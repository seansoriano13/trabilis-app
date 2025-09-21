import { supabase } from '../../config/supabaseClient.js'
import { generateTourSummaryPDF } from '../../services/emailService.js'

// Helper function to generate itinerary HTML
const generateItineraryHTML = (itineraries) => {
    if (!itineraries || itineraries.length === 0) {
        return '<p style="padding: 12px; margin: 0; line-height: 1.4; font-size: 11px; color: #495057;">Tour itinerary details will be provided upon confirmation.</p>'
    }

    // Sort itineraries by day_number
    const sortedItineraries = itineraries.sort((a, b) => (a.day_number || 0) - (b.day_number || 0))

    let html = ''
    sortedItineraries.forEach((day, index) => {
        html += `
            <div style="margin-top: 8px; margin-bottom: 8px; padding: 10px; background-color: #fafbfc; border-left: 3px solid #e21e25; border-radius: 6px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);">
                <h4 style="margin: 0 0 5px 0; color: #e21e25; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px;">Day ${day.day_number || index + 1}: ${day.title || 'Tour Day'}</h4>
                <p style="margin: 0; color: #495057; line-height: 1.4; font-size: 10px; font-weight: 500;">${day.description || 'Activities and details for this day.'}</p>
            </div>
        `
    })

    return html
}

