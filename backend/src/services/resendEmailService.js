import { Resend } from 'resend'
import { query } from '../config/db.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabase } from '../config/supabaseClient.js'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return isNaN(d)
        ? 'N/A'
        : d.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
}

export function getDuration(start, end) {
    if (!start || !end) return 'N/A'

    if (start > end) return 'Invalid Duration'

    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate - startDate
    const minutes = Math.floor(diffMs / 1000 / 60)
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return `${hours}h ${remainingMinutes}m`
}

export const formatToLongDate = (date) => {
    const [start, end] = Array.isArray(date) ? date : [date]

    const toDate = (d) => (d instanceof Date ? d : new Date(d))
    const isValid = (d) => d instanceof Date && !isNaN(d)

    const startDate = toDate(start)
    const endDate = end ? toDate(end) : null

    if (!isValid(startDate)) return ''

    const toFormatted = (d) =>
        d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })

    return endDate && isValid(endDate)
        ? [toFormatted(startDate), toFormatted(endDate)]
        : toFormatted(startDate)
}

// Reusable HTML -> PDF buffer generator using headless Chromium
async function createPdfFromHtml(html) {
    let browser
    try {
        // Render-friendly Puppeteer launch options
        const isProduction = process.env.NODE_ENV === 'production'
        const userDataDir = process.env.PUPPETEER_USER_DATA_DIR || '/tmp/puppeteer-user-data'
        const useSystemChrome = process.env.PUPPETEER_USE_SYSTEM_CHROME === 'true'
        const envExecutablePath = useSystemChrome ? process.env.PUPPETEER_EXECUTABLE_PATH : undefined
        let resolvedExecutablePath
        if (envExecutablePath) {
            try {
                await fs.access(envExecutablePath)
                resolvedExecutablePath = envExecutablePath
            } catch {
                resolvedExecutablePath = puppeteer.executablePath()
            }
        } else {
            resolvedExecutablePath = puppeteer.executablePath()
        }

        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-zygote',
                '--font-render-hinting=medium',
            ],
            userDataDir,
            // If Render provides an executable path, use it; otherwise let Puppeteer resolve
            executablePath: resolvedExecutablePath,
        })
        const page = await browser.newPage()
        // Ensure UTF-8 charset and base styles are respected
        const normalizedHtml = html.includes('<meta charset="utf-8"')
            ? html
            : html.replace(
                  /<head>/i,
                  '<head><meta charset="utf-8">'
              )
        await page.setContent(normalizedHtml, { waitUntil: 'networkidle0' })
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: false,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        })
        await page.close()
        return pdfBuffer
    } finally {
        if (browser) {
            await browser.close()
        }
    }
}

