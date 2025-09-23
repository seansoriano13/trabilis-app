import { query } from '../../config/db.js'
import { generateFlightItineraryPDF } from '../../services/emailService.js'
import { supabase } from '../../config/supabaseClient.js'
import Pusher from 'pusher'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

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
        const result = await query(
            'SELECT * FROM flight_bookings WHERE id = ?',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        const booking = result.rows[0]

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
            e_ticket_numbers: parseJsonField(booking.e_ticket_numbers)
        }

        // Generate PDF
        const pdfBuffer = await generateFlightItineraryPDF(bookingDetails)

        if (!pdfBuffer || !Buffer.isBuffer(pdfBuffer)) {
            return res.status(500).json({ 
                error: 'Failed to generate PDF - invalid buffer returned',
                message: 'PDF generation failed' 
            })
        }

        // Set response headers for PDF
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="Flight-Itinerary-${booking.booking_reference}.pdf"`)
        res.setHeader('Content-Length', pdfBuffer.length)

        // Send PDF buffer
        res.send(pdfBuffer)

    } catch (error) {
        console.error('Error generating flight PDF:', error)
        res.status(500).json({ 
            error: 'Failed to generate PDF',
            message: error.message 
        })
    }
}

export const viewFlightBookingHTML = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database
        const result = await query(
            'SELECT * FROM flight_bookings WHERE id = ?',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        const booking = result.rows[0]

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
            e_ticket_numbers: parseJsonField(booking.e_ticket_numbers)
        }

        // Read the HTML template
        const templatePath = path.join(__dirname, '../../services/templates/flight-itinerary-template.html')
        let html = fs.readFileSync(templatePath, 'utf8')

        // Generate itineraries HTML
        const generateItinerariesHTML = (flightOffer) => {
            if (!flightOffer?.itineraries) return '<p>Flight details not available</p>'
            
            let itinerariesHTML = ''
            flightOffer.itineraries.forEach((itinerary, index) => {
                const isReturn = index > 0
                const headerClass = isReturn ? 'itinerary-header return' : 'itinerary-header'
                const title = isReturn ? 'Return Flight' : 'Outbound Flight'
                
                itinerariesHTML += `
                    <div class="itinerary-section">
                        <div class="${headerClass}">
                            <span>${title}</span>
                            <span>${itinerary.segments?.[0]?.departure?.at ? new Date(itinerary.segments[0].departure.at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="flight-column-headers">
                            <div class="flight-col airline">Airline</div>
                            <div class="flight-col">Flight</div>
                            <div class="flight-col">From</div>
                            <div class="flight-col">To</div>
                            <div class="flight-col">Departure</div>
                            <div class="flight-col">Arrival</div>
                            <div class="flight-col duration">Duration</div>
                        </div>
                `
                
                itinerary.segments?.forEach(segment => {
                    itinerariesHTML += `
                        <div class="flight-details-row">
                            <div class="flight-col airline">
                                <span>${segment.carrierCode || 'N/A'}</span>
                            </div>
                            <div class="flight-col">
                                <h4>${segment.number || 'N/A'}</h4>
                                <p>Aircraft: ${segment.aircraft?.code || 'N/A'}</p>
                            </div>
                            <div class="flight-col">
                                <h4>${segment.departure?.iataCode || 'N/A'}</h4>
                                <p>Terminal ${segment.departure?.terminal || 'N/A'}</p>
                            </div>
                            <div class="flight-col">
                                <h4>${segment.arrival?.iataCode || 'N/A'}</h4>
                                <p>Terminal ${segment.arrival?.terminal || 'N/A'}</p>
                            </div>
                            <div class="flight-col">
                                <h4>${segment.departure?.at ? new Date(segment.departure.at).toLocaleTimeString() : 'N/A'}</h4>
                                <p>${segment.departure?.at ? new Date(segment.departure.at).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div class="flight-col">
                                <h4>${segment.arrival?.at ? new Date(segment.arrival.at).toLocaleTimeString() : 'N/A'}</h4>
                                <p>${segment.arrival?.at ? new Date(segment.arrival.at).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div class="flight-col duration">
                                <span>${segment.duration || 'N/A'}</span>
                            </div>
                        </div>
                    `
                })
                
                itinerariesHTML += '</div>'
            })
            
            return itinerariesHTML
        }

        // Generate passengers HTML
        const generatePassengersHTML = (passengerDetails, eTicketNumbers) => {
            if (!passengerDetails?.travelers) return '<tr><td colspan="6">No passenger details available</td></tr>'
            
            let passengersHTML = ''
            passengerDetails.travelers.forEach((traveler, index) => {
                const ticketNumber = eTicketNumbers?.[index] || 'N/A'
                passengersHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>
                            <strong>${traveler.name?.firstName || ''} ${traveler.name?.lastName || ''}</strong><br>
                            <small>${traveler.type || 'N/A'} | ${traveler.gender || 'N/A'}</small>
                        </td>
                        <td>
                            ${traveler.documents?.[0]?.number || 'N/A'}<br>
                            <small>${traveler.documents?.[0]?.nationality || 'N/A'}</small>
                        </td>
                        <td>${bookingDetails.pnr || 'N/A'}</td>
                        <td>${ticketNumber}</td>
                        <td>${bookingDetails.status || 'N/A'}</td>
                    </tr>
                `
            })
            
            return passengersHTML
        }

        // Generate payment details HTML
        const generatePaymentDetailsHTML = (bookingDetails, flightOffer) => {
            let paymentHTML = `
                <table>
                    <tr>
                        <td>Total Amount:</td>
                        <td>₱${parseFloat(bookingDetails.total_amount || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Currency:</td>
                        <td>${bookingDetails.currency || 'PHP'}</td>
                    </tr>
                    <tr>
                        <td>Payment Type:</td>
                        <td>${bookingDetails.payment_type || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Status:</td>
                        <td>${bookingDetails.status || 'N/A'}</td>
                    </tr>
            `
            
            if (flightOffer?.price) {
                paymentHTML += `
                    <tr class="total">
                        <td>Base Price:</td>
                        <td>₱${parseFloat(flightOffer.price.base || 0).toLocaleString()}</td>
                    </tr>
                `
                
                flightOffer.price.fees?.forEach(fee => {
                    paymentHTML += `
                        <tr>
                            <td>Fee (${fee.type}):</td>
                            <td>₱${parseFloat(fee.amount || 0).toLocaleString()}</td>
                        </tr>
                    `
                })
                
                paymentHTML += `
                    <tr class="total">
                        <td>Grand Total:</td>
                        <td>₱${parseFloat(flightOffer.price.grandTotal || 0).toLocaleString()}</td>
                    </tr>
                `
            }
            
            paymentHTML += '</table>'
            return paymentHTML
        }

        // Generate flight inclusions HTML
        const generateFlightInclusionsHTML = () => {
            return `
                <h5>Included Services:</h5>
                <p>• Flight ticket(s) as specified</p>
                <p>• Standard baggage allowance</p>
                <p>• In-flight meals and beverages</p>
                <p>• Seat selection (subject to availability)</p>
                
                <h5>Important Notes:</h5>
                <p>• Check-in begins 3 hours prior to departure</p>
                <p>• Valid ID required for all passengers</p>
                <p>• Baggage restrictions apply</p>
                <p>• Flight times subject to change</p>
            `
        }

        // Replace placeholders with actual data
        html = html.replace(/\{\{bookingReference\}\}/g, bookingDetails.booking_reference || 'N/A')
        html = html.replace(/\{\{companyName\}\}/g, 'Lindela Travel And Tours - Trabilis')
        html = html.replace(/\{\{companyEmail\}\}/g, 'lindelatravelctws@gmail.com')
        html = html.replace(/\{\{companyAddress\}\}/g, 'Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street, Makati, Metro Manila')
        html = html.replace(/\{\{bookingDate\}\}/g, bookingDetails.created_at ? new Date(bookingDetails.created_at).toLocaleDateString() : 'N/A')
        html = html.replace(/\{\{itineraries\}\}/g, generateItinerariesHTML(bookingDetails.amadeus_flight_offer))
        html = html.replace(/\{\{passengers\}\}/g, generatePassengersHTML(bookingDetails.passenger_details, bookingDetails.e_ticket_numbers))
        html = html.replace(/\{\{paymentDetails\}\}/g, generatePaymentDetailsHTML(bookingDetails, bookingDetails.amadeus_flight_offer))
        html = html.replace(/\{\{flightInclusions\}\}/g, generateFlightInclusionsHTML())

        // Set response headers for HTML
        res.setHeader('Content-Type', 'text/html')
        res.send(html)

    } catch (error) {
        console.error('Error generating flight HTML:', error)
        res.status(500).json({ 
            error: 'Failed to generate HTML',
            message: error.message 
        })
    }
}

