import { query } from '../../config/db.js'
import { generateFlightItineraryPDF } from '../../services/brevoEmailService.js'
import { supabase } from '../../config/supabaseClient.js'
import Pusher from 'pusher'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dayjs from 'dayjs'
import { formatSegment } from '../../utils/flightutils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pusher = new Pusher({
    appId: '2048372',
    key: '371c6201af1a663a4f58',
    secret: 'b4a5985ecd6d27690c8b',
    cluster: 'ap1',
    useTLS: true,
})

export const generateFlightPDF = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database
        const { data, error } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        const booking = data

        // Parse JSON fields if they are strings
        const parseJsonField = (field) => {
            if (!field) return null
            if (typeof field === 'string') {
                try {
                    return JSON.parse(field)
                } catch (e) {
                    console.error('Error parsing JSON field:', e)
                    return null
                }
            }
            return field
        }

        // Prepare booking details for PDF generation
        const bookingDetails = {
            ...booking,
            amadeus_flight_offer: parseJsonField(booking.amadeus_flight_offer),
            passenger_details: parseJsonField(booking.passenger_details),
            search_criteria: parseJsonField(booking.search_criteria),
        }

        // Generate PDF
        const pdfBuffer = await generateFlightItineraryPDF(bookingDetails)

        if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
            return res.status(500).json({ 
                error: 'Failed to generate PDF - invalid buffer returned',
                message: 'PDF generation failed',
            })
        }

        // Set response headers for PDF
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader(
            'Content-Disposition',
            `inline; filename="Flight-Itinerary-${booking.booking_reference}.pdf"`
        )
        res.setHeader('Content-Length', pdfBuffer.length)

        // Send PDF buffer
        res.send(pdfBuffer)
    } catch (error) {
        console.error('Error generating flight PDF:', error)
        res.status(500).json({ 
            error: 'Failed to generate PDF',
            message: error.message,
        })
    }
}