export const generateFlightItineraryPDF = async (bookingDetails) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const templatePath = path.join(
        __dirname,
        'templates',
        'flight-itinerary-template.html'
    )

    let html = await fs.readFile(templatePath, 'utf-8')

    // 1. Itineraries
    const itinerariesHtml = bookingDetails.amadeus_flight_offer.itineraries
        .map((itinerary, index) => {
            const headerClass = index === 0 ? '' : 'return'
            const headerTitle = index === 0 ? 'Onward' : 'Return'
            const segmentsHtml = itinerary.segments
                .map((segment) => {
                    // In a real app, you might map 'PR' to a logo URL.
                    // const airlineLogoUrl = getLogoForCarrier(segment.carrierCode);
                    return `
                <div class="flight-details-row">
                    <div class="flight-col airline">
                        <div>
                            <strong>${segment.carrierCode}</strong><br>
                            ${segment.number}
                        </div>
                    </div>
                    <div class="flight-col departing">
                        <h4>${segment.departure.iataCode}</h4>
                        <p>${formatToLongDate(segment.departure.at)}</p>
                        <p>Terminal ${segment.departure.terminal || 'N/A'}</p>
                    </div>
                    <div class="flight-col arriving">
                        <h4>${segment.arrival.iataCode}</h4>
                        <p>${formatToLongDate(segment.arrival.at)}</p>
                        <p>Terminal ${segment.arrival.terminal || 'N/A'}</p>
                    </div>
                    <div class="flight-col duration">
                        Non Stop<br>
                        ${getDuration(segment.duration)}
                    </div>
                </div>
            `
                })
                .join('')

            return `
            <div class="itinerary-section">
                <div class="itinerary-header ${headerClass}">
                    <span><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M6.428 1.151C6.708.591 7.213 0 7.86 0h.28c.646 0 1.151.59 1.43 1.151l.445 1.039L14.73 4c.626.284.829.986.545 1.591l-2.155 4.223L13 14.85c.165.632-.22 1.252-.88 1.252h-.28c-.66 0-1.045-.62-1.21-1.252L10 11.691 7.918 7.073 5.5 11.691l-.21 1.252c-.165.632-.54 1.252-1.21 1.252h-.28c-.66 0-1.045-.62-.88-1.252l.21-1.252 2.155-4.223L1.724 5.591c-.284-.605-.081-1.307.545-1.591L6 2.19l.428-1.039z"/></svg> ${headerTitle}</span>
                    <span class="non-refundable">Non-Refundable</span>
                </div>
                <div class="flight-column-headers">
                    <div class="flight-col airline">Airline & Flight</div>
                    <div class="flight-col departing">Departure</div>
                    <div class="flight-col arriving">Arrival</div>
                    <div class="flight-col duration">Duration</div>
                </div>
                ${segmentsHtml}
            </div>
        `
        })
        .join('')

    // 2. Passengers
    let eTickets = bookingDetails.e_ticket_numbers || []
    if (typeof eTickets === 'string') {
        try {
            eTickets = JSON.parse(eTickets)
        } catch (err) {
            console.error('Invalid e_ticket_numbers JSON:', eTickets)
            eTickets = []
        }
    }
    const passengersHtml = bookingDetails.passenger_details.travelers
        .map(
            (pax, index) => `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${pax.title.toUpperCase()} ${pax.name.firstName} ${
                pax.name.lastName
            }</strong><br>Adult (${formatToLongDate(pax.dateOfBirth)})</td>
            <td>${pax.documents[0]?.number || 'N/A'}<br>${formatToLongDate(
                pax.documents[0]?.expiryDate
            )}, ${pax.documents[0]?.nationality || ''}</td>
            <td>${bookingDetails.pnr}</td>
            <td>${eTickets[index] || 'N/A'}</td>
            <td>${
                bookingDetails.status === 'TICKETED'
                    ? 'Confirmed'
                    : bookingDetails.status
            }</td>
        </tr>
    `
        )
        .join('')
    // Price Summary
    // 3. Payment Details
    const price = bookingDetails.amadeus_flight_offer.price
    const taxesAndFees = parseFloat(price.total) - parseFloat(price.base)
    const paymentDetailsHtml = `
        <table>
            <tr>
                <td>Base Fare</td>
                <td align="right">${parseFloat(price.base).toLocaleString(
                    'en-PH',
                    { style: 'currency', currency: 'PHP' }
                )}</td>
            </tr>
            <tr>
                <td>Taxes & Fees</td>
                <td align="right">${taxesAndFees.toLocaleString('en-PH', {
                    style: 'currency',
                    currency: 'PHP',
                })}</td>
            </tr>
            <tr class="total">
                <td>Total Fare</td>
                <td align="right">${parseFloat(price.grandTotal).toLocaleString(
                    'en-PH',
                    { style: 'currency', currency: 'PHP' }
                )}</td>
            </tr>
        </table>
    `

    // 4. Flight Inclusions
    const baggageInfo =
        bookingDetails.amadeus_flight_offer.travelerPricings[0]
            .fareDetailsBySegment[0].includedCheckedBags
    const flightInclusionsHtml = `
        <h5>Cabin Baggage (Pre Included)</h5>
        <p>Adult: 7 Kg Included</p>
        <br>
        <h5>Check-in Baggage (Pre Included)</h5>
        <p>Adult: ${baggageInfo?.weight || 0} ${
        baggageInfo?.weightUnit || 'KG'
    } Included</p>
    `

    // --- Replace all placeholders ---
    html = html
        .replace(/{{companyName}}/g, 'Lindela Travel And Tours - Trabilis')
        .replace(/{{companyEmail}}/g, 'lindelatravelctws@gmail.com')
        .replace(
            /{{companyAddress}}/g,
            'Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street, Makati, Metro Manila'
        ) // Replace with your actual address
        .replace('{{bookingReference}}', bookingDetails.booking_reference)
        .replace(
            '{{bookingDate}}',
            new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
        )
        .replace('{{itineraries}}', itinerariesHtml)
        .replace('{{passengers}}', passengersHtml)
        .replace('{{paymentDetails}}', paymentDetailsHtml)
        .replace('{{flightInclusions}}', flightInclusionsHtml)

    try {
        return await createPdfFromHtml(html)
    } catch (error) {
        console.error('Error generating flight PDF:', error)
        throw new Error('Could not generate the itinerary PDF.')
    }
}

