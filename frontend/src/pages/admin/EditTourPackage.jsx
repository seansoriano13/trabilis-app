import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSnackbar } from '../../context/SnackbarContext'
import { IoChevronBack, IoChevronUp, IoChevronDown } from 'react-icons/io5'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import adminClient from '../../api/adminClient.js'
import axios from 'axios'
import AsyncSelect from 'react-select/async'
import './EditTourPackage.css'
import './CreateTourPackage.css'
import { AccordionSection } from './CreateTourPackage.jsx'
import { loadCountryOptions, checkVisaRequirement } from '../../utils/countryOptionsLoader'
import { formSelectStyles } from '../../styles/client/reactSelectStyles'

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

// Custom DateGroup for EditTourPackage with non-editable slots
const EditDateGroup = ({
    index,
    dateGroup,
    updateDateGroup,
    removeDateGroup,
    isOpen,
    onToggle,
}) => (
    <div className='date-group'>
        <div className='date-group__header' onClick={() => onToggle(index)}>
            <h3 className='date-group__title'>Tour Package Date {index + 1}</h3>
            <div className='date-group__toggle'>
                {isOpen ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
            </div>
        </div>
        {isOpen && (
            <div className='form__fields'>
                <div className='date-group__form-field'>
                    <label className='form-label'>Start Date *</label>
                    <input
                        type='date'
                        value={dateGroup.start_date}
                        onChange={(e) =>
                            updateDateGroup(index, 'start_date', e.target.value)
                        }
                        className='form-input'
                        required
                    />
                </div>
                <div className='date-group__form-field'>
                    <label className='form-label'>End Date *</label>
                    <input
                        type='date'
                        value={dateGroup.end_date}
                        onChange={(e) =>
                            updateDateGroup(index, 'end_date', e.target.value)
                        }
                        className='form-input'
                        required
                    />
                </div>
                <div className='date-group__form-field'>
                    <label className='form-label'>Rate per Pax (PHP) *</label>
                    <input
                        type='number'
                        value={dateGroup.rate_per_pax}
                        onChange={(e) =>
                            updateDateGroup(
                                index,
                                'rate_per_pax',
                                Number(e.target.value)
                            )
                        }
                        className='form-input'
                        min='0'
                        required
                    />
                </div>
                <div className='date-group__form-field'>
                    <label className='form-label'>
                        Rate per Pax - Reservation (PHP) *
                    </label>
                    <input
                        type='number'
                        value={dateGroup.reservation_fee_per_pax}
                        onChange={(e) =>
                            updateDateGroup(
                                index,
                                'reservation_fee_per_pax',
                                Number(e.target.value)
                            )
                        }
                        className='form-input'
                        min='0'
                        required
                    />
                </div>
                <div className='date-group__form-field'>
                    <label className='form-label'>Total Slots {!dateGroup.id ? '*' : ''}</label>
                    <input
                        type='number'
                        value={dateGroup.total_slots}
                        onChange={!dateGroup.id ? (e) => {
                            const slots = Number(e.target.value)
                            updateDateGroup(index, 'total_slots', slots)
                            updateDateGroup(index, 'available_slots', slots)
                        } : undefined}
                        className={!dateGroup.id ? 'form-input' : 'form-input form-input--readonly'}
                        readOnly={!!dateGroup.id}
                        disabled={!!dateGroup.id}
                        min='1'
                        required={!dateGroup.id}
                    />
                    <small className='form-help-text'>
                        {dateGroup.id 
                            ? 'Total slots cannot be changed for existing date groups. Create a new date group instead.' 
                            : 'Set the total number of slots available for this date group.'
                        }
                    </small>
                </div>
                <div className='date-group__form-field'>
                    <label className='form-label'>Available Slots</label>
                    <input
                        type='number'
                        value={dateGroup.available_slots}
                        className='form-input form-input--readonly'
                        readOnly
                        disabled
                    />
                    <small className='form-help-text'>Available slots are automatically calculated.</small>
                </div>
                {index > 0 && (
                    <button
                        onClick={() => removeDateGroup(index)}
                        className='button-link button-link--remove'
                    >
                        Remove Tour Package Date
                    </button>
                )}
            </div>
        )}
    </div>
)

function EditTourPackage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { showError } = useSnackbar()
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        main_image_url: '',
        panellum_url: '',
        status: 'DRAFT',
        destination_country: '', // New field for visa integration
        visa_required: false, // Auto-enabled based on country
        fee_rules: { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 }, // Tour-level fee rules
        customFeeRules: [], // Custom fee rules for specific dates
        dates: [],
        itineraries: [],
        exclusions: [''],
        payment_terms: [''],
        requirements: [''],
        notes: [''],
    })
    console.log(formData)
    const [openSections, setOpenSections] = useState({
        general: true,
        dates: false,
        fee_rules: false,
        custom_fee_rules: false,
        inclusion_groups: false,
        custom_inclusions: false,
        itinerary: false,
        exclusions: false,
        payment_terms: false,
        requirements: false,
        notes: false,
    })
    const [openDateGroups, setOpenDateGroups] = useState({})
    const [openFeeRuleGroups, setOpenFeeRuleGroups] = useState({ default: true })
    const [mainImagePreview, setMainImagePreview] = useState(null)
    const [panellumImagePreview, setPanellumImagePreview] = useState(null)
    const [itineraryImagePreviews, setItineraryImagePreviews] = useState({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [originalFormData, setOriginalFormData] = useState(null)

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await adminClient.get(`/tours/${id}`)
                const tour = response.data
                // Build base dates - ONLY date-specific data
                const baseDates = tour.dates.map((date) => ({
                        id: date.id,
                        tour_package_id: date.tour_package_id,
                        start_date: date.start_date || '',
                        end_date: date.end_date || '',
                        rate_per_pax: date.rate_per_pax || 0,
                    reservation_fee_per_pax: date.reservation_fee_per_pax || 0,
                        total_slots: date.total_slots || 0,
                        available_slots: date.available_slots || 0,
                    // Only date-specific data
                    inclusion_groups: [],
                }))

                // Fetch fee rules and inclusion groups per date
                const datesWithExtras = await Promise.all(
                    baseDates.map(async (d, index) => {
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
                                dateIndex: index, // Store the index for inheritance logic
                            }
                        } catch (_error) { // eslint-disable-line no-unused-vars
                            // Ignore API errors for inclusion groups
                            return { ...d, dateIndex: index }
                        }
                    })
                )

                // Apply inheritance: if a date has no inclusion groups, copy from the first date
                const firstDateGroups = datesWithExtras[0]?.inclusion_groups || []
                const datesWithInheritance = datesWithExtras.map((date, index) => {
                    if (index === 0) {
                        // First date keeps its own groups
                        return date
                    } else if (date.inclusion_groups?.length === 0 && firstDateGroups.length > 0) {
                        // Other dates inherit from first date if they have no groups
                        return {
                            ...date,
                            inclusion_groups: JSON.parse(JSON.stringify(firstDateGroups)) // Deep copy
                        }
                    } else {
                        // Date has its own groups, keep them
                        return date
                    }
                })

                // Build itineraries from tour-level data (after migration)
                const allItineraries = (tour.itineraries || []).map((it) => ({
                    id: it.id,
                    day_number: it.day_number || 0,
                    title: it.title || '',
                    description: it.description || '',
                    image_url: it.image_url || '',
                })).sort((a, b) => a.day_number - b.day_number)

                // Build custom fee rules from dates that have different fee rules than tour-level
                const customFeeRules = []
                const tourFeeRules = tour.fee_rules || { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 }
                
                tour.dates.forEach((date, index) => {
                    if (date.fee_rules && typeof date.fee_rules === 'object') {
                        const isDifferent = Object.keys(tourFeeRules).some(key => 
                            date.fee_rules[key] !== tourFeeRules[key]
                        )
                        
                        if (isDifferent) {
                            customFeeRules.push({
                                dateIndex: index,
                                perRemovedGroup: date.fee_rules.perRemovedGroup || 0,
                                perRestDay: date.fee_rules.perRestDay || 0,
                                minFee: date.fee_rules.minFee || 0,
                                maxFee: date.fee_rules.maxFee || 0
                            })
                        }
                    }
                })
                
                console.log('🔍 Loaded custom fee rules:', customFeeRules)

                // Initialize fee rule groups state
                const initialFeeRuleGroups = { default: true }
                customFeeRules.forEach((_, index) => {
                    initialFeeRuleGroups[index] = true
                })
                setOpenFeeRuleGroups(initialFeeRuleGroups)

                setFormData({
                    title: tour.title || '',
                    description: tour.description || '',
                    main_image_url: tour.main_image_url || '',
                    panellum_url: tour.panellum_url || '',
                    status: tour.status || 'DRAFT',
                    destination_country: tour.destination_country || '',
                    visa_required: tour.visa_required || false,
                    fee_rules: tour.fee_rules || { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 },
                    customFeeRules: customFeeRules,
                    dates: datesWithInheritance,
                    itineraries: allItineraries,
                    exclusions: tour.exclusions || [''],
                    payment_terms: tour.payment_terms || [''],
                    requirements: tour.requirements || [''],
                    notes: tour.notes || [''],
                })

                // Store original data for comparison
                setOriginalFormData({
                    title: tour.title || '',
                    description: tour.description || '',
                    main_image_url: tour.main_image_url || '',
                    panellum_url: tour.panellum_url || '',
                    status: tour.status || 'DRAFT',
                    destination_country: tour.destination_country || '',
                    visa_required: tour.visa_required || false,
                    fee_rules: tour.fee_rules || { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 },
                    customFeeRules: customFeeRules,
                    dates: datesWithInheritance,
                    itineraries: allItineraries,
                    exclusions: tour.exclusions || [''],
                    payment_terms: tour.payment_terms || [''],
                    requirements: tour.requirements || [''],
                    notes: tour.notes || [''],
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

    // Track changes to detect unsaved modifications
    useEffect(() => {
        if (!originalFormData) return

        const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalFormData)
        setHasUnsavedChanges(hasChanges)
    }, [formData, originalFormData])

    const toggleSection = (section) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }))
    }

    const toggleDateGroup = (index) => {
        setOpenDateGroups((prev) => ({
            ...prev,
            [index]: !prev[index],
        }))
    }

    const toggleFeeRuleGroup = (index) => {
        setOpenFeeRuleGroups((prev) => ({
            ...prev,
            [index]: !prev[index],
        }))
    }

    const addCustomFeeRule = () => {
        setFormData((prev) => ({
            ...prev,
            customFeeRules: [
                ...(prev.customFeeRules || []),
                { dateIndex: undefined, perRemovedGroup: 0, perRestDay: 0, minFee: 0, maxFee: 0 }
            ]
        }))
    }

    const updateCustomFeeRule = (idx, field, value) => {
        setFormData((prev) => {
            const rules = [...(prev.customFeeRules || [])]
            rules[idx] = { ...rules[idx], [field]: value }
            return { ...prev, customFeeRules: rules }
        })
    }

    const removeCustomFeeRule = (idx) => {
        setFormData((prev) => ({
            ...prev,
            customFeeRules: prev.customFeeRules.filter((_, i) => i !== idx)
        }))
    }

    const updateFormData = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Auto-enable visa based on country selection
    const checkAndEnableVisa = (selectedCountry) => {
        const countryName = selectedCountry?.value || ''
        const visaRequired = checkVisaRequirement(countryName)
        
        setFormData(prev => ({
            ...prev,
            destination_country: countryName,
            visa_required: visaRequired,
            dates: prev.dates.map(date => {
                if (visaRequired) {
                    // Check if visa inclusion group already exists
                    const hasVisaGroup = date.inclusion_groups?.some(group => 
                        group.category === 'Visa / Documentation'
                    )
                    
                    if (!hasVisaGroup) {
                        return {
                            ...date,
                            inclusion_groups: [
                                ...(date.inclusion_groups || []),
                                {
                                    title: 'Visa / Documentation',
                                    category: 'Visa / Documentation',
                                    removable: false, // Required for visa countries
                                    items: ['Visa processing assistance']
                                }
                            ]
                        }
                    }
                }
                return date
            })
        }))
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
                        rate_per_pax: duplicatePricingFromPrevious && last ? last.rate_per_pax || 0 : 0,
                        reservation_fee_per_pax: duplicatePricingFromPrevious && last ? last.reservation_fee_per_pax || 0 : 0,
                        total_slots: duplicatePricingFromPrevious && last ? last.total_slots || 0 : 0,
                        available_slots: duplicatePricingFromPrevious && last ? last.total_slots || 0 : 0,
                        inclusion_groups: [], // Empty - only dates & pricing
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

    const updateItinerary = (index, field, value) => {
        setFormData((prev) => {
            const newItineraries = [...prev.itineraries]
            newItineraries[index][field] = value
            
            // If day_number was updated, sort the itineraries
            if (field === 'day_number') {
                newItineraries.sort((a, b) => a.day_number - b.day_number)
            }
            
            return { ...prev, itineraries: newItineraries }
        })
    }

    const addItinerary = () => {
        setFormData((prev) => {
            // Calculate the next day number based on the highest existing day number
            const maxDayNumber = prev.itineraries.length > 0 
                ? Math.max(...prev.itineraries.map(it => it.day_number || 0))
                : 0
            
            return {
                ...prev,
                itineraries: [
                    ...prev.itineraries,
                    {
                        day_number: maxDayNumber + 1,
                        title: '',
                        description: '',
                        image_url: '',
                        // ✅ No package_date_id needed - itineraries are now tour-level
                    },
                ],
            }
        })
    }

    const removeItinerary = (index) => {
        setFormData((prev) => {
            const newItineraries = prev.itineraries.filter(
                (_, i) => i !== index
            )
            // Re-sort and renumber the remaining itineraries
            newItineraries.sort((a, b) => a.day_number - b.day_number)
            newItineraries.forEach((it, i) => {
                it.day_number = i + 1
            })
            return { ...prev, itineraries: newItineraries }
        })
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

    const uploadImageToImgBB = async (file, field) => {
        // Client-side validation
        const maxSize = 10 * 1024 * 1024 // 10MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        
        if (file.size > maxSize) {
            showError('Image file too large. Maximum size is 10MB.')
            return
        }
        
        if (!allowedTypes.includes(file.type)) {
            showError('Unsupported image format. Please use JPEG, PNG, or WebP.')
            return
        }
        
        const formData = new FormData()
        formData.append('image', file)
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/images/upload-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            )
            const imageUrl = response.data.data.url
            if (field.startsWith('itinerary_')) {
                const itinIndex = parseInt(field.split('_')[1])
                updateItinerary(itinIndex, 'image_url', imageUrl)
            } else {
                updateFormData(field, imageUrl)
                if (field === 'main_image_url') {
                    setMainImagePreview(URL.createObjectURL(file))
                } else if (field === 'panellum_url') {
                    setPanellumImagePreview(URL.createObjectURL(file))
                }
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            const errorMessage = error.response?.data?.error || error.message || 'Failed to upload image'
            showError(`Image upload failed: ${errorMessage}. Please check your file size (max 10MB) and format (JPEG, PNG, WebP only).`)
        }
    }

    const handleItineraryImageChange = (e, itinIndex) => {
        const file = e.target.files[0]
        if (file) {
            uploadImageToImgBB(file, `itinerary_${itinIndex}`)
            setItineraryImagePreviews(prev => ({
                ...prev,
                [itinIndex]: URL.createObjectURL(file)
            }))
        }
    }

    const handleBackClick = () => {
        if (hasUnsavedChanges) {
            const shouldLeave = window.confirm(
                'You have unsaved changes. Are you sure you want to leave without saving?'
            )
            if (!shouldLeave) return
        }
        navigate('/admin/tours')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            // Validate required fields before sending
            const validationErrors = []
            
            if (!formData.title?.trim()) validationErrors.push('Title is required')
            if (!formData.description?.trim()) validationErrors.push('Description is required')
            if (!formData.destination_country?.trim()) validationErrors.push('Destination Country is required')
            if (!formData.main_image_url?.trim()) validationErrors.push('Main image is required')
            if (!formData.panellum_url?.trim()) validationErrors.push('Panellum image is required')
            
            // Validate dates
            formData.dates.forEach((date, index) => {
                if (!date.start_date) validationErrors.push(`Start date is required for date group ${index + 1}`)
                if (!date.end_date) validationErrors.push(`End date is required for date group ${index + 1}`)
                if (date.start_date && date.end_date && new Date(date.start_date) >= new Date(date.end_date)) {
                    validationErrors.push(`End date must be after start date for date group ${index + 1}`)
                }
                if (!date.rate_per_pax || Number(date.rate_per_pax) <= 0) {
                    validationErrors.push(`Rate per pax must be greater than 0 for date group ${index + 1}`)
                }
                if (!date.total_slots || Number(date.total_slots) <= 0) {
                    validationErrors.push(`Total slots must be greater than 0 for date group ${index + 1}`)
                }
            })
            
            if (validationErrors.length > 0) {
                setError(validationErrors.join(', '))
                setIsSubmitting(false)
                return
            }
            
            const payload = {
                title: formData.title,
                description: formData.description,
                main_image_url: formData.main_image_url,
                panellum_url: formData.panellum_url,
                status: formData.status,
                destination_country: formData.destination_country,
                visa_required: formData.visa_required,
                fee_rules: formData.fee_rules,
                customFeeRules: formData.customFeeRules || [],
                // ✅ Tour-level data
                itineraries: formData.itineraries.map((it) => ({
                    id: it.id || undefined,
                    day_number: Number(it.day_number) || 0,
                    title: it.title || '',
                    description: it.description || '',
                    image_url: it.image_url || '',
                })),
                inclusions: [], // Empty array since we use inclusion_groups now
                exclusions: formData.exclusions.filter(Boolean),
                payment_terms: formData.payment_terms.filter(Boolean),
                requirements: formData.requirements.filter(Boolean),
                notes: formData.notes.filter(Boolean),
                dates: formData.dates.map((date) => ({
                    id: date.id || undefined,
                    start_date: date.start_date,
                    end_date: date.end_date,
                    rate_per_pax: Number(date.rate_per_pax) || 0,
                    reservation_fee_per_pax: date.reservation_fee_per_pax
                        ? Number(date.reservation_fee_per_pax)
                        : null,
                    total_slots: Number(date.total_slots) || 0,
                    available_slots: Number(date.available_slots) || 0,
                    // ✅ No itineraries here - they're tour-level now
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
                } catch (_error) { // eslint-disable-line no-unused-vars
                    // Ignore cleanup errors; creation step below will still run
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
                setHasUnsavedChanges(false)
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

    if (isLoading) return (
        <div className='loading-container'>
            <div className='loading-spinner'></div>
            <div className='loading-text'>Loading tour package...</div>
        </div>
    )
    if (error) return <div className='loading'>{error}</div>

    return (
        <div className='container tour-edit-container'>
            <div className='header'>
                <div onClick={handleBackClick} className='header__back-button'>
                    <IoChevronBack size={24} />
                    <p className='header__back-text'>Back to Tours</p>
                    {hasUnsavedChanges && (
                        <span className='unsaved-indicator'>•</span>
                    )}
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
                        <label className='form-label'>Destination Country *</label>
                        <AsyncSelect
                            loadOptions={loadCountryOptions}
                            onChange={checkAndEnableVisa}
                            value={formData.destination_country ? { 
                                value: formData.destination_country, 
                                label: formData.destination_country,
                                requiresVisa: checkVisaRequirement(formData.destination_country)
                            } : null}
                            styles={formSelectStyles}
                            placeholder="Search for a country..."
                            noOptionsMessage={() => "No countries found"}
                            loadingMessage={() => "Loading countries..."}
                            isClearable
                            isSearchable
                            cacheOptions
                            defaultOptions
                            formatOptionLabel={(option) => (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{option.label}</span>
                                    <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#666' }}>
                                        <span>{option.code}</span>
                                        {option.requiresVisa && (
                                            <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>VISA REQUIRED</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        />
                        {formData.visa_required && (
                            <div className='visa-notice'>
                                <p className='visa-notice__text'>
                                    ✅ Visa processing will be automatically included for this destination
                                </p>
                            </div>
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
                        <EditDateGroup
                            key={dateGroup.id || `date-${index}`}
                            index={index}
                            dateGroup={dateGroup}
                            updateDateGroup={updateDateGroup}
                            removeDateGroup={removeDateGroup}
                            isOpen={openDateGroups[index] !== false}
                            onToggle={toggleDateGroup}
                        />
                    ))}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => addDateGroup(false)} className='button-link'>Add Tour Package Date</button>
                        <button onClick={() => addDateGroup(true)} className='button-link'>Duplicate Tour Package Date</button>
                    </div>
                </div>
            </AccordionSection>

            <AccordionSection
                title='Fee Rules'
                isOpen={openSections.fee_rules}
                toggle={() => toggleSection('fee_rules')}
            >
                <div className='form__fields'>
                    {/* Default Fee Rules Group - Always first, labeled "Default" */}
                    <div className='fee-rule-group'>
                        <div className='fee-rule-group__header' onClick={() => toggleFeeRuleGroup('default')}>
                            <h3 className='fee-rule-group__title'>Default (All Dates)</h3>
                            <div className='fee-rule-group__toggle'>
                                {openFeeRuleGroups['default'] ? <IoChevronUp /> : <IoChevronDown />}
                            </div>
                        </div>
                        {openFeeRuleGroups['default'] && (
                            <div className='fee-rule-group__content'>
                                <div className='date-group__form-field'>
                                    <label className='form-label'>Per Removed Group (PHP)</label>
                                    <input 
                                        type='number' 
                                        className='form-input' 
                                        min='0' 
                                        value={formData.fee_rules?.perRemovedGroup || 0} 
                                        onChange={(e) => updateFormData('fee_rules', {...formData.fee_rules, perRemovedGroup: Number(e.target.value)})} 
                                    />
                                </div>
                                <div className='date-group__form-field'>
                                    <label className='form-label'>Per Rest Day (PHP)</label>
                                    <input 
                                        type='number' 
                                        className='form-input' 
                                        min='0' 
                                        value={formData.fee_rules?.perRestDay || 0} 
                                        onChange={(e) => updateFormData('fee_rules', {...formData.fee_rules, perRestDay: Number(e.target.value)})} 
                                    />
                                </div>
                                <div className='date-group__form-field'>
                                    <label className='form-label'>Minimum Fee (PHP)</label>
                                    <input 
                                        type='number' 
                                        className='form-input' 
                                        min='0' 
                                        value={formData.fee_rules?.minFee || 0} 
                                        onChange={(e) => updateFormData('fee_rules', {...formData.fee_rules, minFee: Number(e.target.value)})} 
                                    />
                                </div>
                                <div className='date-group__form-field'>
                                    <label className='form-label'>Maximum Fee (PHP)</label>
                                    <input 
                                        type='number' 
                                        className='form-input' 
                                        min='0' 
                                        value={formData.fee_rules?.maxFee || 0} 
                                        onChange={(e) => updateFormData('fee_rules', {...formData.fee_rules, maxFee: Number(e.target.value)})} 
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Custom Fee Rules - Only show if 2+ date groups exist */}
                    {formData.dates.length >= 2 && formData.customFeeRules?.map((rule, idx) => (
                        <div key={idx} className='fee-rule-group'>
                            <div className='fee-rule-group__header' onClick={() => toggleFeeRuleGroup(idx)}>
                                <h3 className='fee-rule-group__title'>
                                    {rule.dateIndex !== undefined ? `Date ${rule.dateIndex + 1}` : 'Unassigned'}
                                </h3>
                                <div className='fee-rule-group__toggle'>
                                    {openFeeRuleGroups[idx] ? <IoChevronUp /> : <IoChevronDown />}
                                </div>
                            </div>
                            {openFeeRuleGroups[idx] && (
                                <div className='fee-rule-group__content'>
                                    <div className='date-group__form-field'>
                                        <label className='form-label'>Assign to Date</label>
                                        <select 
                                            className='form-input'
                                            value={rule.dateIndex !== undefined ? rule.dateIndex : ''} 
                                            onChange={(e) => updateCustomFeeRule(idx, 'dateIndex', e.target.value ? Number(e.target.value) : undefined)}
                                        >
                                            <option value="">Select Date</option>
                                            {formData.dates.map((d, i) => (
                                                <option key={i} value={i}>
                                                    Date {i + 1}: {d.start_date} - {d.end_date}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className='date-group__form-field'>
                                        <label className='form-label'>Per Removed Group (PHP)</label>
                                        <input 
                                            type='number' 
                                            className='form-input' 
                                            min='0' 
                                            value={rule.perRemovedGroup || 0} 
                                            onChange={(e) => updateCustomFeeRule(idx, 'perRemovedGroup', Number(e.target.value))} 
                                        />
                                    </div>
                                    <div className='date-group__form-field'>
                                        <label className='form-label'>Per Rest Day (PHP)</label>
                                        <input 
                                            type='number' 
                                            className='form-input' 
                                            min='0' 
                                            value={rule.perRestDay || 0} 
                                            onChange={(e) => updateCustomFeeRule(idx, 'perRestDay', Number(e.target.value))} 
                                        />
                                    </div>
                                    <div className='date-group__form-field'>
                                        <label className='form-label'>Minimum Fee (PHP)</label>
                                        <input 
                                            type='number' 
                                            className='form-input' 
                                            min='0' 
                                            value={rule.minFee || 0} 
                                            onChange={(e) => updateCustomFeeRule(idx, 'minFee', Number(e.target.value))} 
                                        />
                                    </div>
                                    <div className='date-group__form-field'>
                                        <label className='form-label'>Maximum Fee (PHP)</label>
                                        <input 
                                            type='number' 
                                            className='form-input' 
                                            min='0' 
                                            value={rule.maxFee || 0} 
                                            onChange={(e) => updateCustomFeeRule(idx, 'maxFee', Number(e.target.value))} 
                                        />
                                    </div>
                                    <div className='date-group__form-field'>
                                        <button 
                                            type='button'
                                            onClick={() => removeCustomFeeRule(idx)} 
                                            className='button-link text-red-600'
                                        >
                                            Remove Fee Rule
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {formData.dates.length >= 2 && (
                        <button 
                            type='button'
                            onClick={addCustomFeeRule} 
                            className='button-link'
                        >
                            + Add Fee Rule for Specific Date
                        </button>
                    )}
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
                            <h3 className='date-group__title'>
                                Date {dIdx + 1}
                                {dIdx > 0 && dateGroup.inclusion_groups?.length === 0 && (
                                    <span className='badge badge--default ml-2'>Using Default Inclusions</span>
                                )}
                                {dIdx > 0 && dateGroup.inclusion_groups?.length > 0 && (
                                    <span className='badge badge--custom ml-2'>Custom Inclusions</span>
                                )}
                            </h3>
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
                                {dIdx > 0 && dateGroup.inclusion_groups?.length === 0 && formData.dates[0]?.inclusion_groups?.length > 0 && (
                                    <button onClick={() => {
                                        const newDates = [...formData.dates]
                                        const firstDateGroups = newDates[0]?.inclusion_groups || []
                                        newDates[dIdx] = { 
                                            ...newDates[dIdx], 
                                            inclusion_groups: JSON.parse(JSON.stringify(firstDateGroups))
                                        }
                                        setFormData(prev => ({ ...prev, dates: newDates }))
                                    }} className='button-link button-link--primary'>
                                        📋 Use Date 1 Template
                                    </button>
                                )}
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
                            <div className='date-group__form-field'>
                                <label className='form-label'>Day Image</label>
                                <input
                                    type='file'
                                    accept='image/jpeg,image/png,image/gif,image/webp'
                                    onChange={(e) =>
                                        handleItineraryImageChange(e, itinIndex)
                                    }
                                    className='form-input'
                                />
                                {(itineraryImagePreviews[itinIndex] || itinerary.image_url) && (
                                    <img
                                        src={itineraryImagePreviews[itinIndex] || itinerary.image_url}
                                        alt={`Day ${itinerary.day_number} Preview`}
                                        className='image-preview'
                                    />
                                )}
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