export const viewFlightBookingPrint = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database
        const result = await query(
            'SELECT * FROM flight_bookings WHERE id = ?',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        const booking = result.rows[0]

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
            e_ticket_numbers: parseJsonField(booking.e_ticket_numbers)
        }

        // Read the HTML template
        const templatePath = path.join(__dirname, '../../services/templates/flight-itinerary-template.html')
        let html = fs.readFileSync(templatePath, 'utf8')

        // Replace placeholders with actual data
        html = html.replace(/\{\{booking_reference\}\}/g, bookingDetails.booking_reference || 'N/A')
        html = html.replace(/\{\{status\}\}/g, bookingDetails.status || 'N/A')
        html = html.replace(/\{\{total_amount\}\}/g, bookingDetails.total_amount || '0')
        html = html.replace(/\{\{payment_type\}\}/g, bookingDetails.payment_type || 'N/A')
        html = html.replace(/\{\{created_at\}\}/g, bookingDetails.created_at ? new Date(bookingDetails.created_at).toLocaleDateString() : 'N/A')

        // Add print-specific CSS
        const printStyles = `
            <style>
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                        background: white !important;
                    }
                    .container {
                        margin: 0;
                        padding: 20px;
                        box-shadow: none;
                        border-radius: 0;
                        max-width: none;
                        min-height: auto;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .flight-details {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    .passenger-details {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
            </style>
        `
        html = html.replace('</head>', printStyles + '</head>')

        // Set response headers for HTML
        res.setHeader('Content-Type', 'text/html')
        res.send(html)

    } catch (error) {
        console.error('Error generating flight print HTML:', error)
        res.status(500).json({ 
            error: 'Failed to generate print HTML',
            message: error.message 
        })
    }
}

