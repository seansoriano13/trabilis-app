import { query } from '../config/db.js'
import { supabase } from '../config/supabaseClient.js'
import { amadeus } from '../config/amadeus.js'
import stripe from '../config/stripe.js'
import {
    sendConfirmationEmail,
    sendFailureEmail,
    sendTourConfirmationEmail,
    sendTourFailureEmail,
} from './brevoEmailService.js'

import Pusher from 'pusher'


const pusher = new Pusher({
    appId: '2048372',
    key: '371c6201af1a663a4f58',
    secret: 'b4a5985ecd6d27690c8b',
    cluster: 'ap1',
    useTLS: true,
})

export async function finalizeFlightBooking(bookingReference) {
    function safeParseJson(data, fallback = null) {
        if (!data) return fallback
        try {
            return JSON.parse(data)
        } catch {
            return fallback
        }
    }
    try {
        console.log(`Starting finalization for booking: ${bookingReference}`)

        const { data, error } = await supabase
            .from('flight_bookings')
            .select('amadeus_order_id, status, passenger_details, search_criteria')
            .eq('booking_reference', bookingReference)
            .single()

        if (error || !data) {
            throw new Error(`Booking ${bookingReference} not found`)
        }

        const booking = data
        const { amadeus_order_id, status } = booking

        if (status !== 'PAID_PENDING_TICKETING') {
            throw new Error(
                `Booking ${bookingReference} is not in PAID_PENDING_TICKETING status, current status: ${status}`
            )
        }
        if (!amadeus_order_id) {
            throw new Error(
                `No Amadeus order ID found for booking ${bookingReference}`
            )
        }

        let order
        try {
            const response = await amadeus.booking
                .flightOrder(amadeus_order_id)
                .get()
            order = response.data
            console.log(
                `✅ Retrieved Amadeus order ${amadeus_order_id} for ${bookingReference}`
            )
        } catch (amadeusError) {
            console.error(
                `Failed to retrieve Amadeus order ${amadeus_order_id} for ${bookingReference}:`,
                {
                    message: amadeusError.message,
                    response: amadeusError.response?.data,
                    status: amadeusError.response?.status,
                    code: amadeusError.code,
                }
            )
            throw new Error(
                `Amadeus order retrieval failed: ${
                    amadeusError.message || 'Unknown error'
                }`
            )
        }

        const pnr =
            order.associatedRecords?.find(
                (record) => record.originSystemCode === 'GDS'
            )?.reference || null

        try {
            const { error } = await supabase
                .from('flight_bookings')
                .update({
                    status: 'TICKETED',
                    pnr: pnr
                })
                .eq('booking_reference', bookingReference)

            if (error) {
                throw new Error(`Database update error: ${error.message}`)
            }
            console.log(
                `✅ Booking ${bookingReference} finalized with status TICKETED, PNR: ${pnr}`
            )
        } catch (dbError) {
            console.error(
                `Failed to update booking ${bookingReference}:`,
                dbError
            )
            throw new Error(`Database error: ${dbError.message}`)
        }

        // Send confirmation email (non-blocking)
        sendConfirmationEmail(bookingReference)
            .then(() =>
                console.log(
                    `✅ Confirmation email sent for ${bookingReference}`
                )
            )
            .catch((emailError) =>
                console.error(
                    `Failed to send confirmation email for ${bookingReference}:`,
                    emailError
                )
            )
    } catch (error) {
        console.error(
            `❌ CRITICAL FAILURE during finalization for ${bookingReference}: ${error.message}`
        )
        try {
            const { error: updateError } = await supabase
                .from('flight_bookings')
                .update({ status: 'TICKETING_FAILED' })
                .eq('booking_reference', bookingReference)

            if (updateError) {
                throw new Error(`Database update error: ${updateError.message}`)
            }
            console.log(
                `Database updated for ${bookingReference}. Status: TICKETING_FAILED: ${error.message}`
            )

            const { data, error: selectError } = await supabase
                .from('flight_bookings')
                .select('total_amount, currency, stripe_checkout_id, passenger_details, search_criteria')
                .eq('booking_reference', bookingReference)
                .single()

            if (selectError || !data) {
                throw new Error(`Failed to fetch booking data: ${selectError?.message}`)
            }
            const booking = data
            if (booking.stripe_checkout_id) {
                try {
                    await stripe.refunds.create({
                        checkout_session: booking.stripe_checkout_id,
                        amount: Math.round(booking.total_amount * 100),
                    })
                    console.log(
                        `✅ Stripe refund issued for failed booking ${bookingReference}`
                    )
                } catch (stripeError) {
                    console.error(
                        `Failed to issue refund for ${bookingReference}:`,
                        stripeError
                    )
                }
            }

            const passengerDetails = safeParseJson(booking.passenger_details)
            const searchCriteria = safeParseJson(booking.search_criteria)
            const primaryTraveler = passengerDetails.travelers[0]
            try {
                await sendFailureEmail({
                    email: primaryTraveler.contact.emailAddress,
                    firstName: primaryTraveler.name.firstName,
                    lastName: primaryTraveler.name.lastName,
                    bookingReference,
                    searchCriteria,
                })
                console.log(`✅ Failure email sent for ${bookingReference}`)
            } catch (emailError) {
                console.error(
                    `Failed to send failure email for ${bookingReference}:`,
                    emailError
                )
            }
        } catch (rollbackError) {
            console.error(
                `Rollback failed for ${bookingReference}:`,
                rollbackError
            )
        }
        throw new Error(`Failed to finalize booking: ${error.message}`)
    }
}