export const viewFlightBookingHTML = async (req, res) => {
    try {
        const { id } = req.params
        const { mode = 'preview' } = req.query // 'preview' or 'print'

        // Get booking details from database
        const { data, error } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        const booking = data

        // Parse JSON fields if they are strings
        const parseJsonField = (field) => {
            if (!field) return null
            if (typeof field === 'string') {
                try {
                    return JSON.parse(field)
                } catch (e) {
                    console.error('Error parsing JSON field:', e)
                    return null
                }
            }
            return field
        }

        // Prepare booking details for HTML generation
        const bookingDetails = {
            ...booking,
            amadeus_flight_offer: parseJsonField(booking.amadeus_flight_offer),
            passenger_details: parseJsonField(booking.passenger_details),
            search_criteria: parseJsonField(booking.search_criteria),
        }

        // Read the new HTML template based on flight.html
        const templatePath = path.join(
            __dirname,
            '../../services/templates/flight.html'
        )
        let html = fs.readFileSync(templatePath, 'utf8')

        // Replace BASE_URL placeholder with actual backend URL
        const baseUrl =
            process.env.BACKEND_URL ||
            (process.env.NODE_ENV === 'production'
                ? 'https://trabilis.onrender.com'
                : 'http://localhost:3001')

        const bookingDate = bookingDetails.updated_at
            ? dayjs(bookingDetails.updated_at).format('MMM D, YYYY')
            : dayjs(bookingDetails.created_at).format('MMM D, YYYY')

        const itineraries = (
            bookingDetails.amadeus_flight_offer?.itineraries || []
        )
            .map((itinerary, index) => {
                return `
                    <div class="pdf-flight-details__section">
                        <div class="pdf-table-header">
                            <div class="pdf-table-header__title">
                                <i class="fa-solid fa-plane"></i>
                                <p>
                                    <b>${index === 0 ? 'Onward' : 'Return'}</b>
                                    <span>${
                                        itinerary.segments?.length || 0
                                    }</span>
                                    Flight(s)
                                </p>
                        </div>
                            <div><span>Non-Refundable</span></div>
                        </div>
                        <div class="pdf-flight-details__subheader">
                            <div class="pdf-flight-details__flight__index">
                                <b>Flight <span>${index + 1}</span></b>
                            </div>
                            <div class="pdf-flight-details__subheader-title">
                                <i class="fa-solid fa-plane-departure pdf-flight-details__icon"></i>
                                <p>Departing</p>
                            </div>
                            <div class="pdf-flight-details__subheader-title">
                                <i class="fa-solid fa-plane-arrival pdf-flight-details__icon"></i>
                                <p>Arriving</p>
                            </div>
                            </div>
                        <div class="pdf-flight-details__data">
                            ${(itinerary.segments || [])
                                .map((segment) => {
                                    const {
                                        airline,
                                        aircraft,
                                        departure,
                                        arrival,
                                        stopsLabel,
                                        duration: flightDuration,
                                    } = formatSegment(segment)

                                    return /* HTML */ ` <div
                                            class="pdf-flight-details__airline"
                                        >
                                            <img
                                                class="pdf-flight-details__airline-logo"
                                                src=${airline.logo}
                                                alt=${airline.name}
                                            />
                                            <div
                                                class="pdf-flight-details__airline-name"
                                            >
                                                <p
                                                    class="pdf-flight-details__airline-text"
                                                >
                                                    <b>${airline.name}</b>
                                                </p>
                                                <p
                                                    class="pdf-flight-details__airline-text"
                                                >
                                                    ${aircraft}
                                                </p>
                            </div>
                            </div>

                                        <div
                                            class="pdf-flight-details__departure"
                                        >
                                            <p
                                                class="pdf-flight-details__airport-code"
                                            >
                                                <b
                                                    ><span
                                                        >${departure.iata}</span
                                                    ></b
                                                >
                                                <span>${departure.city}</span>
                                            </p>
                                            <p
                                                class="pdf-flight-details__airport-name"
                                            >
                                                <span
                                                    >${departure.airport}</span
                                                >
                                            </p>
                                            <p
                                                class="pdf-flight-details__terminal"
                                            >
                                                <span
                                                    >Terminal
                                                    ${departure.terminal ||
                                                    ''}</span
                                                >
                                            </p>
                                            <p class="pdf-flight-details__time">
                                                <b
                                                    ><span
                                                        >${departure.time}</span
                                                    ></b
                                                >
                                            </p>
                            </div>

                                        <div
                                            class="pdf-flight-details__arrival"
                                        >
                                            <p
                                                class="pdf-flight-details__airport-code"
                                            >
                                                <b
                                                    ><span
                                                        >${arrival.iata}</span
                                                    >
                                                    <span
                                                        >${arrival.city}</span
                                                    ></b
                                                >
                                            </p>
                                            <p
                                                class="pdf-flight-details__airport-code"
                                            >
                                                <span>${arrival.airport}</span>
                                            </p>
                                            <p
                                                class="pdf-flight-details__terminal"
                                            >
                                                <span
                                                    >Terminal
                                                    ${arrival.terminal ||
                                                    ''}</span
                                                >
                                            </p>
                                            <p class="pdf-flight-details__time">
                                                <b
                                                    ><span
                                                        >${arrival.time}</span
                                                    ></b
                                                >
                                            </p>
                        </div>

                                        <div class="pdf-flight-details__leg">
                                            <p
                                                class="pdf-flight-details__stops"
                                            >
                                                ${stopsLabel}
                                            </p>
                                            <p
                                                class="pdf-flight-details__durations"
                                            >
                                                ${flightDuration}
                                            </p>
                                        </div>`
                                })
                                .join('')}
                        </div>
                    </div>
                `
            })
            .join('')

        const pnr = bookingDetails.pnr
        const status =
            bookingDetails.status === 'TICKETED'
                ? 'CONFIRMED'
                : bookingDetails.status
        const passengerDetails = (
            bookingDetails.passenger_details?.travelers || []
        )
            .map((passenger, index) => {
                const title = passenger.title || ''
                const name = `${passenger.name?.firstName || ''} ${
                    passenger.name?.lastName || ''
                }`
                    .trim()
                    .toUpperCase()
                const type = passenger.type || ''
                const dateOfBirth = passenger.dateOfBirth || ''
                const psngrDocs = (passenger.documents || [])[0] || {}
                const passport = {
                    number: psngrDocs.number || 'N/A',
                    expiry: psngrDocs.expiryDate || 'N/A',
                }

                return `
                    <div class="pdf-passenger-details__data">
                        <div><span>${index + 1}</span></div>
                        <div class="pdf-passenger-details__data-name">
                            <p><b>${`${
                                title ? title.toUpperCase() + '. ' : ''
                            }${name}`}</b></p>
                            <p>${type} (${dateOfBirth})</p>
                        </div>
                        <div class="pdf-passenger-details__data-passport">
                            <span>${passport.number}</span>
                            <span>${passport.expiry}</span>
                        </div>
                        <p class="pdf-passenger-details__data-pnr">${
                            pnr || 'N/A'
                        }</p>
                        <div>N/A</div>
                        <div>N/A</div>
                        <div>N/A</div>
                        <div>${status || 'N/A'}</div>
                    </div>
                `
            })
            .join('')

        // Compute Payment Details
        const offerPrice = bookingDetails.amadeus_flight_offer?.price || {}
        const currencyCode =
            offerPrice.currency || bookingDetails.currency || 'PHP'
        const toNumber = (value) => Number(value ?? 0)
        const baseFare = toNumber(offerPrice.base)
        const totalFare = toNumber(offerPrice.total || offerPrice.grandTotal)
        const refundableTaxes = toNumber(
            bookingDetails.amadeus_flight_offer?.travelerPricings?.[0]?.price
                ?.refundableTaxes
        )
        const liTax = refundableTaxes || 0
        const feesAndTaxes = Math.max(0, totalFare - baseFare - liTax)
        const formatAmount = (n) =>
            toNumber(n).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })

        // Flight Inclusions
        const flightNumbers = (
            bookingDetails.amadeus_flight_offer?.itineraries || []
        )
            .flatMap((it) => it.segments || [])
            .map((seg) => {
                const code = seg.operating?.carrierCode || seg.carrierCode
                return `${code}-${seg.number}`
            })
            .join(', ')

        // Derive baggage from traveler pricing fareDetailsBySegment if available
        const fareDetails =
            bookingDetails.amadeus_flight_offer?.travelerPricings?.[0]
                ?.fareDetailsBySegment || []
        const bagInfo = fareDetails.reduce(
            (acc, f) => {
                const includedBags = f.includedCheckedBags
                if (includedBags) {
                    if (typeof includedBags.weight === 'number') {
                        acc.checkedKg = Math.max(
                            acc.checkedKg,
                            includedBags.weight
                        )
                        acc.checkedUnit =
                            includedBags.weightUnit || acc.checkedUnit
                    }
                    if (typeof includedBags.quantity === 'number') {
                        acc.checkedPieces = Math.max(
                            acc.checkedPieces,
                            includedBags.quantity
                        )
                    }
                }
                const cabin = f.cabinBags || f.cabin
                if (cabin && typeof cabin.quantity === 'number') {
                    acc.cabinPieces = Math.max(acc.cabinPieces, cabin.quantity)
                }
                return acc
            },
            {
                checkedKg: 0,
                checkedUnit: 'KG',
                checkedPieces: 0,
                cabinPieces: 0,
            }
        )

        const cabinBaggageText = `Adult: ${
            bagInfo.cabinPieces || 0
        } Pc Included`
        const checkedBaggageText =
            bagInfo.checkedKg > 0
                ? `Adult: ${bagInfo.checkedKg} ${bagInfo.checkedUnit}`
                : `Adult: ${bagInfo.checkedPieces || 0} PC`

        // Inject values into template
        html = html.replace(/{{baseUrl}}/g, baseUrl)
        html = html.replace(
            /\{\{bookingReference\}\}/g,
            bookingDetails.booking_reference || 'N/A',
            bookingDetails.booking_reference
        )
        html = html.replace('{{bookingDate}}', bookingDate)
        html = html.replace('{{itineraries}}', itineraries)
        html = html.replace('{{passengerDetails}}', passengerDetails)
        html = html.replace('{{currency}}', currencyCode)
        html = html.replace('{{baseFare}}', formatAmount(baseFare))
        html = html.replace('{{feesTaxes}}', formatAmount(feesAndTaxes))
        html = html.replace('{{liTax}}', formatAmount(liTax))
        html = html.replace('{{totalFare}}', formatAmount(totalFare))
        html = html.replace(/\{{flightNumbers\}}/g, flightNumbers)
        html = html.replace('{{cabinBaggage}}', cabinBaggageText)
        html = html.replace('{{checkedBaggage}}', checkedBaggageText)

        res.setHeader('Content-Type', 'text/html')
        res.send(html)
    } catch (error) {
        console.error('Error generating flight HTML:', error)
        res.status(500).json({ 
            error: 'Failed to generate HTML',
            message: error.message,
        })
    }
}


