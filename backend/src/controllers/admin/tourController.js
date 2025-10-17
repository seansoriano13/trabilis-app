import { supabase, supabaseAdmin } from '../../config/supabaseClient.js'
import { syncTourBookingAssignmentStatus } from '../../services/assignmentService.js'
import Pusher from 'pusher'
import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import { generateTourSummaryPDF } from '../../services/brevoEmailService.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { getAirlineInfo } from '../../utils/airlinesUtils.js'
import { getAircraftName } from '../../utils/aircraftUtils.js'
import { getAirportFull } from '../../utils/airportUtils.js'
import airlines from '../../data/airlines.json' with { type: 'json' }
import { getStopsLabel } from '../../utils/flightutils.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Helper function to parse airport information from string
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


export const createTour = async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            main_image_url,
            panellum_url,
            destination_country,
            visa_required,
            fee_rules,
            dates,
            itineraries,      // ✅ NEW: Tour-level
            exclusions,       // ✅ NEW: Tour-level
            payment_terms,    // ✅ NEW: Tour-level
            requirements,     // ✅ NEW: Tour-level
            notes,            // ✅ NEW: Tour-level
        } = req.body

        // 1️⃣ Insert tour package
        const { data: tour, error: tourError } = await supabase
            .from('tour_packages')
            .insert([{ 
            title, 
            description, 
            status, 
            main_image_url, 
            panellum_url, 
            destination_country, 
            visa_required,
            fee_rules: fee_rules || { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 },
            inclusions: inclusions || [],
            exclusions: exclusions || [],
            payment_terms: payment_terms || [],
            requirements: requirements || [],
            notes: notes || [],
            }])
            .select()
            .single()

        if (tourError) return res.status(400).json({ error: tourError.message })

        // 2️⃣ Insert package dates (NO itineraries here!)
        for (const d of dates) {
            const { inclusion_groups, ...dateData } = d

            const { data: date, error: dateError } = await supabase
                .from('package_dates')
                .insert([{
                    ...dateData,
                    tour_package_id: tour.id,
                }])
                .select()
                .single()

            if (dateError) return res.status(400).json({ error: dateError.message })
        }

        // 3️⃣ Insert itineraries at TOUR level (once, not per date!)
        for (const i of itineraries) {
            const { error: itineraryError } = await supabase
                .from('package_itineraries')
                .insert([{ 
                    ...i, 
                    tour_package_id: tour.id,  // ✅ Link to tour, not date
                    package_date_id: null,      // ✅ Not date-specific
                    image_url: i.image_url || null
                }])

            if (itineraryError) {
                return res.status(400).json({ error: itineraryError.message })
            }
        }

        res.status(201).json({ message: 'Tour created successfully', tour })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// Get all tours
export const getAllTours = async (req, res) => {
    try {
        const { data, error } = await supabase.from('tour_packages').select(`
                *,
                itineraries:package_itineraries!tour_package_id (*, order:day_number),
                dates:package_dates (
                    *,
                    inclusion_groups:package_inclusion_groups (
                        id,
                        title,
                        removable,
                        fee_impact_per_group,
                        position,
                        items:package_inclusion_group_items (
                            id,
                            content,
                            position
                        )
                    )
                )
            `)

        if (error) return res.status(400).json({ error: error.message })
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tours' })
    }
}

export const getTour = async (req, res) => {
    const { id } = req.params

    const { data, error } = await supabase
        .from('tour_packages')
        .select(`
            *,
            itineraries:package_itineraries!tour_package_id (*),
            dates:package_dates (
                *,
                inclusion_groups:package_inclusion_groups (
                    id, title, removable, fee_impact_per_group, position,
                    items:package_inclusion_group_items (id, content, position)
                )
            )
        `)
        .eq('id', id)
        .single()

    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Tour not found' })

    // Transform and apply defaults
    const DEFAULT_FEE_RULES = {
        perRemovedGroup: 5000,
        perRestDay: 3000,
        minFee: 5000,
        maxFee: 50000,
    }

    const tourFeeRules = data.fee_rules && typeof data.fee_rules === 'object'
        ? { ...DEFAULT_FEE_RULES, ...data.fee_rules }
        : { ...DEFAULT_FEE_RULES }

    const transformed = {
        ...data,
        fee_rules: tourFeeRules,
        itineraries: (data.itineraries || []).sort((a, b) => a.day_number - b.day_number),
        dates: (data.dates || []).map((d) => {
            const fee_rules = d.fee_rules && typeof d.fee_rules === 'object'
                ? { ...tourFeeRules, ...d.fee_rules }
                : { ...tourFeeRules }

            const inclusion_groups = (d.inclusion_groups || [])
                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                .map((g) => ({
                    id: g.id,
                    title: g.title,
                    removable: g.removable,
                    fee_impact_per_group: g.fee_impact_per_group,
                    items: (g.items || [])
                        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                        .map((it) => it.content),
                }))

            return { ...d, fee_rules, inclusion_groups }
        })
    }

    res.json(transformed)
}

