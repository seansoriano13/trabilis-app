import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IoChevronBack } from 'react-icons/io5'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import adminClient from '../../api/adminClient.js'
import './EditTourPackage.css'
import './CreateTourPackage.css'
import { AccordionSection, DateGroup } from './CreateTourPackage.jsx'

function EditTourPackage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const CATEGORY_OPTIONS = [
        'Air Travel',
        'Transfers',
        'Accommodation',
        'Meals',
        'Guided Tours / Activities',
        'Entrance Fees / Tickets',
        'Visa / Documentation',
        'Insurance',
        'Taxes / Surcharges',
        'Miscellaneous / Others',
        'Custom…',
    ]
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        main_image_url: '',
        panellum_url: '',
        status: 'DRAFT',
        dates: [],
        itineraries: [],
        inclusions: [''],
        exclusions: [''],
        payment_terms: [''],
        requirements: [''],
        notes: [''],
    })
    const [openSections, setOpenSections] = useState({
        general: true,
        dates: false,
        fee_rules: false,
        inclusion_groups: false,
        itinerary: false,
        inclusions: false,
        exclusions: false,
        payment_terms: false,
        requirements: false,
        notes: false,
    })
    const [mainImagePreview, setMainImagePreview] = useState(null)
    const [panellumImagePreview, setPanellumImagePreview] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await adminClient.get(`/tours/${id}`)
                const tour = response.data
                // Build base dates
                const baseDates = tour.dates.map((date) => ({
                        id: date.id,
                        tour_package_id: date.tour_package_id,
                        start_date: date.start_date || '',
                        end_date: date.end_date || '',
                        rate_per_pax: date.rate_per_pax || 0,
                    reservation_fee_per_pax: date.reservation_fee_per_pax || 0,
                        total_slots: date.total_slots || 0,
                        available_slots: date.available_slots || 0,
                    // legacy flat fields retained
                        inclusions: date.inclusions || [''],
                        exclusions: date.exclusions || [''],
                        payment_terms: date.payment_terms || [''],
                        requirements: date.requirements || [''],
                        notes: date.notes || [''],
                    // phase 2 fields (to be fetched)
                    fee_rules: {
                        perRemovedGroup: Number(date.fee_rules?.perRemovedGroup) || 0,
                        perRestDay: Number(date.fee_rules?.perRestDay) || 0,
                        minFee: Number(date.fee_rules?.minFee) || 0,
                        maxFee: Number(date.fee_rules?.maxFee) || 0,
                    },
                    inclusion_groups: [],
                }))

                // Fetch fee rules and inclusion groups per date
                const datesWithExtras = await Promise.all(
                    baseDates.map(async (d) => {
                        try {
                            // inclusion groups
                            const groupsRes = await adminClient.get(`/tours/dates/${d.id}/inclusion-groups`)
                            const groups = Array.isArray(groupsRes?.data) ? groupsRes.data : []
                            const groupsWithItems = []
                            for (const g of groups) {
                                // listInclusionGroups already returns items; fallback to fetch if absent
                                let items = Array.isArray(g.items)
                                    ? g.items.map((it) => it.content || '')
                                    : []
                                if (items.length === 0) {
                                    const itemsRes = await adminClient.get(`/tours/inclusion-groups/${g.id}/items`)
                                    items = (itemsRes?.data || []).map((it) => it.content || '')
                                }
                                // map category
                                const matchedCategory = CATEGORY_OPTIONS.includes(g.title) ? g.title : 'Custom…'
                                groupsWithItems.push({
                                    title: matchedCategory === 'Custom…' ? (g.title || '') : g.title,
                                    category: matchedCategory,
                                    removable: g.removable !== false,
                                    items: items.length ? items : [''],
                                })
                            }
                            return {
                                ...d,
                                inclusion_groups: groupsWithItems,
                            }
                        } catch (_) {
                            return d
                        }
                    })
                )

                setFormData({
                    title: tour.title || '',
                    description: tour.description || '',
                    main_image_url: tour.main_image_url || '',
                    panellum_url: tour.panellum_url || '',
                    status: tour.status || 'DRAFT',
                    dates: datesWithExtras,
                    itineraries: tour.dates.flatMap((date) =>
                        date.itineraries.map((it) => ({
                            id: it.id,
                            package_date_id: date.id,
                            day_number: it.day_number || 0,
                            title: it.title || '',
                            description: it.description || '',
                        }))
                    ),
                    inclusions: tour.dates[0]?.inclusions || [''],
                    exclusions: tour.dates[0]?.exclusions || [''],
                    payment_terms: tour.dates[0]?.payment_terms || [''],
                    requirements: tour.dates[0]?.requirements || [''],
                    notes: tour.dates[0]?.notes || [''],
                })

                setMainImagePreview(tour.main_image_url || null)
                setPanellumImagePreview(tour.panellum_url || null)
                setIsLoading(false)
            } catch (err) {
                console.log(err)
                setError(
                    err.response?.data?.error || 'Failed to load tour package'
                )
                setIsLoading(false)
            }
        }
        fetchTour()
    }, [id])

    console.log(formData)
    const toggleSection = (section) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }))
    }

    const updateFormData = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const updateDateGroup = (index, field, value) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            if (field.includes('JSON')) {
                newDates[index][field.replace('JSON', '')] = value
                    ? value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean)
                    : ['']
            } else {
                newDates[index][field] = value
            }
            return { ...prev, dates: newDates }
        })
    }

    // Fee rules per date
    const updateFeeRule = (dateIdx, field, value) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            const fr = { ...(newDates[dateIdx].fee_rules || {}) }
            fr[field] = value
            newDates[dateIdx] = { ...newDates[dateIdx], fee_rules: fr }
            return { ...prev, dates: newDates }
        })
    }

    // Inclusion groups per date
    const addInclusionGroupForDate = (dateIdx) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            const groups = [...(newDates[dateIdx].inclusion_groups || [])]
            groups.push({ title: '', category: CATEGORY_OPTIONS[0], removable: true, items: [''] })
            newDates[dateIdx] = { ...newDates[dateIdx], inclusion_groups: groups }
            return { ...prev, dates: newDates }
        })
    }

    const duplicateInclusionGroup = (dateIdx, groupIdx) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            const groups = [...(newDates[dateIdx].inclusion_groups || [])]
            const clone = JSON.parse(JSON.stringify(groups[groupIdx]))
            groups.splice(groupIdx + 1, 0, clone)
            newDates[dateIdx] = { ...newDates[dateIdx], inclusion_groups: groups }
            return { ...prev, dates: newDates }
        })
    }

    const updateInclusionGroup = (dateIdx, groupIdx, field, value) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            const groups = [...(newDates[dateIdx].inclusion_groups || [])]
            const group = { ...(groups[groupIdx] || {}) }
            if (field === 'category') {
                group.category = value
                if (value !== 'Custom…') {
                    group.title = value
                }
            } else {
                group[field] = value
            }
            groups[groupIdx] = group
            newDates[dateIdx] = { ...newDates[dateIdx], inclusion_groups: groups }
            return { ...prev, dates: newDates }
        })
    }

    const removeInclusionGroup = (dateIdx, groupIdx) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            const groups = [...(newDates[dateIdx].inclusion_groups || [])]
            newDates[dateIdx] = {
                ...newDates[dateIdx],
                inclusion_groups: groups.filter((_, i) => i !== groupIdx),
            }
            return { ...prev, dates: newDates }
        })
    }

    const addInclusionGroupItem = (dateIdx, groupIdx) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            const groups = [...(newDates[dateIdx].inclusion_groups || [])]
            const group = { ...(groups[groupIdx] || {}) }
            const items = [...(group.items || [])]
            items.push('')
            group.items = items
            groups[groupIdx] = group
            newDates[dateIdx] = { ...newDates[dateIdx], inclusion_groups: groups }
            return { ...prev, dates: newDates }
        })
    }

    const duplicateInclusionItem = (dateIdx, groupIdx, itemIdx) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            const groups = [...(newDates[dateIdx].inclusion_groups || [])]
            const group = { ...(groups[groupIdx] || {}) }
            const items = [...(group.items || [])]
            const clone = items[itemIdx]
            items.splice(itemIdx + 1, 0, clone)
            group.items = items
            groups[groupIdx] = group
            newDates[dateIdx] = { ...newDates[dateIdx], inclusion_groups: groups }
            return { ...prev, dates: newDates }
        })
    }

    const updateInclusionGroupItem = (dateIdx, groupIdx, itemIdx, value) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            const groups = [...(newDates[dateIdx].inclusion_groups || [])]
            const group = { ...(groups[groupIdx] || {}) }
            const items = [...(group.items || [])]
            items[itemIdx] = value
            group.items = items
            groups[groupIdx] = group
            newDates[dateIdx] = { ...newDates[dateIdx], inclusion_groups: groups }
            return { ...prev, dates: newDates }
        })
    }

    const removeInclusionGroupItem = (dateIdx, groupIdx, itemIdx) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            const groups = [...(newDates[dateIdx].inclusion_groups || [])]
            const group = { ...(groups[groupIdx] || {}) }
            group.items = (group.items || []).filter((_, i) => i !== itemIdx)
            groups[groupIdx] = group
            newDates[dateIdx] = { ...newDates[dateIdx], inclusion_groups: groups }
            return { ...prev, dates: newDates }
        })
    }

    const addDateGroup = (duplicatePricingFromPrevious = false) => {
        setFormData((prev) => ({
            ...prev,
            dates: [
                ...prev.dates,
                (() => {
                    const last = prev.dates[prev.dates.length - 1]
                    return {
                    start_date: '',
                    end_date: '',
                        rate_per_pax:
                            duplicatePricingFromPrevious && last
                                ? last.rate_per_pax || 0
                                : 0,
                        reservation_fee_per_pax:
                            duplicatePricingFromPrevious && last
                                ? last.reservation_fee_per_pax || 0
                                : 0,
                        total_slots:
                            duplicatePricingFromPrevious && last
                                ? last.total_slots || 0
                                : 0,
                        available_slots:
                            duplicatePricingFromPrevious && last
                                ? last.total_slots || 0
                                : 0,
                    inclusions: [''],
                    exclusions: [''],
                    payment_terms: [''],
                    requirements: [''],
                    notes: [''],
                        fee_rules:
                            duplicatePricingFromPrevious && last && last.fee_rules
                                ? { ...last.fee_rules }
                                : { perRemovedGroup: 0, perRestDay: 0, minFee: 0, maxFee: 0 },
                        inclusion_groups:
                            duplicatePricingFromPrevious && last && Array.isArray(last.inclusion_groups)
                                ? last.inclusion_groups.map((g) => ({
                                      title: g.title || '',
                                      category: g.category || 'Custom…',
                                      removable: g.removable !== false,
                                      items: Array.isArray(g.items) ? [...g.items] : [''],
                                  }))
                                : [],
                    }
                })(),
            ],
        }))
    }

    const removeDateGroup = (index) => {
        setFormData((prev) => ({
            ...prev,
            dates: prev.dates.filter((_, i) => i !== index),
        }))
    }

    const autofillDateGroup = (index) => {
        // Optional: Implement autofill logic if needed
    }

    const updateItinerary = (index, field, value) => {
        setFormData((prev) => {
            const newItineraries = [...prev.itineraries]
            newItineraries[index][field] = value
            return { ...prev, itineraries: newItineraries }
        })
    }

    const addItinerary = () => {
        setFormData((prev) => ({
            ...prev,
            itineraries: [
                ...prev.itineraries,
                {
                    day_number: prev.itineraries.length + 1,
                    title: '',
                    description: '',
                    package_date_id: prev.dates[0]?.id || null,
                },
            ],
        }))
    }

    const removeItinerary = (index) => {
        setFormData((prev) => {
            const newItineraries = prev.itineraries.filter(
                (_, i) => i !== index
            )
            newItineraries.forEach((it, i) => {
                it.day_number = i + 1
            })
            return { ...prev, itineraries: newItineraries }
        })
    }

    const updateInclusion = (index, value) => {
        setFormData((prev) => {
            const newInclusions = [...prev.inclusions]
            newInclusions[index] = value
            return { ...prev, inclusions: newInclusions }
        })
    }

    const addInclusion = () => {
        setFormData((prev) => ({
            ...prev,
            inclusions: [...prev.inclusions, ''],
        }))
    }

    const removeInclusion = (index) => {
        setFormData((prev) => ({
            ...prev,
            inclusions: prev.inclusions.filter((_, i) => i !== index),
        }))
    }

    const updateExclusion = (index, value) => {
        setFormData((prev) => {
            const newExclusions = [...prev.exclusions]
            newExclusions[index] = value
            return { ...prev, exclusions: newExclusions }
        })
    }

    const addExclusion = () => {
        setFormData((prev) => ({
            ...prev,
            exclusions: [...prev.exclusions, ''],
        }))
    }

    const removeExclusion = (index) => {
        setFormData((prev) => ({
            ...prev,
            exclusions: prev.exclusions.filter((_, i) => i !== index),
        }))
    }

    const updatePaymentTerm = (index, value) => {
        setFormData((prev) => {
            const newPaymentTerms = [...prev.payment_terms]
            newPaymentTerms[index] = value
            return { ...prev, payment_terms: newPaymentTerms }
        })
    }

    const addPaymentTerm = () => {
        setFormData((prev) => ({
            ...prev,
            payment_terms: [...prev.payment_terms, ''],
        }))
    }

    const removePaymentTerm = (index) => {
        setFormData((prev) => ({
            ...prev,
            payment_terms: prev.payment_terms.filter((_, i) => i !== index),
        }))
    }

    const updateRequirement = (index, value) => {
        setFormData((prev) => {
            const newRequirements = [...prev.requirements]
            newRequirements[index] = value
            return { ...prev, requirements: newRequirements }
        })
    }

    const addRequirement = () => {
        setFormData((prev) => ({
            ...prev,
            requirements: [...prev.requirements, ''],
        }))
    }

    const removeRequirement = (index) => {
        setFormData((prev) => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index),
        }))
    }

    const updateNote = (index, value) => {
        setFormData((prev) => {
            const newNotes = [...prev.notes]
            newNotes[index] = value
            return { ...prev, notes: newNotes }
        })
    }

    const addNote = () => {
        setFormData((prev) => ({
            ...prev,
            notes: [...prev.notes, ''],
        }))
    }

    const removeNote = (index) => {
        setFormData((prev) => ({
            ...prev,
            notes: prev.notes.filter((_, i) => i !== index),
        }))
    }

    const handleImageChange = (e, field) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                if (field === 'main_image_url') {
                    setMainImagePreview(reader.result)
                } else if (field === 'panellum_url') {
                    setPanellumImagePreview(reader.result)
                }
                updateFormData(field, reader.result) // Store base64 or URL after upload
            }
            reader.readAsDataURL(file)
        }
    }

    const handleBackClick = () => {
        navigate('/admin/tours')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                main_image_url: formData.main_image_url,
                panellum_url: formData.panellum_url,
                status: formData.status,
                dates: formData.dates.map((date) => ({
                    id: date.id || undefined,
                    start_date: date.start_date,
                    end_date: date.end_date,
                    rate_per_pax: parseFloat(date.rate_per_pax) || 0,
                    reservation_fee_per_pax: date.reservation_fee_per_pax
                        ? parseFloat(date.reservation_fee_per_pax)
                        : null,
                    total_slots: parseInt(date.total_slots) || 0,
                    available_slots: parseInt(date.available_slots) || 0,
                    inclusions: date.inclusions.filter(Boolean),
                    exclusions: date.exclusions.filter(Boolean),
                    payment_terms: date.payment_terms.filter(Boolean),
                    requirements: date.requirements.filter(Boolean),
                    notes: date.notes.filter(Boolean),
                    itineraries: formData.itineraries
                        .filter((it) => it.package_date_id === date.id)
                        .map((it) => ({
                            id: it.id || undefined,
                            day_number: parseInt(it.day_number) || 0,
                            title: it.title,
                            description: it.description,
                        })),
                })),
            }
            const response = await adminClient.put(`/tours/${id}`, payload)

            // After base update, apply fee rules and create inclusion groups/items per date
            const tourRes = await adminClient.get(`/tours/${id}`)
            const createdDates = tourRes?.data?.dates || []
            for (let dIdx = 0; dIdx < formData.dates.length; dIdx++) {
                const createdDateId = createdDates[dIdx]?.id
                if (!createdDateId) continue

                // Apply fee rules if present
                const fr = formData.dates[dIdx].fee_rules
                if (fr) {
                    await adminClient.put(`/tours/dates/${createdDateId}/fee-rules`, fr)
                }

                // Clear existing inclusion groups (to avoid duplicates and persist removals)
                try {
                    const existingGroupsRes = await adminClient.get(`/tours/dates/${createdDateId}/inclusion-groups`)
                    const existingGroups = Array.isArray(existingGroupsRes?.data) ? existingGroupsRes.data : []
                    for (const eg of existingGroups) {
                        if (eg && eg.id) {
                            await adminClient.delete(`/tours/inclusion-groups/${eg.id}`)
                        }
                    }
                } catch (_) {
                    // ignore cleanup errors; creation step below will still run
                }

                // Create inclusion groups and items
                const groups = formData.dates[dIdx].inclusion_groups || []
                for (const g of groups) {
                    const title = g.category && g.category !== 'Custom…' ? g.category : (g.title || '')
                    if (!title) continue
                    const groupRes = await adminClient.post(`/tours/dates/${createdDateId}/inclusion-groups`, {
                        title,
                        removable: g.removable !== false,
                    })
                    const newGroupId = groupRes?.data?.id
                    if (newGroupId) {
                        for (const item of g.items || []) {
                            const content = (item || '').trim()
                            if (!content) continue
                            await adminClient.post(`/tours/inclusion-groups/${newGroupId}/items`, { content })
                        }
                    }
                }
            }

            if (response.data.message === 'Tour updated successfully') {
                navigate('/admin/tours')
            } else {
                throw new Error('Unexpected response from server')
            }
        } catch (err) {
            setError(
                err.response?.data?.error || 'Failed to update tour package'
            )
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) return <div className='loading'>Loading...</div>
    if (error) return <div className='loading'>{error}</div>

    return (
        <div className='container tour-edit-container'>
            <div className='header'>
                <div onClick={handleBackClick} className='header__back-button'>
                    <IoChevronBack size={24} />
                    <p className='header__back-text'>Back to Tours</p>
                </div>
            </div>

            <AccordionSection
                title='General Information'
                isOpen={openSections.general}
                toggle={() => toggleSection('general')}
            >
                <div className='form__fields'>
                    <div className='date-group__form-field'>
                        <label className='form-label'>Title *</label>
                        <input
                            type='text'
                            value={formData.title}
                            onChange={(e) =>
                                updateFormData('title', e.target.value)
                            }
                            className='form-input'
                            required
                        />
                    </div>
                    <div className='date-group__form-field'>
                        <label className='form-label'>
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                updateFormData('description', e.target.value)
                            }
                            className='form-textarea'
                            rows='4'
                            required
                        />
                    </div>
                    <div className='date-group__form-field'>
                        <label className='form-label'>Main Image *</label>
                        <input
                            type='file'
                            accept='image/jpeg,image/png,image/gif,image/webp'
                            onChange={(e) =>
                                handleImageChange(e, 'main_image_url')
                            }
                            className='form-input'
                        />
                        {mainImagePreview && (
                            <img
                                src={mainImagePreview}
                                alt='Main Image Preview'
                                className='image-preview'
                            />
                        )}
                    </div>
                    <div className='date-group__form-field'>
                        <label className='form-label'>
                            Panellum Image *
                        </label>
                        <input
                            type='file'
                            accept='image/jpeg,image/png,image/gif,image/webp'
                            onChange={(e) =>
                                handleImageChange(e, 'panellum_url')
                            }
                            className='form-input'
                        />
                        {panellumImagePreview && (
                            <img
                                src={panellumImagePreview}
                                alt='Panellum Image Preview'
                                className='image-preview'
                            />
                        )}
                    </div>
                    <div className='date-group__form-field'>
                        <label className='form-label'>Status *</label>
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                updateFormData('status', e.target.value)
                            }
                            className='form-select'
                            required
                        >
                            <option value='DRAFT'>Draft</option>
                            <option value='PUBLISHED'>Published</option>
                        </select>
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection
                title='Dates & Pricing'
                isOpen={openSections.dates}
                toggle={() => toggleSection('dates')}
            >
                <div className='form__fields'>
                    {formData.dates.map((dateGroup, index) => (
                        <DateGroup
                            key={dateGroup.id || `date-${index}`}
                            index={index}
                            dateGroup={dateGroup}
                            updateDateGroup={updateDateGroup}
                            removeDateGroup={removeDateGroup}
                            autofillDateGroup={autofillDateGroup}
                        />
                    ))}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => addDateGroup(false)} className='button-link'>+ Add another travel date</button>
                        <button onClick={() => addDateGroup(true)} className='button-link'>+ Add date (duplicate pricing)</button>
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection
                title='Fee Rules'
                isOpen={openSections.fee_rules}
                toggle={() => toggleSection('fee_rules')}
            >
                <div className='form__fields'>
                    {formData.dates.map((dateGroup, dIdx) => (
                        <div key={dIdx} className='date-group'>
                            <h3 className='date-group__title'>Date {dIdx + 1}</h3>
                            <div className='form__fields'>
                                <div className='date-group__form-field'>
                                    <label className='form-label'>Per Removed Group (PHP)</label>
                                    <input type='number' className='form-input' min='0' value={dateGroup.fee_rules?.perRemovedGroup || 0} onChange={(e) => updateFeeRule(dIdx, 'perRemovedGroup', Number(e.target.value))} />
                                </div>
                                <div className='date-group__form-field'>
                                    <label className='form-label'>Per Rest Day (PHP)</label>
                                    <input type='number' className='form-input' min='0' value={dateGroup.fee_rules?.perRestDay || 0} onChange={(e) => updateFeeRule(dIdx, 'perRestDay', Number(e.target.value))} />
                                </div>
                                <div className='date-group__form-field'>
                                    <label className='form-label'>Minimum Fee (PHP)</label>
                                    <input type='number' className='form-input' min='0' value={dateGroup.fee_rules?.minFee || 0} onChange={(e) => updateFeeRule(dIdx, 'minFee', Number(e.target.value))} />
                                </div>
                                <div className='date-group__form-field'>
                                    <label className='form-label'>Maximum Fee (PHP)</label>
                                    <input type='number' className='form-input' min='0' value={dateGroup.fee_rules?.maxFee || 0} onChange={(e) => updateFeeRule(dIdx, 'maxFee', Number(e.target.value))} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </AccordionSection>

            <AccordionSection
                title='Inclusions'
                isOpen={openSections.inclusion_groups}
                toggle={() => toggleSection('inclusion_groups')}
            >
                <div className='form__fields'>
                    {formData.dates.map((dateGroup, dIdx) => (
                        <div key={dIdx} className='date-group'>
                            <h3 className='date-group__title'>Date {dIdx + 1}</h3>
                            <div className='grid gap-4'>
                                {(dateGroup.inclusion_groups || []).map((group, gIdx) => (
                                    <div key={gIdx} className='border rounded-md p-3 border-gray-300'>
                                        <div className='date-group__form-field'>
                                            <label className='form-label'>Group Title</label>
                                            <select className='form-select' value={group.category || 'Custom…'} onChange={(e) => updateInclusionGroup(dIdx, gIdx, 'category', e.target.value)}>
                                                {CATEGORY_OPTIONS.map((opt) => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {group.category === 'Custom…' && (
                                            <div className='date-group__form-field'>
                                                <label className='form-label'>Custom Group Title</label>
                                                <input type='text' className='form-input' value={group.title || ''} onChange={(e) => updateInclusionGroup(dIdx, gIdx, 'title', e.target.value)} />
                                            </div>
                                        )}
                                        <div className='date-group__form-field'>
                                            <label className='form-label'>Removable?</label>
                                            <select className='form-select' value={group.removable ? 'yes' : 'no'} onChange={(e) => updateInclusionGroup(dIdx, gIdx, 'removable', e.target.value === 'yes')}>
                                                <option value='yes'>Yes</option>
                                                <option value='no'>No (Required)</option>
                                            </select>
                                        </div>
                                        <div className='form__fields'>
                                            <label className='form-label'>Items</label>
                                            {(group.items || []).map((item, iIdx) => (
                                                <div key={iIdx} className='flex items-center gap-2'>
                                                    <input type='text' className='form-input' value={item} onChange={(e) => updateInclusionGroupItem(dIdx, gIdx, iIdx, e.target.value)} placeholder='e.g., Roundtrip international airfare on economy class' />
                                                    {(group.items || []).length > 0 && (
                                                        <>
                                                            <button onClick={() => duplicateInclusionItem(dIdx, gIdx, iIdx)} className='button-link'>Duplicate</button>
                                                            {(group.items || []).length > 1 && (
                                                                <button onClick={() => removeInclusionGroupItem(dIdx, gIdx, iIdx)} className='button-link button-link--remove'>Remove</button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                            <button onClick={() => addInclusionGroupItem(dIdx, gIdx)} className='button-link'>+ Add another item</button>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button onClick={() => duplicateInclusionGroup(dIdx, gIdx)} className='button-link'>Duplicate Group</button>
                                            <button onClick={() => removeInclusionGroup(dIdx, gIdx)} className='button-link button-link--remove'>Remove Group</button>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => addInclusionGroupForDate(dIdx)} className='button-link'>+ Add inclusion group</button>
                            </div>
                        </div>
                    ))}
                </div>
            </AccordionSection>

            <AccordionSection
                title='Itinerary'
                isOpen={openSections.itinerary}
                toggle={() => toggleSection('itinerary')}
            >
                <div className='form__fields'>
                    {formData.itineraries.map((itinerary, itinIndex) => (
                        <div
                            key={itinerary.id || `itinerary-${itinIndex}`}
                            className='itinerary__day'
                        >
                            <div className='date-group__form-field'>
                                <label className='form-label'>
                                    Day Number *
                                </label>
                                <input
                                    type='number'
                                    value={itinerary.day_number}
                                    onChange={(e) =>
                                        updateItinerary(
                                            itinIndex,
                                            'day_number',
                                            Number(e.target.value)
                                        )
                                    }
                                    className='form-input'
                                    min='1'
                                    required
                                />
                            </div>
                            <div className='date-group__form-field'>
                                <label className='form-label'>
                                    Title *
                                </label>
                                <input
                                    type='text'
                                    value={itinerary.title}
                                    onChange={(e) =>
                                        updateItinerary(
                                            itinIndex,
                                            'title',
                                            e.target.value
                                        )
                                    }
                                    className='form-input'
                                    required
                                    placeholder='e.g., Arrival to Amman'
                                />
                            </div>
                            <div className='date-group__form-field'>
                                <label className='form-label'>
                                    Description *
                                </label>
                                <textarea
                                    value={itinerary.description}
                                    onChange={(e) =>
                                        updateItinerary(
                                            itinIndex,
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    className='form-textarea'
                                    rows='3'
                                    required
                                    placeholder='e.g., Airport pickup, transfer to hotel'
                                />
                            </div>
                            {formData.itineraries.length > 1 && (
                                <button
                                    onClick={() => removeItinerary(itinIndex)}
                                    className='button-link button-link--remove'
                                >
                                    Remove Itinerary
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addItinerary}
                        className='button-link'
                    >
                        + Add another itinerary day
                    </button>
                </div>
            </AccordionSection>

            <AccordionSection
                title='Inclusions'
                isOpen={openSections.inclusions}
                toggle={() => toggleSection('inclusions')}
            >
                <div className='form__fields'>
                    {formData.inclusions.map((inclusion, incIndex) => (
                        <div
                            key={`inclusion-${incIndex}`}
                            className='inclusions__item'
                        >
                            <div className='date-group__form-field'>
                                <label className='form-label'>
                                    Inclusion *
                                </label>
                                <input
                                    type='text'
                                    value={inclusion}
                                    onChange={(e) =>
                                        updateInclusion(
                                            incIndex,
                                            e.target.value
                                        )
                                    }
                                    className='form-input'
                                    required
                                    placeholder='e.g., Round trip airfare'
                                />
                            </div>
                            {formData.inclusions.length > 1 && (
                                <button
                                    onClick={() => removeInclusion(incIndex)}
                                    className='button-link button-link--remove'
                                >
                                    Remove Inclusion
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addInclusion}
                        className='button-link'
                    >
                        + Add another inclusion
                    </button>
                </div>
            </AccordionSection>

            <AccordionSection
                title='Exclusions'
                isOpen={openSections.exclusions}
                toggle={() => toggleSection('exclusions')}
            >
                <div className='form__fields'>
                    {formData.exclusions.map((exclusion, excIndex) => (
                        <div
                            key={`exclusion-${excIndex}`}
                            className='exclusions__item'
                        >
                            <div className='date-group__form-field'>
                                <label className='form-label'>
                                    Exclusion *
                                </label>
                                <input
                                    type='text'
                                    value={exclusion}
                                    onChange={(e) =>
                                        updateExclusion(
                                            excIndex,
                                            e.target.value
                                        )
                                    }
                                    className='form-input'
                                    required
                                    placeholder='e.g., Hotel quarantine if required'
                                />
                            </div>
                            {formData.exclusions.length > 1 && (
                                <button
                                    onClick={() => removeExclusion(excIndex)}
                                    className='button-link button-link--remove'
                                >
                                    Remove Exclusion
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addExclusion}
                        className='button-link'
                    >
                        + Add another exclusion
                    </button>
                </div>
            </AccordionSection>

            <AccordionSection
                title='Payment Terms'
                isOpen={openSections.payment_terms}
                toggle={() => toggleSection('payment_terms')}
            >
                <div className='form__fields'>
                    {formData.payment_terms.map((term, termIndex) => (
                        <div
                            key={`payment-term-${termIndex}`}
                            className='payment-terms__item'
                        >
                            <div className='date-group__form-field'>
                                <label className='form-label'>
                                    Payment Term *
                                </label>
                                <input
                                    type='text'
                                    value={term}
                                    onChange={(e) =>
                                        updatePaymentTerm(
                                            termIndex,
                                            e.target.value
                                        )
                                    }
                                    className='form-input'
                                    required
                                    placeholder='e.g., Reservation fee: PHP 30,000'
                                />
                            </div>
                            {formData.payment_terms.length > 1 && (
                                <button
                                    onClick={() => removePaymentTerm(termIndex)}
                                    className='button-link button-link--remove'
                                >
                                    Remove Payment Term
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addPaymentTerm}
                        className='button-link'
                    >
                        + Add another payment term
                    </button>
                </div>
            </AccordionSection>

            <AccordionSection
                title='Requirements'
                isOpen={openSections.requirements}
                toggle={() => toggleSection('requirements')}
            >
                <div className='form__fields'>
                    {formData.requirements.map((requirement, reqIndex) => (
                        <div
                            key={`requirement-${reqIndex}`}
                            className='requirements__item'
                        >
                            <div className='date-group__form-field'>
                                <label className='form-label'>
                                    Requirement *
                                </label>
                                <input
                                    type='text'
                                    value={requirement}
                                    onChange={(e) =>
                                        updateRequirement(
                                            reqIndex,
                                            e.target.value
                                        )
                                    }
                                    className='form-input'
                                    required
                                    placeholder='e.g., Full vaccination'
                                />
                            </div>
                            {formData.requirements.length > 1 && (
                                <button
                                    onClick={() => removeRequirement(reqIndex)}
                                    className='button-link button-link--remove'
                                >
                                    Remove Requirement
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addRequirement}
                        className='button-link'
                    >
                        + Add another requirement
                    </button>
                </div>
            </AccordionSection>

            <AccordionSection
                title='Notes'
                isOpen={openSections.notes}
                toggle={() => toggleSection('notes')}
            >
                <div className='form__fields'>
                    {formData.notes.map((note, noteIndex) => (
                        <div
                            key={`note-${noteIndex}`}
                            className='notes__item'
                        >
                            <div className='date-group__form-field'>
                                <label className='form-label'>
                                    Note *
                                </label>
                                <input
                                    type='text'
                                    value={note}
                                    onChange={(e) =>
                                        updateNote(noteIndex, e.target.value)
                                    }
                                    className='form-input'
                                    required
                                    placeholder='e.g., Illegal entry subject to deportation'
                                />
                            </div>
                            {formData.notes.length > 1 && (
                                <button
                                    onClick={() => removeNote(noteIndex)}
                                    className='button-link button-link--remove'
                                >
                                    Remove Note
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addNote}
                        className='button-link'
                    >
                        + Add another note
                    </button>
                </div>
            </AccordionSection>

            <div className='sticky-save-bar'>
                <div className='sticky-save-bar__inner'>
            <AdminPrimaryButton
                        className='admin-primary-button'
                buttonText={isSubmitting ? 'Saving...' : 'Save'}
                onClick={handleSubmit}
                disabled={isSubmitting}
            />
                </div>
            </div>
        </div>
    )
}

export default EditTourPackage