// Generate Flight PDF for Admin (without PDFShift - uses browser print functionality)
export const generateFlightPDFAdmin = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database
        const { data, error } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        const booking = data

        // Parse JSON fields if they are strings
        const parseJsonField = (field) => {
            if (!field) return null
            if (typeof field === 'string') {
                try {
                    return JSON.parse(field)
                } catch (e) {
                    console.error('Error parsing JSON field:', e)
                    return null
                }
            }
            return field
        }

        // Prepare booking details for HTML generation
        const bookingDetails = {
            ...booking,
            amadeus_flight_offer: parseJsonField(booking.amadeus_flight_offer),
            passenger_details: parseJsonField(booking.passenger_details),
            search_criteria: parseJsonField(booking.search_criteria),
        }

        // Read the new HTML template based on flight.html
        const templatePath = path.join(
            __dirname,
            '../../services/templates/flight.html'
        )
        let html = fs.readFileSync(templatePath, 'utf8')

        // Replace BASE_URL placeholder with actual backend URL
        const baseUrl =
            process.env.BACKEND_URL ||
            (process.env.NODE_ENV === 'production'
                ? 'https://trabilis.onrender.com'
                : 'http://localhost:5000')

        const bookingDate = bookingDetails.updated_at
            ? dayjs(bookingDetails.updated_at).format('MMM D, YYYY')
            : dayjs(bookingDetails.created_at).format('MMM D, YYYY')

        const itineraries = (
            bookingDetails.amadeus_flight_offer?.itineraries || []
        )
            .map((itinerary, index) => {
                return `
                    <div class="pdf-flight-details__section">
                        <div class="pdf-table-header">
                            <div class="pdf-table-header__title">
                                <i class="fa-solid fa-plane"></i>
                                <p>
                                    <b>${index === 0 ? 'Onward' : 'Return'}</b>
                                    <span>${
                                        itinerary.segments?.length || 0
                                    }</span>
                                    Flight(s)
                                </p>
                        </div>
                            <div><span>Non-Refundable</span></div>
                        </div>
                        <div class="pdf-flight-details__subheader">
                            <div class="pdf-flight-details__flight__index">
                                <b>Flight <span>${index + 1}</span></b>
                            </div>
                            <div class="pdf-flight-details__subheader-title">
                                <i class="fa-solid fa-plane-departure pdf-flight-details__icon"></i>
                                <p>Departing</p>
                            </div>
                            <div class="pdf-flight-details__subheader-title">
                                <i class="fa-solid fa-plane-arrival pdf-flight-details__icon"></i>
                                <p>Arriving</p>
                            </div>
                            </div>
                        <div class="pdf-flight-details__data">
                            ${(itinerary.segments || [])
                                .map((segment) => {
                                    const {
                                        airline,
                                        aircraft,
                                        departure,
                                        arrival,
                                        stopsLabel,
                                        duration: flightDuration,
                                    } = formatSegment(segment)

                                    return ` <div class="pdf-flight-details__airline">
                                            <img class="pdf-flight-details__airline-logo" src=${
                                                airline.logo
                                            } alt=${airline.name} />
                                            <div class="pdf-flight-details__airline-name">
                                                <p class="pdf-flight-details__airline-text"><b>${
                                                    airline.name
                                                }</b></p>
                                                <p class="pdf-flight-details__airline-text">${aircraft}</p>
                            </div>
                            </div>

                                        <div class="pdf-flight-details__departure">
                                            <p class="pdf-flight-details__airport-code">
                                                <b><span>${
                                                    departure.iata
                                                }</span></b>
                                                <span>${departure.city}</span>
                                            </p>
                                            <p class="pdf-flight-details__airport-name"><span>${
                                                departure.airport
                                            }</span></p>
                                            <p class="pdf-flight-details__terminal"><span>Terminal ${
                                                departure.terminal || ''
                                            }</span></p>
                                            <p class="pdf-flight-details__time"><b><span>${
                                                departure.time
                                            }</span></b></p>
                            </div>

                                        <div class="pdf-flight-details__arrival">
                                            <p class="pdf-flight-details__airport-code">
                                                <b><span>${
                                                    arrival.iata
                                                }</span><span>${
                                        arrival.city
                                    }</span></b>
                                            </p>
                                            <p class="pdf-flight-details__airport-code"><span>${
                                                arrival.airport
                                            }</span></p>
                                            <p class="pdf-flight-details__terminal"><span>Terminal ${
                                                arrival.terminal || ''
                                            }</span></p>
                                            <p class="pdf-flight-details__time"><b><span>${
                                                arrival.time
                                            }</span></b></p>
                        </div>

                                        <div class="pdf-flight-details__leg">
                                            <p class="pdf-flight-details__stops">${stopsLabel}</p>
                                            <p class="pdf-flight-details__durations">${flightDuration}</p>
                                        </div>`
                                })
                                .join('')}
                        </div>
                    </div>
                `
            })
            .join('')

        const pnr = bookingDetails.pnr
        const status =
            bookingDetails.status === 'TICKETED'
                ? 'CONFIRMED'
                : bookingDetails.status
        const passengerDetails = (
            bookingDetails.passenger_details?.travelers || []
        )
            .map((passenger, index) => {
                const title = passenger.title || ''
                const name = `${passenger.name?.firstName || ''} ${
                    passenger.name?.lastName || ''
                }`
                    .trim()
                    .toUpperCase()
                const type = passenger.type || ''
                const dateOfBirth = passenger.dateOfBirth || ''
                const psngrDocs = (passenger.documents || [])[0] || {}
                const passport = {
                    number: psngrDocs.number || 'N/A',
                    expiry: psngrDocs.expiryDate || 'N/A',
                }

                return `
                    <div class="pdf-passenger-details__data">
                        <div><span>${index + 1}</span></div>
                        <div class="pdf-passenger-details__data-name">
                            <p><b>${`${
                                title ? title.toUpperCase() + '. ' : ''
                            }${name}`}</b></p>
                            <p>${type} (${dateOfBirth})</p>
                        </div>
                        <div class="pdf-passenger-details__data-passport">
                            <span>${passport.number}</span>
                            <span>${passport.expiry}</span>
                        </div>
                        <p class="pdf-passenger-details__data-pnr">${
                            pnr || 'N/A'
                        }</p>
                        <div>N/A</div>
                        <div>N/A</div>
                        <div>N/A</div>
                        <div>${status || 'N/A'}</div>
                    </div>
                `
            })
            .join('')

        // Compute Payment Details
        const offerPrice = bookingDetails.amadeus_flight_offer?.price || {}
        const currencyCode =
            offerPrice.currency || bookingDetails.currency || 'PHP'
        const toNumber = (value) => Number(value ?? 0)
        const baseFare = toNumber(offerPrice.base)
        const totalFare = toNumber(offerPrice.total || offerPrice.grandTotal)
        const refundableTaxes = toNumber(
            bookingDetails.amadeus_flight_offer?.travelerPricings?.[0]?.price
                ?.refundableTaxes
        )
        const liTax = refundableTaxes || 0
        const feesAndTaxes = Math.max(0, totalFare - baseFare - liTax)
        const formatAmount = (n) =>
            toNumber(n).toLocaleString('en-PH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })

        // Flight Inclusions
        const flightNumbers = (
            bookingDetails.amadeus_flight_offer?.itineraries || []
        )
            .flatMap((it) => it.segments || [])
            .map((seg) => {
                const code = seg.operating?.carrierCode || seg.carrierCode
                return `${code}-${seg.number}`
            })
            .join(', ')

        // Derive baggage from traveler pricing fareDetailsBySegment if available
        const fareDetails =
            bookingDetails.amadeus_flight_offer?.travelerPricings?.[0]
                ?.fareDetailsBySegment || []
        const bagInfo = fareDetails.reduce(
            (acc, f) => {
                const includedBags = f.includedCheckedBags
                if (includedBags) {
                    if (typeof includedBags.weight === 'number') {
                        acc.checkedKg = Math.max(
                            acc.checkedKg,
                            includedBags.weight
                        )
                        acc.checkedUnit =
                            includedBags.weightUnit || acc.checkedUnit
                    }
                    if (typeof includedBags.quantity === 'number') {
                        acc.checkedPieces = Math.max(
                            acc.checkedPieces,
                            includedBags.quantity
                        )
                    }
                }
                const cabin = f.cabinBags || f.cabin
                if (cabin && typeof cabin.quantity === 'number') {
                    acc.cabinPieces = Math.max(acc.cabinPieces, cabin.quantity)
                }
                return acc
            },
            {
                checkedKg: 0,
                checkedUnit: 'KG',
                checkedPieces: 0,
                cabinPieces: 0,
            }
        )

        const cabinBaggageText = `Adult: ${
            bagInfo.cabinPieces || 0
        } Pc Included`
        const checkedBaggageText =
            bagInfo.checkedKg > 0
                ? `Adult: ${bagInfo.checkedKg} ${bagInfo.checkedUnit}`
                : `Adult: ${bagInfo.checkedPieces || 0} PC`

        // Inject values into template
        html = html.replace('{{baseUrl}}', baseUrl)
        html = html.replace(
            '{{bookingReference}}',
            bookingDetails.booking_reference
        )
        html = html.replace('{{bookingDate}}', bookingDate)
        html = html.replace('{{itineraries}}', itineraries)
        html = html.replace('{{passengerDetails}}', passengerDetails)
        html = html.replace('{{currency}}', currencyCode)
        html = html.replace('{{baseFare}}', formatAmount(baseFare))
        html = html.replace('{{feesTaxes}}', formatAmount(feesAndTaxes))
        html = html.replace('{{liTax}}', formatAmount(liTax))
        html = html.replace('{{totalFare}}', formatAmount(totalFare))
        html = html.replace(/\{{flightNumbers\}}/g, flightNumbers)
        html = html.replace('{{cabinBaggage}}', cabinBaggageText)
        html = html.replace('{{checkedBaggage}}', checkedBaggageText)

        // Add comprehensive print optimization and admin styling
        const adminStyles = `
            <style>
                /* Base styles for better print rendering */
                * {
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    background: white !important;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
                    font-size: 12px !important;
                    color: #2c3e50 !important;
                    line-height: 1.4 !important;
                }
                
                .container {
                    max-width: 8.5in !important;
                    margin: 0 auto !important;
                    padding: 20px !important;
                    background: white !important;
                    box-shadow: none !important;
                    border-radius: 0 !important;
                }
                
                /* Header styling */
                .header {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: flex-start !important;
                    margin-bottom: 20px !important;
                    padding-bottom: 15px !important;
                    border-bottom: 3px solid #e21e25 !important;
                }
                
                .logo-section h3 {
                    font-size: 20px !important;
                    font-weight: 700 !important;
                    color: #e21e25 !important;
                    margin: 0 !important;
                }
                
                .logo-section p {
                    font-size: 11px !important;
                    color: #6c757d !important;
                    margin: 0 0 5px 0 !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                
                .contact-info h4 {
                    font-size: 16px !important;
                    font-weight: 600 !important;
                    color: #2c3e50 !important;
                    margin: 0 0 8px 0 !important;
                }
                
                .contact-info p {
                    margin: 0 0 5px 0 !important;
                    font-size: 11px !important;
                    color: #495057 !important;
                }
                
                /* Flight sections */
                .flight-section {
                    margin-bottom: 20px !important;
                    border: 1px solid #e9ecef !important;
                    border-radius: 8px !important;
                    overflow: hidden !important;
                    background: white !important;
                }
                
                .flight-header {
                    background: #e21e25 !important;
                    color: white !important;
                    padding: 12px 15px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    letter-spacing: 0.5px !important;
                    text-transform: uppercase !important;
                }
                
                .flight-details {
                    padding: 15px !important;
                    background: #f8f9fa !important;
                }
                
                .segment-card {
                    background: white !important;
                    border: 1px solid #e9ecef !important;
                    border-radius: 6px !important;
                    margin-bottom: 10px !important;
                    padding: 15px !important;
                }
                
                .segment-header {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    margin-bottom: 15px !important;
                }
                
                .airline-info {
                    display: flex !important;
                    align-items: center !important;
                }
                
                .airline-code {
                    background: #2c3e50 !important;
                    color: white !important;
                    padding: 4px 8px !important;
                    border-radius: 4px !important;
                    font-weight: 600 !important;
                    font-size: 11px !important;
                    margin-right: 10px !important;
                }
                
                .flight-number {
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    color: #2c3e50 !important;
                }
                
                .aircraft-info {
                    font-size: 11px !important;
                    color: #6c757d !important;
                    margin-left: 10px !important;
                }
                
                .status-badge {
                    background: #28a745 !important;
                    color: white !important;
                    padding: 4px 8px !important;
                    border-radius: 4px !important;
                    font-size: 10px !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                }
                
                .segment-route {
                    display: flex !important;
                    justify-content: space-between !important;
                    align-items: center !important;
                    margin-bottom: 15px !important;
                }
                
                .airport-departure,
                .airport-arrival {
                    text-align: center !important;
                    flex: 1 !important;
                }
                
                .airport-code {
                    font-size: 18px !important;
                    font-weight: 700 !important;
                    color: #2c3e50 !important;
                    margin-bottom: 5px !important;
                }
                
                .airport-name {
                    font-size: 10px !important;
                    color: #6c757d !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    margin-bottom: 5px !important;
                }
                
                .airport-time {
                    font-size: 16px !important;
                    font-weight: 600 !important;
                    color: #2c3e50 !important;
                    margin-bottom: 3px !important;
                }
                
                .airport-date {
                    font-size: 11px !important;
                    color: #6c757d !important;
                    margin-bottom: 3px !important;
                }
                
                .airport-terminal {
                    font-size: 10px !important;
                    color: #6c757d !important;
                }
                
                .flight-path {
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    margin: 0 20px !important;
                }
                
                .flight-duration {
                    font-size: 11px !important;
                    color: #6c757d !important;
                    margin-bottom: 5px !important;
                }
                
                .flight-arrow {
                    font-size: 20px !important;
                    color: #e21e25 !important;
                }
                
                /* Tables */
                .passenger-details,
                .pricing-table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin-bottom: 20px !important;
                    border: 1px solid #e9ecef !important;
                    border-radius: 8px !important;
                    overflow: hidden !important;
                }
                
                .passenger-details th,
                .passenger-details td,
                .pricing-table th,
                .pricing-table td {
                    text-align: left !important;
                    padding: 12px 15px !important;
                    border-bottom: 1px solid #e9ecef !important;
                    vertical-align: top !important;
                }
                
                .passenger-details th,
                .pricing-table th {
                    background: #2c3e50 !important;
                    color: white !important;
                    font-size: 11px !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                
                .passenger-details td,
                .pricing-table td {
                    background: white !important;
                    color: #495057 !important;
                    font-weight: 500 !important;
                    font-size: 12px !important;
                }
                
                /* Pricing sections */
                .pricing-section {
                    margin-bottom: 20px !important;
                    border: 1px solid #e9ecef !important;
                    border-radius: 8px !important;
                    background: white !important;
                    overflow: hidden !important;
                }
                
                .pricing-header {
                    background: #f8f9fa !important;
                    padding: 12px 15px !important;
                    font-weight: 600 !important;
                    font-size: 12px !important;
                    color: #2c3e50 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    border-bottom: 1px solid #e9ecef !important;
                }
                
                .pricing-content {
                    padding: 15px !important;
                }
                
                .price-item {
                    display: flex !important;
                    justify-content: space-between !important;
                    padding: 8px 0 !important;
                    border-bottom: 1px solid #f1f3f4 !important;
                }
                
                .price-item:last-child {
                    border-bottom: none !important;
                }
                
                .price-item.total {
                    font-weight: 700 !important;
                    border-top: 2px solid #e21e25 !important;
                    padding-top: 12px !important;
                    color: #2c3e50 !important;
                    font-size: 14px !important;
                }
                
                .price-item .label {
                    color: #495057 !important;
                    font-weight: 500 !important;
                }
                
                .price-item .value {
                    color: #2c3e50 !important;
                    font-weight: 600 !important;
                }
                
                /* Footer */
                .footer {
                    text-align: center !important;
                    border-top: 3px solid #e21e25 !important;
                    padding-top: 15px !important;
                    margin-top: 20px !important;
                    color: #6c757d !important;
                    font-size: 10px !important;
                    font-weight: 500 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                
                /* Print-specific optimizations */
                @media print {
                    @page {
                        margin: 0.5in;
                        size: A4;
                    }
                    
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        font-size: 11px !important;
                    }
                    
                    .container {
                        margin: 0 !important;
                        padding: 0 !important;
                        max-width: none !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                    }
                    
                    .flight-section,
                    .segment-card,
                    .passenger-details,
                    .pricing-table {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            </style>
        `

        // Insert admin styles
        html = html.replace('</head>', adminStyles + '</head>')

        // Set response headers for HTML (admin will use browser print to PDF)
        res.setHeader('Content-Type', 'text/html')
        res.setHeader(
            'Content-Disposition',
            `inline; filename="Flight-Itinerary-${booking.booking_reference}.html"`
        )
        res.send(html)
    } catch (error) {
        console.error('Error generating flight PDF for admin:', error)
        res.status(500).json({ 
            error: 'Failed to generate PDF for admin',
            message: error.message,
        })
    }
}

