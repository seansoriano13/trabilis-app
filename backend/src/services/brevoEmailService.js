import * as brevo from '@getbrevo/brevo'
import { query } from '../config/db.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabase } from '../config/supabaseClient.js'
import puppeteer from 'puppeteer'
import chromium from '@sparticuz/chromium'
import { formatSegment, getStopsLabel } from '../utils/flightutils.js'
import { getAirlineInfo } from '../utils/airlinesUtils.js'
import { getAircraftName } from '../utils/aircraftUtils.js'
import { getAirportFull } from '../utils/airportUtils.js'
import { generateTourBookingHTML } from '../controllers/admin/tourController.js'
import airlines from '../data/airlines.json' with { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Helper function to parse airport information from string (from tourController.js)
const parseAirportInfo = (airportString) => {
    if (!airportString || airportString === 'TBA') {
        return {
            iata: 'TBA',
            city: 'TBA',
            airport: 'TBA',
            terminal: 'TBA'
        }
    }
    
    // Try to extract IATA code from various patterns
    let iata = 'TBA'
    
    // Pattern 1: IATA at the beginning (e.g., "MNL Manila")
    const iataStartMatch = airportString.match(/^([A-Z]{3})\s/)
    if (iataStartMatch) {
        iata = iataStartMatch[1]
    } else {
        // Pattern 2: IATA in parentheses (e.g., "Ninoy Aquino International Airport (MNL)")
        const iataParenMatch = airportString.match(/\(([A-Z]{3})\)/)
        if (iataParenMatch) {
            iata = iataParenMatch[1]
        } else {
            // Pattern 3: Try to find any 3-letter uppercase code
            const anyIataMatch = airportString.match(/([A-Z]{3})/)
            if (anyIataMatch) {
                iata = anyIataMatch[1]
            }
        }
    }
    // Use airportUtils to get full airport information
    const airportInfo = getAirportFull(iata)
    
    return {
        iata: airportInfo.iata,
        city: airportInfo.city,
        airport: airportInfo.name,
        terminal: 'TBA' // Default terminal - will be updated from form data
    }
}

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

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
    const isProduction = process.env.NODE_ENV === 'production'
    
    try {
        // Render-friendly Puppeteer launch options
        const userDataDir = process.env.PUPPETEER_USER_DATA_DIR || '/tmp/puppeteer-user-data'
        const useSystemChrome = process.env.PUPPETEER_USE_SYSTEM_CHROME === 'true'
        const envExecutablePath = useSystemChrome ? process.env.PUPPETEER_EXECUTABLE_PATH : undefined
        
        if (!isProduction) {
            console.log('🔍 PUPPETEER DEBUG - Starting PDF generation')
            console.log('🔍 PUPPETEER DEBUG - Environment check:', {
                NODE_ENV: process.env.NODE_ENV,
                isProduction,
                userDataDir,
                useSystemChrome,
                envExecutablePath,
                RENDER: !!process.env.RENDER,
                RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL
            })
        }
        
        let resolvedExecutablePath
        if (isProduction) {
            try {
                resolvedExecutablePath = await chromium.executablePath()
            } catch (chromiumError) {
                console.error('❌ Chromium path resolution failed:', chromiumError.message)
                resolvedExecutablePath = puppeteer.executablePath()
            }
        } else if (envExecutablePath) {
            try {
                await fs.access(envExecutablePath)
                resolvedExecutablePath = envExecutablePath
                if (!isProduction) {
                    console.log('🔍 PUPPETEER DEBUG - Using custom executable path:', resolvedExecutablePath)
                }
            } catch {
                resolvedExecutablePath = puppeteer.executablePath()
                if (!isProduction) {
                    console.log('🔍 PUPPETEER DEBUG - Custom path not accessible, using Puppeteer path:', resolvedExecutablePath)
                }
            }
        } else {
            resolvedExecutablePath = puppeteer.executablePath()
            if (!isProduction) {
                console.log('🔍 PUPPETEER DEBUG - Using default Puppeteer path:', resolvedExecutablePath)
            }
        }

        // Render-specific args for better compatibility
        const renderArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-zygote',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--font-render-hinting=medium',
            '--ignore-certificate-errors',
            '--ignore-ssl-errors',
            '--ignore-certificate-errors-spki-list',
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--memory-pressure-off',
            '--max_old_space_size=512'
        ]
        
        const launchArgs = isProduction ? [...chromium.args, ...renderArgs] : renderArgs
        
        if (!isProduction) {
            console.log('🔍 PUPPETEER DEBUG - Launch configuration:', {
                headless: 'new',
                argsCount: launchArgs.length,
                userDataDir,
                executablePath: resolvedExecutablePath,
                isProduction
            })
        }

        try {
            if (!isProduction) {
                console.log('🔍 PUPPETEER DEBUG - Attempting browser launch')
            }
            browser = await puppeteer.launch({
                headless: 'new',
                args: launchArgs,
                defaultViewport: isProduction ? chromium.defaultViewport : null,
                userDataDir,
                executablePath: resolvedExecutablePath,
                timeout: 30000, // 30 second timeout
            })
            if (!isProduction) {
                console.log('✅ PUPPETEER DEBUG - Browser launched successfully')
            }
        } catch (launchErr) {
            console.error('❌ Browser launch failed:', launchErr.message)
            if (!isProduction) {
                console.log('🔍 PUPPETEER DEBUG - Attempting fallback launch without explicit executablePath')
            }
            
            // Fallback: try without explicit executablePath (let Puppeteer resolve bundled Chrome)
            browser = await puppeteer.launch({
                headless: 'new',
                args: launchArgs,
                defaultViewport: isProduction ? chromium.defaultViewport : null,
                userDataDir,
                timeout: 30000,
            })
            if (!isProduction) {
                console.log('✅ PUPPETEER DEBUG - Fallback browser launch successful')
            }
        }
        const page = await browser.newPage()
        if (!isProduction) {
            console.log('✅ PUPPETEER DEBUG - New page created')
        }
        
        // Set real Chrome user-agent and headers for better image loading
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        if (!isProduction) {
            console.log('✅ PUPPETEER DEBUG - User agent set')
        }
        
        // Set extra headers including Referer for kiwi.com images
        await page.setExtraHTTPHeaders({
            'Referer': 'https://www.kiwi.com',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
        })
        if (!isProduction) {
            console.log('✅ PUPPETEER DEBUG - HTTP headers set')
        }
        
        // Ensure UTF-8 charset and base styles are respected
        const normalizedHtml = html.includes('<meta charset="utf-8"')
            ? html
            : html.replace(
                  /<head>/i,
                  '<head><meta charset="utf-8">'
              )
        
        if (!isProduction) {
            console.log('🔍 PUPPETEER DEBUG - HTML prepared, length:', normalizedHtml.length)
        }
        
        // Load content with networkidle0 to wait for all resources
        if (!isProduction) {
            console.log('🔍 PUPPETEER DEBUG - Loading HTML content')
        }
        await page.setContent(normalizedHtml, { 
            waitUntil: 'networkidle0',
            timeout: 30000 // 30 second timeout for image loading
        })
        if (!isProduction) {
            console.log('✅ PUPPETEER DEBUG - HTML content loaded')
        }
        
        // Wait for all images to load completely
        if (!isProduction) {
            console.log('🔍 PUPPETEER DEBUG - Waiting for images to load')
        }
        await page.evaluate(() => {
            return Promise.all(
                Array.from(document.images)
                    .filter(img => !img.complete)
                    .map(img => new Promise(resolve => {
                        img.onload = img.onerror = resolve
                    }))
            )
        })
        if (!isProduction) {
            console.log('✅ PUPPETEER DEBUG - Images loaded')
        }
        
        // Additional wait to ensure all images are fully rendered
        await new Promise(resolve => setTimeout(resolve, 2000))
        if (!isProduction) {
            console.log('✅ PUPPETEER DEBUG - Additional render wait completed')
        }
        
        if (!isProduction) {
            console.log('🔍 PUPPETEER DEBUG - Generating PDF')
        }
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: false,
            margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
        })
        if (!isProduction) {
            console.log('✅ PUPPETEER DEBUG - PDF generated successfully, size:', pdfBuffer.length, 'bytes')
        }
        
        await page.close()
        if (!isProduction) {
            console.log('✅ PUPPETEER DEBUG - Page closed')
        }
        
        return pdfBuffer
    } finally {
        if (browser) {
            if (!isProduction) {
                console.log('🔍 PUPPETEER DEBUG - Closing browser')
            }
            try {
                await browser.close()
                if (!isProduction) {
                    console.log('✅ PUPPETEER DEBUG - Browser closed successfully')
                }
            } catch (closeError) {
                console.error('❌ Error closing browser:', closeError.message)
            }
        }
    }
}

