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

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
)

// Debug Brevo configuration
console.log(`[BREVO] 🔍 API Key configured: ${!!process.env.BREVO_API_KEY}`)
console.log(
  `[BREVO] 🔍 From Email configured: ${!!process.env.BREVO_FROM_EMAIL}`
)
console.log(
  `[BREVO] 🔍 API Key length: ${process.env.BREVO_API_KEY?.length || 0}`
)

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
    const userDataDir =
      process.env.PUPPETEER_USER_DATA_DIR || '/tmp/puppeteer-user-data'
    const useSystemChrome = process.env.PUPPETEER_USE_SYSTEM_CHROME === 'true'
    const envExecutablePath = useSystemChrome
      ? process.env.PUPPETEER_EXECUTABLE_PATH
      : undefined

    if (!isProduction) {
      console.log('🔍 PUPPETEER DEBUG - Starting PDF generation')
      console.log('🔍 PUPPETEER DEBUG - Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        isProduction,
        userDataDir,
        useSystemChrome,
        envExecutablePath,
        RENDER: !!process.env.RENDER,
        RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
      })
    }

    let resolvedExecutablePath
    if (isProduction) {
      try {
        resolvedExecutablePath = await chromium.executablePath()
      } catch (chromiumError) {
        console.error(
          '❌ Chromium path resolution failed:',
          chromiumError.message
        )
        resolvedExecutablePath = puppeteer.executablePath()
      }
    } else if (envExecutablePath) {
      try {
        await fs.access(envExecutablePath)
        resolvedExecutablePath = envExecutablePath
        if (!isProduction) {
          console.log(
            '🔍 PUPPETEER DEBUG - Using custom executable path:',
            resolvedExecutablePath
          )
        }
      } catch {
        resolvedExecutablePath = puppeteer.executablePath()
        if (!isProduction) {
          console.log(
            '🔍 PUPPETEER DEBUG - Custom path not accessible, using Puppeteer path:',
            resolvedExecutablePath
          )
        }
      }
    } else {
      resolvedExecutablePath = puppeteer.executablePath()
      if (!isProduction) {
        console.log(
          '🔍 PUPPETEER DEBUG - Using default Puppeteer path:',
          resolvedExecutablePath
        )
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
      '--max_old_space_size=512',
    ]

    const launchArgs = isProduction
      ? [...chromium.args, ...renderArgs]
      : renderArgs

    if (!isProduction) {
      console.log('🔍 PUPPETEER DEBUG - Launch configuration:', {
        headless: 'new',
        argsCount: launchArgs.length,
        userDataDir,
        executablePath: resolvedExecutablePath,
        isProduction,
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
        console.log(
          '🔍 PUPPETEER DEBUG - Attempting fallback launch without explicit executablePath'
        )
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
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    if (!isProduction) {
      console.log('✅ PUPPETEER DEBUG - User agent set')
    }

    // Set extra headers including Referer for kiwi.com images
    await page.setExtraHTTPHeaders({
      Referer: 'https://www.kiwi.com',
      Accept: 'image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    })
    if (!isProduction) {
      console.log('✅ PUPPETEER DEBUG - HTTP headers set')
    }

    // Ensure UTF-8 charset and base styles are respected
    const normalizedHtml = html.includes('<meta charset="utf-8"')
      ? html
      : html.replace(/<head>/i, '<head><meta charset="utf-8">')

    if (!isProduction) {
      console.log(
        '🔍 PUPPETEER DEBUG - HTML prepared, length:',
        normalizedHtml.length
      )
    }

    // Load content with networkidle0 to wait for all resources
    if (!isProduction) {
      console.log('🔍 PUPPETEER DEBUG - Loading HTML content')
    }
    await page.setContent(normalizedHtml, {
      waitUntil: 'networkidle0',
      timeout: 30000, // 30 second timeout for image loading
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
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((resolve) => {
                img.onload = img.onerror = resolve
              })
          )
      )
    })
    if (!isProduction) {
      console.log('✅ PUPPETEER DEBUG - Images loaded')
    }

    // Additional wait to ensure all images are fully rendered
    await new Promise((resolve) => setTimeout(resolve, 2000))
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
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
    })
    if (!isProduction) {
      console.log(
        '✅ PUPPETEER DEBUG - PDF generated successfully, size:',
        pdfBuffer.length,
        'bytes'
      )
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
  const templatePath = path.join(__dirname, 'templates', 'flight.html')

  let html = await fs.readFile(templatePath, 'utf-8')

  // Set base URL for images - auto-detect from Render or environment
  const baseUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.BACKEND_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://trabilis.onrender.com'
      : 'http://localhost:3001')

  // 1. Generate Itineraries HTML (matching template structure)
  const itinerariesHtml = (
    bookingDetails.amadeus_flight_offer?.itineraries || []
  )
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
                        ${
                          airline.logo
                            ? `
                            <img
                                class="pdf-flight-details__airline-logo"
                                src="${airline.logo}"
                                alt="${airline.name}"
                                onerror="this.style.display='none';"
                            />
                        `
                            : ``
                        }
                        
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
  const passengerDetailsHtml = (
    bookingDetails.passenger_details?.travelers || []
  )
    .map((passenger, index) => {
      const title = passenger.title || ''
      const name =
        `${passenger.name?.firstName || ''} ${passenger.name?.lastName || ''}`
          .trim()
          .toUpperCase()
      const type = passenger.type || 'Adult'
      const dateOfBirth = passenger.dateOfBirth || ''
      const psngrDocs = (passenger.documents || [])[0] || {}
      const passport = {
        number: psngrDocs.number || 'N/A',
        expiry: psngrDocs.expiryDate || 'N/A',
      }
      const status =
        bookingDetails.status === 'TICKETED'
          ? 'CONFIRMED'
          : bookingDetails.status

      // Get e-ticket number for this passenger (if available)
      const passengerETicket =
        Array.isArray(eTickets) && eTickets[index] ? eTickets[index] : 'N/A'

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

  // 4. Flight Inclusions
  const flightNumbers = (bookingDetails.amadeus_flight_offer?.itineraries || [])
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
  const checkedBaggageText =
    bagInfo.checkedKg > 0
      ? `Adult: ${bagInfo.checkedKg} ${bagInfo.checkedUnit}`
      : `Adult: ${bagInfo.checkedPieces || 0} PC`

  // 5. Replace all placeholders with correct values
  html = html
    .replace(/{{baseUrl}}/g, baseUrl)
    .replace(/{{bookingReference}}/g, bookingDetails.booking_reference || 'N/A')
    .replace(
      '{{bookingDate}}',
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    )
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
    console.log(
      '📧 Email PDF Generation - Received bookingDetails:',
      JSON.stringify(bookingDetails, null, 2)
    )

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
        total_slots:
          bookingDetails.totalSlots || bookingDetails.availableSlots || 0,
        inclusions: bookingDetails.inclusions || [],
        exclusions: bookingDetails.exclusions || [],
        payment_terms: bookingDetails.paymentTerms || [],
        requirements: bookingDetails.requirements || [],
        notes: bookingDetails.notes || [],
        tour_packages: {
          id: bookingDetails.tour_package_id || null,
          title: bookingDetails.tourTitle,
          description: bookingDetails.tourDescription,
          itineraries: (() => {
            // Handle itinerary data - it should be an array from package_itineraries table
            if (Array.isArray(bookingDetails.itinerary)) {
              console.log(
                '✅ Itinerary received as array with',
                bookingDetails.itinerary.length,
                'items'
              )
              return bookingDetails.itinerary
            } else if (
              typeof bookingDetails.itinerary === 'string' &&
              bookingDetails.itinerary.trim()
            ) {
              // If it's a string, something went wrong in the data flow
              console.log(
                '⚠️ Warning: Itinerary received as string instead of array!'
              )
              console.log(
                '⚠️ String content preview:',
                bookingDetails.itinerary.substring(0, 100) + '...'
              )
              return []
            } else {
              console.log('⚠️ Warning: No itinerary data received')
              return []
            }
          })(),
        },
      },
    }

    console.log(
      '📧 Email PDF Generation - Transformed booking:',
      JSON.stringify(transformedBooking, null, 2)
    )
    console.log(
      '📧 Email PDF Generation - Itineraries in transformed booking:',
      transformedBooking.package_dates?.tour_packages?.itineraries?.length || 0,
      'items'
    )

    // Generate HTML using shared function
    console.log('🔍 PDF DEBUG - Generating HTML from template')
    const html = await generateTourBookingHTML(transformedBooking)

    console.log(
      '📧 Email PDF Generation - HTML generated successfully, length:',
      html.length
    )

    // Convert HTML to PDF using existing PDF generation logic
    console.log('🔍 PDF DEBUG - Converting HTML to PDF')
    return await createPdfFromHtml(html)
  } catch (err) {
    console.error('❌ PDF DEBUG - Error generating Tour PDF:', err)
    console.error(
      '❌ PDF DEBUG - Booking details received:',
      JSON.stringify(bookingDetails, null, 2)
    )
    console.error('❌ PDF DEBUG - Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
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
    throw new Error(`No tour booking found with reference ${bookingReference}`)
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
    (traveler) => traveler.type === 'ADULT' && traveler.contact?.emailAddress
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
                            <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}" style="color: #0078D4; text-decoration: none;">
                                contact our support team
                            </a>.
                        </p>
                    </div>
                </body>
            </html>
        `

    sendSmtpEmail.sender = {
      name: 'Trabilis',
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }

    sendSmtpEmail.to = [
      {
        email: customerEmail,
      },
    ]

    sendSmtpEmail.attachment = [
      {
        content: Buffer.from(pdfBuffer).toString('base64'),
        name: `Flight-Itinerary-${bookingDetails.booking_reference}.pdf`,
      },
    ]

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log(
      '✅ Flight confirmation email sent via Brevo API:',
      data.response.statusMessage
    )
  } catch (err) {
    console.error('❌ Error sending flight confirmation email:', err)
    throw err
  }
}

/**
 * Send updated flight details email
 */
export const sendFlightUpdateEmail = async (bookingReference) => {
  const bookingDetails = await getBookingByBookingReference(bookingReference)

  // Find the first adult traveler with contact info (in case first passenger is a child)
  const adultTraveler = bookingDetails.passenger_details?.travelers?.find(
    (traveler) => traveler.type === 'ADULT' && traveler.contact?.emailAddress
  )

  const customerEmail = adultTraveler?.contact?.emailAddress
  const customerName =
    `${adultTraveler?.name?.firstName || ''} ${adultTraveler?.name?.lastName || ''}`.trim()

  if (!customerEmail) {
    throw new Error('Customer email not found in booking details.')
  }

  const pdfBuffer = await generateFlightItineraryPDF(bookingDetails)

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.subject = `Flight Update - ${bookingReference}`
    sendSmtpEmail.htmlContent = `
            <html>
                <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; margin:0; padding:0;">
                    <div style="max-width: 600px; margin: 30px auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 30px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 30px -30px; text-align: center;">
                            <h1 style="margin: 0 0 10px 0; font-size: 28px;">
                                ✈️ Flight Update
                            </h1>
                            <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                                Booking Reference: <strong>${bookingReference}</strong>
                            </p>
                        </div>

                        <div style="padding: 0 10px;">
                            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                                Hello ${customerName || 'Valued Customer'},
                            </p>

                            <div style="background: #fff8f0; border-left: 4px solid #fd7e14; padding: 15px 20px; border-radius: 4px; margin: 25px 0;">
                                <p style="margin: 0; color: #856404; font-weight: 600;">
                                    📢 Important Update
                                </p>
                                <p style="margin: 10px 0 0 0; color: #333; line-height: 1.6;">
                                    Your flight booking has been updated. Please review the attached itinerary for the latest flight details.
                                </p>
                            </div>

                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
                                <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
                                    What's Changed?
                                </h2>
                                <p style="margin: 0; color: #6c757d; line-height: 1.6;">
                                    Your booking details have been updated. Common updates include:
                                </p>
                                <ul style="color: #6c757d; line-height: 1.8; margin: 10px 0;">
                                    <li>Flight times or dates</li>
                                    <li>PNR (Passenger Name Record)</li>
                                    <li>E-ticket numbers</li>
                                    <li>Status updates</li>
                                </ul>
                            </div>

                            <div style="background: #e8f4fd; border: 1px solid #bee5eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                                <p style="margin: 0 0 10px 0; font-weight: 600; color: #004085;">
                                    📎 Your Updated Itinerary
                                </p>
                                <p style="margin: 0; color: #004085; font-size: 14px;">
                                    The latest version of your flight itinerary is attached to this email as a PDF.
                                    Please save it for your records and present it at the airport check-in.
                                </p>
                            </div>

                            <div style="text-align: center; margin: 35px 0 25px 0;">
                                <a href="${process.env.FRONTEND_URL}/track-booking?ref=${bookingReference}" 
                                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);">
                                    Track Your Booking
                                </a>
                            </div>

                            <div style="border-top: 2px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
                                <p style="font-size: 14px; color: #6c757d; margin: 0 0 10px 0;">
                                    <strong>Need Help?</strong>
                                </p>
                                <p style="font-size: 14px; color: #6c757d; margin: 0; line-height: 1.6;">
                                    If you have any questions about this update, please contact our support team at 
                                    <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}" style="color: #667eea; text-decoration: none; font-weight: 600;">
                                        ${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}
                                    </a>
                                    or call us at <strong>${process.env.SUPPORT_PHONE || '9296106660'}</strong>.
                                </p>
                            </div>
                        </div>

                        <div style="text-align: center; padding-top: 30px; border-top: 1px solid #e9ecef; margin-top: 30px;">
                            <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: 600; color: #333;">
                                <span style="font-weight: 700; color: #667eea;">Trabilis</span>
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #888;">
                                Your Travel Companion
                            </p>
                        </div>
                    </div>
                </body>
            </html>
        `

    sendSmtpEmail.sender = {
      name: 'Trabilis',
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }

    sendSmtpEmail.to = [
      {
        email: customerEmail,
        name: customerName,
      },
    ]

    sendSmtpEmail.attachment = [
      {
        content: Buffer.from(pdfBuffer).toString('base64'),
        name: `Flight-Itinerary-${bookingDetails.booking_reference}-Updated.pdf`,
      },
    ]

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log(
      '✅ Flight update email sent via Brevo API:',
      data.response.statusMessage
    )
    return { success: true }
  } catch (err) {
    console.error('❌ Error sending flight update email:', err)
    throw err
  }
}

export const sendTourConfirmationEmail = async (bookingDetails) => {
  try {
    console.log(
      '🔍 EMAIL DEBUG - Starting tour confirmation email for:',
      bookingDetails.bookingReference
    )
    console.log('🔍 EMAIL DEBUG - Email recipient:', bookingDetails.email)
    console.log('🔍 EMAIL DEBUG - Tour title:', bookingDetails.tourTitle)

    console.log('🔍 EMAIL DEBUG - Generating PDF buffer')
    const pdfBuffer = await generateTourSummaryPDF(bookingDetails)
    console.log(
      '✅ EMAIL DEBUG - PDF generated successfully, size:',
      pdfBuffer.length,
      'bytes'
    )

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
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }

    sendSmtpEmail.to = [
      {
        email: email,
      },
    ]

    sendSmtpEmail.attachment = [
      {
        content: Buffer.from(pdfBuffer).toString('base64'),
        name: `Tour-Summary-${bookingReference}.pdf`,
      },
    ]

    console.log('🔍 EMAIL DEBUG - Sending email via Brevo API')
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log(
      `✅ EMAIL DEBUG - Tour confirmation email sent to ${email} (Ref: ${bookingReference})`
    )
    console.log(
      '🔍 EMAIL DEBUG - Brevo API response:',
      data.response.statusMessage
    )
  } catch (err) {
    console.error(
      '❌ EMAIL DEBUG - Error sending tour confirmation email:',
      err
    )
    console.error('❌ EMAIL DEBUG - Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
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
                  <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}">${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}</a>.
                </p>
                <p>Thank you for your understanding.</p>
                <p>Best regards,<br/>Trabilis Team</p>
              </div>
            </body>
          </html>
        `

    sendSmtpEmail.sender = {
      name: 'Trabilis',
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }

    sendSmtpEmail.to = [
      {
        email: email,
      },
    ]

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
                  <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}">${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}</a>.
                </p>
                <p>We apologize for the inconvenience and thank you for choosing us.</p>
                <p>Best regards,<br/>Trabilis Team</p>
              </div>
            </body>
          </html>
        `

    sendSmtpEmail.sender = {
      name: 'Trabilis',
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }

    sendSmtpEmail.to = [
      {
        email: email,
      },
    ]

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
  message,
}) => {
  if (!email_address) throw new Error('Recipient email is required.')

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.subject =
      'Visa Inquiry Received - Lindela Immigration Visa Consultancy'
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
                    <li><strong>If you decide to proceed:</strong> Visit our website → Click "Track Me" → Enter reference <strong>${inquiryReference}</strong> → Click "Pay Now" to start processing</li>
                    <li>After payment, prepare required documents and bring them to our office at Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street Makati Metro Manila</li>
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
                    <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}" style="color: #f7d100; text-decoration: none; font-weight: bold;">
                      ${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}
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
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }

    sendSmtpEmail.to = [
      {
        email: email_address,
      },
    ]

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Visa inquiry confirmation email sent via Brevo API:', data)
  } catch (err) {
    console.error('❌ Error sending visa inquiry confirmation email:', err)
    throw err
  }
}

export const sendVisaProcessingStartedEmail = async ({
  processingReference,
  inquiryReference,
  full_name,
  email_address,
  visa_type,
  destination,
}) => {
  if (!email_address) throw new Error('Recipient email is required.')

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.subject = 'Payment Received - Visa Processing Started'
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
                
                <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                  <h2 style="color: #155724; margin-top: 0;">✓ Payment Received - Processing Started!</h2>
                  <p style="color: #155724; margin: 0;">Your visa processing has officially begun.</p>
                </div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                  Dear <strong>${full_name}</strong>,
                </p>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for your payment! We have successfully received your payment and your visa processing has been initiated.
                </p>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f7d100;">
                  <h3 style="color: #333; margin-top: 0; font-size: 1.2rem;">Processing Details:</h3>
                  <p style="margin: 5px 0; color: #555;"><strong>Processing Reference:</strong> ${processingReference}</p>
                  <p style="margin: 5px 0; color: #555;"><strong>Original Inquiry:</strong> ${inquiryReference}</p>
                  <p style="margin: 5px 0; color: #555;"><strong>Visa Type:</strong> ${visa_type}</p>
                  <p style="margin: 5px 0; color: #555;"><strong>Destination:</strong> ${destination}</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <h3 style="color: #856404; margin-top: 0; font-size: 1.1rem;">📋 Next Steps - Document Preparation</h3>
                  <p style="color: #856404; margin-bottom: 10px;">Please prepare the following documents and bring them to our office:</p>
                  <ul style="color: #856404; line-height: 1.8; margin: 10px 0; padding-left: 20px;">
                    <li>Valid passport (at least 6 months validity)</li>
                    <li>Passport-sized photos (2x2, white background)</li>
                    <li>Completed visa application form</li>
                    <li>Bank statements (last 3 months)</li>
                    <li>Travel insurance</li>
                    <li>Hotel booking confirmation</li>
                    <li>Flight reservation</li>
                    <li>Cover letter</li>
                  </ul>
                  <p style="color: #856404; margin-top: 15px; font-weight: bold;">
                    📍 Office Address: Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street
                    Makati Metro Manila<br>
                    📞 Contact: 9296106660<br>
                    📧 Email: ${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}
                  </p>
                </div>
                
                <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 20px 0;">
                  Our visa processing team will contact you within 24 hours to schedule your document submission appointment.
                </p>
                
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
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }

    sendSmtpEmail.to = [{ email: email_address }]

    await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('✅ Visa processing started email sent')
  } catch (err) {
    console.error('❌ Error sending visa processing started email:', err)
    throw err
  }
}

/**
 * Send cancellation verification email
 */
export async function sendCancellationVerificationEmail({
  email,
  firstName,
  lastName,
  bookingReference,
  token,
  totalAmount,
  currency,
  cancellationReason,
}) {
  try {
    console.log(`[EMAIL] Sending cancellation verification email to ${email}`)

    // Read email template
    const templatePath = path.join(
      __dirname,
      'templates',
      'cancellation-verification.html'
    )
    console.log(`[EMAIL] 🔍 Template path: ${templatePath}`)
    let htmlTemplate = await fs.readFile(templatePath, 'utf8')
    console.log(`[EMAIL] 🔍 Template loaded, length: ${htmlTemplate.length}`)

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/cancel-booking?token=${token}`
    console.log(`[EMAIL] 🔍 Verification URL: ${verificationUrl}`)
    console.log(`[EMAIL] 🔍 Frontend URL: ${process.env.FRONTEND_URL}`)

    // Replace template variables
    htmlTemplate = htmlTemplate
      .replace(/{{firstName}}/g, firstName || 'Valued Customer')
      .replace(/{{lastName}}/g, lastName || '')
      .replace(/{{bookingReference}}/g, bookingReference)
      .replace(/{{totalAmount}}/g, totalAmount?.toLocaleString() || '0')
      .replace(/{{currency}}/g, currency || 'PHP')
      .replace(/{{cancellationReason}}/g, cancellationReason || 'Not provided')
      .replace(/{{verificationUrl}}/g, verificationUrl)

    // Create email data using proper Brevo format
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.subject = `Confirm Flight Cancellation - ${bookingReference}`
    sendSmtpEmail.htmlContent = htmlTemplate
    sendSmtpEmail.sender = {
      name: 'Lindela Travel and Tours',
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }
    sendSmtpEmail.to = [
      {
        email: email,
        name: `${firstName} ${lastName}`.trim(),
      },
    ]

    // Send email
    console.log(`[EMAIL] 🔍 Sending email via Brevo API...`)
    console.log(`[EMAIL] 🔍 Email data:`, {
      to: sendSmtpEmail.to,
      subject: sendSmtpEmail.subject,
      sender: sendSmtpEmail.sender,
      hasHtmlContent: !!sendSmtpEmail.htmlContent,
    })

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)

    console.log(`[EMAIL] 🔍 Brevo API response:`, {
      messageId: result.messageId,
      response: result.response,
    })

    console.log(
      `[EMAIL] ✅ Cancellation verification email sent successfully to ${email}`
    )
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error(
      `[EMAIL] ❌ Failed to send cancellation verification email to ${email}:`,
      error
    )
    throw new Error(
      `Failed to send cancellation verification email: ${error.message}`
    )
  }
}