// Edit flight booking
export const editFlightBooking = async (req, res) => {
    try {
        const { id } = req.params
        const { 
            status, 
            pnr, 
            assigned_to,
            assignment_status,
        } = req.body

        // Validate required fields
        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: 'Booking ID is required',
            })
        }

        // Check if booking exists
        const { data: existingBooking, error: fetchError } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !existingBooking) {
            return res.status(404).json({ 
                success: false,
                error: 'Booking not found',
            })
        }

        // Prepare update data
        const updateData = {
            updated_at: new Date().toISOString(),
        }

        // Only update fields that are provided
        if (status !== undefined) {
            updateData.status = status
        }
        if (pnr !== undefined) {
            updateData.pnr = pnr
        }
        if (assigned_to !== undefined) {
            updateData.assigned_to = assigned_to
        }
        if (assignment_status !== undefined) {
            // Validate assignment status against allowed values
            const validStatuses = ['pending', 'in_progress', 'completed']
            if (!validStatuses.includes(assignment_status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid assignment status. Must be one of: pending, in_progress, completed',
                })
            }
            updateData.assignment_status = assignment_status
        }

        // Update booking
        const { data: updatedBooking, error: updateError } = await supabase
            .from('flight_bookings')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single()

        if (updateError) {
            throw updateError
        }


        // Create admin notification for assignment changes
        if (
            assigned_to !== undefined &&
            assigned_to !== existingBooking.assigned_to
        ) {
            const isReassign = !!existingBooking.assigned_to && !!assigned_to
            const notifType = isReassign
                ? 'booking_reassigned'
                : 'booking_assigned'
            // Resolve assigner and assignee names for readable message
            let assignerName = req.user?.email || 'System'
            let assigneeName = assigned_to
            try {
                // Lookup assigner by email if available
                if (req.user?.email) {
                    const { data: assigner } = await supabase
                        .from('admins')
                        .select('first_name, last_name, email')
                        .eq('email', req.user.email)
                        .single()
                    if (assigner) {
                        assignerName =
                            `${assigner.first_name || ''} ${
                                assigner.last_name || ''
                            }`.trim() || assigner.email
                    }
                }
                // Lookup assignee by id
                if (assigned_to) {
                    const { data: assignee } = await supabase
                        .from('admins')
                        .select('first_name, last_name, email')
                        .eq('id', assigned_to)
                        .single()
                    if (assignee) {
                        assigneeName =
                            `${assignee.first_name || ''} ${
                                assignee.last_name || ''
                            }`.trim() || assignee.email
                    }
                }
            } catch (_) {}

            const message = isReassign
                ? `Flight booking ${existingBooking.booking_reference} reassigned by ${assignerName} to ${assigneeName}`
                : `Flight booking ${existingBooking.booking_reference} assigned by ${assignerName} to ${assigneeName}`


            // Trigger realtime event via Pusher
            await pusher.trigger('admin-notifications', notifType, {
                bookingReference: existingBooking.booking_reference,
                bookingType: 'flight',
                bookingId: id,
            })
        }

        // Create admin notification for assignment status updates
        if (
            assignment_status &&
            assignment_status !== existingBooking.assignment_status
        ) {

            await pusher.trigger(
                'admin-notifications',
                'assignment-status-updated',
                {
                bookingReference: existingBooking.booking_reference,
                bookingType: 'flight',
                bookingId: id,
                status: assignment_status,
                }
            )
        }

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: updatedBooking,
        })
    } catch (error) {
        console.error('Error editing flight booking:', error)
        res.status(500).json({ 
            success: false,
            error: 'Failed to update booking',
            message: error.message,
        })
    }
}