export const generateFlightItineraryPDF = async (bookingDetails) => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const templatePath = path.join(
        __dirname,
        'templates',
        'flight.html'
    )

    let html = await fs.readFile(templatePath, 'utf-8')

    // Set base URL for images - auto-detect from Render or environment
    const baseUrl = process.env.RENDER_EXTERNAL_URL || 
                    process.env.BACKEND_URL || 
                    'http://localhost:3001'

    // 1. Generate Itineraries HTML (matching template structure)
    const itinerariesHtml = (bookingDetails.amadeus_flight_offer?.itineraries || [])
        .map((itinerary, index) => {
            const segmentsHtml = (itinerary.segments || [])
                .map((segment) => {
                    const {
                        airline,
                        aircraft,
                        departure,
                        arrival,
                        stopsLabel,
                        duration: flightDuration,
                    } = formatSegment(segment)

                    return `
                    <div class="pdf-flight-details__data">
                        <div class="pdf-flight-details__airline">
                        ${airline.logo ? `
                            <img
                                class="pdf-flight-details__airline-logo"
                                src="${airline.logo}"
                                alt="${airline.name}"
                                onerror="this.style.display='none';"
                            />
                        ` : ``}
                        
                            <div class="pdf-flight-details__airline-name">
                                <p class="pdf-flight-details__airline-text">
                                    <b>${airline.name}</b>
                                </p>
                                <p class="pdf-flight-details__airline-text">
                                    ${aircraft}
                                </p>
                            </div>
                        </div>
                        <div class="pdf-flight-details__departure">
                            <p class="pdf-flight-details__airport-code">
                                <b><span>${departure.iata}</span></b>
                                <span>${departure.city}</span>
                            </p>
                            <p class="pdf-flight-details__airport-name">
                                <span>${departure.airport}</span>
                            </p>
                            <p class="pdf-flight-details__terminal">
                                <span>Terminal ${departure.terminal || ''}</span>
                            </p>
                            <p class="pdf-flight-details__time">
                                <b><span>${departure.time}</span></b>
                            </p>
                        </div>
                        <div class="pdf-flight-details__arrival">
                            <p class="pdf-flight-details__airport-code">
                                <b><span>${arrival.iata}</span><span>${arrival.city}</span></b>
                            </p>
                            <p class="pdf-flight-details__airport-code">
                                <span>${arrival.airport}</span>
                            </p>
                            <p class="pdf-flight-details__terminal">
                                <span>Terminal ${arrival.terminal || ''}</span>
                            </p>
                            <p class="pdf-flight-details__time">
                                <b><span>${arrival.time}</span></b>
                            </p>
                        </div>
                        <div class="pdf-flight-details__leg">
                            <p class="pdf-flight-details__stops">${stopsLabel}</p>
                            <p class="pdf-flight-details__durations">${flightDuration}</p>
                        </div>
                    </div>
                    `
                })
                .join('')

            return `
            <div class="pdf-flight-details__section">
                <div class="pdf-table-header">
                    <div class="pdf-table-header__title">
                        <i class="fa-solid fa-plane"></i>
                        <p>
                            <b>${index === 0 ? 'Onward' : 'Return'}</b>
                            <span>${itinerary.segments?.length || 0}</span>
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
                ${segmentsHtml}
            </div>
            `
        })
        .join('')

    // 2. Generate Passenger Details HTML (matching template structure)
    const eTickets = bookingDetails.e_ticket_numbers || [] // Define eTickets with fallback to empty array
    const passengerDetailsHtml = (bookingDetails.passenger_details?.travelers || [])
        .map((passenger, index) => {
            const title = passenger.title || ''
            const name = `${passenger.name?.firstName || ''} ${passenger.name?.lastName || ''}`.trim().toUpperCase()
            const type = passenger.type || 'Adult'
            const dateOfBirth = passenger.dateOfBirth || ''
            const psngrDocs = (passenger.documents || [])[0] || {}
            const passport = {
                number: psngrDocs.number || 'N/A',
                expiry: psngrDocs.expiryDate || 'N/A',
            }
            const status = bookingDetails.status === 'TICKETED' ? 'CONFIRMED' : bookingDetails.status
            
            // Get e-ticket number for this passenger (if available)
            const passengerETicket = Array.isArray(eTickets) && eTickets[index] ? eTickets[index] : 'N/A'

            return `
            <div class="pdf-passenger-details__data">
                <div><span>${index + 1}</span></div>
                <div class="pdf-passenger-details__data-name">
                    <p><b>${title ? title.toUpperCase() + '. ' : ''}${name}</b></p>
                    <p>${type} (${dateOfBirth})</p>
                </div>
                <div class="pdf-passenger-details__data-passport">
                    <span>${passport.number}</span>
                    <span>${passport.expiry}</span>
                </div>
                <p class="pdf-passenger-details__data-pnr">${bookingDetails.pnr || 'N/A'}</p>
                <div>N/A</div>
                <div>${passengerETicket}</div>
                <div>N/A</div>
                <div>${status || 'N/A'}</div>
            </div>
            `
        })
        .join('')

    // 3. Calculate Payment Details
    const offerPrice = bookingDetails.amadeus_flight_offer?.price || {}
    const currencyCode = offerPrice.currency || bookingDetails.currency || 'PHP'
    const toNumber = (value) => Number(value ?? 0)
    const baseFare = toNumber(offerPrice.base)
    const totalFare = toNumber(offerPrice.total || offerPrice.grandTotal)
    const refundableTaxes = toNumber(
        bookingDetails.amadeus_flight_offer?.travelerPricings?.[0]?.price?.refundableTaxes
    )
    const liTax = refundableTaxes || 0
    const feesAndTaxes = Math.max(0, totalFare - baseFare - liTax)
    const formatAmount = (n) =>
        toNumber(n).toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })

    // 4. Flight Inclusions
    const flightNumbers = (bookingDetails.amadeus_flight_offer?.itineraries || [])
        .flatMap((it) => it.segments || [])
        .map((seg) => {
            const code = seg.operating?.carrierCode || seg.carrierCode
            return `${code}-${seg.number}`
        })
        .join(', ')

    // Derive baggage from traveler pricing fareDetailsBySegment if available
    const fareDetails = bookingDetails.amadeus_flight_offer?.travelerPricings?.[0]?.fareDetailsBySegment || []
    const bagInfo = fareDetails.reduce(
        (acc, f) => {
            const includedBags = f.includedCheckedBags
            if (includedBags) {
                if (typeof includedBags.weight === 'number') {
                    acc.checkedKg = Math.max(acc.checkedKg, includedBags.weight)
                    acc.checkedUnit = includedBags.weightUnit || acc.checkedUnit
                }
                if (typeof includedBags.quantity === 'number') {
                    acc.checkedPieces = Math.max(acc.checkedPieces, includedBags.quantity)
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

    const cabinBaggageText = `Adult: ${bagInfo.cabinPieces || 0} Pc Included`
    const checkedBaggageText = bagInfo.checkedKg > 0
        ? `Adult: ${bagInfo.checkedKg} ${bagInfo.checkedUnit}`
        : `Adult: ${bagInfo.checkedPieces || 0} PC`

    // 5. Replace all placeholders with correct values
    html = html
        .replace(/{{baseUrl}}/g, baseUrl)
        .replace(/{{bookingReference}}/g, bookingDetails.booking_reference || 'N/A')
        .replace('{{bookingDate}}', new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }))
        .replace('{{itineraries}}', itinerariesHtml)
        .replace('{{passengerDetails}}', passengerDetailsHtml)
        .replace('{{currency}}', currencyCode)
        .replace('{{baseFare}}', formatAmount(baseFare))
        .replace('{{feesTaxes}}', formatAmount(feesAndTaxes))
        .replace('{{liTax}}', formatAmount(liTax))
        .replace('{{totalFare}}', formatAmount(totalFare))
        .replace(/\{\{flightNumbers\}\}/g, flightNumbers)
        .replace('{{cabinBaggage}}', cabinBaggageText)
        .replace('{{checkedBaggage}}', checkedBaggageText)

    try {
        return await createPdfFromHtml(html)
    } catch (error) {
        console.error('Error generating flight PDF:', error)
        throw new Error('Could not generate the itinerary PDF.')
    }
}

export const generateTourSummaryPDF = async (bookingDetails) => {
    try {
        console.log('🔍 PDF DEBUG - Starting tour PDF generation')
        console.log('📧 Email PDF Generation - Received bookingDetails:', JSON.stringify(bookingDetails, null, 2))
        
        // Transform flattened bookingDetails back to the structure expected by generateTourBookingHTML
        const transformedBooking = {
            booking_reference: bookingDetails.bookingReference,
            lead_first_name: bookingDetails.firstName,
            lead_last_name: bookingDetails.lastName,
            lead_email: bookingDetails.email,
            lead_phone: bookingDetails.phone || 'Not provided',
            passenger_count: bookingDetails.passengerCount,
            payment_type: bookingDetails.paymentType,
            total_amount: parseFloat(bookingDetails.amount) || 0,
            reservation_amount: parseFloat(bookingDetails.reservationAmount) || 0,
            status: bookingDetails.status || 'CONFIRMED',
            passenger_details: bookingDetails.passengers || [],
            flight_details: bookingDetails.flight_details || {},
            created_at: bookingDetails.created_at || new Date().toISOString(),
            updated_at: bookingDetails.updated_at || new Date().toISOString(),
            package_dates: {
                id: bookingDetails.package_date_id || null,
                start_date: bookingDetails.startDate,
                end_date: bookingDetails.endDate,
                total_slots: bookingDetails.totalSlots || bookingDetails.availableSlots || 0,
                inclusions: bookingDetails.inclusions || [],
                exclusions: bookingDetails.exclusions || [],
                payment_terms: bookingDetails.paymentTerms || [],
                requirements: bookingDetails.requirements || [],
                notes: bookingDetails.notes || [],
                tour_packages: {
                    id: bookingDetails.tour_package_id || null,
                    title: bookingDetails.tourTitle,
                    description: bookingDetails.tourDescription
                },
                package_itineraries: (() => {
                    // Handle itinerary data - it should be an array from package_itineraries table
                    if (Array.isArray(bookingDetails.itinerary)) {
                        console.log('✅ Itinerary received as array with', bookingDetails.itinerary.length, 'items')
                        return bookingDetails.itinerary
                    } else if (typeof bookingDetails.itinerary === 'string' && bookingDetails.itinerary.trim()) {
                        // If it's a string, something went wrong in the data flow
                        console.log('⚠️ Warning: Itinerary received as string instead of array!')
                        console.log('⚠️ String content preview:', bookingDetails.itinerary.substring(0, 100) + '...')
                        return []
                    } else {
                        console.log('⚠️ Warning: No itinerary data received')
                        return []
                    }
                })(),
                itinerary: (() => {
                    // Generate itinerary string for PDF display
                    if (Array.isArray(bookingDetails.itinerary)) {
                        return bookingDetails.itinerary
                            .sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
                            .map(day => `Day ${day.day_number || 'N/A'}: ${day.title || 'Tour Day'}\n${day.description || 'No description available'}`)
                            .join('\n\n')
                    } else if (typeof bookingDetails.itinerary === 'string' && bookingDetails.itinerary.trim()) {
                        return bookingDetails.itinerary
                    } else {
                        return 'Detailed itinerary will be provided upon confirmation.'
                    }
                })()
            }
        }

        console.log('📧 Email PDF Generation - Transformed booking:', JSON.stringify(transformedBooking, null, 2))

        // Generate HTML using shared function
        console.log('🔍 PDF DEBUG - Generating HTML from template')
        const html = await generateTourBookingHTML(transformedBooking)
        
        console.log('📧 Email PDF Generation - HTML generated successfully, length:', html.length)
        
        // Convert HTML to PDF using existing PDF generation logic
        console.log('🔍 PDF DEBUG - Converting HTML to PDF')
        return await createPdfFromHtml(html)
    } catch (err) {
        console.error('❌ PDF DEBUG - Error generating Tour PDF:', err)
        console.error('❌ PDF DEBUG - Booking details received:', JSON.stringify(bookingDetails, null, 2))
        console.error('❌ PDF DEBUG - Error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name
        })
        throw new Error('Could not generate the tour summary PDF.')
    }
}