/**
 * Send cancellation confirmation email
 */
export async function sendCancellationConfirmationEmail({
  email,
  firstName,
  lastName,
  bookingReference,
  totalAmount,
  currency,
  cancelledAt,
}) {
  try {
    console.log(`[EMAIL] Sending cancellation confirmation email to ${email}`)

    // Create simple confirmation email
    const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Booking Cancelled</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .amount { font-size: 24px; font-weight: bold; color: #dc3545; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>✈️ Booking Cancelled</h1>
                    <p>Lindela Travel and Tours</p>
                </div>
                <div class="content">
                    <h2>Hello ${firstName} ${lastName},</h2>
                    <p>Your flight booking has been successfully cancelled.</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3>Booking Details</h3>
                        <p><strong>Booking Reference:</strong> ${bookingReference}</p>
                        <p><strong>Amount Forfeited:</strong> <span class="amount">₱${totalAmount?.toLocaleString() || '0'}</span></p>
                        <p><strong>Cancelled At:</strong> ${new Date(cancelledAt).toLocaleString()}</p>
                    </div>
                    <p>Thank you for choosing Lindela Travel and Tours. We hope to serve you again in the future.</p>
                    <p>If you have any questions, please contact us at ${process.env.SUPPORT_EMAIL || 'support@trabilis.com'} or call ${process.env.SUPPORT_PHONE || '9296106660'}.</p>
                </div>
            </body>
            </html>
        `

    // Create email data using proper Brevo format
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.subject = `Booking Cancelled - ${bookingReference}`
    sendSmtpEmail.htmlContent = htmlContent
    sendSmtpEmail.sender = {
      name: 'Lindela Travel and Tours',
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }
    sendSmtpEmail.to = [
      {
        email: email,
        name: `${firstName} ${lastName}`.trim(),
      },
    ]

    // Send email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)

    console.log(
      `[EMAIL] ✅ Cancellation confirmation email sent successfully to ${email}`
    )
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error(
      `[EMAIL] ❌ Failed to send cancellation confirmation email to ${email}:`,
      error
    )
    throw new Error(
      `Failed to send cancellation confirmation email: ${error.message}`
    )
  }
}

/**
 * Send ticketing deadline alert email
 */
export async function sendTicketingDeadlineAlert({
  email,
  firstName,
  lastName,
  bookingReference,
  hoursRemaining,
  deadline,
  totalAmount,
  currency,
}) {
  try {
    console.log(`[EMAIL] Sending ticketing deadline alert to ${email}`)

    // Create deadline alert email
    const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Ticketing Deadline Alert</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .urgent-box { background: #fff3cd; border: 2px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .booking-details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ff6b35; }
                    .cta-button { display: inline-block; background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
                    .cta-button:hover { background: #e55a2b; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
                    .amount { font-size: 24px; font-weight: bold; color: #ff6b35; }
                    .deadline-notice { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>⏰ Ticketing Deadline Alert</h1>
                    <p>Lindela Travel and Tours</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${firstName} ${lastName},</h2>
                    
                    <div class="urgent-box">
                        <h3 style="color: #856404; margin-top: 0;">⚠️ URGENT: Ticketing Deadline Approaching</h3>
                        <p style="margin-bottom: 0;">
                            Your flight booking needs to be ticketed within <strong>${hoursRemaining} hours</strong> 
                            or it will be automatically cancelled.
                        </p>
                    </div>
                    
                    <div class="booking-details">
                        <h3 style="margin-top: 0;">Booking Details</h3>
                        <p><strong>Booking Reference:</strong> ${bookingReference}</p>
                        <p><strong>Total Amount:</strong> <span class="amount">₱${totalAmount?.toLocaleString() || '0'}</span></p>
                        <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
                        <p><strong>Time Remaining:</strong> ${hoursRemaining} hours</p>
                    </div>
                    
                    <div class="deadline-notice">
                        <strong>🚨 ACTION REQUIRED</strong><br>
                        Our ticketing team needs to process your booking before the deadline to avoid automatic cancellation.
                    </div>
                    
                    <p><strong>What happens next?</strong></p>
                    <ul>
                        <li>Our ticketing team will process your booking immediately</li>
                        <li>You will receive your e-ticket via email once processed</li>
                        <li>If not processed in time, your booking will be automatically cancelled</li>
                        <li>No refund will be issued for cancelled bookings (non-refundable policy)</li>
                    </ul>
                    
                    <p><strong>Need immediate assistance?</strong><br>
                    Contact our ticketing team at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}">${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}</a> 
                    or call us at ${process.env.SUPPORT_PHONE || '9296106660'}.</p>
                </div>
                
                <div class="footer">
                    <p><strong>Lindela Travel and Tours</strong></p>
                    <p>Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street<br>
                    Makati Metro Manila, Philippines</p>
                    <p>Phone: ${process.env.SUPPORT_PHONE || '9296106660'} | Email: ${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}</p>
                    <p style="font-size: 12px; margin-top: 20px;">
                        This is an automated alert. Please do not reply to this email.
                    </p>
                </div>
            </body>
            </html>
        `

    // Create email data using proper Brevo format
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.subject = `⏰ URGENT: Ticketing Deadline Alert - ${bookingReference}`
    sendSmtpEmail.htmlContent = htmlContent
    sendSmtpEmail.sender = {
      name: 'Lindela Travel and Tours',
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }
    sendSmtpEmail.to = [
      {
        email: email,
        name: `${firstName} ${lastName}`.trim(),
      },
    ]

    // Send email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)

    console.log(
      `[EMAIL] ✅ Ticketing deadline alert sent successfully to ${email}`
    )
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error(
      `[EMAIL] ❌ Failed to send ticketing deadline alert to ${email}:`,
      error
    )
    throw new Error(`Failed to send ticketing deadline alert: ${error.message}`)
  }
}

/**
 * Send ticketing expired alert email
 */
export async function sendTicketingExpiredAlert({
  email,
  firstName,
  lastName,
  bookingReference,
  totalAmount,
  currency,
}) {
  try {
    console.log(`[EMAIL] Sending ticketing expired alert to ${email}`)

    // Create expiration alert email
    const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Booking Expired - Ticketing Deadline Missed</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .expired-box { background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .booking-details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc3545; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
                    .amount { font-size: 24px; font-weight: bold; color: #dc3545; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>❌ Booking Expired</h1>
                    <p>Lindela Travel and Tours</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${firstName} ${lastName},</h2>
                    
                    <div class="expired-box">
                        <h3 style="color: #721c24; margin-top: 0;">⚠️ BOOKING EXPIRED</h3>
                        <p style="margin-bottom: 0;">
                            Your flight booking has been automatically cancelled due to missed ticketing deadline.
                        </p>
                    </div>
                    
                    <div class="booking-details">
                        <h3 style="margin-top: 0;">Booking Details</h3>
                        <p><strong>Booking Reference:</strong> ${bookingReference}</p>
                        <p><strong>Amount Forfeited:</strong> <span class="amount">₱${totalAmount?.toLocaleString() || '0'}</span></p>
                        <p><strong>Status:</strong> EXPIRED</p>
                        <p><strong>Reason:</strong> Missed ticketing deadline</p>
                    </div>
                    
                    <p><strong>What happened?</strong></p>
                    <ul>
                        <li>Your booking was not ticketed within the 6-day deadline</li>
                        <li>The airline automatically cancelled the reservation</li>
                        <li>No refund will be issued (per non-refundable policy)</li>
                        <li>You will need to make a new booking if you still wish to travel</li>
                    </ul>
                    
                    <p><strong>Need assistance?</strong><br>
                    If you believe this is an error or need help with a new booking, 
                    please contact us at <a href="mailto:${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}">${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}</a> 
                    or call ${process.env.SUPPORT_PHONE || '9296106660'}.</p>
                </div>
                
                <div class="footer">
                    <p><strong>Lindela Travel and Tours</strong></p>
                    <p>Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street<br>
                    Makati Metro Manila, Philippines</p>
                    <p>Phone: ${process.env.SUPPORT_PHONE || '9296106660'} | Email: ${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}</p>
                    <p style="font-size: 12px; margin-top: 20px;">
                        This is an automated notification. Please do not reply to this email.
                    </p>
                </div>
            </body>
            </html>
        `

    // Create email data using proper Brevo format
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    sendSmtpEmail.subject = `❌ Booking Expired - ${bookingReference}`
    sendSmtpEmail.htmlContent = htmlContent
    sendSmtpEmail.sender = {
      name: 'Lindela Travel and Tours',
      email:
        process.env.BREVO_FROM_EMAIL ||
        process.env.SUPPORT_EMAIL ||
        'noreply@trabilis.com',
    }
    sendSmtpEmail.to = [
      {
        email: email,
        name: `${firstName} ${lastName}`.trim(),
      },
    ]

    // Send email
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)

    console.log(
      `[EMAIL] ✅ Ticketing expired alert sent successfully to ${email}`
    )
    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error(
      `[EMAIL] ❌ Failed to send ticketing expired alert to ${email}:`,
      error
    )
    throw new Error(`Failed to send ticketing expired alert: ${error.message}`)
  }
}