export const generateTourSummaryPDF = async (bookingDetails) => {
    const templatePath = path.join(
        __dirname,
        'templates',
        'tour-confirmation-template.html'
    )

    let html
    try {
        html = await fs.readFile(templatePath, 'utf-8')
    } catch (err) {
        throw new Error(`Template not found: ${templatePath}`)
    }

    // Safely extract values with fallback
    const {
        bookingReference = 'N/A',
        tourTitle = 'N/A',
        startDate,
        endDate,
        passengerCount = 1,
        paymentType = 'FULL',
        amount = 'N/A',
        firstName = 'Guest',
        lastName = '',
        email = 'N/A',
        phone = 'N/A',
        status = 'CONFIRMED',
        inclusions = 'As per package',
        exclusions = '-',
        notes = '-',
        itinerary = '',
        ratePerPax = 'N/A',
        availableSlots = 'N/A',
        totalSlots = 'N/A',
        requirements = '-',
        paymentTerms = '-',
        tourDescription = '-',
        mainImageUrl = '',
        panellumUrl = '',
    } = bookingDetails

    // Derive flight details with TBA defaults (admin may later edit real details)
    const flight = bookingDetails.flight_details || {}
    const outboundSegs = Array.isArray(flight.outbound)
        ? flight.outbound
        : flight.outbound
        ? [flight.outbound]
        : []
    const inboundSegs = Array.isArray(flight.return || flight.inbound)
        ? flight.return || flight.inbound
        : flight.return || flight.inbound
        ? [flight.return || flight.inbound]
        : []
    const firstOutbound = outboundSegs[0] || {}
    const lastInbound = inboundSegs[inboundSegs.length - 1] || {}

    const outboundAirline = firstOutbound.airline || 'TBA'
    const outboundFlightNo = firstOutbound.flight_no || firstOutbound.flightNo || 'TBA'
    const outboundDeparture = firstOutbound.departure || 'TBA'
    const outboundArrival = firstOutbound.arrival || 'TBA'
    const outboundDate = firstOutbound.date || 'TBA'
    const returnAirline = lastInbound.airline || 'TBA'
    const returnFlightNo = lastInbound.flight_no || lastInbound.flightNo || 'TBA'
    const returnDeparture = lastInbound.departure || 'TBA'
    const returnArrival = lastInbound.arrival || 'TBA'
    const returnDate = lastInbound.date || 'TBA'

    html = html
        .replace(/{{bookingReference}}/g, bookingReference)
        .replace(/{{companyName}}/g, 'Lindela Travel And Tours - Trabilis')
        .replace(/{{companyEmail}}/g, 'lindelatravelctws@gmail.com')
        .replace(
            /{{companyAddress}}/g,
            'Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street, Makati, Metro Manila'
        )
        .replace(/{{bookingDate}}/g, formatDate(new Date()))
        .replace(/{{tourTitle}}/g, tourTitle)
        .replace(/{{startDate}}/g, formatDate(startDate))
        .replace(/{{endDate}}/g, formatDate(endDate))
        .replace(/{{passengerCount}}/g, passengerCount)
        .replace(/{{paymentType}}/g, paymentType)
        .replace(/{{amount}}/g, amount)
        .replace(/{{leadFirstName}}/g, firstName)
        .replace(/{{leadLastName}}/g, lastName)
        .replace(/{{leadEmail}}/g, email)
        .replace(/{{leadPhone}}/g, phone)
        .replace(/{{status}}/g, status)
        .replace(/{{inclusions}}/g, inclusions)
        .replace(/{{exclusions}}/g, exclusions)
        .replace(/{{notes}}/g, notes)
        .replace(/{{itineraryDetails}}/g, itinerary)
        .replace(/{{ratePerPax}}/g, ratePerPax)
        .replace(/{{availableSlots}}/g, availableSlots)
        .replace(/{{totalSlots}}/g, totalSlots)
        .replace(/{{requirements}}/g, requirements)
        .replace(/{{paymentTerms}}/g, paymentTerms)
        .replace(/{{tourDescription}}/g, tourDescription)
        .replace(/{{mainImageUrl}}/g, mainImageUrl)
        .replace(/{{panellumUrl}}/g, panellumUrl)
        // Flight placeholders (TBA defaults)
        .replace(/{{outboundAirline}}/g, outboundAirline)
        .replace(/{{outboundFlightNo}}/g, outboundFlightNo)
        .replace(/{{outboundDeparture}}/g, outboundDeparture)
        .replace(/{{outboundArrival}}/g, outboundArrival)
        .replace(/{{outboundDate}}/g, outboundDate)
        .replace(/{{returnAirline}}/g, returnAirline)
        .replace(/{{returnFlightNo}}/g, returnFlightNo)
        .replace(/{{returnDeparture}}/g, returnDeparture)
        .replace(/{{returnArrival}}/g, returnArrival)
        .replace(/{{returnDate}}/g, returnDate)

    try {
        return await createPdfFromHtml(html)
    } catch (err) {
        console.error('Error generating Tour PDF:', err)
        throw new Error('Could not generate the tour summary PDF.')
    }
}

