import { supabase } from '../config/supabaseClient.js'
import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { getAirlineInfo } from './airlinesUtils.js'
import { getAircraftName } from './aircraftUtils.js'
import { getAirportFull } from './airportUtils.js'
import { getStopsLabel } from './flightutils.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Helper function to parse airport information from Amadeus segment data
const parseAirportFromSegment = (airportData) => {
  if (!airportData || !airportData.iataCode) {
    return {
      iata: 'TBA',
      city: 'TBA',
      airport: 'TBA',
      terminal: 'TBA',
    }
  }

  // Use existing airportUtils to get full airport information
  const airportInfo = getAirportFull(airportData.iataCode)

  return {
    iata: airportInfo.iata,
    city: airportInfo.city,
    airport: airportInfo.name,
    terminal: airportData.terminal || 'TBA',
  }
}

// Shared function to generate tour booking HTML
export const generateTourBookingHTML = async (booking) => {
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

  // Prepare booking details for template
  const packageDate = booking.package_dates
  const tourPackage = packageDate?.tour_packages
  const passengerDetails = parseJsonField(booking.passenger_details)

  // Read the HTML template
  const templatePath = path.join(__dirname, '../services/templates/tour.html')
  let html = fs.readFileSync(templatePath, 'utf8')

  // Replace BASE_URL placeholder with actual backend URL
  const baseUrl =
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://trabilis.onrender.com'
      : 'http://localhost:3001')

  const bookingDate = booking.updated_at
    ? dayjs(booking.updated_at).format('MMM D, YYYY')
    : dayjs(booking.created_at).format('MMM D, YYYY')

  // Generate tour details section
  const tourDetails = `
        <div class="pdf-tour-details__section">
            <div class="pdf-table-header">
                <div class="pdf-table-header__title">
                    <i class="fa-solid fa-map"></i>
                    <p><b>Tour Details</b></p>
                </div>
            </div>
            <div class="pdf-tour-details__subheader">
                <div class="pdf-tour-details__package__index">
                    <i class="fa-solid fa-cube"></i>
                    <b>Package</b>
                </div>
                <div class="pdf-tour-details__subheader-title">
                    <i class="fa-solid fa-calendar pdf-tour-details__icon"></i>
                    <p>Duration</p>
                </div>
                <div class="pdf-tour-details__subheader-title">
                    <i class="fa-solid fa-users pdf-tour-details__icon"></i>
                    <p>Passengers</p>
                </div>
                <div class="pdf-tour-details__subheader-title">
                    <i class="fa-solid fa-calendar pdf-tour-details__icon"></i>
                    <p>Dates</p>
                </div>
            </div>
            <div class="pdf-tour-details__data">
                <div class="pdf-tour-details__package">
                    <i class="fa-solid fa-map pdf-tour-details__package-icon"></i>
                    <div class="pdf-tour-details__package-name">
                        <p class="pdf-tour-details__package-text">
                            <b>${tourPackage?.title || 'Unknown Tour Package'}</b>
                        </p>
                    </div>
                </div>
                <p class="pdf-tour-details__duration">
                    <b>${
                      packageDate?.start_date && packageDate?.end_date
                        ? Math.ceil(
                            (new Date(packageDate.end_date) -
                              new Date(packageDate.start_date)) /
                              (1000 * 60 * 60 * 24)
                          ) + 1
                        : 'N/A'
                    } Days</b>
                </p>
                <div class="pdf-tour-details__arrival">
                    <p class="pdf-tour-details__duration">
                        <b>${booking.passenger_count || 0} Passengers</b>
                    </p>
                </div>
                <div class="pdf-tour-details__leg">
                    <p class="pdf-tour-details__duration">
                        ${
                          packageDate?.start_date && packageDate?.end_date
                            ? `${new Date(packageDate.start_date).toLocaleDateString()} - ${new Date(packageDate.end_date).toLocaleDateString()}`
                            : 'N/A'
                        }
                    </p>
                </div>
            </div>
        </div>
    `

  // Generate passenger details following flight controller pattern
  const passengers = `
        <div class="pdf-passenger-details">
            <div class="pdf-table-header pdf-table-header--passenger">
                <div>
                    <i class="pdf-passenger-details__icon fa-solid fa-user"></i>
                </div>
                <div class="pdf-table-header__title">
                    <p>Passenger(s) Details</p>
                </div>
                <div>Contact Details</div>
                <div>Status</div>
                <div>Type</div>
                <div>PNR</div>
                <div>DOB</div>
                <div>Passport No.</div>
            </div>
            ${(passengerDetails || [])
              .map((passenger, index) => {
                const title = passenger.title || ''
                const name = `${passenger.name?.firstName || ''} ${
                  passenger.name?.lastName || ''
                }`
                  .trim()
                  .toUpperCase()
                const type = passenger.type || 'Adult'
                // Get PNR from flight booking data
                const flightPnr = booking.flight_booking_reference
                  ? booking.flight_booking_reference.split('-').pop() || 'TBA'
                  : 'TBA'
                const dateOfBirth = passenger.dateOfBirth || 'N/A'
                // Use lead passenger contact as fallback if individual passenger contact is missing
                const email =
                  passenger.contact?.emailAddress ||
                  booking.lead_email ||
                  'Not provided'
                const phone =
                  passenger.contact?.phones?.[0]?.number ||
                  booking.lead_phone ||
                  'Not provided'
                const psngrDocs = (passenger.documents || [])[0] || {}
                const passport = psngrDocs.number || 'N/A'
                const status =
                  booking.status === 'CONFIRMED' ? 'CONFIRMED' : booking.status

                return `
                        <div class="pdf-passenger-details__data">
                            <div><span>${index + 1}</span></div>
                            <div class="pdf-passenger-details__data-name">
                                <p><b>${`${
                                  title ? title.toUpperCase() + '. ' : ''
                                }${name}`}</b></p>
                                <p>${type} (${dateOfBirth})</p>
                            </div>
                            <div class="pdf-passenger-details__data-contact">
                                <span>${email}</span>
                                <span>${phone}</span>
                            </div>
                            <p class="pdf-passenger-details__data-status">${status || 'N/A'}</p>
                            <div>${type}</div>
                            <div>${flightPnr}</div>
                            <div>${dateOfBirth}</div>
                            <div>${passport}</div>
                        </div>
                    `
              })
              .join('')}
        </div>
    `

  // Generate visa details section
  const visaDetails = `
        <div class="pdf-visa-details">
            <div class="pdf-table-header pdf-table-header--visa">
                <div>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="25"
                        width="25"
                        fill="white"
                        viewBox="0 0 640 640"
                    >
                        <path
                            d="M502.1 295.3C502.1 295.3 509.7 332.5 511.4 340.3L478 340.3C481.3 331.4 494 296.8 494 296.8C493.8 297.1 497.3 287.7 499.3 281.9L502.1 295.3zM608 144L608 496C608 522.5 586.5 544 560 544L80 544C53.5 544 32 522.5 32 496L32 144C32 117.5 53.5 96 80 96L560 96C586.5 96 608 117.5 608 144zM184.5 395.2L247.7 240L205.2 240L165.9 346L161.6 324.5L147.6 253.1C145.3 243.2 138.2 240.4 129.4 240L64.7 240L64 243.1C79.8 247.1 93.9 252.9 106.2 260.2L142 395.2L184.5 395.2zM278.9 395.4L304.1 240L263.9 240L238.8 395.4L278.9 395.4zM418.8 344.6C419 326.9 408.2 313.4 385.1 302.3C371 295.2 362.4 290.4 362.4 283.1C362.6 276.5 369.7 269.7 385.5 269.7C398.6 269.4 408.2 272.5 415.4 275.6L419 277.3L424.5 243.7C416.6 240.6 404 237.1 388.5 237.1C348.8 237.1 320.9 258.3 320.7 288.5C320.4 310.8 340.7 323.2 355.9 330.7C371.4 338.3 376.7 343.3 376.7 350C376.5 360.4 364.1 365.2 352.6 365.2C336.6 365.2 328 362.7 314.9 356.9L309.6 354.4L304 389.3C313.4 393.6 330.8 397.4 348.8 397.6C391 397.7 418.5 376.8 418.8 344.6zM560 395.4L527.6 240L496.5 240C486.9 240 479.6 242.8 475.5 252.9L415.8 395.4L458 395.4C458 395.4 464.9 376.2 466.4 372.1L518 372.1C519.2 377.6 522.8 395.4 522.8 395.4L560 395.4z"
                        />
                    </svg>
                </div>
                <div class="pdf-table-header__title pdf-table-header__title--visa">
                    <p>Visa Details</p>
                </div>
                <div>Status</div>
                <div>Type</div>
                <div>Expiry Date</div>
                <div>Notes</div>
            </div>
            ${(passengerDetails || [])
              .map((passenger, index) => {
                const title = passenger.title || ''
                const name = `${passenger.name?.firstName || ''} ${
                  passenger.name?.lastName || ''
                }`
                  .trim()
                  .toUpperCase()

                // Extract visa information from passenger details
                const visaStatus = passenger.visa_status || 'Not Required'
                const visaType = passenger.visa_type || 'N/A'
                const visaExpiry = passenger.visa_expiry || 'N/A'
                const visaNotes = passenger.visa_notes || 'N/A'

                return `
                        <div class="pdf-visa-details__data pdf-visa-details__data--visa">
                            <div><span>${index + 1}</span></div>
                            <div class="pdf-visa-details__data-name pdf-visa-details__data-name--visa">
                                <p><b>${`${
                                  title ? title.toUpperCase() + '. ' : ''
                                }${name}`}</b></p>
                            </div>
                            <div class="pdf-visa-details__data-status">${visaStatus}</div>
                            <div class="pdf-visa-details__data-type">${visaType}</div>
                            <div class="pdf-visa-details__data-expiry">${visaExpiry}</div>
                            <div>${visaNotes}</div>
                        </div>
                    `
              })
              .join('')}
        </div>
    `

  // Compute Payment Details
  const currencyCode = 'PHP'
  const toNumber = (value) => Number(value ?? 0)

  // Get customization data
  const customization = booking.tour_booking_customizations?.[0]
  const customizationFee = customization
    ? toNumber(customization.customization_fee)
    : 0
  const baseAmount = toNumber(booking.total_amount) - customizationFee
  const pricePerPerson = baseAmount / toNumber(booking.passenger_count)
  const totalAmount = toNumber(booking.total_amount)
  const reservationAmount = toNumber(booking.reservation_amount)
  const formatAmount = (n) =>
    toNumber(n).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  // Package duration calculation
  const packageDuration =
    packageDate?.start_date && packageDate?.end_date
      ? Math.ceil(
          (new Date(packageDate.end_date) - new Date(packageDate.start_date)) /
            (1000 * 60 * 60 * 24)
        ) + 1
      : 0

  // Fetch flight details using flight_booking_reference
  let flightDetails = {}
  let outboundSegs = []
  let inboundSegs = []
  let flightDataFetchError = null

  if (booking.flight_booking_reference) {
    try {
      console.log(
        `Fetching flight data for reference: ${booking.flight_booking_reference}`
      )

      const { data: flightBooking, error: flightError } = await supabase
        .from('flight_bookings')
        .select('*')
        .eq('booking_reference', booking.flight_booking_reference)
        .single()

      if (flightError) {
        flightDataFetchError = `Database error: ${flightError.message}`
        console.error(
          `Error fetching flight booking ${booking.flight_booking_reference}:`,
          flightError
        )
      } else if (!flightBooking) {
        flightDataFetchError = 'Flight booking not found'
        console.warn(
          `Flight booking ${booking.flight_booking_reference} not found in database`
        )
      } else if (flightBooking) {
        console.log('Flight booking found:', flightBooking.booking_reference)

        // Parse flight details from the flight booking
        const amadeusOffer = parseJsonField(flightBooking.amadeus_flight_offer)
        console.log('Parsed flight offer structure:', amadeusOffer)

        // Handle both possible structures: direct itineraries or flightOffers array
        let itineraries = []
        if (amadeusOffer?.flightOffers?.[0]?.itineraries) {
          // Structure: { flightOffers: [{ itineraries: [...] }] }
          itineraries = amadeusOffer.flightOffers[0].itineraries
          console.log(
            'Using flightOffers structure, found itineraries:',
            itineraries.length
          )
        } else if (amadeusOffer?.itineraries) {
          // Structure: { itineraries: [...] }
          itineraries = amadeusOffer.itineraries
          console.log(
            'Using direct itineraries structure, found itineraries:',
            itineraries.length
          )
        }

        if (itineraries && itineraries.length > 0) {
          // Filter valid itineraries - only check for segments
          const validItineraries = itineraries.filter(
            (it) => it.segments?.length > 0
          )
          console.log('Valid itineraries:', validItineraries.length)
          console.log(
            'Itinerary details:',
            validItineraries.map((it) => ({
              hasSegments: it.segments?.length > 0,
              segmentCount: it.segments?.length || 0,
              duration: it.duration,
              firstSegmentDuration: it.segments?.[0]?.duration,
            }))
          )

          if (validItineraries.length > 0) {
            // First itinerary is outbound
            outboundSegs = validItineraries[0].segments || []
            console.log('Outbound segments:', outboundSegs.length)
            console.log(
              'Outbound segment details:',
              outboundSegs.map((seg) => ({
                id: seg.id,
                number: seg.number,
                carrierCode: seg.carrierCode,
                departure: seg.departure?.iataCode,
                arrival: seg.arrival?.iataCode,
                duration: seg.duration,
              }))
            )

            // Second itinerary is return (if exists)
            if (validItineraries.length > 1) {
              inboundSegs = validItineraries[1].segments || []
              console.log('Inbound segments:', inboundSegs.length)
            }

            flightDetails = {
              outbound: outboundSegs,
              return: inboundSegs,
            }
            console.log('Flight details set:', flightDetails)
          }
        } else {
          console.log('No itineraries found in flight offer')
        }
      }
    } catch (error) {
      flightDataFetchError = `Unexpected error: ${error.message}`
      console.error(
        `Unexpected error fetching flight details for ${booking.flight_booking_reference}:`,
        error
      )
    }
  } else {
    console.log('No flight_booking_reference provided for tour booking')
  }

  // Generate flight itineraries similar to flight controller
  const flightItineraries = []

  // Add outbound flights
  if (outboundSegs.length > 0) {
    flightItineraries.push({
      type: 'outbound',
      segments: outboundSegs.map((seg) => {
        // Get airline info from carrier code
        const carrierCode = seg.carrierCode || seg.operating?.carrierCode
        const airlineInfo = carrierCode
          ? getAirlineInfo(carrierCode)
          : { name: 'TBA', id: 'TBA', logo: null }

        const departureInfo = parseAirportFromSegment(seg.departure)
        const arrivalInfo = parseAirportFromSegment(seg.arrival)
        // Parse times from Amadeus segment structure
        const departureTime = seg.departure?.at
          ? new Date(seg.departure.at)
          : null
        const arrivalTime = seg.arrival?.at ? new Date(seg.arrival.at) : null

        // Calculate duration from segment data
        let duration = 'TBA'
        if (departureTime && arrivalTime) {
          const diffMs = arrivalTime - departureTime
          const hours = Math.floor(diffMs / (1000 * 60 * 60))
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
          duration = `${hours}h ${minutes}m`
        } else if (seg.duration) {
          // Use Amadeus duration if available (e.g., "PT1H25M")
          duration = seg.duration
            .replace('PT', '')
            .replace('H', 'h ')
            .replace('M', 'm')
        }

        return {
          airline: {
            name: airlineInfo.name,
            code: airlineInfo.id || seg.airline || 'TBA',
            logo: airlineInfo.logo || '',
          },
          number: `${carrierCode || ''}${seg.number || ''}`,
          departure: {
            iata: departureInfo.iata,
            city: departureInfo.city,
            airport: departureInfo.airport,
            terminal: departureInfo.terminal,
            time: departureTime
              ? departureTime.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'TBA',
            at: departureTime ? departureTime.toISOString() : null,
          },
          arrival: {
            iata: arrivalInfo.iata,
            city: arrivalInfo.city,
            airport: arrivalInfo.airport,
            terminal: arrivalInfo.terminal,
            time: arrivalTime
              ? arrivalTime.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'TBA',
            at: arrivalTime ? arrivalTime.toISOString() : null,
          },
          aircraft: {
            code: seg.aircraft?.code || 'TBA',
            name: seg.aircraft?.code
              ? getAircraftName(seg.aircraft.code)
              : 'TBA',
          },
          duration: duration,
          stops: seg.numberOfStops || 0,
        }
      }),
    })
  }

  // Add return flights
  if (inboundSegs.length > 0) {
    flightItineraries.push({
      type: 'return',
      segments: inboundSegs.map((seg) => {
        // Get airline info from carrier code
        const carrierCode = seg.carrierCode || seg.operating?.carrierCode
        const airlineInfo = carrierCode
          ? getAirlineInfo(carrierCode)
          : { name: 'TBA', id: 'TBA', logo: null }

        const departureInfo = parseAirportFromSegment(seg.departure)
        const arrivalInfo = parseAirportFromSegment(seg.arrival)
        // Parse times from Amadeus segment structure
        const departureTime = seg.departure?.at
          ? new Date(seg.departure.at)
          : null
        const arrivalTime = seg.arrival?.at ? new Date(seg.arrival.at) : null

        // Calculate duration from segment data
        let duration = 'TBA'
        if (departureTime && arrivalTime) {
          const diffMs = arrivalTime - departureTime
          const hours = Math.floor(diffMs / (1000 * 60 * 60))
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
          duration = `${hours}h ${minutes}m`
        } else if (seg.duration) {
          // Use Amadeus duration if available (e.g., "PT1H25M")
          duration = seg.duration
            .replace('PT', '')
            .replace('H', 'h ')
            .replace('M', 'm')
        }

        return {
          airline: {
            name: airlineInfo.name,
            code: airlineInfo.id || seg.airline || 'TBA',
            logo: airlineInfo.logo || '',
          },
          number: `${carrierCode || ''}${seg.number || ''}`,
          departure: {
            iata: departureInfo.iata,
            city: departureInfo.city,
            airport: departureInfo.airport,
            terminal: departureInfo.terminal,
            time: departureTime
              ? departureTime.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'TBA',
            at: departureTime ? departureTime.toISOString() : null,
          },
          arrival: {
            iata: arrivalInfo.iata,
            city: arrivalInfo.city,
            airport: arrivalInfo.airport,
            terminal: arrivalInfo.terminal,
            time: arrivalTime
              ? arrivalTime.toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'TBA',
            at: arrivalTime ? arrivalTime.toISOString() : null,
          },
          aircraft: {
            code: seg.aircraft?.code || 'TBA',
            name: seg.aircraft?.code
              ? getAircraftName(seg.aircraft.code)
              : 'TBA',
          },
          duration: duration,
          stops: seg.numberOfStops || 0,
        }
      }),
    })
  }

  // Generate flight details HTML - show TBA when no data, with proper Onward/Return structure
  let flightDetailsHTML = ''

  if (flightItineraries.length > 0) {
    // Generate Onward flights
    const onwardFlights = flightItineraries.find(
      (itinerary) => itinerary.type === 'outbound'
    )
    if (onwardFlights) {
      flightDetailsHTML += /* HTML */ `
        <div
          class="pdf-tour-details__section pdf-tour-details__section--flight"
        >
          <div class="pdf-table-header pdf-table-header--flight">
            <div class="pdf-table-header__title">
              <p><b>Flight Details</b></p>
            </div>
          </div>
        </div>
        <div class="pdf-flight-details__section">
          <div class="pdf-table-header">
            <div class="pdf-table-header__title">
              <i class="fa-solid fa-plane"></i>
              <p>
                <b>Onward</b>
                <span>${onwardFlights.segments.length}</span>
                Flight(s)
              </p>
            </div>
            <div><span>Non-Refundable</span></div>
          </div>
          <div class="pdf-flight-details__subheader">
            <div class="pdf-flight-details__flight__index">
              <b>Flight <span>1</span></b>
            </div>
            <div class="pdf-flight-details__subheader-title">
              <i
                class="fa-solid fa-plane-departure pdf-flight-details__icon"
              ></i>
              <p>Departing</p>
            </div>
            <div class="pdf-flight-details__subheader-title">
              <i class="fa-solid fa-plane-arrival pdf-flight-details__icon"></i>
              <p>Arriving</p>
            </div>
          </div>
          <div class="pdf-flight-details__data">
            ${onwardFlights.segments
              .map(
                (segment, segIndex) => `
                            <div class="pdf-flight-details__airline">
                                <div class="pdf-flight-details__airline-logo">
                                    ${segment.airline.logo ? `<img src="${segment.airline.logo}" alt="${segment.airline.name}" style="height: 2rem; width: auto;" />` : ''}
                                </div>
                                <div class="pdf-flight-details__airline-name">
                                    <p class="pdf-flight-details__airline-text"><b>${segment.airline.name}</b></p>
                                    <p class="pdf-flight-details__airline-text">${segment.aircraft.name || segment.aircraft}</p>
                                </div>
                            </div>
                            <div class="pdf-flight-details__departure">
                                <p class="pdf-flight-details__airport-code">
                                    <b><span>${segment.departure.iata}</span></b>
                                    <span>${segment.departure.city === 'TBA' ? '' : segment.departure.city}</span>
                                </p>
                                <p class="pdf-flight-details__airport-name"><span>${segment.departure.airport === 'TBA' ? '' : segment.departure.airport}</span></p>
                                <p class="pdf-flight-details__terminal"><span>${segment.departure.terminal === 'TBA' ? '' : `Terminal ${segment.departure.terminal}`}</span></p>
                                <p class="pdf-flight-details__time"><b><span>${segment.departure.time}</span></b></p>
                            </div>
                            <div class="pdf-flight-details__arrival">
                                <p class="pdf-flight-details__airport-code">
                                    <b><span>${segment.arrival.iata}</span><span>${segment.arrival.city === 'TBA' ? '' : segment.arrival.city}</span></b>
                                </p>
                                <p class="pdf-flight-details__airport-code"><span>${segment.arrival.airport === 'TBA' ? '' : segment.arrival.airport}</span></p>
                                <p class="pdf-flight-details__terminal"><span>${segment.arrival.terminal === 'TBA' ? '' : `Terminal ${segment.arrival.terminal}`}</span></p>
                                <p class="pdf-flight-details__time"><b><span>${segment.arrival.time}</span></b></p>
                            </div>
                            <div class="pdf-flight-details__leg">
                                <p class="pdf-flight-details__stops">${getStopsLabel(segment.stops)}</p>
                                <p class="pdf-flight-details__durations">${segment.duration}</p>
                            </div>
                        `
              )
              .join('')}
          </div>
        </div>
      `
    }

    // Generate Return flights
    const returnFlights = flightItineraries.find(
      (itinerary) => itinerary.type === 'return'
    )
    if (returnFlights) {
      flightDetailsHTML += /* HTML */ `
        <div class="pdf-flight-details__section">
          <div class="pdf-table-header">
            <div class="pdf-table-header__title">
              <i class="fa-solid fa-plane"></i>
              <p>
                <b>Return</b>
                <span>${returnFlights.segments.length}</span>
                Flight(s)
              </p>
            </div>
            <div><span>Non-Refundable</span></div>
          </div>
          <div class="pdf-flight-details__subheader">
            <div class="pdf-flight-details__flight__index">
              <b>Flight <span>2</span></b>
            </div>
            <div class="pdf-flight-details__subheader-title">
              <i
                class="fa-solid fa-plane-departure pdf-flight-details__icon"
              ></i>
              <p>Departing</p>
            </div>
            <div class="pdf-flight-details__subheader-title">
              <i class="fa-solid fa-plane-arrival pdf-flight-details__icon"></i>
              <p>Arriving</p>
            </div>
          </div>
          <div class="pdf-flight-details__data">
            ${returnFlights.segments
              .map(
                (segment, segIndex) => `
                            <div class="pdf-flight-details__airline">
                                <div class="pdf-flight-details__airline-logo">
                                    ${segment.airline.logo ? `<img src="${segment.airline.logo}" alt="${segment.airline.name}" style="height: 2rem; width: auto;" />` : ''}
                                </div>
                                <div class="pdf-flight-details__airline-name">
                                    <p class="pdf-flight-details__airline-text"><b>${segment.airline.name}</b></p>
                                    <p class="pdf-flight-details__airline-text">${segment.aircraft.name || segment.aircraft}</p>
                                </div>
                            </div>
                            <div class="pdf-flight-details__departure">
                                <p class="pdf-flight-details__airport-code">
                                    <b><span>${segment.departure.iata}</span></b>
                                    <span>${segment.departure.city === 'TBA' ? '' : segment.departure.city}</span>
                                </p>
                                <p class="pdf-flight-details__airport-name"><span>${segment.departure.airport === 'TBA' ? '' : segment.departure.airport}</span></p>
                                <p class="pdf-flight-details__terminal"><span>${segment.departure.terminal === 'TBA' ? '' : `Terminal ${segment.departure.terminal}`}</span></p>
                                <p class="pdf-flight-details__time"><b><span>${segment.departure.time}</span></b></p>
                            </div>
                            <div class="pdf-flight-details__arrival">
                                <p class="pdf-flight-details__airport-code">
                                    <b><span>${segment.arrival.iata}</span><span>${segment.arrival.city === 'TBA' ? '' : segment.arrival.city}</span></b>
                                </p>
                                <p class="pdf-flight-details__airport-code"><span>${segment.arrival.airport === 'TBA' ? '' : segment.arrival.airport}</span></p>
                                <p class="pdf-flight-details__terminal"><span>${segment.arrival.terminal === 'TBA' ? '' : `Terminal ${segment.arrival.terminal}`}</span></p>
                                <p class="pdf-flight-details__time"><b><span>${segment.arrival.time}</span></b></p>
                            </div>
                            <div class="pdf-flight-details__leg">
                                <p class="pdf-flight-details__stops">${getStopsLabel(segment.stops)}</p>
                                <p class="pdf-flight-details__durations">${segment.duration}</p>
                            </div>
                        `
              )
              .join('')}
          </div>
        </div>
      `
    }
  } else {
    // Show TBA when no flight data - with proper Onward/Return structure
    // Include error message if flight data fetch failed
    const errorMessage = flightDataFetchError
      ? `<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px 15px; margin-bottom: 15px;">
                <p style="margin: 0; color: #856404; font-size: 12px;">
                    <strong>⚠️ Flight Information Unavailable:</strong> ${flightDataFetchError}
                </p>
            </div>`
      : ''

    flightDetailsHTML = `
            <div class="pdf-tour-details__section pdf-tour-details__section--flight">
                <div class="pdf-table-header pdf-table-header--flight">
                    <div class="pdf-table-header__title">
                        <p><b>Flight Details</b></p>
                    </div>
                </div>
                ${errorMessage}
            </div>
            <div class="pdf-flight-details__section">
                <div class="pdf-table-header">
                    <div class="pdf-table-header__title">
                        <i class="fa-solid fa-plane"></i>
                        <p><b>Onward</b><span>1</span> Flight(s)</p>
                    </div>
                    <div><span>Non-Refundable</span></div>
                </div>
                <div class="pdf-flight-details__subheader">
                    <div class="pdf-flight-details__flight__index">
                        <b>Flight <span>1</span></b>
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
                    <div class="pdf-flight-details__airline">
                        <div class="pdf-flight-details__airline-logo">
                            <!-- No logo for TBA -->
                        </div>
                        <div class="pdf-flight-details__airline-name">
                            <p class="pdf-flight-details__airline-text"><b>TBA</b></p>
                            <p class="pdf-flight-details__airline-text">TBA</p>
                        </div>
                    </div>
                    <div class="pdf-flight-details__departure">
                        <p class="pdf-flight-details__airport-code">
                            <b><span>TBA</span></b>
                        </p>
                        <p class="pdf-flight-details__airport-name"><span>TBA</span></p>
                        <p class="pdf-flight-details__terminal"><span>TBA</span></p>
                        <p class="pdf-flight-details__time"><b><span>TBA</span></b></p>
                    </div>
                    <div class="pdf-flight-details__arrival">
                        <p class="pdf-flight-details__airport-code">
                            <b><span>TBA</span></b>
                        </p>
                        <p class="pdf-flight-details__airport-code"><span>TBA</span></p>
                        <p class="pdf-flight-details__terminal"><span>TBA</span></p>
                        <p class="pdf-flight-details__time"><b><span>TBA</span></b></p>
                    </div>
                    <div class="pdf-flight-details__leg">
                        <p class="pdf-flight-details__stops">TBA</p>
                        <p class="pdf-flight-details__durations">TBA</p>
                    </div>
                </div>
            </div>
            <div class="pdf-flight-details__section">
                <div class="pdf-table-header">
                    <div class="pdf-table-header__title">
                        <i class="fa-solid fa-plane"></i>
                        <p><b>Return</b><span>1</span> Flight(s)</p>
                    </div>
                    <div><span>Non-Refundable</span></div>
                </div>
                <div class="pdf-flight-details__subheader">
                    <div class="pdf-flight-details__flight__index">
                        <b>Flight <span>2</span></b>
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
                    <div class="pdf-flight-details__airline">
                        <div class="pdf-flight-details__airline-logo">
                            <!-- No logo for TBA -->
                        </div>
                        <div class="pdf-flight-details__airline-name">
                            <p class="pdf-flight-details__airline-text"><b>TBA</b></p>
                            <p class="pdf-flight-details__airline-text">TBA</p>
                        </div>
                    </div>
                    <div class="pdf-flight-details__departure">
                        <p class="pdf-flight-details__airport-code">
                            <b><span>TBA</span></b>
                        </p>
                        <p class="pdf-flight-details__airport-name"><span>TBA</span></p>
                        <p class="pdf-flight-details__terminal"><span>TBA</span></p>
                        <p class="pdf-flight-details__time"><b><span>TBA</span></b></p>
                    </div>
                    <div class="pdf-flight-details__arrival">
                        <p class="pdf-flight-details__airport-code">
                            <b><span>TBA</span></b>
                        </p>
                        <p class="pdf-flight-details__airport-code"><span>TBA</span></p>
                        <p class="pdf-flight-details__terminal"><span>TBA</span></p>
                        <p class="pdf-flight-details__time"><b><span>TBA</span></b></p>
                    </div>
                    <div class="pdf-flight-details__leg">
                        <p class="pdf-flight-details__stops">TBA</p>
                        <p class="pdf-flight-details__durations">TBA</p>
                    </div>
                </div>
            </div>
        `
  }

  // Generate itinerary details from tour-level itineraries - consolidated under single header, sorted by day_number
  const sortedItineraries = (tourPackage?.itineraries || []).sort((a, b) => {
    const dayA = parseInt(a.day_number) || 0
    const dayB = parseInt(b.day_number) || 0
    return dayA - dayB
  })

  const itineraryDetails = `
        <div class="pdf-tour-details__section">
            <div class="pdf-table-header">
                <div class="pdf-table-header__title">
                    <i class="fa-solid fa-map"></i>
                    <p><b>Itinerary</b></p>
                </div>
            </div>
            <div class="pdf-tour-details__data pdf-tour-details__data--itinerary">
                ${sortedItineraries
                  .map(
                    (itinerary, index) => `
                        <div class="pdf-tour-details__package">
                            <div class="pdf-tour-details__package-icon">
                                <i class="fa-solid fa-calendar"></i>
                            </div>
                            <div class="pdf-tour-details__package-name">
                                <p class="pdf-tour-details__package-text">
                                    <b>Day ${itinerary.day_number || index + 1}: ${itinerary.title || 'Tour Day'}</b>
                                </p>
                            ${
                              itinerary.image_url
                                ? `
                                <div style="margin: 8px 0;">
                                    <img src="${itinerary.image_url}" 
                                         alt="Day ${itinerary.day_number || index + 1} - ${itinerary.title || 'Tour Day'}" 
                                         style="width: 100%; max-width: 400px; height: auto; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" 
                                         onerror="this.style.display='none';" />
                                </div>
                            `
                                : ''
                            }
                            <p class="pdf-tour-details__package-text">
                                ${itinerary.description || 'No description available'}
                            </p>
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        </div>
    `

  // Generate inclusions list items
  const inclusionsList = Array.isArray(packageDate?.inclusions)
    ? packageDate.inclusions.map((item) => `<li>${item}</li>`).join('')
    : '<li>As per package</li>'

  // Generate exclusions list items
  const exclusionsList = Array.isArray(packageDate?.exclusions)
    ? packageDate.exclusions.map((item) => `<li>${item}</li>`).join('')
    : '<li>Personal expenses</li>'

  // Generate notes content with proper formatting
  const notesContent =
    Array.isArray(packageDate?.notes) && packageDate.notes.length > 0
      ? `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Additional Notes:</h5>
            <ul style="margin: 0; padding-left: 20px;">
                ${packageDate.notes.map((note) => `<li style="margin-bottom: 5px; line-height: 1.4; font-size: 11px; color: #495057;">${note}</li>`).join('')}
            </ul>
           </div>`
      : `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Additional Notes:</h5>
            <p style="margin: 0; font-size: 11px; color: #495057; font-style: italic;">No additional notes</p>
           </div>`

  // Generate payment terms content with proper formatting
  const paymentTermsContent =
    Array.isArray(packageDate?.payment_terms) &&
    packageDate.payment_terms.length > 0
      ? `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Payment Terms:</h5>
            <ul style="margin: 0; padding-left: 20px;">
                ${packageDate.payment_terms.map((term) => `<li style="margin-bottom: 5px; line-height: 1.4; font-size: 11px; color: #495057;">${term}</li>`).join('')}
            </ul>
           </div>`
      : `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Payment Terms:</h5>
            <p style="margin: 0; font-size: 11px; color: #495057; font-style: italic;">Standard payment terms apply</p>
           </div>`

  // Generate requirements content with proper formatting
  const requirementsContent =
    Array.isArray(packageDate?.requirements) &&
    packageDate.requirements.length > 0
      ? `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Requirements:</h5>
            <ul style="margin: 0; padding-left: 20px;">
                ${packageDate.requirements.map((req) => `<li style="margin-bottom: 5px; line-height: 1.4; font-size: 11px; color: #495057;">${req}</li>`).join('')}
            </ul>
           </div>`
      : `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Requirements:</h5>
            <p style="margin: 0; font-size: 11px; color: #495057; font-style: italic;">Valid passport required</p>
           </div>`

  // Generate payment details
  const paymentDetails = `
        <div class="pdf-payment-details">
            <div class="pdf-table-header pdf-table-header--payment">
                <div class="pdf-table-header__title">
                    <i class="fa-solid fa-credit-card"></i>
                    <p>Payment Details</p>
                </div>
            </div>
            <div class="pdf-payment-details__data">
                <div class="pdf-payment-details__header">
                    <div class="pdf-payment-details__col">Type</div>
                    <div class="pdf-payment-details__col">Amount PHP</div>
                </div>
                <div class="pdf-payment-details__body">
                    <div class="pdf-payment-details__row">
                        <div class="pdf-payment-details__label">Base Price per Person</div>
                        <div class="pdf-payment-details__value">${formatAmount(pricePerPerson)}</div>
                    </div>
                    <div class="pdf-payment-details__row">
                        <div class="pdf-payment-details__label">Number of Passengers</div>
                        <div class="pdf-payment-details__value">${booking.passenger_count || 0}</div>
                    </div>
                    <div class="pdf-payment-details__row">
                        <div class="pdf-payment-details__label">Base Total</div>
                        <div class="pdf-payment-details__value">${formatAmount(baseAmount)}</div>
                    </div>
                    ${
                      customizationFee > 0
                        ? `
                    <div class="pdf-payment-details__row">
                        <div class="pdf-payment-details__label">Customization Fee</div>
                        <div class="pdf-payment-details__value">${formatAmount(customizationFee)}</div>
                    </div>
                    `
                        : ''
                    }
                    <div class="pdf-payment-details__row">
                        <div class="pdf-payment-details__label">Payment Type</div>
                        <div class="pdf-payment-details__value">${booking.payment_type || 'N/A'}</div>
                    </div>
                    <div class="pdf-payment-details__row">
                        <div class="pdf-payment-details__label">Reservation Amount</div>
                        <div class="pdf-payment-details__value">${formatAmount(reservationAmount)}</div>
                    </div>
                </div>
                <div class="pdf-payment-details__footer">
                    <div class="pdf-payment-details__total-label">Total Amount</div>
                    <div class="pdf-payment-details__total-value">${formatAmount(totalAmount)}</div>
                </div>
            </div>
        </div>
    `

  // Generate inclusions details
  const inclusionsDetails = `
        <div class="pdf-inclusions">
            <div class="pdf-table-header pdf-table-header--inclusions">
                <div class="pdf-table-header__title">
                    <i class="fa-solid fa-star"></i>
                    <p>Tour Inclusions</p>
                </div>
            </div>
            <div class="pdf-inclusions__data">
                <div class="pdf-inclusions__list">
                    <h5>Inclusions:</h5>
                    <ul>
                        ${inclusionsList}
                    </ul>
                </div>
                <div class="pdf-inclusions__list">
                    <h5>Exclusions:</h5>
                    <ul>
                        ${exclusionsList}
                    </ul>
                </div>
            </div>
        </div>
    `

  // Generate customization details if applicable
  let customizationDetails = ''
  if (customization && customizationFee > 0) {
    const removedGroupIds = customization.removed_inclusion_group_ids
      ? JSON.parse(customization.removed_inclusion_group_ids)
      : []
    const restDayIds = customization.rest_day_ids
      ? JSON.parse(customization.rest_day_ids)
      : []

    let customizationItems = []

    if (removedGroupIds.length > 0) {
      customizationItems.push(
        `<li><strong>Removed Inclusion Groups:</strong> ${removedGroupIds.join(', ')}</li>`
      )
    }

    if (restDayIds.length > 0) {
      customizationItems.push(
        `<li><strong>Rest Days:</strong> Day ${restDayIds.join(', ')}</li>`
      )
    }

    if (customizationItems.length > 0) {
      customizationDetails = `
                <div class="pdf-customization">
                    <div class="pdf-table-header pdf-table-header--customization">
                        <div class="pdf-table-header__title">
                            <i class="fa-solid fa-cogs"></i>
                            <p>Package Customizations</p>
                        </div>
                    </div>
                    <div class="pdf-customization__data">
                        <div class="pdf-customization__list">
                            <h5>Applied Customizations:</h5>
                            <ul>
                                ${customizationItems.join('')}
                            </ul>
                            <p><strong>Customization Fee:</strong> PHP ${formatAmount(customizationFee)}</p>
                        </div>
                    </div>
                </div>
            `
    }
  }

  // Inject values into template
  html = html.replace(/{{baseUrl}}/g, baseUrl)
  html = html.replace(
    /\{\{bookingReference\}\}/g,
    booking.booking_reference || 'N/A'
  )
  html = html.replace('{{bookingDate}}', bookingDate)
  html = html.replace('{{tourDetails}}', tourDetails)
  html = html.replace('{{flightDetails}}', flightDetailsHTML)
  html = html.replace('{{itineraryDetails}}', itineraryDetails)
  html = html.replace('{{passengerDetails}}', passengers)
  html = html.replace('{{visaDetails}}', visaDetails)
  html = html.replace('{{paymentDetails}}', paymentDetails)
  html = html.replace('{{inclusionsDetails}}', inclusionsDetails)
  html = html.replace('{{customizationDetails}}', customizationDetails)
  html = html.replace('{{currency}}', currencyCode)
  html = html.replace('{{pricePerPerson}}', formatAmount(pricePerPerson))
  html = html.replace('{{passengerCount}}', booking.passenger_count || 0)
  html = html.replace('{{paymentType}}', booking.payment_type || 'N/A')
  html = html.replace('{{totalAmount}}', formatAmount(totalAmount))
  html = html.replace('{{reservationAmount}}', formatAmount(reservationAmount))
  html = html.replace('{{packageDuration}}', packageDuration)
  html = html.replace('{{packageTitle}}', tourPackage?.title || 'N/A')

  // Replace new dynamic content
  html = html.replace('{{inclusionsList}}', inclusionsList)
  html = html.replace('{{exclusionsList}}', exclusionsList)
  html = html.replace('{{notes}}', notesContent)
  html = html.replace('{{paymentTerms}}', paymentTermsContent)
  html = html.replace('{{requirements}}', requirementsContent)

  return html
}