// ✏ Update tour package
export const updateTour = async (req, res) => {
    const { id } = req.params
        const { 
            title, description, status, main_image_url, panellum_url, 
            destination_country, visa_required, fee_rules, customFeeRules,
            inclusions, exclusions, payment_terms, requirements, notes, 
            dates, itineraries 
        } = req.body

    try {
        // 1️⃣ Update tour package
        const { error: tourError } = await supabase
            .from('tour_packages')
            .update({
                title, description, status, main_image_url, panellum_url,
                destination_country, visa_required,
                fee_rules: fee_rules || { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 },
                inclusions: inclusions || [],
                exclusions: exclusions || [],
                payment_terms: payment_terms || [],
                requirements: requirements || [],
                notes: notes || [],
            })
            .eq('id', id)

        if (tourError) return res.status(400).json({ error: tourError.message })

        // 2️⃣ Handle dates (delete removed, update existing, insert new)
        const { data: currentDates } = await supabase
            .from('package_dates')
            .select('id')
            .eq('tour_package_id', id)

        const currentDateIds = currentDates.map(d => d.id)
        const incomingDateIds = dates.map(d => d.id).filter(Boolean)
        const datesToDelete = currentDateIds.filter(id => !incomingDateIds.includes(id))

        // Delete removed dates
        for (const dateId of datesToDelete) {
            // Delete inclusion groups and items first
            const { data: groups } = await supabase
                .from('package_inclusion_groups')
                .select('id')
                .eq('package_date_id', dateId)

            if (groups) {
                for (const group of groups) {
                    await supabase
                        .from('package_inclusion_group_items')
                        .delete()
                        .eq('inclusion_group_id', group.id)
                    
                    await supabase
                        .from('package_inclusion_groups')
                        .delete()
                        .eq('id', group.id)
                }
            }

            await supabase.from('package_dates').delete().eq('id', dateId)
        }

        // Update or insert dates
        const createdDateIds = []
        for (const d of dates) {
            const { id: dateId, inclusion_groups, ...dateData } = d

            if (dateId) {
                // Update existing date
                await supabase
                    .from('package_dates')
                    .update(dateData)
                    .eq('id', dateId)
                createdDateIds.push(dateId)
            } else {
                // Insert new date
                const { data: newDate } = await supabase
                    .from('package_dates')
                    .insert([{ ...dateData, tour_package_id: id }])
                    .select()
                    .single()
                createdDateIds.push(newDate.id)
            }
        }

        // 3️⃣ Apply date-specific fee rules (customFeeRules)
        console.log('🔧 Custom fee rules received:', customFeeRules)
        
        // Get tour-level fee rules for resetting
        const tourFeeRules = fee_rules || { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 }
        
        // First, reset ALL dates to tour-level fee rules
        console.log('🔄 Resetting all dates to tour-level fee rules')
        for (const date of dates) {
            if (date.id) {
                const { error: resetError } = await supabase
                    .from('package_dates')
                    .update({ fee_rules: tourFeeRules })
                    .eq('id', date.id)
                
                if (resetError) {
                    console.error(`❌ Error resetting fee rules for date ${date.id}:`, resetError)
                } else {
                    console.log(`✅ Reset fee rules for date ${date.id} to tour-level`)
                }
            }
        }
        
        // Then, apply custom fee rules for specific dates
        if (customFeeRules && Array.isArray(customFeeRules)) {
            console.log(`🔧 Processing ${customFeeRules.length} custom fee rules`)
            
            for (const rule of customFeeRules) {
                if (rule.dateIndex !== undefined && rule.dateIndex >= 0 && rule.dateIndex < dates.length) {
                    const targetDate = dates[rule.dateIndex]
                    if (targetDate && targetDate.id) {
                        console.log(`💰 Applying custom fee rules to existing date ${rule.dateIndex + 1} (ID: ${targetDate.id})`)
                        
                        const customFeeData = {
                            perRemovedGroup: rule.perRemovedGroup || 0,
                            perRestDay: rule.perRestDay || 0,
                            minFee: rule.minFee || 0,
                            maxFee: rule.maxFee || 0
                        }
                        
                        const { error: feeError } = await supabase
                            .from('package_dates')
                            .update({ fee_rules: customFeeData })
                            .eq('id', targetDate.id)
                        
                        if (feeError) {
                            console.error(`❌ Error updating fee rules for date ${targetDate.id}:`, feeError)
                        } else {
                            console.log(`✅ Updated fee rules for date ${targetDate.id}:`, customFeeData)
                        }
                    }
                }
            }
        }

        // 4️⃣ Handle tour-level itineraries
        const { data: currentItineraries } = await supabase
            .from('package_itineraries')
            .select('id')
            .eq('tour_package_id', id)

        const currentItinIds = currentItineraries.map(it => it.id)
        const incomingItinIds = itineraries.map(it => it.id).filter(Boolean)
        const itinsToDelete = currentItinIds.filter(id => !incomingItinIds.includes(id))

        // Delete removed itineraries
        for (const itinId of itinsToDelete) {
            await supabase.from('package_itineraries').delete().eq('id', itinId)
        }

        // Update or insert itineraries
        for (const i of itineraries) {
            if (i.id) {
                // Update existing
                await supabase
                    .from('package_itineraries')
                    .update({
                        title: i.title,
                        description: i.description,
                        day_number: i.day_number,
                        image_url: i.image_url || null,
                    })
                    .eq('id', i.id)
            } else {
                // Insert new
                await supabase
                    .from('package_itineraries')
                    .insert([{ 
                        ...i, 
                        tour_package_id: id,
                        package_date_id: null,
                        image_url: i.image_url || null
                    }])
            }
        }

        res.json({ message: 'Tour updated successfully' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}


// ❌ Delete tour package and related data
export const deleteTour = async (req, res) => {
    const { id } = req.params

    try {
        // Delete related itineraries first (tour-level)
        await supabase
            .from('package_itineraries')
            .delete()
            .eq('tour_package_id', id)

        // Delete package dates
        const { data: dates } = await supabase
            .from('package_dates')
            .select('id')
            .eq('tour_package_id', id)

        if (dates?.length) {
            const dateIds = dates.map((d) => d.id)
            await supabase.from('package_dates').delete().in('id', dateIds)
        }

        // Delete tour package itself
        const { error: deleteError } = await supabase
            .from('tour_packages')
            .delete()
            .eq('id', id)

        if (deleteError)
            return res.status(400).json({ error: deleteError.message })
        res.json({ message: 'Tour deleted successfully' })
    } catch (err) {
        res.status(500).json({ error: err.message })
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
    const templatePath = path.join(
        __dirname,
        '../../services/templates/tour.html'
    )
    let html = fs.readFileSync(templatePath, 'utf8')

    // Replace BASE_URL placeholder with actual backend URL
    const baseUrl =
        process.env.BACKEND_URL ||
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
                    <b>${packageDate?.start_date && packageDate?.end_date ? 
                        Math.ceil((new Date(packageDate.end_date) - new Date(packageDate.start_date)) / (1000 * 60 * 60 * 24)) + 1 : 
                        'N/A'
                    } Days</b>
                </p>
                <div class="pdf-tour-details__arrival">
                    <p class="pdf-tour-details__duration">
                        <b>${booking.passenger_count || 0} Passengers</b>
                    </p>
                </div>
                <div class="pdf-tour-details__leg">
                    <p class="pdf-tour-details__duration">
                        ${packageDate?.start_date && packageDate?.end_date ? 
                            `${new Date(packageDate.start_date).toLocaleDateString()} - ${new Date(packageDate.end_date).toLocaleDateString()}` : 
                            'N/A'
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
                    // Get PNR from flight details instead of passenger details
                    const flightPnr = (booking.flight_details?.outbound?.[0]?.pnr || booking.flight_details?.return?.[0]?.pnr || 'TBA')
                    const dateOfBirth = passenger.dateOfBirth || 'N/A'
                    // Use lead passenger contact as fallback if individual passenger contact is missing
                    const email = passenger.contact?.emailAddress || booking.lead_email || 'Not provided'
                    const phone = passenger.contact?.phones?.[0]?.number || booking.lead_phone || 'Not provided'
                    const psngrDocs = (passenger.documents || [])[0] || {}
                    const passport = psngrDocs.number || 'N/A'
                    const status = booking.status === 'CONFIRMED' ? 'CONFIRMED' : booking.status

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
    const customizationFee = customization ? toNumber(customization.customization_fee) : 0
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
    const packageDuration = packageDate?.start_date && packageDate?.end_date ? 
        Math.ceil((new Date(packageDate.end_date) - new Date(packageDate.start_date)) / (1000 * 60 * 60 * 24)) + 1 : 
        0

    // Generate flight details from flight_details JSON field - restructured to match flight.html format
    const flightDetails = booking.flight_details || {}
    const outboundSegs = Array.isArray(flightDetails.outbound)
        ? flightDetails.outbound
        : flightDetails.outbound
        ? [flightDetails.outbound]
        : []
    const inboundSegs = Array.isArray(flightDetails.return || flightDetails.inbound)
        ? flightDetails.return || flightDetails.inbound
        : flightDetails.return || flightDetails.inbound
        ? [flightDetails.return || flightDetails.inbound]
        : []

    // Generate flight itineraries similar to flight controller
    const flightItineraries = []
    
    // Add outbound flights
    if (outboundSegs.length > 0) {
        flightItineraries.push({
            type: 'outbound',
            segments: outboundSegs.map(seg => {
                // Find airline by name instead of ID
                const airlineName = seg.airline || 'TBA'
                const airlineInfo = airlineName === 'TBA' 
                    ? { name: 'TBA', id: 'TBA', logo: null }
                    : airlines.find(airline => 
                        airline.name.toLowerCase() === airlineName.toLowerCase() ||
                        airline.name.toLowerCase().includes(airlineName.toLowerCase())
                      ) || { name: airlineName, id: airlineName, logo: null }
                
                const departureInfo = parseAirportInfo(seg.departure)
                const arrivalInfo = parseAirportInfo(seg.arrival)
                // Handle date format inconsistency: seg.date might be just date string, seg.arrival_date is full timestamp
                let departureTime = null
                let arrivalTime = null
                
                if (seg.date) {
                    // If seg.date is just a date string (YYYY-MM-DD), treat it as departure date at midnight
                    // If it's a full timestamp, use it as is
                    departureTime = new Date(seg.date)
                }
                
                if (seg.arrival_date) {
                    arrivalTime = new Date(seg.arrival_date)
                }
                
                // If we only have departure date but no arrival time, we can't calculate duration properly
                // This is a data consistency issue that should be addressed in the frontend
                
                // Calculate duration if both times are available
                let duration = 'TBA'
                if (departureTime && arrivalTime) {
                    const diffMs = arrivalTime - departureTime
                    const hours = Math.floor(diffMs / (1000 * 60 * 60))
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                    duration = `${hours}h ${minutes}m`
                }
                
                return {
                    airline: {
                        name: airlineInfo.name,
                        code: airlineInfo.id || seg.airline || 'TBA',
                        logo: airlineInfo.logo || ''
                    },
                    number: seg.pnr || seg.flight_no || 'TBA',
                    departure: {
                        iata: departureInfo.iata,
                        city: departureInfo.city,
                        airport: departureInfo.airport,
                        terminal: seg.terminal || departureInfo.terminal,
                        time: departureTime ? departureTime.toLocaleString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                        }) : 'TBA',
                        at: departureTime ? departureTime.toISOString() : null
                    },
                    arrival: {
                        iata: arrivalInfo.iata,
                        city: arrivalInfo.city,
                        airport: arrivalInfo.airport,
                        terminal: seg.terminal || arrivalInfo.terminal,
                        time: arrivalTime ? arrivalTime.toLocaleString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                        }) : 'TBA',
                        at: arrivalTime ? arrivalTime.toISOString() : null
                    },
                    aircraft: {
                        code: seg.aircraft || 'TBA',
                        name: seg.aircraft ? getAircraftName(seg.aircraft) : 'TBA'
                    },
                    duration: duration,
                    stops: 0
                }
            })
        })
    }

    // Add return flights
    if (inboundSegs.length > 0) {
        flightItineraries.push({
            type: 'return',
            segments: inboundSegs.map(seg => {
                // Find airline by name instead of ID
                const airlineName = seg.airline || 'TBA'
                const airlineInfo = airlineName === 'TBA' 
                    ? { name: 'TBA', id: 'TBA', logo: null }
                    : airlines.find(airline => 
                        airline.name.toLowerCase() === airlineName.toLowerCase() ||
                        airline.name.toLowerCase().includes(airlineName.toLowerCase())
                      ) || { name: airlineName, id: airlineName, logo: null }
                
                const departureInfo = parseAirportInfo(seg.departure)
                const arrivalInfo = parseAirportInfo(seg.arrival)
                // Handle date format inconsistency: seg.date might be just date string, seg.arrival_date is full timestamp
                let departureTime = null
                let arrivalTime = null
                
                if (seg.date) {
                    // If seg.date is just a date string (YYYY-MM-DD), treat it as departure date at midnight
                    // If it's a full timestamp, use it as is
                    departureTime = new Date(seg.date)
                }
                
                if (seg.arrival_date) {
                    arrivalTime = new Date(seg.arrival_date)
                }
                
                // If we only have departure date but no arrival time, we can't calculate duration properly
                // This is a data consistency issue that should be addressed in the frontend
                
                // Calculate duration if both times are available
                let duration = 'TBA'
                if (departureTime && arrivalTime) {
                    const diffMs = arrivalTime - departureTime
                    const hours = Math.floor(diffMs / (1000 * 60 * 60))
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
                    duration = `${hours}h ${minutes}m`
                }
                
                return {
                    airline: {
                        name: airlineInfo.name,
                        code: airlineInfo.id || seg.airline || 'TBA',
                        logo: airlineInfo.logo || ''
                    },
                    number: seg.pnr || seg.flight_no || 'TBA',
                    departure: {
                        iata: departureInfo.iata,
                        city: departureInfo.city,
                        airport: departureInfo.airport,
                        terminal: seg.terminal || departureInfo.terminal,
                        time: departureTime ? departureTime.toLocaleString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                        }) : 'TBA',
                        at: departureTime ? departureTime.toISOString() : null
                    },
                    arrival: {
                        iata: arrivalInfo.iata,
                        city: arrivalInfo.city,
                        airport: arrivalInfo.airport,
                        terminal: seg.terminal || arrivalInfo.terminal,
                        time: arrivalTime ? arrivalTime.toLocaleString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                        }) : 'TBA',
                        at: arrivalTime ? arrivalTime.toISOString() : null
                    },
                    aircraft: {
                        code: seg.aircraft || 'TBA',
                        name: seg.aircraft ? getAircraftName(seg.aircraft) : 'TBA'
                    },
                    duration: duration,
                    stops: 0
                }
            })
        })
    }

    // Generate flight details HTML - show TBA when no data, with proper Onward/Return structure
    let flightDetailsHTML = ''
    
    if (flightItineraries.length > 0) {
        // Generate Onward flights
        const onwardFlights = flightItineraries.find(itinerary => itinerary.type === 'outbound')
        if (onwardFlights) {
            flightDetailsHTML += /* HTML */ `
            <div class="pdf-tour-details__section pdf-tour-details__section--flight">
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
                            <i class="fa-solid fa-plane-departure pdf-flight-details__icon"></i>
                            <p>Departing</p>
                        </div>
                        <div class="pdf-flight-details__subheader-title">
                            <i class="fa-solid fa-plane-arrival pdf-flight-details__icon"></i>
                            <p>Arriving</p>
                        </div>
                    </div>
                    <div class="pdf-flight-details__data">
                        ${onwardFlights.segments.map((segment, segIndex) => `
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
                        `).join('')}
                    </div>
                </div>
            `
        }

        // Generate Return flights
        const returnFlights = flightItineraries.find(itinerary => itinerary.type === 'return')
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
                            <i class="fa-solid fa-plane-departure pdf-flight-details__icon"></i>
                            <p>Departing</p>
                        </div>
                        <div class="pdf-flight-details__subheader-title">
                            <i class="fa-solid fa-plane-arrival pdf-flight-details__icon"></i>
                            <p>Arriving</p>
                        </div>
                    </div>
                    <div class="pdf-flight-details__data">
                        ${returnFlights.segments.map((segment, segIndex) => `
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
                        `).join('')}
                    </div>
                </div>
            `
        }
    } else {
        // Show TBA when no flight data - with proper Onward/Return structure
        flightDetailsHTML = `
            <div class="pdf-tour-details__section pdf-tour-details__section--flight">
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
    const sortedItineraries = (tourPackage?.itineraries || [])
        .sort((a, b) => {
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
                    .map((itinerary, index) => `
                        <div class="pdf-tour-details__package">
                            <div class="pdf-tour-details__package-icon">
                                <i class="fa-solid fa-calendar"></i>
                            </div>
                            <div class="pdf-tour-details__package-name">
                                <p class="pdf-tour-details__package-text">
                                    <b>Day ${itinerary.day_number || index + 1}: ${itinerary.title || 'Tour Day'}</b>
                                </p>
                            ${itinerary.image_url ? `
                                <div style="margin: 8px 0;">
                                    <img src="${itinerary.image_url}" 
                                         alt="Day ${itinerary.day_number || index + 1} - ${itinerary.title || 'Tour Day'}" 
                                         style="width: 100%; max-width: 400px; height: auto; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" 
                                         onerror="this.style.display='none';" />
                                </div>
                            ` : ''}
                            <p class="pdf-tour-details__package-text">
                                ${itinerary.description || 'No description available'}
                            </p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `

    // Generate inclusions list items
    const inclusionsList = Array.isArray(packageDate?.inclusions)
        ? packageDate.inclusions.map(item => `<li>${item}</li>`).join('')
        : '<li>As per package</li>'

    // Generate exclusions list items
    const exclusionsList = Array.isArray(packageDate?.exclusions)
        ? packageDate.exclusions.map(item => `<li>${item}</li>`).join('')
        : '<li>Personal expenses</li>'

    // Generate notes content with proper formatting
    const notesContent = Array.isArray(packageDate?.notes) && packageDate.notes.length > 0
        ? `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Additional Notes:</h5>
            <ul style="margin: 0; padding-left: 20px;">
                ${packageDate.notes.map(note => `<li style="margin-bottom: 5px; line-height: 1.4; font-size: 11px; color: #495057;">${note}</li>`).join('')}
            </ul>
           </div>`
        : `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Additional Notes:</h5>
            <p style="margin: 0; font-size: 11px; color: #495057; font-style: italic;">No additional notes</p>
           </div>`

    // Generate payment terms content with proper formatting
    const paymentTermsContent = Array.isArray(packageDate?.payment_terms) && packageDate.payment_terms.length > 0
        ? `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Payment Terms:</h5>
            <ul style="margin: 0; padding-left: 20px;">
                ${packageDate.payment_terms.map(term => `<li style="margin-bottom: 5px; line-height: 1.4; font-size: 11px; color: #495057;">${term}</li>`).join('')}
            </ul>
           </div>`
        : `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Payment Terms:</h5>
            <p style="margin: 0; font-size: 11px; color: #495057; font-style: italic;">Standard payment terms apply</p>
           </div>`

    // Generate requirements content with proper formatting
    const requirementsContent = Array.isArray(packageDate?.requirements) && packageDate.requirements.length > 0
        ? `<div style="margin-bottom: 15px;">
            <h5 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: #2c3e50; text-transform: uppercase; letter-spacing: 0.5px;">Requirements:</h5>
            <ul style="margin: 0; padding-left: 20px;">
                ${packageDate.requirements.map(req => `<li style="margin-bottom: 5px; line-height: 1.4; font-size: 11px; color: #495057;">${req}</li>`).join('')}
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
                    ${customizationFee > 0 ? `
                    <div class="pdf-payment-details__row">
                        <div class="pdf-payment-details__label">Customization Fee</div>
                        <div class="pdf-payment-details__value">${formatAmount(customizationFee)}</div>
                    </div>
                    ` : ''}
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
        const removedGroupIds = customization.removed_inclusion_group_ids ? 
            JSON.parse(customization.removed_inclusion_group_ids) : []
        const restDayIds = customization.rest_day_ids ? 
            JSON.parse(customization.rest_day_ids) : []
        
        let customizationItems = []
        
        if (removedGroupIds.length > 0) {
            customizationItems.push(`<li><strong>Removed Inclusion Groups:</strong> ${removedGroupIds.join(', ')}</li>`)
        }
        
        if (restDayIds.length > 0) {
            customizationItems.push(`<li><strong>Rest Days:</strong> Day ${restDayIds.join(', ')}</li>`)
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

// View Tour Booking HTML (for testing without PDF generation)
// Auto-enable visa based on country
export const updateTourVisaSettings = async (req, res) => {
    try {
        const { id } = req.params
        const { destination_country } = req.body

        if (!destination_country) {
            return res.status(400).json({
                success: false,
                message: 'destination_country is required'
            })
        }

        // Check if country requires visa
        const { data: visaRequirement, error: visaError } = await supabaseAdmin
            .from('visa_requirements')
            .select('country')
            .eq('country', destination_country)
            .single()

        const visa_required = !visaError && !!visaRequirement

        // Update tour package
        const { data: updated, error: updateError } = await supabaseAdmin
            .from('tour_packages')
            .update({
                destination_country,
                visa_required,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('id')

        if (updateError) {
            throw updateError
        }

        if (!updated || updated.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tour package not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Tour visa settings updated successfully',
            data: {
                destination_country,
                visa_required
            }
        })

    } catch (error) {
        console.error('Error updating tour visa settings:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to update tour visa settings'
        })
    }
}

export const getCountriesWithVisaRequirements = async (req, res) => {
    try {
        const { data: countries, error } = await supabaseAdmin
            .from('visa_requirements')
            .select('country')
            .order('country', { ascending: true })

        if (error) {
            throw error
        }

        const countryList = countries.map(c => c.country)

        res.status(200).json({
            success: true,
            data: countryList
        })

    } catch (error) {
        console.error('Error fetching countries with visa requirements:', error)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch countries with visa requirements'
        })
    }
}

export const viewTourBookingHTML = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database with related package information
        const { data: booking, error: bookingError } = await supabase
            .from('tour_bookings')
            .select(
                `
                *,
                package_dates (
                    id,
                    start_date,
                    end_date,
                    total_slots,
                    tour_package_id,
                    tour_packages (
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
                            image_url
                        )
                    )
                )
            `
            )
            .eq('id', id)
            .single()

        if (bookingError) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        // Generate HTML using shared function
        const html = await generateTourBookingHTML(booking)
        
        res.setHeader('Content-Type', 'text/html')
        res.send(html)
    } catch (error) {
        console.error('Error generating tour HTML:', error)
        res.status(500).json({
            error: 'Failed to generate HTML',
            message: error.message,
        })
    }
}

// Generate Tour PDF for Admin (without PDFShift - uses browser print functionality)

// Generate Tour PDF for Admin (without PDFShift - uses browser print functionality)
export const generateTourPDFAdmin = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database with related package information
        const { data: booking, error: bookingError } = await supabase
            .from('tour_bookings')
            .select(
                `
                *,
                package_dates (
                    id,
                    start_date,
                    end_date,
                    total_slots,
                    tour_package_id,
                    tour_packages (
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
                            image_url
                        )
                    )
                ),
                tour_booking_customizations (
                    id,
                    removed_inclusion_group_ids,
                    rest_day_ids,
                    customization_fee,
                    client_snapshot
                )
            `
            )
            .eq('id', id)
            .single()

        if (bookingError) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        // Generate HTML using shared function
        const html = await generateTourBookingHTML(booking)

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
                
                /* Itinerary sections */
                .itinerary-section {
                    margin-bottom: 20px !important;
                    border: 1px solid #e9ecef !important;
                    border-radius: 8px !important;
                    overflow: hidden !important;
                    background: white !important;
                }
                
                .itinerary-header {
                    background: #e21e25 !important;
                    color: white !important;
                    padding: 12px 15px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    letter-spacing: 0.5px !important;
                    text-transform: uppercase !important;
                }
                
                .itinerary-details-row {
                    display: flex !important;
                    align-items: center !important;
                    padding: 15px !important;
                    background: #f8f9fa !important;
                }
                
                .itinerary-col {
                    flex: 1 !important;
                    padding: 0 10px !important;
                }
                
                .itinerary-col h4 {
                    margin: 0 0 5px 0 !important;
                    font-size: 11px !important;
                    font-weight: 600 !important;
                    color: #2c3e50 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                
                .itinerary-col p {
                    margin: 0 !important;
                    color: #495057 !important;
                    font-weight: 500 !important;
                    font-size: 12px !important;
                }
                
                /* Tables */
                .passenger-details,
                .flight-table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin-bottom: 20px !important;
                    border: 1px solid #e9ecef !important;
                    border-radius: 8px !important;
                    overflow: hidden !important;
                }
                
                .passenger-details th,
                .passenger-details td,
                .flight-table th,
                .flight-table td {
                    text-align: left !important;
                    padding: 12px 15px !important;
                    border-bottom: 1px solid #e9ecef !important;
                    vertical-align: top !important;
                }
                
                .passenger-details th,
                .flight-table th {
                    background: #2c3e50 !important;
                    color: white !important;
                    font-size: 11px !important;
                    font-weight: 600 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                
                .passenger-details td,
                .flight-table td {
                    background: white !important;
                    color: #495057 !important;
                    font-weight: 500 !important;
                    font-size: 12px !important;
                }
                
                /* Details boxes */
                .bottom-section {
                    display: flex !important;
                    justify-content: space-between !important;
                    margin-bottom: 20px !important;
                    gap: 20px !important;
                }
                
                .details-box {
                    flex: 1 !important;
                    border: 1px solid #e9ecef !important;
                    border-radius: 8px !important;
                    background: white !important;
                    overflow: hidden !important;
                }
                
                .details-box-header {
                    display: flex !important;
                    align-items: center !important;
                    background: #f8f9fa !important;
                    padding: 12px 15px !important;
                    font-weight: 600 !important;
                    font-size: 12px !important;
                    color: #2c3e50 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                    border-bottom: 1px solid #e9ecef !important;
                }
                
                .details-box-content {
                    padding: 15px !important;
                }
                
                .payment-details table {
                    width: 100% !important;
                }
                
                .payment-details td {
                    padding: 8px 0 !important;
                    color: #495057 !important;
                    font-weight: 500 !important;
                    font-size: 12px !important;
                }
                
                .payment-details .total td {
                    font-weight: 700 !important;
                    border-top: 2px solid #e21e25 !important;
                    padding-top: 12px !important;
                    color: #2c3e50 !important;
                    font-size: 14px !important;
                }
                
                .inclusions-details h5 {
                    margin: 0 0 8px 0 !important;
                    font-size: 12px !important;
                    font-weight: 600 !important;
                    color: #2c3e50 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                
                .inclusions-details p {
                    margin: 0 0 10px 0 !important;
                    line-height: 1.5 !important;
                    font-size: 11px !important;
                    color: #495057 !important;
                }
                
                /* Important info */
                .important-info {
                    border-top: 3px solid #e21e25 !important;
                    padding: 20px !important;
                    margin-top: 20px !important;
                    background: white !important;
                    border-radius: 8px !important;
                    border: 1px solid #e9ecef !important;
                }
                
                .important-info h4 {
                    margin: 0 0 10px 0 !important;
                    font-size: 14px !important;
                    font-weight: 600 !important;
                    color: #2c3e50 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.5px !important;
                }
                
                .important-info p {
                    line-height: 1.5 !important;
                    color: #495057 !important;
                    font-size: 11px !important;
                    margin: 0 !important;
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
                    
                    .itinerary-section,
                    .details-box,
                    .passenger-details,
                    .flight-table {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                    }
                }
            </style>
        `

        // Insert admin styles
        const finalHtml = html.replace('</head>', adminStyles + '</head>')

        // Set response headers for HTML (admin will use browser print to PDF)
        res.setHeader('Content-Type', 'text/html')
        res.setHeader(
            'Content-Disposition',
            `inline; filename="Tour-Booking-${booking.booking_reference}.html"`
        )
        res.send(finalHtml)
    } catch (error) {
        console.error('Error generating tour PDF for admin:', error)
        res.status(500).json({
            error: 'Failed to generate PDF for admin',
            message: error.message,
        })
    }
}

