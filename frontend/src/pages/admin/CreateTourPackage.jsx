import { useState, useRef } from 'react'
import { IoChevronBack, IoChevronUp, IoChevronDown } from 'react-icons/io5'
import { useSnackbar } from '../../context/SnackbarContext'
import adminClient from '../../api/adminClient.js'
import axios from 'axios'
import AsyncSelect from 'react-select/async'
import './CreateTourPackage.css'
import { useNavigate } from 'react-router-dom'
import { loadCountryOptions, checkVisaRequirement } from '../../utils/countryOptionsLoader'
import { formSelectStyles } from '../../styles/client/reactSelectStyles'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import useBlocker from '../../hooks/useBlocker'
import UnsavedChangesModal from '../../components/UnsavedChangesModal'
import '../../styles/unsaved-changes.css'

const AdminPrimaryButton = ({ buttonText, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className='admin-primary-button'
    >
        {buttonText}
    </button>
)

export const AccordionSection = ({ title, isOpen, toggle, children }) => {
    const headerRef = useRef(null)
    const scrollToHeader = () => {
        try {
            if (headerRef.current) {
                headerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                // If the environment doesn't respect scroll-margin-top, apply manual offset
                setTimeout(() => {
                    const _offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--default-padding-top')) || 64
                    window.scrollBy({ top: -16, left: 0, behavior: 'instant' })
                }, 300)
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } catch (_error) { // eslint-disable-line no-unused-vars
            // Ignore scroll errors
        }
    }
    return (
        <div className='accordion-section' ref={headerRef}>
            <button
                className='accordion-section__button'
                onClick={toggle}
            >
                <span className='accordion-section__title'>{title}</span>
                <div className='accordion-section__toggle'>
                    {isOpen ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
                </div>
            </button>
            {isOpen && (
                <>
                    <div className='accordion-section__content'>{children}</div>
                    <div className='accordion-scroll-top'>
                        <button className='button-link' onClick={scrollToHeader}>↑ Scroll to header</button>
                    </div>
                </>
            )}
        </div>
    )
}

export const DateGroup = ({
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
                    <label className='form-label'>Total Slots *</label>
                    <input
                        type='number'
                        value={dateGroup.total_slots}
                        onChange={(e) => {
                            const slots = Number(e.target.value)
                            updateDateGroup(index, 'total_slots', slots)
                            updateDateGroup(index, 'available_slots', slots)
                        }}
                        className='form-input'
                        min='1'
                        required
                    />
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
                    <small className='form-help-text'>Available slots are automatically set to match total slots.</small>
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

function CreateTourPackage() {
    const { showError, showSuccess } = useSnackbar()
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
        status: 'DRAFT',
        main_image_url: '',
        panellum_url: '',
        destination_country: '', // New field for visa integration
        visa_required: false, // Auto-enabled based on country
        fee_rules: { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 }, // Tour-level fee rules
        dates: [
            {
                start_date: '',
                end_date: '',
                rate_per_pax: 0,
                reservation_fee_per_pax: 0,
                total_slots: 0,
                available_slots: 0,
                inclusion_groups: [],
            },
        ],
        itineraries: [{ day_number: 1, title: '', description: '', image_url: '' }],
        exclusions: [''],
        payment_terms: [''],
        requirements: [''],
        notes: [''],
    })

    // Initial empty form data for comparison
    const initialFormData = {
        title: '',
        description: '',
        status: 'DRAFT',
        main_image_url: '',
        panellum_url: '',
        destination_country: '',
        visa_required: false,
        fee_rules: { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 },
        dates: [{ start_date: '', end_date: '', rate_per_pax: 0, reservation_fee_per_pax: 0, total_slots: 0, available_slots: 0, inclusion_groups: [] }],
        itineraries: [{ day_number: 1, title: '', description: '', image_url: '' }],
        exclusions: [''],
        payment_terms: [''],
        requirements: [''],
        notes: [''],
    }

    // Unsaved changes hook
    const {
        hasUnsavedChanges
    } = useUnsavedChanges(initialFormData, formData, {
        enabled: true,
        trackBeforeUnload: true
    })

    // Navigation blocker
    useBlocker(hasUnsavedChanges, () => {
        setShowUnsavedModal(true)
    })

    const [openSections, setOpenSections] = useState({
        general: true,
        dates: false,
        fee_rules: false,
        custom_fee_rules: false,
        inclusion_groups: false,
        custom_inclusions: false,
        itinerary: false,
        inclusions: false,
        exclusions: false,
        payment_terms: false,
        requirements: false,
        notes: false,
    })

    const [openDateGroups, setOpenDateGroups] = useState({})
    const [openFeeRuleGroups, setOpenFeeRuleGroups] = useState({ default: true })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [mainImagePreview, setMainImagePreview] = useState(null)
    const [panellumImagePreview, setPanellumImagePreview] = useState(null)
    const [itineraryImagePreviews, setItineraryImagePreviews] = useState({})
    const [showUnsavedModal, setShowUnsavedModal] = useState(false)
    const navigate = useNavigate()

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
                    const hasVisaGroup = date.inclusion_groups.some(group => 
                        group.category === 'Visa / Documentation'
                    )
                    
                    if (!hasVisaGroup) {
                        return {
                            ...date,
                            inclusion_groups: [
                                ...date.inclusion_groups,
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
            newDates[index] = { ...newDates[index], [field]: value }
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

    const addDateGroup = () => {
        setFormData((prev) => ({
            ...prev,
            dates: [
                ...prev.dates,
                {
                    start_date: '',
                    end_date: '',
                    rate_per_pax: 0,
                    reservation_fee_per_pax: 0,
                    total_slots: 0,
                    available_slots: 0,
                    inclusion_groups: [], // Empty - only dates & pricing
                },
            ],
        }))
    }

    const removeDateGroup = (index) => {
        setFormData((prev) => ({
            ...prev,
            dates: prev.dates.filter((_, i) => i !== index),
        }))
    }

    const updateItinerary = (itinIndex, field, value) => {
        setFormData((prev) => {
            const newItineraries = [...prev.itineraries]
            newItineraries[itinIndex] = {
                ...newItineraries[itinIndex],
                [field]: value,
            }
            return { ...prev, itineraries: newItineraries }
        })
    }

    const addItinerary = () => {
        setFormData((prev) => {
            const nextDay = prev.itineraries.length + 1
            return {
                ...prev,
                itineraries: [
                    ...prev.itineraries,
                    { day_number: nextDay, title: '', description: '', image_url: '' },
                ],
            }
        })
    }

    const removeItinerary = (itinIndex) => {
        setFormData((prev) => ({
            ...prev,
            itineraries: prev.itineraries.filter(
                (_, index) => index !== itinIndex
            ),
        }))
    }

    const updateExclusion = (excIndex, value) => {
        setFormData((prev) => {
            const newExclusions = [...prev.exclusions]
            newExclusions[excIndex] = value
            return { ...prev, exclusions: newExclusions }
        })
    }

    const addExclusion = () => {
        setFormData((prev) => ({
            ...prev,
            exclusions: [...prev.exclusions, ''],
        }))
    }

    const removeExclusion = (excIndex) => {
        setFormData((prev) => ({
            ...prev,
            exclusions: prev.exclusions.filter(
                (_, index) => index !== excIndex
            ),
        }))
    }

    const updatePaymentTerm = (termIndex, value) => {
        setFormData((prev) => {
            const newPaymentTerms = [...prev.payment_terms]
            newPaymentTerms[termIndex] = value
            return { ...prev, payment_terms: newPaymentTerms }
        })
    }

    const addPaymentTerm = () => {
        setFormData((prev) => ({
            ...prev,
            payment_terms: [...prev.payment_terms, ''],
        }))
    }

    const removePaymentTerm = (termIndex) => {
        setFormData((prev) => ({
            ...prev,
            payment_terms: prev.payment_terms.filter(
                (_, index) => index !== termIndex
            ),
        }))
    }

    const updateRequirement = (reqIndex, value) => {
        setFormData((prev) => {
            const newRequirements = [...prev.requirements]
            newRequirements[reqIndex] = value
            return { ...prev, requirements: newRequirements }
        })
    }

    const addRequirement = () => {
        setFormData((prev) => ({
            ...prev,
            requirements: [...prev.requirements, ''],
        }))
    }

    const removeRequirement = (reqIndex) => {
        setFormData((prev) => ({
            ...prev,
            requirements: prev.requirements.filter(
                (_, index) => index !== reqIndex
            ),
        }))
    }

    const updateNote = (noteIndex, value) => {
        setFormData((prev) => {
            const newNotes = [...prev.notes]
            newNotes[noteIndex] = value
            return { ...prev, notes: newNotes }
        })
    }

    const addNote = () => {
        setFormData((prev) => ({
            ...prev,
            notes: [...prev.notes, ''],
        }))
    }

    const removeNote = (noteIndex) => {
        setFormData((prev) => ({
            ...prev,
            notes: prev.notes.filter((_, index) => index !== noteIndex),
        }))
    }

    const uploadImageToImgBB = async (file, field) => {
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
            showError('Failed to upload image. Please try again.')
        }
    }

    const handleImageChange = (e, field) => {
        const file = e.target.files[0]
        if (file) {
            uploadImageToImgBB(file, field)
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

    const validateForm = () => {
        if (!formData.title.trim()) return 'Title is required.'
        if (!formData.description.trim()) return 'Description is required.'
        if (!formData.destination_country || !formData.destination_country.trim()) return 'Destination Country is required.'
        if (!formData.main_image_url) return 'Main Image is required.'
        if (!formData.panellum_url) return 'Panellum Image is required.'
        if (formData.dates.length === 0)
            return 'At least one date group is required.'
        for (const date of formData.dates) {
            if (!date.start_date)
                return 'Start Date is required for all date groups.'
            if (!date.end_date)
                return 'End Date is required for all date groups.'
            if (date.rate_per_pax <= 0)
                return 'Rate per Pax must be greater than 0.'
            if (date.total_slots <= 0)
                return 'Total Slots must be greater than 0.'
            if (new Date(date.start_date) >= new Date(date.end_date))
                return 'End Date must be after Start Date.'
        }
        if (formData.itineraries.length === 0)
            return 'At least one itinerary is required.'
        for (const itinerary of formData.itineraries) {
            if (!itinerary.title.trim())
                return 'Itinerary Title is required for all itineraries.'
            if (!itinerary.description.trim())
                return 'Itinerary Description is required for all itineraries.'
            if (itinerary.day_number <= 0)
                return 'Itinerary Day Number must be greater than 0.'
        }
        // Validate inclusions: check inclusion_groups with at least one non-empty item
        const hasGroupedInclusions = (formData.dates || []).some((d) =>
            Array.isArray(d.inclusion_groups) && d.inclusion_groups.some((g) => Array.isArray(g.items) && g.items.some((it) => (it || '').trim()))
        )
        if (!hasGroupedInclusions) {
            return 'At least one non-empty inclusion is required.'
        }
        if (
            formData.exclusions.length === 0 ||
            formData.exclusions.every((exc) => !exc.trim())
        )
            return 'At least one non-empty exclusion is required.'
        if (
            formData.payment_terms.length === 0 ||
            formData.payment_terms.every((term) => !term.trim())
        )
            return 'At least one non-empty payment term is required.'
        if (
            formData.requirements.length === 0 ||
            formData.requirements.every((req) => !req.trim())
        )
            return 'At least one non-empty requirement is required.'
        if (
            formData.notes.length === 0 ||
            formData.notes.every((note) => !note.trim())
        )
            return 'At least one non-empty note is required.'
        return null
    }

    const handleSubmit = async () => {
        const validationError = validateForm()
        if (validationError) {
            showError(validationError)
            return
        }
        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                // ✅ Send tour-level data at top level
                itineraries: formData.itineraries,
                inclusions: [], // Empty array since we use inclusion_groups now
                exclusions: formData.exclusions,
                payment_terms: formData.payment_terms,
                requirements: formData.requirements,
                notes: formData.notes,
                // ✅ Send dates without duplicating tour-level data
                dates: formData.dates.map((date) => ({
                    ...date,
                    // Only include date-specific data
                })),
            }
            const createRes = await adminClient.post('/tours/create', payload)

            // Phase 2: Post-create, create inclusion groups/items and apply fee rules per date via admin endpoints
            const tourId = createRes?.data?.tour?.id
            if (tourId) {
                // Fetch created package_dates to get their ids
                const tourRes = await adminClient.get(`/tours/${tourId}`)
                const createdDates = tourRes?.data?.dates || []

                for (let dIdx = 0; dIdx < formData.dates.length; dIdx++) {
                    const createdDateId = createdDates[dIdx]?.id
                    if (!createdDateId) continue

                    // Apply fee rules if present
                    const fr = formData.dates[dIdx].fee_rules
                    if (fr) {
                        await adminClient.put(`/tours/dates/${createdDateId}/fee-rules`, fr)
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
            }

            showSuccess('Tour package created successfully!')
            navigate('/admin/tours')
        } catch (error) {
            console.error('Error creating tour:', error)
            showError('Failed to create tour package.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBackClick = async () => {
        if (hasUnsavedChanges) {
            setShowUnsavedModal(true)
            return
        }
        navigate('/admin/tours')
    }

    const handleConfirmLeave = () => {
        setShowUnsavedModal(false)
        navigate('/admin/tours')
    }

    const handleCancelLeave = () => {
        setShowUnsavedModal(false)
    }

    return (
        <div className='container'>
            <div className='header'>
                <div
                    onClick={handleBackClick}
                    className='header__back-button'
                >
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
                        <label className='form-label'>Description *</label>
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
                            required
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
                        <label className='form-label'>Panellum Image *</label>
                        <input
                            type='file'
                            accept='image/jpeg,image/png,image/gif,image/webp'
                            onChange={(e) =>
                                handleImageChange(e, 'panellum_url')
                            }
                            className='form-input'
                            required
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
                        <DateGroup
                            key={index}
                            index={index}
                            dateGroup={dateGroup}
                            updateDateGroup={updateDateGroup}
                            removeDateGroup={removeDateGroup}
                            isOpen={openDateGroups[index] !== false}
                            onToggle={toggleDateGroup}
                        />
                    ))}
                    <button
                        onClick={addDateGroup}
                        className='button-link'
                    >
                        + Add Tour Package Date
                    </button>
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
                            key={itinIndex}
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
                                <label className='form-label'>Title *</label>
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
                                {itineraryImagePreviews[itinIndex] && (
                                    <img
                                        src={itineraryImagePreviews[itinIndex]}
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
                            <h3 className='date-group__title'>Tour Package Date {dIdx + 1}</h3>
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
                                                    {(group.items || []).length > 1 && (
                                                        <button onClick={() => removeInclusionGroupItem(dIdx, gIdx, iIdx)} className='button-link button-link--remove'>Remove</button>
                                                    )}
                                                </div>
                                            ))}
                                            <button onClick={() => addInclusionGroupItem(dIdx, gIdx)} className='button-link'>+ Add another item</button>
                                        </div>
                                        <button onClick={() => removeInclusionGroup(dIdx, gIdx)} className='button-link button-link--remove'>Remove Group</button>
                                    </div>
                                ))}
                                <button onClick={() => addInclusionGroupForDate(dIdx)} className='button-link'>+ Add inclusion group</button>
                            </div>
                        </div>
                    ))}
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
                            key={excIndex}
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
                            key={termIndex}
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
                            key={reqIndex}
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
                            key={noteIndex}
                            className='notes__item'
                        >
                            <div className='date-group__form-field'>
                                <label className='form-label'>Note *</label>
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
            <AdminPrimaryButton
                buttonText='Save'
                onClick={handleSubmit}
                disabled={isSubmitting}
            />

            {/* Unsaved Changes Modal */}
            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onConfirm={handleConfirmLeave}
                onCancel={handleCancelLeave}
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to leave without saving?"
                confirmText="Leave Without Saving"
                cancelText="Stay on Page"
            />
        </div>
    )
}

export default CreateTourPackage