export const createTour = async (req, res) => {
    try {
        const {
            title,
            description,
            status,
            main_image_url,
            panellum_url,
            dates,
        } = req.body

        // 1️⃣ Insert tour package
        const { data: tour, error: tourError } = await supabase
            .from('tour_packages')
            .insert([
                { title, description, status, main_image_url, panellum_url },
            ])
            .select()
            .single()

        if (tourError) return res.status(400).json({ error: tourError.message })

        // 2️⃣ Insert package dates with JSON extras
        for (const d of dates) {
            const {
                itineraries,
                inclusions,
                exclusions,
                payment_terms,
                requirements,
                notes,
                ...dateData
            } = d

            console.log(dateData)

            const { data: date, error: dateError } = await supabase
                .from('package_dates')
                .insert([
                    {
                        ...dateData,
                        tour_package_id: tour.id,
                        inclusions: inclusions || [],
                        exclusions: exclusions || [],
                        payment_terms: payment_terms || [],
                        requirements: requirements || [],
                        notes: notes || [],
                    },
                ])
                .select()
                .single()

            if (dateError)
                return res.status(400).json({ error: dateError.message })

            // 3️⃣ Insert itineraries per date
            for (const i of itineraries) {
                const { data: itinerary, error: itineraryError } =
                    await supabase
                        .from('package_itineraries')
                        .insert([{ ...i, package_date_id: date.id }])
                        .select()
                        .single()

                if (itineraryError)
                    return res
                        .status(400)
                        .json({ error: itineraryError.message })
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
                dates:package_dates (
                    *,
                    itineraries:package_itineraries (*)
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
        .select(
            `
            *,
            dates:package_dates (
                *,
                itineraries:package_itineraries (*)
            )
        `
        )
        .eq('id', id)
        .single()

    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Tour not found' })

    res.json(data)
}

// ✏ Update tour package
export const updateTour = async (req, res) => {
    const { id } = req.params
    const { title, description, status, main_image_url, panellum_url, dates } =
        req.body

    try {
        // 1️⃣ Update tour package
        const { error: tourError } = await supabase
            .from('tour_packages')
            .update({
                title,
                description,
                status,
                main_image_url,
                panellum_url,
            })
            .eq('id', id)

        if (tourError) return res.status(400).json({ error: tourError.message })

        // 2️⃣ Loop through dates
        for (const d of dates) {
            const { id: dateId, itineraries, ...dateData } = d

            let packageDateId = dateId

            if (dateId) {
                // Update existing date
                const { error: dateErr } = await supabase
                    .from('package_dates')
                    .update(dateData)
                    .eq('id', dateId)
                if (dateErr)
                    return res.status(400).json({ error: dateErr.message })
            } else {
                // Insert new date
                const { data: newDate, error: dateErr } = await supabase
                    .from('package_dates')
                    .insert([{ ...dateData, tour_package_id: id }])
                    .select()
                    .single()
                if (dateErr)
                    return res.status(400).json({ error: dateErr.message })
                packageDateId = newDate.id
            }

            // 3️⃣ Handle itineraries for this date
            for (const i of itineraries) {
                if (i.id) {
                    // Update existing itinerary
                    const { error: itErr } = await supabase
                        .from('package_itineraries')
                        .update({
                            title: i.title,
                            description: i.description,
                            day_number: i.day_number,
                        })
                        .eq('id', i.id)
                    if (itErr)
                        return res.status(400).json({ error: itErr.message })
                } else {
                    // Insert new itinerary
                    const { error: itErr } = await supabase
                        .from('package_itineraries')
                        .insert([{ ...i, package_date_id: packageDateId }])
                    if (itErr)
                        return res.status(400).json({ error: itErr.message })
                }
            }
        }

        // 4️⃣ Return updated tour with relations
        const { data: updatedTour, error: fetchError } = await supabase
            .from('tour_packages')
            .select(
                `
                *,
                package_dates (
                    *,
                    package_itineraries (*)
                )
            `
            )
            .eq('id', id)
            .single()

        if (fetchError)
            return res.status(400).json({ error: fetchError.message })

        res.json({ message: 'Tour updated successfully', tour: updatedTour })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

// ❌ Delete tour package and related data
export const deleteTour = async (req, res) => {
    const { id } = req.params

    try {
        // Delete related itineraries first (via package_dates)
        const { data: dates } = await supabase
            .from('package_dates')
            .select('id')
            .eq('tour_package_id', id)

        if (dates?.length) {
            const dateIds = dates.map((d) => d.id)
            await supabase
                .from('package_itineraries')
                .delete()
                .in('package_date_id', dateIds)
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

// Generate Tour PDF
export const generateTourPDF = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database with related package information
        const { data: booking, error: bookingError } = await supabase
            .from('tour_bookings')
            .select(`
                *,
                package_dates (
                    id,
                    start_date,
                    end_date,
                    total_slots,
                    tour_package_id,
                    inclusions,
                    exclusions,
                    payment_terms,
                    requirements,
                    notes,
                    tour_packages (
                        id,
                        title,
                        description
                    ),
                    package_itineraries (
                        id,
                        day_number,
                        title,
                        description
                    )
                )
            `)
            .eq('id', id)
            .single()

        if (bookingError) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        // Prepare booking details for PDF generation
        const packageDate = booking.package_dates
        const tourPackage = packageDate?.tour_packages
        
        const bookingDetails = {
            // Basic booking info
            bookingReference: booking.booking_reference,
            firstName: booking.lead_first_name,
            lastName: booking.lead_last_name,
            email: booking.lead_email,
            phone: booking.lead_phone,
            passengerCount: booking.passenger_count,
            paymentType: booking.payment_type,
            amount: booking.total_amount,
            status: booking.status,
            
            // Package info
            tourTitle: tourPackage?.title || 'Unknown Tour Package',
            startDate: packageDate?.start_date ? new Date(packageDate.start_date).toLocaleDateString() : 'N/A',
            endDate: packageDate?.end_date ? new Date(packageDate.end_date).toLocaleDateString() : 'N/A',
            availableSlots: packageDate?.total_slots || 'N/A',
            totalSlots: packageDate?.total_slots || 'N/A',
            ratePerPax: booking.total_amount / booking.passenger_count || 'N/A',
            
            // Package details
            inclusions: Array.isArray(packageDate?.inclusions) ? packageDate.inclusions.join(', ') : (packageDate?.inclusions || 'As per package'),
            exclusions: Array.isArray(packageDate?.exclusions) ? packageDate.exclusions.join(', ') : (packageDate?.exclusions || '-'),
            notes: Array.isArray(packageDate?.notes) ? packageDate.notes.join(', ') : (packageDate?.notes || '-'),
            requirements: Array.isArray(packageDate?.requirements) ? packageDate.requirements.join(', ') : (packageDate?.requirements || '-'),
            paymentTerms: Array.isArray(packageDate?.payment_terms) ? packageDate.payment_terms.join(', ') : (packageDate?.payment_terms || '-'),
            tourDescription: tourPackage?.description || '-',
            
            // Itinerary (generate from actual data)
            itinerary: generateItineraryHTML(packageDate?.package_itineraries || [])
        }

        // Generate PDF
        const pdfBuffer = await generateTourSummaryPDF(bookingDetails)

        // Set response headers for PDF
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="Tour-Booking-${booking.booking_reference}.pdf"`)
        res.setHeader('Content-Length', pdfBuffer.length)

        // Send PDF buffer
        res.send(pdfBuffer)

    } catch (error) {
        console.error('Error generating tour PDF:', error)
        res.status(500).json({ 
            error: 'Failed to generate PDF',
            message: error.message 
        })
    }
}

// View Tour Booking HTML (for testing without PDF generation)
export const viewTourBookingHTML = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database with related package information
        const { data: booking, error: bookingError } = await supabase
            .from('tour_bookings')
            .select(`
                *,
                package_dates (
                    id,
                    start_date,
                    end_date,
                    total_slots,
                    tour_package_id,
                    inclusions,
                    exclusions,
                    payment_terms,
                    requirements,
                    notes,
                    tour_packages (
                        id,
                        title,
                        description
                    ),
                    package_itineraries (
                        id,
                        day_number,
                        title,
                        description
                    )
                )
            `)
            .eq('id', id)
            .single()

        if (bookingError) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        // Prepare booking details for template
        const packageDate = booking.package_dates
        const tourPackage = packageDate?.tour_packages
        
        const bookingDetails = {
            // Basic booking info
            bookingReference: booking.booking_reference,
            firstName: booking.lead_first_name,
            lastName: booking.lead_last_name,
            email: booking.lead_email,
            phone: booking.lead_phone,
            passengerCount: booking.passenger_count,
            paymentType: booking.payment_type,
            amount: booking.total_amount,
            status: booking.status,
            
            // Package info
            tourTitle: tourPackage?.title || 'Unknown Tour Package',
            startDate: packageDate?.start_date ? new Date(packageDate.start_date).toLocaleDateString() : 'N/A',
            endDate: packageDate?.end_date ? new Date(packageDate.end_date).toLocaleDateString() : 'N/A',
            availableSlots: packageDate?.total_slots || 'N/A',
            totalSlots: packageDate?.total_slots || 'N/A',
            ratePerPax: booking.total_amount / booking.passenger_count || 'N/A',
            
            // Package details
            inclusions: Array.isArray(packageDate?.inclusions) ? packageDate.inclusions.join(', ') : (packageDate?.inclusions || 'As per package'),
            exclusions: Array.isArray(packageDate?.exclusions) ? packageDate.exclusions.join(', ') : (packageDate?.exclusions || '-'),
            notes: Array.isArray(packageDate?.notes) ? packageDate.notes.join(', ') : (packageDate?.notes || '-'),
            requirements: Array.isArray(packageDate?.requirements) ? packageDate.requirements.join(', ') : (packageDate?.requirements || '-'),
            paymentTerms: Array.isArray(packageDate?.payment_terms) ? packageDate.payment_terms.join(', ') : (packageDate?.payment_terms || '-'),
            tourDescription: tourPackage?.description || '-',
            
            // Itinerary (generate from actual data)
            itinerary: generateItineraryHTML(packageDate?.package_itineraries || [])
        }

        // Read and populate the HTML template
        const fs = await import('fs/promises')
        const path = await import('path')
        
        const templatePath = path.join(
            process.cwd(),
            'src',
            'services',
            'templates',
            'tour-confirmation-template.html'
        )

        let html = await fs.readFile(templatePath, 'utf-8')

        // Replace template variables
        html = html
            .replace(/{{bookingReference}}/g, bookingDetails.bookingReference)
            .replace(/{{companyName}}/g, 'Lindela Travel And Tours - Trabilis')
            .replace(/{{companyEmail}}/g, 'lindelatravelctws@gmail.com')
            .replace(/{{companyAddress}}/g, 'Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street, Makati, Metro Manila')
            .replace(/{{bookingDate}}/g, new Date(booking.created_at).toLocaleDateString())
            .replace(/{{tourTitle}}/g, bookingDetails.tourTitle)
            .replace(/{{startDate}}/g, bookingDetails.startDate)
            .replace(/{{endDate}}/g, bookingDetails.endDate)
            .replace(/{{paymentType}}/g, bookingDetails.paymentType)
            .replace(/{{ratePerPax}}/g, `₱${parseFloat(bookingDetails.ratePerPax).toLocaleString()}`)
            .replace(/{{availableSlots}}/g, bookingDetails.availableSlots)
            .replace(/{{itineraryDetails}}/g, bookingDetails.itinerary)
            .replace(/{{leadFirstName}}/g, bookingDetails.firstName)
            .replace(/{{leadLastName}}/g, bookingDetails.lastName)
            .replace(/{{leadEmail}}/g, bookingDetails.email)
            .replace(/{{leadPhone}}/g, bookingDetails.phone)
            .replace(/{{status}}/g, bookingDetails.status)
            .replace(/{{amount}}/g, `₱${parseFloat(bookingDetails.amount).toLocaleString()}`)
            .replace(/{{inclusions}}/g, bookingDetails.inclusions)
            .replace(/{{exclusions}}/g, bookingDetails.exclusions)
            .replace(/{{notes}}/g, bookingDetails.notes)
            .replace(/{{requirements}}/g, bookingDetails.requirements)
            .replace(/{{paymentTerms}}/g, bookingDetails.paymentTerms)
            .replace(/{{tourDescription}}/g, bookingDetails.tourDescription)

        // Send HTML response
        res.setHeader('Content-Type', 'text/html')
        res.send(html)

    } catch (error) {
        console.error('Error generating tour HTML:', error)
        res.status(500).json({ 
            error: 'Failed to generate HTML',
            message: error.message 
        })
    }
}

// View Tour Booking for Print (print-optimized)
export const viewTourBookingPrint = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database with related package information
        const { data: booking, error: bookingError } = await supabase
            .from('tour_bookings')
            .select(`
                *,
                package_dates (
                    id,
                    start_date,
                    end_date,
                    total_slots,
                    tour_package_id,
                    inclusions,
                    exclusions,
                    payment_terms,
                    requirements,
                    notes,
                    tour_packages (
                        id,
                        title,
                        description
                    ),
                    package_itineraries (
                        id,
                        day_number,
                        title,
                        description
                    )
                )
            `)
            .eq('id', id)
            .single()

        if (bookingError) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        const packageDate = booking.package_dates
        const tourPackage = packageDate?.tour_packages

        // Prepare booking details for template
        const bookingDetails = {
            bookingReference: booking.booking_reference,
            leadFirstName: booking.lead_first_name,
            leadLastName: booking.lead_last_name,
            leadEmail: booking.lead_email,
            leadPhone: booking.lead_phone,
            passengerCount: booking.passenger_count,
            paymentType: booking.payment_type,
            amount: booking.total_amount,
            status: booking.status,
            tourTitle: tourPackage?.title || 'Unknown Tour Package',
            startDate: packageDate?.start_date ? new Date(packageDate.start_date).toLocaleDateString() : 'N/A',
            endDate: packageDate?.end_date ? new Date(packageDate.end_date).toLocaleDateString() : 'N/A',
            availableSlots: packageDate?.total_slots || 'N/A',
            ratePerPax: booking.total_amount / booking.passenger_count || 'N/A',
            inclusions: Array.isArray(packageDate?.inclusions) ? packageDate.inclusions.join(', ') : (packageDate?.inclusions || 'As per package'),
            exclusions: Array.isArray(packageDate?.exclusions) ? packageDate.exclusions.join(', ') : (packageDate?.exclusions || '-'),
            notes: Array.isArray(packageDate?.notes) ? packageDate.notes.join(', ') : (packageDate?.notes || '-'),
            requirements: Array.isArray(packageDate?.requirements) ? packageDate.requirements.join(', ') : (packageDate?.requirements || '-'),
            paymentTerms: Array.isArray(packageDate?.payment_terms) ? packageDate.payment_terms.join(', ') : (packageDate?.payment_terms || '-'),
            tourDescription: tourPackage?.description || '-',
            
            // Itinerary (generate from actual data)
            itinerary: generateItineraryHTML(packageDate?.package_itineraries || [])
        }

        // Read and populate the HTML template
        const fs = await import('fs/promises')
        const path = await import('path')
        
        const templatePath = path.join(
            process.cwd(),
            'src',
            'services',
            'templates',
            'tour-confirmation-template.html'
        )

        let html = await fs.readFile(templatePath, 'utf8')

        // Replace placeholders with actual data
        Object.keys(bookingDetails).forEach(key => {
            const placeholder = `{{${key}}}`
            const value = bookingDetails[key] || ''
            html = html.replace(new RegExp(placeholder, 'g'), value)
        })

        // Add print-specific styling
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
                    .itinerary-section {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    .details-box {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                    .flight-table {
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
            </style>
        `

        // Insert print styles before closing head tag
        html = html.replace('</head>', printStyles + '</head>')

        // Set content type to HTML
        res.setHeader('Content-Type', 'text/html')
        res.send(html)
    } catch (error) {
        console.error('Error generating tour print view:', error)
        res.status(500).json({ error: 'Failed to generate tour print view' })
    }
}

// Generate Tour PDF for Admin (without PDFShift - uses browser print functionality)
export const generateTourPDFAdmin = async (req, res) => {
    try {
        const { id } = req.params

        // Get booking details from database with related package information
        const { data: booking, error: bookingError } = await supabase
            .from('tour_bookings')
            .select(`
                *,
                package_dates (
                    id,
                    start_date,
                    end_date,
                    total_slots,
                    tour_package_id,
                    inclusions,
                    exclusions,
                    payment_terms,
                    requirements,
                    notes,
                    tour_packages (
                        id,
                        title,
                        description
                    ),
                    package_itineraries (
                        id,
                        day_number,
                        title,
                        description
                    )
                )
            `)
            .eq('id', id)
            .single()

        if (bookingError) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        // Prepare booking details for template
        const packageDate = booking.package_dates
        const tourPackage = packageDate?.tour_packages
        
        const bookingDetails = {
            // Basic booking info
            bookingReference: booking.booking_reference,
            firstName: booking.lead_first_name,
            lastName: booking.lead_last_name,
            email: booking.lead_email,
            phone: booking.lead_phone,
            passengerCount: booking.passenger_count,
            paymentType: booking.payment_type,
            amount: booking.total_amount,
            status: booking.status,
            
            // Package info
            tourTitle: tourPackage?.title || 'Unknown Tour Package',
            startDate: packageDate?.start_date ? new Date(packageDate.start_date).toLocaleDateString() : 'N/A',
            endDate: packageDate?.end_date ? new Date(packageDate.end_date).toLocaleDateString() : 'N/A',
            availableSlots: packageDate?.total_slots || 'N/A',
            totalSlots: packageDate?.total_slots || 'N/A',
            ratePerPax: booking.total_amount / booking.passenger_count || 'N/A',
            
            // Package details
            inclusions: Array.isArray(packageDate?.inclusions) ? packageDate.inclusions.join(', ') : (packageDate?.inclusions || 'As per package'),
            exclusions: Array.isArray(packageDate?.exclusions) ? packageDate.exclusions.join(', ') : (packageDate?.exclusions || '-'),
            notes: Array.isArray(packageDate?.notes) ? packageDate.notes.join(', ') : (packageDate?.notes || '-'),
            requirements: Array.isArray(packageDate?.requirements) ? packageDate.requirements.join(', ') : (packageDate?.requirements || '-'),
            paymentTerms: Array.isArray(packageDate?.payment_terms) ? packageDate.payment_terms.join(', ') : (packageDate?.payment_terms || '-'),
            tourDescription: tourPackage?.description || '-',
            
            // Itinerary (generate from actual data)
            itinerary: generateItineraryHTML(packageDate?.package_itineraries || [])
        }

        // Read and populate the HTML template
        const fs = await import('fs/promises')
        const path = await import('path')
        
        const templatePath = path.join(
            process.cwd(),
            'src',
            'services',
            'templates',
            'tour-confirmation-template.html'
        )

        let html = await fs.readFile(templatePath, 'utf-8')

        // Replace template variables
        html = html
            .replace(/{{bookingReference}}/g, bookingDetails.bookingReference)
            .replace(/{{companyName}}/g, 'Lindela Travel And Tours - Trabilis')
            .replace(/{{companyEmail}}/g, 'lindelatravelctws@gmail.com')
            .replace(/{{companyAddress}}/g, 'Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street, Makati, Metro Manila')
            .replace(/{{bookingDate}}/g, new Date(booking.created_at).toLocaleDateString())
            .replace(/{{tourTitle}}/g, bookingDetails.tourTitle)
            .replace(/{{startDate}}/g, bookingDetails.startDate)
            .replace(/{{endDate}}/g, bookingDetails.endDate)
            .replace(/{{paymentType}}/g, bookingDetails.paymentType)
            .replace(/{{ratePerPax}}/g, `₱${parseFloat(bookingDetails.ratePerPax).toLocaleString()}`)
            .replace(/{{availableSlots}}/g, bookingDetails.availableSlots)
            .replace(/{{itineraryDetails}}/g, bookingDetails.itinerary)
            .replace(/{{leadFirstName}}/g, bookingDetails.firstName)
            .replace(/{{leadLastName}}/g, bookingDetails.lastName)
            .replace(/{{leadEmail}}/g, bookingDetails.email)
            .replace(/{{leadPhone}}/g, bookingDetails.phone)
            .replace(/{{status}}/g, bookingDetails.status)
            .replace(/{{amount}}/g, `₱${parseFloat(bookingDetails.amount).toLocaleString()}`)
            .replace(/{{inclusions}}/g, bookingDetails.inclusions)
            .replace(/{{exclusions}}/g, bookingDetails.exclusions)
            .replace(/{{notes}}/g, bookingDetails.notes)
            .replace(/{{requirements}}/g, bookingDetails.requirements)
            .replace(/{{paymentTerms}}/g, bookingDetails.paymentTerms)
            .replace(/{{tourDescription}}/g, bookingDetails.tourDescription)

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
        html = html.replace('</head>', adminStyles + '</head>')

        // Set response headers for HTML (admin will use browser print to PDF)
        res.setHeader('Content-Type', 'text/html')
        res.setHeader('Content-Disposition', `inline; filename="Tour-Booking-${booking.booking_reference}.html"`)
        res.send(html)

    } catch (error) {
        console.error('Error generating tour PDF for admin:', error)
        res.status(500).json({ 
            error: 'Failed to generate PDF for admin',
            message: error.message 
        })
    }
}