export async function finalizeTourBooking(bookingReference) {
    try {
        console.log(
            `Starting tour finalization for tour booking: ${bookingReference}`
        )

        const { data: booking, error } = await supabase
            .from('tour_bookings')
            .select(
                `
        *,
        package_dates!inner (
          id,
          start_date,
          end_date,
          total_slots,
          available_slots,
          tour_packages!inner (
            id,
            title,
            description,
            exclusions,
            payment_terms,
            requirements,
            notes,
            itineraries:package_itineraries!tour_package_id (
              id,
              day_number,
              title,
              description,
              image_url,
              image_metadata
            )
          )
        )
      `
            )
            .eq('booking_reference', bookingReference)
            .single()

        if (error || !booking) {
            throw new Error(`Tour booking ${bookingReference} not found`)
        }

        console.log('📧 BookingService - Raw booking data from Supabase:')
        console.log('📧 BookingService - package_dates:', booking.package_dates)
        console.log('📧 BookingService - tour_packages:', booking.package_dates?.tour_packages)
        console.log('📧 BookingService - itineraries:', booking.package_dates?.tour_packages?.itineraries)
        console.log('📧 BookingService - itineraries type:', typeof booking.package_dates?.tour_packages?.itineraries)
        console.log('📧 BookingService - itineraries length:', booking.package_dates?.tour_packages?.itineraries?.length)

        if (booking.status !== 'CONFIRMED') {
            throw new Error(
                `Tour booking ${bookingReference} is not in CONFIRMED status, current status: ${booking.status}`
            )
        }

        // Insert admin notification (awaited)
        const { error: insertError } = await supabase
            .from('admin_notifications')
            .insert([
                {
                    type: 'new_tour_booking',
                    booking_reference: bookingReference,
                    pnr: null,
                    message: `Tour booking confirmed: ${booking.package_dates.tour_packages.title} (${bookingReference})`,
                    created_at: new Date().toISOString(),
                },
            ])

        if (insertError) {
            console.error('Supabase insert error:', insertError.message)
        }

        // Send real-time notification (awaited)
        await pusher.trigger('admin-notifications', 'new-booking', {
            bookingReference,
            pnr: null,
        })

        // Send confirmation email
        try {
            // Pass raw itineraries data for PDF generation (now from tour_packages)
            const packageItineraries = booking.package_dates?.tour_packages?.itineraries || []
            
            console.log('📧 BookingService - packageItineraries type:', typeof packageItineraries)
            console.log('📧 BookingService - packageItineraries length:', packageItineraries.length)
            console.log('📧 BookingService - packageItineraries sample:', JSON.stringify(packageItineraries.slice(0, 2), null, 2))

            await sendTourConfirmationEmail({
                bookingReference,
                email: booking.lead_email,
                firstName: booking.lead_first_name,
                lastName: booking.lead_last_name,
                phone: booking.lead_phone,
                tourTitle: booking.package_dates?.tour_packages?.title || 'Tour Package',
                startDate: booking.package_dates?.start_date,
                endDate: booking.package_dates?.end_date,
                passengerCount: booking.passenger_count,
                passengers: booking.passenger_details 
                    ? (typeof booking.passenger_details === 'string' 
                        ? JSON.parse(booking.passenger_details) 
                        : booking.passenger_details)
                    : [],
                paymentType: booking.payment_type || 'FULL',
                amount: booking.total_amount,
                reservationAmount: booking.reservation_amount,
                status: booking.status,
                flight_details: booking.flight_details 
                    ? (typeof booking.flight_details === 'string' 
                        ? JSON.parse(booking.flight_details) 
                        : booking.flight_details)
                    : {},
                inclusions: booking.package_dates?.inclusions || ['As per package'],
                exclusions: booking.package_dates?.exclusions || ['Personal expenses'],
                notes: booking.package_dates?.notes || ['No additional notes'],
                requirements: booking.package_dates?.requirements || ['Valid passport required'],
                paymentTerms: booking.package_dates?.payment_terms || ['Standard payment terms apply'],
                itinerary: packageItineraries,
                tourDescription: booking.package_dates?.tour_packages?.description || 'Tour description will be provided upon confirmation.',
                package_date_id: booking.package_date_id,
                tour_package_id: booking.package_dates?.tour_packages?.id,
                totalSlots: booking.package_dates?.total_slots,
                availableSlots: booking.package_dates?.available_slots,
                created_at: booking.created_at,
                updated_at: booking.updated_at,
            })
            console.log(
                `✅ Tour confirmation email sent for ${bookingReference}`
            )
        } catch (emailError) {
            console.error(
                `Failed to send tour confirmation email for ${bookingReference}:`,
                emailError
            )
        }

        return { status: 'CONFIRMED' }
    } catch (error) {
        console.error(
            `❌ CRITICAL FAILURE during tour finalization for ${bookingReference}: ${error.message}`
        )
        try {
            await supabase
                .from('tour_bookings')
                .update({
                    status: 'FAILED',
                    updated_at: new Date().toISOString(),
                })
                .eq('booking_reference', bookingReference)

            console.log(
                `Database updated for ${bookingReference}. Status: FAILED`
            )

            const { data: booking } = await supabase
                .from('tour_bookings')
                .select(
                    'lead_email, lead_first_name, lead_last_name, stripe_checkout_id, reservation_amount, total_amount, payment_type'
                )
                .eq('booking_reference', bookingReference)
                .single()

            if (booking.stripe_checkout_id) {
                try {
                    await stripe.refunds.create({
                        checkout_session: booking.stripe_checkout_id,
                        amount: Math.round(
                            (booking.payment_type === 'RESERVATION'
                                ? booking.reservation_amount
                                : booking.total_amount) * 100
                        ),
                    })
                    console.log(
                        `✅ Stripe refund issued for failed tour booking ${bookingReference}`
                    )
                } catch (stripeError) {
                    console.error(
                        `Failed to issue refund for ${bookingReference}:`,
                        stripeError
                    )
                }
            }

            try {
                await sendTourFailureEmail({
                    email: booking.lead_email,
                    firstName: booking.lead_first_name,
                    lastName: booking.lead_last_name,
                    bookingReference,
                })
                console.log(
                    `✅ Tour failure email sent for ${bookingReference}`
                )
            } catch (emailError) {
                console.error(
                    `Failed to send tour failure email for ${bookingReference}:`,
                    emailError
                )
            }
        } catch (rollbackError) {
            console.error(
                `Rollback failed for ${bookingReference}:`,
                rollbackError
            )
        }
        throw new Error(`Failed to finalize tour booking: ${error.message}`)
    }
}

export async function checkBookingStatus(bookingReference) {
    try {
        const { data, error } = await supabase
            .from('flight_bookings')
            .select('status, search_criteria, pnr')
            .eq('booking_reference', bookingReference)
            .single()

        if (error || !data) {
            throw new Error(`Booking ${bookingReference} not found`)
        }

        const { status, search_criteria, pnr } = data
        return {
            status: status,
            searchCriteria: search_criteria,
            pnr: pnr,
        }
    } catch (error) {
        console.error(`Failed to check status for ${bookingReference}:`, error)
        throw new Error(`Failed to check booking status: ${error.message}`)
    }
}