// Generate Flight PDF for Admin (without PDFShift - uses browser print functionality)
export const generateFlightPDFAdmin = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database
        const result = await query(
            'SELECT * FROM flight_bookings WHERE id = ?',
            [id]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        const booking = result.rows[0]

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
            e_ticket_numbers: parseJsonField(booking.e_ticket_numbers)
        }

        // Read the HTML template
        const templatePath = path.join(__dirname, '../../services/templates/flight-itinerary-template.html')
        let html = fs.readFileSync(templatePath, 'utf8')

        // Generate itineraries HTML
        const generateItinerariesHTML = (flightOffer) => {
            if (!flightOffer?.itineraries) return '<p>Flight details not available</p>'
            
            let itinerariesHTML = ''
            flightOffer.itineraries.forEach((itinerary, index) => {
                const isReturn = index > 0
                const headerClass = isReturn ? 'itinerary-header return' : 'itinerary-header'
                const title = isReturn ? 'Return Flight' : 'Outbound Flight'
                
                itinerariesHTML += `
                    <div class="itinerary-section">
                        <div class="${headerClass}">
                            <span>${title}</span>
                            <span>${itinerary.segments?.[0]?.departure?.at ? new Date(itinerary.segments[0].departure.at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div class="flight-column-headers">
                            <div class="flight-col airline">Airline</div>
                            <div class="flight-col">Flight</div>
                            <div class="flight-col">From</div>
                            <div class="flight-col">To</div>
                            <div class="flight-col">Departure</div>
                            <div class="flight-col">Arrival</div>
                            <div class="flight-col duration">Duration</div>
                        </div>
                `
                
                itinerary.segments?.forEach(segment => {
                    itinerariesHTML += `
                        <div class="flight-details-row">
                            <div class="flight-col airline">
                                <span>${segment.carrierCode || 'N/A'}</span>
                            </div>
                            <div class="flight-col">
                                <h4>${segment.number || 'N/A'}</h4>
                                <p>Aircraft: ${segment.aircraft?.code || 'N/A'}</p>
                            </div>
                            <div class="flight-col">
                                <h4>${segment.departure?.iataCode || 'N/A'}</h4>
                                <p>Terminal ${segment.departure?.terminal || 'N/A'}</p>
                            </div>
                            <div class="flight-col">
                                <h4>${segment.arrival?.iataCode || 'N/A'}</h4>
                                <p>Terminal ${segment.arrival?.terminal || 'N/A'}</p>
                            </div>
                            <div class="flight-col">
                                <h4>${segment.departure?.at ? new Date(segment.departure.at).toLocaleTimeString() : 'N/A'}</h4>
                                <p>${segment.departure?.at ? new Date(segment.departure.at).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div class="flight-col">
                                <h4>${segment.arrival?.at ? new Date(segment.arrival.at).toLocaleTimeString() : 'N/A'}</h4>
                                <p>${segment.arrival?.at ? new Date(segment.arrival.at).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div class="flight-col duration">
                                <span>${segment.duration || 'N/A'}</span>
                            </div>
                        </div>
                    `
                })
                
                itinerariesHTML += '</div>'
            })
            
            return itinerariesHTML
        }

        // Generate passengers HTML
        const generatePassengersHTML = (passengerDetails, eTicketNumbers) => {
            if (!passengerDetails?.travelers) return '<tr><td colspan="6">No passenger details available</td></tr>'
            
            let passengersHTML = ''
            passengerDetails.travelers.forEach((traveler, index) => {
                const ticketNumber = eTicketNumbers?.[index] || 'N/A'
                passengersHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>
                            <strong>${traveler.name?.firstName || ''} ${traveler.name?.lastName || ''}</strong><br>
                            <small>${traveler.type || 'N/A'} | ${traveler.gender || 'N/A'}</small>
                        </td>
                        <td>
                            ${traveler.documents?.[0]?.number || 'N/A'}<br>
                            <small>${traveler.documents?.[0]?.nationality || 'N/A'}</small>
                        </td>
                        <td>${bookingDetails.pnr || 'N/A'}</td>
                        <td>${ticketNumber}</td>
                        <td>${bookingDetails.status || 'N/A'}</td>
                    </tr>
                `
            })
            
            return passengersHTML
        }

        // Generate payment details HTML
        const generatePaymentDetailsHTML = (bookingDetails, flightOffer) => {
            let paymentHTML = `
                <table>
                    <tr>
                        <td>Total Amount:</td>
                        <td>₱${parseFloat(bookingDetails.total_amount || 0).toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td>Currency:</td>
                        <td>${bookingDetails.currency || 'PHP'}</td>
                    </tr>
                    <tr>
                        <td>Payment Type:</td>
                        <td>${bookingDetails.payment_type || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td>Status:</td>
                        <td>${bookingDetails.status || 'N/A'}</td>
                    </tr>
            `
            
            if (flightOffer?.price) {
                paymentHTML += `
                    <tr class="total">
                        <td>Base Price:</td>
                        <td>₱${parseFloat(flightOffer.price.base || 0).toLocaleString()}</td>
                    </tr>
                `
                
                flightOffer.price.fees?.forEach(fee => {
                    paymentHTML += `
                        <tr>
                            <td>Fee (${fee.type}):</td>
                            <td>₱${parseFloat(fee.amount || 0).toLocaleString()}</td>
                        </tr>
                    `
                })
                
                paymentHTML += `
                    <tr class="total">
                        <td>Grand Total:</td>
                        <td>₱${parseFloat(flightOffer.price.grandTotal || 0).toLocaleString()}</td>
                    </tr>
                `
            }
            
            paymentHTML += '</table>'
            return paymentHTML
        }

        // Generate flight inclusions HTML
        const generateFlightInclusionsHTML = () => {
            return `
                <h5>Included Services:</h5>
                <p>• Flight ticket(s) as specified</p>
                <p>• Standard baggage allowance</p>
                <p>• In-flight meals and beverages</p>
                <p>• Seat selection (subject to availability)</p>
                
                <h5>Important Notes:</h5>
                <p>• Check-in begins 3 hours prior to departure</p>
                <p>• Valid ID required for all passengers</p>
                <p>• Baggage restrictions apply</p>
                <p>• Flight times subject to change</p>
            `
        }

        // Replace placeholders with actual data
        html = html.replace(/\{\{bookingReference\}\}/g, bookingDetails.booking_reference || 'N/A')
        html = html.replace(/\{\{companyName\}\}/g, 'Lindela Travel And Tours - Trabilis')
        html = html.replace(/\{\{companyEmail\}\}/g, 'lindelatravelctws@gmail.com')
        html = html.replace(/\{\{companyAddress\}\}/g, 'Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street, Makati, Metro Manila')
        html = html.replace(/\{\{bookingDate\}\}/g, bookingDetails.created_at ? new Date(bookingDetails.created_at).toLocaleDateString() : 'N/A')
        html = html.replace(/\{\{itineraries\}\}/g, generateItinerariesHTML(bookingDetails.amadeus_flight_offer))
        html = html.replace(/\{\{passengers\}\}/g, generatePassengersHTML(bookingDetails.passenger_details, bookingDetails.e_ticket_numbers))
        html = html.replace(/\{\{paymentDetails\}\}/g, generatePaymentDetailsHTML(bookingDetails, bookingDetails.amadeus_flight_offer))
        html = html.replace(/\{\{flightInclusions\}\}/g, generateFlightInclusionsHTML())

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
        res.setHeader('Content-Disposition', `inline; filename="Flight-Itinerary-${booking.booking_reference}.html"`)
        res.send(html)

    } catch (error) {
        console.error('Error generating flight PDF for admin:', error)
        res.status(500).json({ 
            error: 'Failed to generate PDF for admin',
            message: error.message 
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
            e_ticket_numbers, 
            assigned_to,
            assignment_status 
        } = req.body

        // Validate required fields
        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: 'Booking ID is required' 
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
                error: 'Booking not found' 
            })
        }

        // Prepare update data
        const updateData = {
            updated_at: new Date().toISOString()
        }

        // Only update fields that are provided
        if (status !== undefined) {
            updateData.status = status
        }
        if (pnr !== undefined) {
            updateData.pnr = pnr
        }
        if (e_ticket_numbers !== undefined) {
            updateData.e_ticket_numbers = e_ticket_numbers
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
                    error: 'Invalid assignment status. Must be one of: pending, in_progress, completed'
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

        // Create admin notification for status changes
        if (status && status !== existingBooking.status) {
            await supabase
                .from('admin_notifications')
                .insert({
                    type: 'booking_status_changed',
                    message: `Flight booking ${existingBooking.booking_reference} status changed from ${existingBooking.status} to ${status}`,
                    booking_reference: existingBooking.booking_reference,
                    booking_type: 'flight',
                    booking_id: null,
                    created_at: new Date().toISOString()
                })
        }

        // Create admin notification for assignment changes
        if (assigned_to !== undefined && assigned_to !== existingBooking.assigned_to) {
            const isReassign = !!existingBooking.assigned_to && !!assigned_to
            const notifType = isReassign ? 'booking_reassigned' : 'booking_assigned'
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
                        assignerName = `${assigner.first_name || ''} ${assigner.last_name || ''}`.trim() || assigner.email
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
                        assigneeName = `${assignee.first_name || ''} ${assignee.last_name || ''}`.trim() || assignee.email
                    }
                }
            } catch (_) {}

            const message = isReassign
                ? `Flight booking ${existingBooking.booking_reference} reassigned by ${assignerName} to ${assigneeName}`
                : `Flight booking ${existingBooking.booking_reference} assigned by ${assignerName} to ${assigneeName}`

            await supabase
                .from('admin_notifications')
                .insert({
                    type: notifType,
                    message,
                    booking_reference: existingBooking.booking_reference,
                    booking_type: 'flight',
                    booking_id: null,
                    assigned_to: assigned_to || null,
                    assigned_by: req.user?.id || null,
                    created_at: new Date().toISOString()
                })

            // Trigger realtime event via Pusher
            await pusher.trigger('admin-notifications', notifType, {
                bookingReference: existingBooking.booking_reference,
                bookingType: 'flight',
                bookingId: id,
            })
        }

        // Create admin notification for assignment status updates
        if (assignment_status && assignment_status !== existingBooking.assignment_status) {
            await supabase
                .from('admin_notifications')
                .insert({
                    type: 'assignment_status_updated',
                    message: `Flight booking ${existingBooking.booking_reference} assignment status: ${assignment_status}`,
                    booking_reference: existingBooking.booking_reference,
                    booking_type: 'flight',
                    booking_id: null,
                    created_at: new Date().toISOString()
                })

            await pusher.trigger('admin-notifications', 'assignment-status-updated', {
                bookingReference: existingBooking.booking_reference,
                bookingType: 'flight',
                bookingId: id,
                status: assignment_status,
            })
        }

        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: updatedBooking
        })

    } catch (error) {
        console.error('Error editing flight booking:', error)
        res.status(500).json({ 
            success: false,
            error: 'Failed to update booking',
            message: error.message 
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
                error: 'Booking ID is required' 
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
                error: 'Booking not found' 
            })
        }

        // Check if booking can be cancelled
        if (existingBooking.status === 'CANCELLED') {
            return res.status(400).json({ 
                success: false,
                error: 'Booking is already cancelled' 
            })
        }

        if (existingBooking.status === 'TICKETED') {
            return res.status(400).json({ 
                success: false,
                error: 'Cannot cancel ticketed booking. Please contact support for assistance.' 
            })
        }

        // Prepare cancellation data
        const updateData = {
            status: 'CANCELLED',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
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

        // Create admin notification
        await supabase
            .from('admin_notifications')
            .insert({
                type: 'booking_cancelled',
                message: `Flight booking ${existingBooking.booking_reference} has been cancelled${reason ? ` - Reason: ${reason}` : ''}`,
                booking_reference: existingBooking.booking_reference,
                booking_type: 'flight',
                booking_id: null,
                created_at: new Date().toISOString()
            })

        // TODO: Process refund if payment was made
        // This would integrate with Stripe or other payment processor
        if (existingBooking.stripe_checkout_id && refund_amount) {
            console.log(`Refund processing needed for booking ${existingBooking.booking_reference}: ${refund_amount}`)
            // Implement refund logic here
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: cancelledBooking
        })

    } catch (error) {
        console.error('Error cancelling flight booking:', error)
        res.status(500).json({ 
            success: false,
            error: 'Failed to cancel booking',
            message: error.message 
        })
    }
}