export const getBookingByBookingReference = async (bookingReference) => {
    // This is your database logic, which should be correct.
    const { data, error } = await supabase
        .from('flight_bookings')
        .select('*')
        .eq('booking_reference', bookingReference)
        .single()

    if (error || !data) {
        throw new Error(`No booking found with reference ${bookingReference}`)
    }

    return data
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
    
    // Find the first adult traveler with contact info (in case first passenger is a child)
    const adultTraveler = bookingDetails.passenger_details?.travelers?.find(
        traveler => traveler.type === 'ADULT' && traveler.contact?.emailAddress
    )
    
    const customerEmail = adultTraveler?.contact?.emailAddress

    if (!customerEmail) {
        throw new Error('Customer email not found in booking details.')
    }

    const pdfBuffer = await generateFlightItineraryPDF(bookingDetails)

    try {
        const sendSmtpEmail = new brevo.SendSmtpEmail()
        
        sendSmtpEmail.subject = 'Your Flight Booking Confirmation'
        sendSmtpEmail.htmlContent = `
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
        `
        
        sendSmtpEmail.sender = {
            name: 'Trabilis',
            email: process.env.BREVO_FROM_EMAIL || 'noreply@trabilis.com'
        }
        
        sendSmtpEmail.to = [{
            email: customerEmail
        }]
        
        sendSmtpEmail.attachment = [{
            content: Buffer.from(pdfBuffer).toString('base64'),
            name: `Flight-Itinerary-${bookingDetails.booking_reference}.pdf`
        }]

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log('✅ Flight confirmation email sent via Brevo API:', data.response.statusMessage)
    } catch (err) {
        console.error('❌ Error sending flight confirmation email:', err)
        throw err
    }
}