// Cancel flight booking
export const cancelFlightBooking = async (req, res) => {
    try {
        const { id } = req.params
        const { reason, refund_amount } = req.body

        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: 'Booking ID is required',
            })
        }

        // Check if booking exists and get current status
        const { data: existingBooking, error: fetchError } = await supabase
            .from('flight_bookings')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !existingBooking) {
            return res.status(404).json({ 
                success: false,
                error: 'Booking not found',
            })
        }

        // Check if booking can be cancelled
        if (existingBooking.status === 'CANCELLED') {
            return res.status(400).json({ 
                success: false,
                error: 'Booking is already cancelled',
            })
        }

        if (existingBooking.status === 'TICKETED') {
            return res.status(400).json({ 
                success: false,
                error: 'Cannot cancel ticketed booking. Please contact support for assistance.',
            })
        }

        // Prepare cancellation data
        const updateData = {
            status: 'CANCELLED',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        if (reason) {
            updateData.cancellation_reason = reason
        }
        if (refund_amount !== undefined) {
            updateData.refund_amount = refund_amount
        }

        // Update booking status
        const { data: cancelledBooking, error: updateError } = await supabase
            .from('flight_bookings')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single()

        if (updateError) {
            throw updateError
        }


        // TODO: Process refund if payment was made
        // This would integrate with Stripe or other payment processor
        if (existingBooking.stripe_checkout_id && refund_amount) {
            console.log(
                `Refund processing needed for booking ${existingBooking.booking_reference}: ${refund_amount}`
            )
            // Implement refund logic here
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking,
        })
    } catch (error) {
        console.error('Error cancelling flight booking:', error)
        res.status(500).json({ 
            success: false,
            error: 'Failed to cancel booking',
            message: error.message,
        })
    }
}
