import { query } from '../config/db.js'
import nodemailer from 'nodemailer'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'
import fetch from 'node-fetch'

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
        .replace(/{{companyName}}/g, 'Lindela Travel And Tours') // Replace with your actual company name
        .replace(/{{companyEmail}}/g, 'lindelatravelandtours@gmail.com') // Replace with your actual email
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
        const response = await fetch('https://api.pdfshift.io/v3/convert/pdf', {
            method: 'POST',
            headers: {
                'X-API-Key': process.env.PDFSHIFT_API_KEY,
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                source: html,
                format: 'A4',
                landscape: false,
                use_print: true,
            }),
        })

        if (!response.ok) {
            throw new Error(
                `PDFShift API error: ${
                    response.status
                } ${await response.text()}`
            )
        }

        const arrayBuffer = await response.arrayBuffer()
        return Buffer.from(arrayBuffer)
    } catch (error) {
        console.error('Error generating PDF via PDFShift:', error)
        throw new Error('Could not generate the itinerary PDF.')
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

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_SMTP_USER,
        pass: process.env.GMAIL_SMTP_PASS,
    },
})

export default transporter

export const sendConfirmationEmail = async (bookingReference) => {
    const bookingDetails = await getBookingByBookingReference(bookingReference)
    const customerEmail =
        bookingDetails.passenger_details?.travelers[0]?.contact?.emailAddress

    if (!customerEmail) {
        throw new Error('Customer email not found in booking details.')
    }

    const pdfBuffer = await generateFlightItineraryPDF(bookingDetails)

    const mailOptions = {
        from: process.env.GMAIL_SMTP_FROM,
        to: customerEmail,
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
                        <a href="mailto:${process.env.GMAIL_SMTP_FROM}" style="color: #0078D4; text-decoration: none;">
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
                contentType: 'application/pdf',
            },
        ],
    }
    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent! Preview URL:', nodemailer.getTestMessageUrl(info))
}

export const sendFailureEmail = async ({
    email,
    firstName,
    lastName,
    bookingReference,
    searchCriteria,
}) => {
    if (!email) throw new Error('Recipient email is required.')

    const mailOptions = {
        from: process.env.GMAIL_SMTP_FROM,
        to: email,
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
              <a href="mailto:${process.env.GMAIL_SMTP_FROM}">${
            process.env.GMAIL_SMTP_FROM
        }</a>.
            </p>
            <p>Thank you for your understanding.</p>
            <p>Best regards,<br/>Trabilis Team</p>
          </div>
        </body>
      </html>
    `,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(
        'Failure email sent! Preview URL:',
        nodemailer.getTestMessageUrl(info)
    )
}