export const getBookingByBookingReference = async (bookingReference) => {
    // This is your database logic, which should be correct.
    const result = await query(
        `SELECT * FROM flight_bookings WHERE booking_reference = ?`,
        [bookingReference]
    )

    if (!result.rows.length) {
        throw new Error(`No booking found with reference ${bookingReference}`)
    }

    const booking = result.rows[0]

    return booking
}

export const getTourBookingByReference = async (bookingReference) => {
    const { data, error } = await supabase
        .from('tour_bookings')
        .select('*')
        .eq('booking_reference', bookingReference)
        .single() // get just one record

    if (error) {
        throw new Error(`Error fetching tour booking: ${error.message}`)
    }

    if (!data) {
        throw new Error(
            `No tour booking found with reference ${bookingReference}`
        )
    }

    // If your table stores JSON fields (e.g., itinerary), parse them here
    if (typeof data.itinerary === 'string') {
        try {
            data.itinerary = JSON.parse(data.itinerary)
        } catch (err) {
            console.warn('Invalid JSON for itinerary:', data.itinerary)
            data.itinerary = ''
        }
    }

    return data
}

export const sendConfirmationEmail = async (bookingReference) => {
    const bookingDetails = await getBookingByBookingReference(bookingReference)
    const customerEmail =
        bookingDetails.passenger_details?.travelers[0]?.contact?.emailAddress

    if (!customerEmail) {
        throw new Error('Customer email not found in booking details.')
    }

    const pdfBuffer = await generateFlightItineraryPDF(bookingDetails)

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Trabilis <onboarding@resend.dev>',
            to: [customerEmail],
            subject: 'Your Flight Booking Confirmation',
            html: `
            <html>
                <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin:0; padding:0;">
                    <div style="max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px;">
                        <h1 style="color: #0078D4; text-align: center; margin-bottom: 10px;">
                            ✈️ Thank you for booking with <span style="font-weight: 700;">Trabilis</span>!
                        </h1>
                        <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center; margin-bottom: 30px;">
                            Your flight itinerary is attached to this email.<br/>
                            We wish you a safe and pleasant journey!
                        </p>
                        <p style="font-size: 14px; color: #888; margin-top: 40px; text-align: center;">
                            If you have any questions, feel free to 
                            <a href="mailto:lindelatravelctws@gmail.com" style="color: #0078D4; text-decoration: none;">
                                contact our support team
                            </a>.
                        </p>
                    </div>
                </body>
            </html>
        `,
            attachments: [
                {
                    filename: `Itinerary-${bookingDetails.booking_reference}.pdf`,
                    content: pdfBuffer,
                },
            ],
        })

        if (error) {
            console.error('Resend error:', error)
            throw new Error(`Failed to send email: ${error.message}`)
        }

        console.log('✅ Flight confirmation email sent via Resend:', data)
    } catch (err) {
        console.error('❌ Error sending flight confirmation email:', err)
        throw err
    }
}

