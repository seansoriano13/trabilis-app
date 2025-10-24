import { supabase, supabaseAdmin } from '../../config/supabaseClient.js'
import { syncTourBookingAssignmentStatus } from '../../services/assignmentService.js'
import Pusher from 'pusher'
import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import { generateTourSummaryPDF } from '../../services/brevoEmailService.js'
import { generateTourBookingHTML } from '../../utils/tourBookingHtmlGenerator.js'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import airlines from '../../data/airlines.json' with { type: 'json' }
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
      itineraries,
      exclusions,
      payment_terms,
      requirements,
      notes,
    } = req.body

    // 1️⃣ Insert tour package
    const { data: tour, error: tourError } = await supabase
      .from('tour_packages')
      .insert([
        {
          title,
          description,
          status,
          main_image_url,
          panellum_url,
          destination_country,
          visa_required,
          fee_rules: fee_rules || {
            perRemovedGroup: 5000,
            perRestDay: 3000,
            minFee: 5000,
            maxFee: 50000,
          },
          inclusions: [],
          exclusions: exclusions || [],
          payment_terms: payment_terms || [],
          requirements: requirements || [],
          notes: notes || [],
        },
      ])
      .select()
      .single()

    if (tourError) return res.status(400).json({ error: tourError.message })

    // 2️⃣ Insert package dates (NO itineraries here!)
    for (const d of dates) {
      const { inclusion_groups, ...dateData } = d

      const { data: date, error: dateError } = await supabase
        .from('package_dates')
        .insert([
          {
            ...dateData,
            tour_package_id: tour.id,
          },
        ])
        .select()
        .single()

      if (dateError) return res.status(400).json({ error: dateError.message })
    }

    // 3️⃣ Insert itineraries at TOUR level (once, not per date!)
    for (const i of itineraries) {
      const { error: itineraryError } = await supabase
        .from('package_itineraries')
        .insert([
          {
            ...i,
            tour_package_id: tour.id, // ✅ Link to tour, not date
            package_date_id: null, // ✅ Not date-specific
            image_url: i.image_url || null,
          },
        ])

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
    const { data, error } = await supabase
      .from('tour_packages')
      .select(
        `
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
            `
      )
      .is('deleted_at', null) // Exclude soft-deleted tours

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
            itineraries:package_itineraries!tour_package_id (*),
            dates:package_dates (
                *,
                inclusion_groups:package_inclusion_groups (
                    id, title, removable, fee_impact_per_group, position,
                    items:package_inclusion_group_items (id, content, position)
                )
            )
        `
    )
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

  const tourFeeRules =
    data.fee_rules && typeof data.fee_rules === 'object'
      ? { ...DEFAULT_FEE_RULES, ...data.fee_rules }
      : { ...DEFAULT_FEE_RULES }

  const transformed = {
    ...data,
    fee_rules: tourFeeRules,
    itineraries: (data.itineraries || []).sort(
      (a, b) => a.day_number - b.day_number
    ),
    dates: (data.dates || []).map((d) => {
      const fee_rules =
        d.fee_rules && typeof d.fee_rules === 'object'
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
    }),
  }

  res.json(transformed)
}

// ✏ Update tour package
export const updateTour = async (req, res) => {
  const { id } = req.params
  const {
    title,
    description,
    status,
    main_image_url,
    panellum_url,
    destination_country,
    visa_required,
    fee_rules,
    customFeeRules,
    inclusions,
    exclusions,
    payment_terms,
    requirements,
    notes,
    dates,
    itineraries,
  } = req.body

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
        destination_country,
        visa_required,
        fee_rules: fee_rules || {
          perRemovedGroup: 5000,
          perRestDay: 3000,
          minFee: 5000,
          maxFee: 50000,
        },
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

    const currentDateIds = currentDates.map((d) => d.id)
    const incomingDateIds = dates.map((d) => d.id).filter(Boolean)
    const datesToDelete = currentDateIds.filter(
      (id) => !incomingDateIds.includes(id)
    )

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
        await supabase.from('package_dates').update(dateData).eq('id', dateId)
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
    const tourFeeRules = fee_rules || {
      perRemovedGroup: 5000,
      perRestDay: 3000,
      minFee: 5000,
      maxFee: 50000,
    }

    // First, reset ALL dates to tour-level fee rules
    console.log('🔄 Resetting all dates to tour-level fee rules')
    for (const date of dates) {
      if (date.id) {
        const { error: resetError } = await supabase
          .from('package_dates')
          .update({ fee_rules: tourFeeRules })
          .eq('id', date.id)

        if (resetError) {
          console.error(
            `❌ Error resetting fee rules for date ${date.id}:`,
            resetError
          )
        } else {
          console.log(`✅ Reset fee rules for date ${date.id} to tour-level`)
        }
      }
    }

    // Then, apply custom fee rules for specific dates
    if (customFeeRules && Array.isArray(customFeeRules)) {
      console.log(`🔧 Processing ${customFeeRules.length} custom fee rules`)

      for (const rule of customFeeRules) {
        if (
          rule.dateIndex !== undefined &&
          rule.dateIndex >= 0 &&
          rule.dateIndex < dates.length
        ) {
          const targetDate = dates[rule.dateIndex]
          if (targetDate && targetDate.id) {
            console.log(
              `💰 Applying custom fee rules to existing date ${rule.dateIndex + 1} (ID: ${targetDate.id})`
            )

            const customFeeData = {
              perRemovedGroup: rule.perRemovedGroup || 0,
              perRestDay: rule.perRestDay || 0,
              minFee: rule.minFee || 0,
              maxFee: rule.maxFee || 0,
            }

            const { error: feeError } = await supabase
              .from('package_dates')
              .update({ fee_rules: customFeeData })
              .eq('id', targetDate.id)

            if (feeError) {
              console.error(
                `❌ Error updating fee rules for date ${targetDate.id}:`,
                feeError
              )
            } else {
              console.log(
                `✅ Updated fee rules for date ${targetDate.id}:`,
                customFeeData
              )
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

    const currentItinIds = currentItineraries.map((it) => it.id)
    const incomingItinIds = itineraries.map((it) => it.id).filter(Boolean)
    const itinsToDelete = currentItinIds.filter(
      (id) => !incomingItinIds.includes(id)
    )

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
        await supabase.from('package_itineraries').insert([
          {
            ...i,
            tour_package_id: id,
            package_date_id: null,
            image_url: i.image_url || null,
          },
        ])
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
    // Soft delete: Set deleted_at and deleted_by instead of hard delete
    const { error: deleteError } = await supabase
      .from('tour_packages')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: req.user.id,
      })
      .eq('id', id)

    if (deleteError) return res.status(400).json({ error: deleteError.message })
    res.json({ message: 'Tour moved to recycle bin successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Auto-enable visa based on country
export const updateTourVisaSettings = async (req, res) => {
  try {
    const { id } = req.params
    const { destination_country } = req.body

    if (!destination_country) {
      return res.status(400).json({
        success: false,
        message: 'destination_country is required',
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id')

    if (updateError) {
      throw updateError
    }

    if (!updated || updated.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tour package not found',
      })
    }

    res.status(200).json({
      success: true,
      message: 'Tour visa settings updated successfully',
      data: {
        destination_country,
        visa_required,
      },
    })
  } catch (error) {
    console.error('Error updating tour visa settings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update tour visa settings',
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

    const countryList = countries.map((c) => c.country)

    res.status(200).json({
      success: true,
      data: countryList,
    })
  } catch (error) {
    console.error('Error fetching countries with visa requirements:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch countries with visa requirements',
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
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_APP_SECRET,
  cluster: process.env.PUSHER_APP_CLUSTER,
  useTLS: true,
})

// Simple tour status update (for publish/unpublish)
export const updateTourStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['DRAFT', 'PUBLISHED'].includes(status)) {
      return res
        .status(400)
        .json({ error: 'Invalid status. Must be DRAFT or PUBLISHED' })
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
      tour: data,
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
    const { status, assigned_to, assignment_status, flight_booking_reference, passenger_details } =
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

    // Handle passenger details update
    if (typeof passenger_details !== 'undefined') {
      // Validate passenger_details is an array
      if (!Array.isArray(passenger_details)) {
        return res.status(400).json({
          error: 'passenger_details must be an array',
        })
      }

      // Basic validation: check required fields for each passenger
      for (let i = 0; i < passenger_details.length; i++) {
        const passenger = passenger_details[i]
        if (!passenger.name?.firstName || !passenger.name?.lastName) {
          return res.status(400).json({
            error: `Passenger ${i + 1}: First name and last name are required`,
          })
        }
        if (!passenger.type) {
          return res.status(400).json({
            error: `Passenger ${i + 1}: Passenger type is required`,
          })
        }
      }

      updateData.passenger_details = passenger_details
    }

    // Handle flight booking reference
    if (typeof flight_booking_reference !== 'undefined') {
      // If flight_booking_reference is provided, validate it exists
      if (flight_booking_reference && flight_booking_reference.trim() !== '') {
        const { data: flightBooking, error: flightError } = await supabase
          .from('flight_bookings')
          .select('id, booking_reference')
          .eq('booking_reference', flight_booking_reference.trim())
          .single()

        if (flightError || !flightBooking) {
          return res.status(400).json({
            error: `Flight booking with reference '${flight_booking_reference}' not found`,
          })
        }
      }
      updateData.flight_booking_reference = flight_booking_reference
    }

    if (assigned_to !== undefined) {
      updateData.assigned_to = assigned_to
      updateData.assigned_at = assigned_to ? new Date().toISOString() : null
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
        booking_id: id,
        category: 'status',
        priority: 'medium',
        action_url: `/admin/tours/${id}`,
        created_at: new Date().toISOString(),
      })
      await pusher.trigger('admin-notifications', 'booking-status-changed', {
        bookingReference: existingBooking.booking_reference,
        bookingType: 'tour',
        bookingId: id,
        status,
      })
    }

    if (
      assigned_to !== undefined &&
      assigned_to !== existingBooking.assigned_to
    ) {
      const isReassign = !!existingBooking.assigned_to && !!assigned_to
      const notifType = isReassign ? 'booking_reassigned' : 'booking_assigned'
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
        booking_id: id,
        assigned_to: assigned_to || null,
        assigned_by: req.user?.id || null,
        category: 'assignment',
        priority: 'medium',
        action_url: `/admin/tours/${id}`,
        related_user_id: assigned_to || null,
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
            const visaProcessingIds = visaProcessings.map((vp) => vp.id)

            const { error: updateError } = await supabase
              .from('visa_processings')
              .update({
                assigned_to: assigned_to,
                assigned_at: new Date().toISOString(),
                assigned_by: req.user?.id || null,
              })
              .in('id', visaProcessingIds)

            if (updateError) {
              console.error(
                'Error syncing visa processing assignments:',
                updateError
              )
            } else {
              console.log(
                `Synced ${visaProcessingIds.length} visa processings to new staff member`
              )
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
        booking_id: id,
        category: 'status',
        priority: 'low',
        action_url: `/admin/tours/${id}`,
        created_at: new Date().toISOString(),
      })
      await pusher.trigger('admin-notifications', 'assignment-status-updated', {
        bookingReference: existingBooking.booking_reference,
        bookingType: 'tour',
        bookingId: id,
        status: assignment_status,
      })

      // Sync assignment status with related visa processings
      try {
        const syncResult = await syncTourBookingAssignmentStatus(
          id,
          assignment_status,
          req.user?.id
        )
        if (syncResult.success) {
          console.log(
            `Synced visa processing assignments: ${syncResult.message}`
          )
        } else {
          console.warn(
            `Failed to sync visa processing assignments: ${syncResult.error}`
          )
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
    const { visa_status, visa_type, existing_visa_status, visa_expiry_date } =
      req.body

    // Validate required fields
    if (!id || index === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Booking ID and passenger index are required',
      })
    }

    const passengerIndex = parseInt(index)
    if (isNaN(passengerIndex) || passengerIndex < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid passenger index',
      })
    }

    // Validate visa_status if provided
    if (
      visa_status &&
      !['not_applicable', 'already_has', 'needs_processing'].includes(
        visa_status
      )
    ) {
      return res.status(400).json({
        success: false,
        error:
          'Invalid visa_status. Must be one of: not_applicable, already_has, needs_processing',
      })
    }

    // Validate visa_type if provided
    if (
      visa_type &&
      ![
        'Tourist Visa',
        'Business Visa',
        'Student Visa',
        'Fiancee Visa',
        'Spousal Visa',
      ].includes(visa_type)
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid visa_type',
      })
    }

    // Validate existing_visa_status if provided
    if (
      existing_visa_status &&
      !['valid', 'expiring_soon', 'expired', 'not_specified'].includes(
        existing_visa_status
      )
    ) {
      return res.status(400).json({
        success: false,
        error: 'Invalid existing_visa_status',
      })
    }

    // Fetch existing booking
    const { data: existingBooking, error: fetchError } = await supabase
      .from('tour_bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !existingBooking) {
      return res.status(400).json({
        success: false,
        error: 'Booking not found',
      })
    }

    // Parse passenger_details
    let passengers = []
    try {
      passengers =
        typeof existingBooking.passenger_details === 'string'
          ? JSON.parse(existingBooking.passenger_details)
          : existingBooking.passenger_details || []
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid passenger_details format',
      })
    }

    // Validate passenger index exists
    if (passengerIndex >= passengers.length) {
      return res.status(400).json({
        success: false,
        error: 'Passenger index out of range',
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
      if (
        existing_visa_status !== 'valid' &&
        existing_visa_status !== 'expiring_soon'
      ) {
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
        updated_at: new Date().toISOString(),
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
      data: updatedBooking,
    })
  } catch (error) {
    console.error('Error updating passenger visa status:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