export const sendTourConfirmationEmail = async (bookingDetails) => {
    try {
        console.log('🔍 EMAIL DEBUG - Starting tour confirmation email for:', bookingDetails.bookingReference)
        console.log('🔍 EMAIL DEBUG - Email recipient:', bookingDetails.email)
        console.log('🔍 EMAIL DEBUG - Tour title:', bookingDetails.tourTitle)
        
        console.log('🔍 EMAIL DEBUG - Generating PDF buffer')
        const pdfBuffer = await generateTourSummaryPDF(bookingDetails)
        console.log('✅ EMAIL DEBUG - PDF generated successfully, size:', pdfBuffer.length, 'bytes')
        
        const {
            email,
            firstName = 'Guest',
            bookingReference = 'N/A',
            tourTitle = 'Tour',
        } = bookingDetails

        if (!email) throw new Error('Recipient email not found.')

        console.log('🔍 EMAIL DEBUG - Preparing Brevo email')
        const sendSmtpEmail = new brevo.SendSmtpEmail()
        
        sendSmtpEmail.subject = `Tour Confirmation - ${tourTitle}`
        sendSmtpEmail.htmlContent = `
            <p>Hi ${firstName},</p>
            <p>Thank you for booking <strong>${tourTitle}</strong>.</p>
            <p>Please find attached your booking summary (Ref: ${bookingReference}).</p>
            <p>We look forward to your adventure!</p>
            <br/>
            <p>— The Trabilis Team</p>
        `
        
        sendSmtpEmail.sender = {
            name: 'Trabilis',
            email: process.env.BREVO_FROM_EMAIL || 'noreply@trabilis.com'
        }
        
        sendSmtpEmail.to = [{
            email: email
        }]
        
        sendSmtpEmail.attachment = [{
            content: Buffer.from(pdfBuffer).toString('base64'),
            name: `Tour-Summary-${bookingReference}.pdf`
        }]

        console.log('🔍 EMAIL DEBUG - Sending email via Brevo API')
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log(`✅ EMAIL DEBUG - Tour confirmation email sent to ${email} (Ref: ${bookingReference})`)
        console.log('🔍 EMAIL DEBUG - Brevo API response:', data.response.statusMessage)
    } catch (err) {
        console.error('❌ EMAIL DEBUG - Error sending tour confirmation email:', err)
        console.error('❌ EMAIL DEBUG - Error details:', {
            message: err.message,
            stack: err.stack,
            name: err.name
        })
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
        const sendSmtpEmail = new brevo.SendSmtpEmail()
        
        sendSmtpEmail.subject = 'Booking Failure Notification'
        sendSmtpEmail.htmlContent = `
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
        `
        
        sendSmtpEmail.sender = {
            name: 'Trabilis',
            email: process.env.BREVO_FROM_EMAIL || 'noreply@trabilis.com'
        }
        
        sendSmtpEmail.to = [{
            email: email
        }]

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log('✅ Failure email sent via Brevo API:', data)
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
        const sendSmtpEmail = new brevo.SendSmtpEmail()
        
        sendSmtpEmail.subject = 'Tour Booking Failed'
        sendSmtpEmail.htmlContent = `
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
        `
        
        sendSmtpEmail.sender = {
            name: 'Trabilis',
            email: process.env.BREVO_FROM_EMAIL || 'noreply@trabilis.com'
        }
        
        sendSmtpEmail.to = [{
            email: email
        }]

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log('✅ Tour failure email sent via Brevo API:', data)
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
        const sendSmtpEmail = new brevo.SendSmtpEmail()
        
        sendSmtpEmail.subject = 'Visa Inquiry Received - Lindela Immigration Visa Consultancy'
        sendSmtpEmail.htmlContent = `
          <html>
            <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin:0; padding:0;">
              <div style="max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="color: #f7d100; font-size: 2rem; margin: 0; font-weight: 900;">
                     Lindela Immigration Visa Consultancy
                  </h1>
                  <p style="color: #666; margin: 10px 0 0 0; font-size: 1.1rem;">
                    Your Trusted Partner in Dream Destinations
                  </p>
                </div>
                
                <h2 style="color: #333; text-align: center; margin-bottom: 20px;">
                   Visa Inquiry Received Successfully!
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
        `
        
        sendSmtpEmail.sender = {
            name: 'Trabilis',
            email: process.env.BREVO_FROM_EMAIL || 'noreply@trabilis.com'
        }
        
        sendSmtpEmail.to = [{
            email: email_address
        }]

        const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
        console.log('✅ Visa inquiry confirmation email sent via Brevo API:', data)
    } catch (err) {
        console.error('❌ Error sending visa inquiry confirmation email:', err)
        throw err
    }
}