export const sendTourConfirmationEmail = async (bookingDetails) => {
    try {
        const pdfBuffer = await generateTourSummaryPDF(bookingDetails)
        const {
            email,
            firstName = 'Guest',
            bookingReference = 'N/A',
            tourTitle = 'Tour',
        } = bookingDetails

        if (!email) throw new Error('Recipient email not found.')

        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Trabilis <onboarding@resend.dev>',
            to: [email],
            subject: `Tour Confirmation - ${tourTitle}`,
            html: `
                <p>Hi ${firstName},</p>
                <p>Thank you for booking <strong>${tourTitle}</strong>.</p>
                <p>Please find attached your booking summary (Ref: ${bookingReference}).</p>
                <p>We look forward to your adventure!</p>
                <br/>
                <p>— The Trabilis Team</p>
            `,
            attachments: [
                {
                    filename: `Tour-Summary-${bookingReference}.pdf`,
                    content: pdfBuffer,
                },
            ],
        })

        if (error) {
            console.error('Resend error:', error)
            throw new Error(`Failed to send email: ${error.message}`)
        }

        console.log(`✅ Tour confirmation email sent to ${email} (Ref: ${bookingReference})`)
        console.log('Resend response:', data)
    } catch (err) {
        console.error('❌ Error sending tour confirmation email:', err)
        throw err
    }
}

export const sendFailureEmail = async ({
    email,
    firstName,
    lastName,
    bookingReference,
    searchCriteria,
}) => {
    if (!email) throw new Error('Recipient email is required.')

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Trabilis <onboarding@resend.dev>',
            to: [email],
            subject: 'Booking Failure Notification',
            html: `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <h2 style="color: #d9534f;">Booking Failed</h2>
                <p>Dear ${firstName} ${lastName},</p>
                <p>We regret to inform you that your booking with reference <strong>${bookingReference}</strong> has failed.</p>
                <p>Please review your search criteria and try again:</p>
                <pre style="background:#eee; padding:10px; border-radius:4px;">${JSON.stringify(
                    searchCriteria,
                    null,
                    2
                )}</pre>
                <p>If you have any questions, please contact our support team at 
                  <a href="mailto:lindelatravelctws@gmail.com">lindelatravelctws@gmail.com</a>.
                </p>
                <p>Thank you for your understanding.</p>
                <p>Best regards,<br/>Trabilis Team</p>
              </div>
            </body>
          </html>
        `,
        })

        if (error) {
            console.error('Resend error:', error)
            throw new Error(`Failed to send email: ${error.message}`)
        }

        console.log('✅ Failure email sent via Resend:', data)
    } catch (err) {
        console.error('❌ Error sending failure email:', err)
        throw err
    }
}