const pusher = new Pusher({
    appId: '2048372',
    key: '371c6201af1a663a4f58',
    secret: 'b4a5985ecd6d27690c8b',
    cluster: 'ap1',
    useTLS: true,
})

// Simple tour status update (for publish/unpublish)
export const updateTourStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        if (!status || !['DRAFT', 'PUBLISHED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be DRAFT or PUBLISHED' })
        }

        const { data, error } = await supabase
            .from('tour_packages')
            .update({ status })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return res.status(400).json({ error: error.message })
        }

        if (!data) {
            return res.status(404).json({ error: 'Tour not found' })
        }

        res.json({ 
            success: true, 
            message: `Tour ${status.toLowerCase()} successfully`,
            tour: data 
        })
    } catch (err) {
        console.error('Error updating tour status:', err)
        res.status(500).json({ error: 'Failed to update tour status' })
    }
}

// Edit Tour Booking (status/assignment updates)
export const editTourBooking = async (req, res) => {
    try {
        const { id } = req.params
        const { status, assigned_to, assignment_status, flight_details } =
            req.body || {}

        // Fetch existing booking for comparison and reference
        const { data: existingBooking, error: fetchError } = await supabase
            .from('tour_bookings')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !existingBooking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        // Build update payload
        const updateData = {}
        if (typeof status !== 'undefined') updateData.status = status
        if (typeof assignment_status !== 'undefined')
            updateData.assignment_status = assignment_status

        // Allow storing flight_details JSON
        if (typeof flight_details !== 'undefined') {
            updateData.flight_details = flight_details
        }

        if (typeof assigned_to === 'number' || assigned_to === null) {
            updateData.assigned_to = assigned_to
            updateData.assigned_at = assigned_to
                ? new Date().toISOString()
                : null
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' })
        }

        const { data, error } = await supabase
            .from('tour_bookings')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return res.status(400).json({ error: error.message })
        }

        // Notifications
        if (status && status !== existingBooking.status) {
            await supabase.from('admin_notifications').insert({
                type: 'booking_status_changed',
                message: `Tour booking ${existingBooking.booking_reference} status changed from ${existingBooking.status} to ${status}`,
                booking_reference: existingBooking.booking_reference,
                booking_type: 'tour',
                booking_id: null,
                created_at: new Date().toISOString(),
            })
            await pusher.trigger(
                'admin-notifications',
                'booking-status-changed',
                {
                    bookingReference: existingBooking.booking_reference,
                    bookingType: 'tour',
                    bookingId: id,
                    status,
                }
            )
        }

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
                ? `Tour booking ${existingBooking.booking_reference} reassigned by ${assignerName} to ${assigneeName}`
                : `Tour booking ${existingBooking.booking_reference} assigned by ${assignerName} to ${assigneeName}`

            await supabase.from('admin_notifications').insert({
                type: notifType,
                message,
                booking_reference: existingBooking.booking_reference,
                booking_type: 'tour',
                booking_id: null,
                assigned_to: assigned_to || null,
                assigned_by: req.user?.id || null,
                created_at: new Date().toISOString(),
            })
            await pusher.trigger('admin-notifications', notifType, {
                bookingReference: existingBooking.booking_reference,
                bookingType: 'tour',
                bookingId: id,
            })

            // Sync assignment with related visa processings
            if (assigned_to) {
                try {
                    // Get related visa processings and update their assignment
                    const { data: visaProcessings, error: fetchError } = await supabase
                        .from('visa_processings')
                        .select('id')
                        .eq('tour_booking_id', id)

                    if (!fetchError && visaProcessings && visaProcessings.length > 0) {
                        const visaProcessingIds = visaProcessings.map(vp => vp.id)
                        
                        const { error: updateError } = await supabase
                            .from('visa_processings')
                            .update({
                                assigned_to: assigned_to,
                                assigned_at: new Date().toISOString(),
                                assigned_by: req.user?.id || null
                            })
                            .in('id', visaProcessingIds)

                        if (updateError) {
                            console.error('Error syncing visa processing assignments:', updateError)
                        } else {
                            console.log(`Synced ${visaProcessingIds.length} visa processings to new staff member`)
                        }
                    }
                } catch (syncError) {
                    console.error('Error syncing visa processing assignments:', syncError)
                    // Don't fail the main update if sync fails
                }
            }
        }

        if (
            assignment_status &&
            assignment_status !== existingBooking.assignment_status
        ) {
            await supabase.from('admin_notifications').insert({
                type: 'assignment_status_updated',
                message: `Tour booking ${existingBooking.booking_reference} assignment status: ${assignment_status}`,
                booking_reference: existingBooking.booking_reference,
                booking_type: 'tour',
                booking_id: null,
                created_at: new Date().toISOString(),
            })
            await pusher.trigger(
                'admin-notifications',
                'assignment-status-updated',
                {
                    bookingReference: existingBooking.booking_reference,
                    bookingType: 'tour',
                    bookingId: id,
                    status: assignment_status,
                }
            )

            // Sync assignment status with related visa processings
            try {
                const syncResult = await syncTourBookingAssignmentStatus(id, assignment_status, req.user?.id)
                if (syncResult.success) {
                    console.log(`Synced visa processing assignments: ${syncResult.message}`)
                } else {
                    console.warn(`Failed to sync visa processing assignments: ${syncResult.error}`)
                }
            } catch (syncError) {
                console.error('Error syncing visa processing assignments:', syncError)
                // Don't fail the main update if sync fails
            }
        }

        return res.json({ success: true, data })
    } catch (err) {
        console.error('Error editing tour booking:', err)
        return res.status(500).json({ error: 'Failed to edit tour booking' })
    }
}

