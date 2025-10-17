import stripe from '../config/stripe.js'
import { supabase } from '../config/supabaseClient.js'
import { v4 as uuidv4 } from 'uuid'
import {
    autoAssignBooking,
    syncVisaProcessingAssignments,
    syncTourBookingAssignmentStatus,
} from '../services/assignmentService.js'

const TourBookingController = {
    async initiateTourBooking(req, res) {
        try {
            const {
                package_date_id,
                num_pax,
                lead_booker_details,
                passenger_details, // optional: array of all passenger details
                payment_type = 'FULL',
                customization, // optional: { enabled, removedInclusionGroupIds: number[], restDayNumbers: number[], clientTotals? }
                visa_statuses, // optional: array of visa statuses per passenger
            } = req.body

            if (
                !Number.isInteger(package_date_id) ||
                package_date_id <= 0 ||
                !Number.isInteger(num_pax) ||
                num_pax <= 0 ||
                !lead_booker_details ||
                typeof lead_booker_details !== 'object' ||
                !lead_booker_details.email ||
                !lead_booker_details.firstName ||
                !lead_booker_details.lastName ||
                !lead_booker_details.phone
            ) {
                return res
                    .status(400)
                    .json({ error: 'Missing or invalid required fields' })
            }

            if (!['RESERVATION', 'FULL'].includes(payment_type)) {
                return res.status(400).json({ error: 'Invalid payment type' })
            }

            // Validate passenger_details if provided
            if (passenger_details) {
                if (!Array.isArray(passenger_details)) {
                    return res
                        .status(400)
                        .json({ error: 'passenger_details must be an array' })
                }
                if (passenger_details.length !== num_pax) {
                    return res.status(400).json({
                        error: 'passenger_details length must match num_pax',
                    })
                }
                // Basic validation for passenger structure
                for (let i = 0; i < passenger_details.length; i++) {
                    const passenger = passenger_details[i]
                    if (
                        !passenger.name ||
                        !passenger.name.firstName ||
                        !passenger.name.lastName
                    ) {
                        return res.status(400).json({
                            error: `Passenger ${i + 1} must have valid name structure`,
                        })
                    }
                }
            }

            const { data: packageData, error: packageError } = await supabase
                .from('package_dates')
                .select(
                    `available_slots, reservation_fee_per_pax, rate_per_pax, fee_rules, 
                     tour_packages (title)`
                )
                .eq('id', package_date_id)
                .single()

            if (packageError || !packageData) {
                return res.status(404).json({ error: 'Package date not found' })
            }

            if (packageData.available_slots < num_pax) {
                return res
                    .status(409)
                    .json({ error: 'Not enough slots available for this tour' })
            }

            const booking_reference = `TRB-TOUR-${uuidv4()
                .slice(0, 8)
                .toUpperCase()}`
            const base_total_amount = packageData.rate_per_pax * num_pax
            const total_reservation_fee =
                packageData.reservation_fee_per_pax * num_pax

            // Compute customization fee if provided
            let customization_fee = 0
            let removedGroupIdsToPersist = []
            let restDayNumbersToPersist = []

            if (customization && customization.enabled === true) {
                // Load inclusion groups for validation
                const { data: groupsData, error: groupsError } = await supabase
                    .from('package_inclusion_groups')
                    .select('id, removable')
                    .eq('package_date_id', package_date_id)

                if (groupsError) {
                    return res
                        .status(500)
                        .json({ error: 'Failed to load inclusion groups' })
                }

                const validGroupMap = new Map(
                    (groupsData || []).map((g) => [g.id, g])
                )
                const requestedRemovedIds = Array.isArray(
                    customization.removedInclusionGroupIds
                )
                    ? customization.removedInclusionGroupIds.filter((v) =>
                          Number.isInteger(v)
                      )
                    : []

                // Filter only valid and removable groups
                removedGroupIdsToPersist = requestedRemovedIds.filter(
                    (groupId) => {
                        const g = validGroupMap.get(groupId)
                        return g && g.removable === true
                    }
                )

                if (
                    requestedRemovedIds.length &&
                    removedGroupIdsToPersist.length !==
                        requestedRemovedIds.length
                ) {
                    // Some requested groups are invalid or not removable
                    return res.status(400).json({
                        error: 'One or more inclusion groups are invalid or not removable',
                    })
                }

                // Get tour_package_id from package_date_id first
                const { data: dateData, error: dateError } = await supabase
                    .from('package_dates')
                    .select('tour_package_id')
                    .eq('id', package_date_id)
                    .single()

                if (dateError || !dateData) {
                    return res.status(400).json({ error: 'Invalid package date' })
                }

                // Validate itinerary rest days by day_number existing (tour-level)
                const { data: itinData, error: itinError } = await supabase
                    .from('package_itineraries')
                    .select('day_number')
                    .eq('tour_package_id', dateData.tour_package_id)

                if (itinError) {
                    return res
                        .status(500)
                        .json({ error: 'Failed to load itineraries' })
                }

                const validDayNumbers = new Set(
                    (itinData || []).map((i) => i.day_number)
                )
                const requestedRestDays = Array.isArray(
                    customization.restDayNumbers
                )
                    ? customization.restDayNumbers.filter((v) =>
                          Number.isInteger(v)
                      )
                    : []
                restDayNumbersToPersist = requestedRestDays.filter((d) =>
                    validDayNumbers.has(d)
                )

                if (
                    requestedRestDays.length &&
                    restDayNumbersToPersist.length !== requestedRestDays.length
                ) {
                    return res.status(400).json({
                        error: 'One or more rest day numbers are invalid',
                    })
                }

                // Fee rules with defaults
                const DEFAULT_FEE_RULES = {
                    perRemovedGroup: 5000,
                    perRestDay: 3000,
                    minFee: 5000,
                    maxFee: 50000,
                }
                const fee_rules =
                    packageData.fee_rules &&
                    typeof packageData.fee_rules === 'object'
                        ? { ...DEFAULT_FEE_RULES, ...packageData.fee_rules }
                        : { ...DEFAULT_FEE_RULES }

                const perGroup = Number(fee_rules.perRemovedGroup) || 0
                const perRest = Number(fee_rules.perRestDay) || 0
                const minFee = Number(fee_rules.minFee) || 0
                const maxFee =
                    Number(fee_rules.maxFee) || Number.MAX_SAFE_INTEGER

                customization_fee =
                    removedGroupIdsToPersist.length * perGroup +
                    restDayNumbersToPersist.length * perRest
                if (customization_fee > 0 && customization_fee < minFee)
                    customization_fee = minFee
                if (customization_fee > maxFee) customization_fee = maxFee
            }

            // Grand total reflects customization for FULL payments; reservation fee unchanged
            const total_amount = base_total_amount + customization_fee

            const { data: bookingData, error: bookingError } = await supabase
                .from('tour_bookings')
                .insert({
                    booking_reference,
                    package_date_id,
                    passenger_count: num_pax,
                    lead_first_name: lead_booker_details.firstName,
                    lead_last_name: lead_booker_details.lastName,
                    lead_email: lead_booker_details.email,
                    lead_phone: lead_booker_details.phone,
                    passenger_details: Array.isArray(passenger_details)
                        ? passenger_details
                        : null,
                    total_amount,
                    reservation_amount: total_reservation_fee,
                    status: 'PENDING_PAYMENT',
                    payment_type,
                    created_at: new Date().toISOString(),
                })
                .select()
                .single()

            if (bookingError) {
                console.error('Error creating booking:', bookingError)
                return res
                    .status(500)
                    .json({ error: 'Failed to create booking' })
            }

            // Create visa processings if visa_statuses are provided and tour package requires visa
            if (
                visa_statuses &&
                Array.isArray(visa_statuses) &&
                visa_statuses.length > 0
            ) {
                try {
                    // Get tour package info to check if visa is required
                    const { data: packageInfo, error: packageInfoError } =
                        await supabase
                            .from('package_dates')
                            .select(
                                `
                            tour_packages (
                                id,
                                title,
                                destination_country,
                                visa_required
                            )
                        `
                            )
                            .eq('id', package_date_id)
                            .single()

                    if (packageInfoError) {
                        console.error(
                            'Error fetching package info:',
                            packageInfoError
                        )
                        // Don't fail the booking if we can't get package info
                    } else if (packageInfo?.tour_packages?.visa_required) {
                        // Create visa processings for passengers who need visa processing
                        const visaProcessingsToCreate = visa_statuses
                            .filter((vs) => vs.status === 'needs_processing')
                            .map((vs) => {
                                // Determine if this is for an expired visa renewal
                                const isExpiredVisaRenewal =
                                    vs.existing_visa_status === 'expired'

                                return {
                                    tour_booking_id: bookingData.id,
                                    passenger_index: vs.passenger_index,
                                    passenger_name: vs.passenger_name,
                                    passenger_email: vs.passenger_email,
                                    country:
                                        packageInfo.tour_packages
                                            .destination_country,
                                    visa_type: 'tourist', // Default to tourist, can be updated later
                                    status: 'PENDING',
                                    existing_visa_status:
                                        vs.existing_visa_status ||
                                        'not_specified',
                                    visa_expiry_date:
                                        vs.visa_expiry_date || null,
                                    requirements_status: {},
                                    processing_reference: `TRB-VISA-${uuidv4().slice(0, 8).toUpperCase()}`,
                                    notes: isExpiredVisaRenewal
                                        ? `Auto-created for tour booking ${bookingData.booking_reference} - Expired visa renewal assistance`
                                        : `Auto-created for tour booking ${bookingData.booking_reference}`,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString(),
                                }
                            })

                        if (visaProcessingsToCreate.length > 0) {
                            const { error: visaProcessingError } =
                                await supabase
                                    .from('visa_processings')
                                    .insert(visaProcessingsToCreate)

                            if (visaProcessingError) {
                                console.error(
                                    'Error creating visa processings:',
                                    visaProcessingError
                                )
                                // Don't fail the booking if visa processing creation fails
                            } else {
                                console.log(
                                    `Created ${visaProcessingsToCreate.length} visa processings for booking ${bookingData.id}`
                                )

                                // Store visa processing IDs for later assignment sync
                                const visaProcessingIds =
                                    visaProcessingsToCreate.map((vp) => vp.id)
                                bookingData.visaProcessingIds =
                                    visaProcessingIds
                            }
                        }
                    }
                } catch (visaError) {
                    console.error(
                        'Error in visa processing creation:',
                        visaError
                    )
                    // Don't fail the booking if visa processing fails
                }
            }

            // Auto-assign booking to accounting staff
            try {
                const assignmentResult = await autoAssignBooking(
                    'tour',
                    bookingData.id
                )
                if (assignmentResult.success) {
                    console.log(
                        `Tour booking ${bookingData.id} auto-assigned to ${assignmentResult.assignedStaff.name}`
                    )

                    // Sync assignment to related visa processings
                    if (
                        bookingData.visaProcessingIds &&
                        bookingData.visaProcessingIds.length > 0
                    ) {
                        try {
                            await syncVisaProcessingAssignments(
                                bookingData.visaProcessingIds,
                                assignmentResult.assignedStaff.id,
                                assignmentResult.assignedStaff.name
                            )
                        } catch (syncError) {
                            console.error(
                                'Error syncing visa processing assignments:',
                                syncError
                            )
                            // Don't fail the booking if sync fails
                        }
                    }
                } else {
                    console.warn(
                        `Failed to auto-assign tour booking ${bookingData.id}:`,
                        assignmentResult.error
                    )
                }
            } catch (assignmentError) {
                console.error('Auto-assignment error:', assignmentError)
                // Don't fail the booking creation if auto-assignment fails
            }

            // Persist customization if any
            if (
                customization &&
                customization.enabled === true &&
                (removedGroupIdsToPersist.length > 0 ||
                    restDayNumbersToPersist.length > 0)
            ) {
                const snapshot = {
                    clientTotals: customization.clientTotals || null,
                }
                const { error: custError } = await supabase
                    .from('tour_booking_customizations')
                    .insert({
                        tour_booking_id: bookingData.id,
                        removed_inclusion_group_ids: JSON.stringify(
                            removedGroupIdsToPersist
                        ),
                        rest_day_ids: JSON.stringify(restDayNumbersToPersist),
                        customization_fee,
                        client_snapshot: snapshot,
                    })

                if (custError) {
                    console.error(
                        'Error saving booking customization:',
                        custError
                    )
                    return res
                        .status(500)
                        .json({ error: 'Failed to save booking customization' })
                }
            }

            const amount =
                payment_type === 'RESERVATION'
                    ? total_reservation_fee + customization_fee
                    : total_amount
            if (!amount || amount <= 0) {
                return res
                    .status(400)
                    .json({ error: 'Invalid amount for payment' })
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'php',
                            product_data: {
                                name: `${
                                    payment_type === 'RESERVATION'
                                        ? 'Reservation Fee'
                                        : 'Full Payment'
                                }: ${packageData.tour_packages.title}`,
                            },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/tour/booking/success?booking_reference=${booking_reference}`,
                cancel_url: `${process.env.FRONTEND_URL}/tour/booking/cancel`,
                metadata: {
                    booking_reference,
                    product_type: 'TOUR',
                },
            })

            const { error: updateError } = await supabase
                .from('tour_bookings')
                .update({
                    stripe_checkout_id: session.id,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', bookingData.id)

            if (updateError) {
                console.error('Error updating stripe_checkout_id:', updateError)
                return res
                    .status(500)
                    .json({ error: 'Failed to update booking' })
            }

            res.status(200).json({ checkoutUrl: session.url })
        } catch (error) {
            console.error('Error initiating booking:', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    },

    async getBooking(req, res) {
        try {
            const { booking_reference } = req.query

            if (!booking_reference) {
                return res.status(400).json({
                    error: 'booking_reference query parameter is required',
                })
            }

            // fetch the booking along with package_dates and tour_packages
            const { data, error } = await supabase
                .from('tour_bookings')
                .select(
                    `
    *,
    package_dates (
      start_date,
      end_date,
      rate_per_pax,
      reservation_fee_per_pax,
      tour_packages (
        title
      )
    )
  `
                )
                .eq('booking_reference', String(booking_reference))
                .single()

            if (error || !data) {
                console.error('Booking not found or Supabase error:', error)
                return res.status(404).json({ error: 'Booking not found' })
            }

            // map response for frontend
            const response = {
                status: data.status,
                start_date: data.package_dates?.start_date,
                end_date: data.package_dates?.end_date,
                title: data.package_dates?.tour_packages?.title,
                passenger_count: data.passenger_count,
                total_amount: data.total_amount,
                payment_type: data.payment_type,
                // Support both JSONB object and legacy stringified JSON
                passenger_details:
                    data.passenger_details == null
                        ? null
                        : typeof data.passenger_details === 'string'
                          ? (() => {
                                try {
                                    return JSON.parse(data.passenger_details)
                                } catch {
                                    return null
                                }
                            })()
                          : data.passenger_details,
            }

            res.json(response)
        } catch (err) {
            console.error('Error fetching booking:', err)
            res.status(500).json({ error: 'Internal server error' })
        }
    },

    async cancelBooking(req, res) {
        try {
            const { id } = req.params
            const { lead_email } = req.query

            if (!lead_email) {
                return res
                    .status(400)
                    .json({ error: 'lead_email query parameter is required' })
            }

            const { data: bookingData, error: bookingError } = await supabase
                .from('tour_bookings')
                .select('package_date_id, passenger_count, status')
                .eq('id', id)
                .eq('lead_email', lead_email)
                .eq('status', 'PENDING_PAYMENT')
                .single()

            if (bookingError || !bookingData) {
                return res.status(404).json({
                    error: 'Booking not found, not cancellable, or access denied',
                })
            }

            const { package_date_id, passenger_count } = bookingData

            const { error: updateBookingError } = await supabase
                .from('tour_bookings')
                .update({
                    status: 'CANCELLED',
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)

            if (updateBookingError) {
                console.error('Error updating booking:', updateBookingError)
                return res
                    .status(500)
                    .json({ error: 'Failed to cancel booking' })
            }

            const { data, error: fetchError } = await supabase
                .from('package_dates')
                .select('available_slots')
                .eq('id', package_date_id)
                .single()

            if (fetchError) throw fetchError

            // 2. Update with new value
            const newSlots = data.available_slots + passenger_count
            const { error: updateError } = await supabase
                .from('package_dates')
                .update({ available_slots: newSlots })
                .eq('id', package_date_id)

            if (updateError) throw updateError

            res.json({ message: 'Booking cancelled successfully' })
        } catch (error) {
            console.error('Error cancelling booking:', error)
            res.status(500).json({ error: 'Internal server error' })
        }
    },
}

export default TourBookingController
