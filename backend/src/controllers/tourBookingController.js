import stripe from '../config/stripe.js'
import { supabase } from '../config/supabaseClient.js'
import { v4 as uuidv4 } from 'uuid'

const TourBookingController = {
    async initiateTourBooking(req, res) {
        try {
            const {
                package_date_id,
                num_pax,
                lead_booker_details,
                payment_type = 'FULL',
                customization, // optional: { enabled, removedInclusionGroupIds: number[], restDayNumbers: number[], clientTotals? }
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
            const total_reservation_fee = packageData.reservation_fee_per_pax * num_pax

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
                    return res.status(500).json({ error: 'Failed to load inclusion groups' })
                }

                const validGroupMap = new Map((groupsData || []).map(g => [g.id, g]))
                const requestedRemovedIds = Array.isArray(customization.removedInclusionGroupIds)
                    ? customization.removedInclusionGroupIds.filter((v) => Number.isInteger(v))
                    : []

                // Filter only valid and removable groups
                removedGroupIdsToPersist = requestedRemovedIds.filter((groupId) => {
                    const g = validGroupMap.get(groupId)
                    return g && g.removable === true
                })

                if (requestedRemovedIds.length && removedGroupIdsToPersist.length !== requestedRemovedIds.length) {
                    // Some requested groups are invalid or not removable
                    return res.status(400).json({ error: 'One or more inclusion groups are invalid or not removable' })
                }

                // Validate itinerary rest days by day_number existing
                const { data: itinData, error: itinError } = await supabase
                    .from('package_itineraries')
                    .select('day_number')
                    .eq('package_date_id', package_date_id)

                if (itinError) {
                    return res.status(500).json({ error: 'Failed to load itineraries' })
                }

                const validDayNumbers = new Set((itinData || []).map((i) => i.day_number))
                const requestedRestDays = Array.isArray(customization.restDayNumbers)
                    ? customization.restDayNumbers.filter((v) => Number.isInteger(v))
                    : []
                restDayNumbersToPersist = requestedRestDays.filter((d) => validDayNumbers.has(d))

                if (requestedRestDays.length && restDayNumbersToPersist.length !== requestedRestDays.length) {
                    return res.status(400).json({ error: 'One or more rest day numbers are invalid' })
                }

                // Fee rules with defaults
                const DEFAULT_FEE_RULES = {
                    perRemovedGroup: 5000,
                    perRestDay: 3000,
                    minFee: 5000,
                    maxFee: 50000,
                }
                const fee_rules = packageData.fee_rules && typeof packageData.fee_rules === 'object'
                    ? { ...DEFAULT_FEE_RULES, ...packageData.fee_rules }
                    : { ...DEFAULT_FEE_RULES }

                const perGroup = Number(fee_rules.perRemovedGroup) || 0
                const perRest = Number(fee_rules.perRestDay) || 0
                const minFee = Number(fee_rules.minFee) || 0
                const maxFee = Number(fee_rules.maxFee) || Number.MAX_SAFE_INTEGER

                customization_fee = (removedGroupIdsToPersist.length * perGroup) + (restDayNumbersToPersist.length * perRest)
                if (customization_fee > 0 && customization_fee < minFee) customization_fee = minFee
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

            // Persist customization if any
            if (customization && customization.enabled === true && (removedGroupIdsToPersist.length > 0 || restDayNumbersToPersist.length > 0)) {
                const snapshot = {
                    clientTotals: customization.clientTotals || null,
                }
                const { error: custError } = await supabase
                    .from('tour_booking_customizations')
                    .insert({
                        tour_booking_id: bookingData.id,
                        removed_inclusion_group_ids: JSON.stringify(removedGroupIdsToPersist),
                        rest_day_ids: JSON.stringify(restDayNumbersToPersist),
                        customization_fee,
                        client_snapshot: snapshot,
                    })

                if (custError) {
                    console.error('Error saving booking customization:', custError)
                    return res.status(500).json({ error: 'Failed to save booking customization' })
                }
            }

            const amount =
                payment_type === 'RESERVATION'
                    ? (total_reservation_fee + customization_fee)
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