export const sendTourFailureEmail = async ({
    email,
    firstName,
    lastName,
    bookingReference,
}) => {
    if (!email) throw new Error('Recipient email is required.')

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Trabilis <onboarding@resend.dev>',
            to: [email],
            subject: 'Tour Booking Failed',
            html: `
          <html>
            <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                <h2 style="color: #d9534f;">Tour Booking Failed</h2>
                <p>Dear ${firstName} ${lastName},</p>
                <p>Unfortunately, your tour booking with reference 
                  <strong>${bookingReference}</strong> could not be completed.</p>
                <p>Please try again later or contact our support team for assistance.</p>
                <p>If you need help, reach us at 
                  <a href="mailto:lindelatravelctws@gmail.com">lindelatravelctws@gmail.com</a>.
                </p>
                <p>We apologize for the inconvenience and thank you for choosing us.</p>
                <p>Best regards,<br/>Trabilis Team</p>
              </div>
            </body>
          </html>
        `,
        })

        if (error) {
            console.error('Resend error:', error)
            throw new Error(`Failed to send email: ${error.message}`)
        }

        console.log('✅ Tour failure email sent via Resend:', data)
    } catch (err) {
        console.error('❌ Error sending tour failure email:', err)
        throw err
    }
}

export const sendVisaInquiryConfirmationEmail = async ({
    inquiryReference,
    visa_type,
    destination,
    full_name,
    email_address,
    message
}) => {
    if (!email_address) throw new Error('Recipient email is required.')

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'Trabilis <onboarding@resend.dev>',
            to: [email_address],
            subject: 'Visa Inquiry Received - Lindela Immigration Visa Consultancy',
            html: `
          <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin:0; padding:0;">
              <div style="max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #f7d100; font-size: 2rem; margin: 0; font-weight: 900;">
                    🛂 Lindela Immigration Visa Consultancy
                  </h1>
                  <p style="color: #666; margin: 10px 0 0 0; font-size: 1.1rem;">
                    Your Trusted Partner in Dream Destinations
                  </p>
                </div>
                
                <h2 style="color: #333; text-align: center; margin-bottom: 20px;">
                  ✅ Visa Inquiry Received Successfully!
                </h2>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                  Dear <strong>${full_name}</strong>,
                </p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for your interest in our visa consultation services! We have successfully received your inquiry and our team of expert visa consultants will review your request shortly.
                </p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f7d100;">
                  <h3 style="color: #333; margin-top: 0; font-size: 1.2rem;">Inquiry Details:</h3>
                  <p style="margin: 5px 0; color: #555;"><strong>Reference Number:</strong> ${inquiryReference}</p>
                  <p style="margin: 5px 0; color: #555;"><strong>Visa Type:</strong> ${visa_type}</p>
                  <p style="margin: 5px 0; color: #555;"><strong>Destination:</strong> ${destination}</p>
                  <p style="margin: 5px 0; color: #555;"><strong>Your Message:</strong> ${message}</p>
                </div>
                
                <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #0066cc; margin-top: 0; font-size: 1.1rem;">What happens next?</h3>
                  <ul style="color: #333; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
                    <li>Our visa consultant will review your inquiry within 24 hours</li>
                    <li>We will contact you via phone or email to discuss your requirements</li>
                    <li>We will provide you with a detailed consultation and next steps</li>
                    <li>Our team will guide you through the entire visa application process</li>
                  </ul>
                </div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 20px 0;">
                  With our <strong>12 years of experience</strong> and <strong>high approval rate</strong>, we are confident that we can help you achieve your travel dreams. Our knowledgeable and professional team is committed to providing you with the best possible service.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="color: #666; font-size: 14px; margin: 0;">
                    Need immediate assistance? Contact us at:
                  </p>
                  <p style="margin: 10px 0;">
                    <a href="mailto:lindelatravelctws@gmail.com" style="color: #f7d100; text-decoration: none; font-weight: bold;">
                      lindelatravelctws@gmail.com
                    </a>
                  </p>
                </div>
                
                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
                  <p style="color: #888; font-size: 12px; margin: 0;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                  <p style="color: #888; font-size: 12px; margin: 5px 0 0 0;">
                    © 2024 Lindela Immigration Visa Consultancy - Trabilis. All rights reserved.
                  </p>
                </div>
              </div>
            </body>
          </html>
        `,
        })

        if (error) {
            console.error('Resend error:', error)
            throw new Error(`Failed to send email: ${error.message}`)
        }

        console.log('✅ Visa inquiry confirmation email sent via Resend:', data)
    } catch (err) {
        console.error('❌ Error sending visa inquiry confirmation email:', err)
        throw err
    }
}