// Cancel Tour Booking
export const cancelTourBooking = async (req, res) => {
    try {
        const { id } = req.params
        const { reason } = req.body || {}

        const { data, error } = await supabase
            .from('tour_bookings')
            .update({
                status: 'CANCELLED',
                cancellation_reason: reason || null,
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return res.status(400).json({ error: error.message })
        }

        return res.json({ success: true, data })
    } catch (err) {
        console.error('Error cancelling tour booking:', err)
        return res.status(500).json({ error: 'Failed to cancel tour booking' })
    }
}

// Update Passenger Visa Status
export const updatePassengerVisaStatus = async (req, res) => {
    try {
        const { id, index } = req.params
        const { visa_status, visa_type, existing_visa_status, visa_expiry_date } = req.body

        // Validate required fields
        if (!id || index === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Booking ID and passenger index are required'
            })
        }

        const passengerIndex = parseInt(index)
        if (isNaN(passengerIndex) || passengerIndex < 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid passenger index'
            })
        }

        // Validate visa_status if provided
        if (visa_status && !['not_applicable', 'already_has', 'needs_processing'].includes(visa_status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid visa_status. Must be one of: not_applicable, already_has, needs_processing'
            })
        }

        // Validate visa_type if provided
        if (visa_type && !['Tourist Visa', 'Business Visa', 'Student Visa', 'Fiancee Visa', 'Spousal Visa'].includes(visa_type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid visa_type'
            })
        }

        // Validate existing_visa_status if provided
        if (existing_visa_status && !['valid', 'expiring_soon', 'expired', 'not_specified'].includes(existing_visa_status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid existing_visa_status'
            })
        }

        // Fetch existing booking
        const { data: existingBooking, error: fetchError } = await supabase
            .from('tour_bookings')
            .select('*')
            .eq('id', id)
            .single()

        if (fetchError || !existingBooking) {
            return res.status(404).json({
                success: false,
                error: 'Booking not found'
            })
        }

        // Parse passenger_details
        let passengers = []
        try {
            passengers = typeof existingBooking.passenger_details === 'string' 
                ? JSON.parse(existingBooking.passenger_details) 
                : existingBooking.passenger_details || []
        } catch (parseError) {
            return res.status(400).json({
                success: false,
                error: 'Invalid passenger_details format'
            })
        }

        // Validate passenger index exists
        if (passengerIndex >= passengers.length) {
            return res.status(400).json({
                success: false,
                error: 'Passenger index out of range'
            })
        }

        // Update passenger visa fields
        const passenger = passengers[passengerIndex]
        
        // Update fields if provided
        if (visa_status !== undefined) {
            passenger.visa_status = visa_status
            
            // Clear dependent fields if visa_status changes away from 'already_has'
            if (visa_status !== 'already_has') {
                passenger.visa_type = ''
                passenger.existing_visa_status = 'not_specified'
                passenger.visa_expiry_date = ''
            }
        }
        
        if (visa_type !== undefined) {
            passenger.visa_type = visa_type
        }
        
        if (existing_visa_status !== undefined) {
            passenger.existing_visa_status = existing_visa_status
            
            // Clear expiry date if status doesn't require it
            if (existing_visa_status !== 'valid' && existing_visa_status !== 'expiring_soon') {
                passenger.visa_expiry_date = ''
            }
        }
        
        if (visa_expiry_date !== undefined) {
            passenger.visa_expiry_date = visa_expiry_date
        }

        // Update the booking with modified passenger_details
        const { data: updatedBooking, error: updateError } = await supabase
            .from('tour_bookings')
            .update({
                passenger_details: passengers,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            throw updateError
        }

        res.status(200).json({
            success: true,
            message: 'Passenger visa status updated successfully',
            data: updatedBooking
        })

    } catch (error) {
        console.error('Error updating passenger visa status:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
}
