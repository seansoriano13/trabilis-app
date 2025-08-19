import { supabase } from '../../config/supabaseClient.js'

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
