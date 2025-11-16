import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSnackbar } from '../../context/SnackbarContext'
import { IoChevronBack } from 'react-icons/io5'
import adminClient from '../../api/adminClient.js'
import axios from 'axios'
import AsyncSelect from 'react-select/async'
import './TourPackageForm.css'
import {
  loadCountryOptions,
  checkVisaRequirement,
} from '../../utils/countryOptionsLoader'
import { formSelectStyles } from '../../styles/client/reactSelectStyles'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import useBlocker from '../../hooks/useBlocker'
import UnsavedChangesModal from '../../components/UnsavedChangesModal'
import '../../styles/unsaved-changes.css'

// Tour Form Components
import DateGroupCard from '../../components/admin/tour-form/DateGroupCard'
import FeeRulesSection from '../../components/admin/tour-form/FeeRulesSection'
import InclusionsSection from '../../components/admin/tour-form/InclusionsSection'
import ItineraryCard from '../../components/admin/tour-form/ItineraryCard'
import SimpleListSection from '../../components/admin/tour-form/SimpleListSection'

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

function TourPackageForm({ mode = 'create' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showError, showSuccess } = useSnackbar()
  const isEditMode = mode === 'edit'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    main_image_url: '',
    panellum_url: '',
    status: 'DRAFT',
    destination_country: '',
    visa_required: false,
    fee_rules: {
      perRemovedGroup: 5000,
      perRestDay: 3000,
      minFee: 5000,
      maxFee: 50000,
    },
    customFeeRules: [],
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

  const [originalFormData, setOriginalFormData] = useState(null)
  const [mainImagePreview, setMainImagePreview] = useState(null)
  const [panellumImagePreview, setPanellumImagePreview] = useState(null)
  const [itineraryImagePreviews, setItineraryImagePreviews] = useState({})
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [activeSection, setActiveSection] = useState('general')

  // Section refs for scroll spy
  const sectionRefs = useRef({})

  // Unsaved changes hook
  const { hasUnsavedChanges, resetUnsavedChanges } = useUnsavedChanges(
    originalFormData || formData,
    formData,
    {
      enabled: isEditMode ? !!originalFormData : true,
      trackBeforeUnload: true,
    }
  )

  // Navigation blocker
  useBlocker(hasUnsavedChanges, () => {
    setShowUnsavedModal(true)
  })

  // Scroll spy effect
  useEffect(() => {
    const observers = []
    const options = {
      root: null,
      rootMargin: '-100px 0px -50% 0px',
      threshold: 0,
    }

    Object.keys(sectionRefs.current).forEach((key) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(key)
          }
        })
      }, options)

      if (sectionRefs.current[key]) {
        observer.observe(sectionRefs.current[key])
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  // Load tour data for edit mode
  useEffect(() => {
    if (!isEditMode || !id) {
      if (!isEditMode) {
        setOriginalFormData({ ...formData })
      }
      return
    }

    const fetchTour = async () => {
      try {
        const response = await adminClient.get(`/tours/${id}`)
        const tour = response.data

        const baseDates = tour.dates.map((date) => ({
          id: date.id,
          tour_package_id: date.tour_package_id,
          start_date: date.start_date || '',
          end_date: date.end_date || '',
          rate_per_pax: date.rate_per_pax || 0,
          reservation_fee_per_pax: date.reservation_fee_per_pax || 0,
          total_slots: date.total_slots || 0,
          available_slots: date.available_slots || 0,
          inclusion_groups: [],
        }))

        const datesWithExtras = await Promise.all(
          baseDates.map(async (d, index) => {
            try {
              const groupsRes = await adminClient.get(
                `/tours/dates/${d.id}/inclusion-groups`
              )
              const groups = Array.isArray(groupsRes?.data)
                ? groupsRes.data
                : []
              const groupsWithItems = []
              for (const g of groups) {
                let items = Array.isArray(g.items)
                  ? g.items.map((it) => it.content || '')
                  : []
                if (items.length === 0) {
                  const itemsRes = await adminClient.get(
                    `/tours/inclusion-groups/${g.id}/items`
                  )
                  items = (itemsRes?.data || []).map((it) => it.content || '')
                }
                const matchedCategory = CATEGORY_OPTIONS.includes(g.title)
                  ? g.title
                  : 'Custom…'
                groupsWithItems.push({
                  title:
                    matchedCategory === 'Custom…' ? g.title || '' : g.title,
                  category: matchedCategory,
                  removable: g.removable !== false,
                  items: items.length ? items : [''],
                })
              }
              return {
                ...d,
                inclusion_groups: groupsWithItems,
                dateIndex: index,
              }
            } catch {
              return { ...d, dateIndex: index }
            }
          })
        )

        const firstDateGroups = datesWithExtras[0]?.inclusion_groups || []
        const datesWithInheritance = datesWithExtras.map((date, index) => {
          if (index === 0) {
            return date
          } else if (
            date.inclusion_groups?.length === 0 &&
            firstDateGroups.length > 0
          ) {
            return {
              ...date,
              inclusion_groups: JSON.parse(JSON.stringify(firstDateGroups)),
            }
          } else {
            return date
          }
        })

        const allItineraries = (tour.itineraries || [])
          .map((it) => ({
            id: it.id,
            day_number: it.day_number || 0,
            title: it.title || '',
            description: it.description || '',
            image_url: it.image_url || '',
          }))
          .sort((a, b) => a.day_number - b.day_number)

        const customFeeRules = []
        const tourFeeRules = tour.fee_rules || {
          perRemovedGroup: 5000,
          perRestDay: 3000,
          minFee: 5000,
          maxFee: 50000,
        }

        tour.dates.forEach((date, index) => {
          if (date.fee_rules && typeof date.fee_rules === 'object') {
            const isDifferent = Object.keys(tourFeeRules).some(
              (key) => date.fee_rules[key] !== tourFeeRules[key]
            )

            if (isDifferent) {
              customFeeRules.push({
                dateIndex: index,
                perRemovedGroup: date.fee_rules.perRemovedGroup || 0,
                perRestDay: date.fee_rules.perRestDay || 0,
                minFee: date.fee_rules.minFee || 0,
                maxFee: date.fee_rules.maxFee || 0,
              })
            }
          }
        })

        const loadedData = {
          title: tour.title || '',
          description: tour.description || '',
          main_image_url: tour.main_image_url || '',
          panellum_url: tour.panellum_url || '',
          status: tour.status || 'DRAFT',
          destination_country: tour.destination_country || '',
          visa_required: tour.visa_required || false,
          fee_rules: tourFeeRules,
          customFeeRules: customFeeRules,
          dates: datesWithInheritance,
          itineraries: allItineraries,
          exclusions: tour.exclusions || [''],
          payment_terms: tour.payment_terms || [''],
          requirements: tour.requirements || [''],
          notes: tour.notes || [''],
        }

        setFormData(loadedData)
        setOriginalFormData(loadedData)
        setMainImagePreview(tour.main_image_url || null)
        setPanellumImagePreview(tour.panellum_url || null)
        setIsLoading(false)
      } catch (err) {
        console.log(err)
        setError(err.response?.data?.error || 'Failed to load tour package')
        setIsLoading(false)
      }
    }
    fetchTour()
  }, [id, isEditMode])

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const checkAndEnableVisa = (selectedCountry) => {
    const countryName = selectedCountry?.value || ''
    const visaRequired = checkVisaRequirement(countryName)

    setFormData((prev) => ({
      ...prev,
      destination_country: countryName,
      visa_required: visaRequired,
      dates: prev.dates.map((date) => {
        if (visaRequired) {
          const hasVisaGroup = date.inclusion_groups?.some(
            (group) => group.category === 'Visa / Documentation'
          )

          if (!hasVisaGroup) {
            return {
              ...date,
              inclusion_groups: [
                ...(date.inclusion_groups || []),
                {
                  title: 'Visa / Documentation',
                  category: 'Visa / Documentation',
                  removable: false,
                  items: ['Visa processing assistance'],
                },
              ],
            }
          }
        }
        return date
      }),
    }))
  }

  const updateDateGroup = (index, field, value) => {
    setFormData((prev) => {
      const newDates = [...prev.dates]
      newDates[index][field] = value
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
              duplicatePricingFromPrevious && last ? last.rate_per_pax || 0 : 0,
            reservation_fee_per_pax:
              duplicatePricingFromPrevious && last
                ? last.reservation_fee_per_pax || 0
                : 0,
            total_slots:
              duplicatePricingFromPrevious && last ? last.total_slots || 0 : 0,
            available_slots:
              duplicatePricingFromPrevious && last ? last.total_slots || 0 : 0,
            inclusion_groups: [],
          }
        })(),
      ],
    }))
  }

  const removeDateGroup = (index) => {
    setFormData((prev) => {
      // Validate index
      if (index < 0 || index >= prev.dates.length) {
        console.warn('Invalid date index for removal:', index)
        return prev
      }

      const newDates = prev.dates.filter((_, i) => i !== index)

      // Clean up customFeeRules: remove rules for deleted date, adjust indices for dates after
      const newCustomFeeRules = (prev.customFeeRules || [])
        .filter((rule) => {
          // Remove rules that reference the deleted date
          return rule.dateIndex !== index
        })
        .map((rule) => {
          // Adjust dateIndex for rules that reference dates after the removed one
          if (rule.dateIndex !== undefined && rule.dateIndex > index) {
            return {
              ...rule,
              dateIndex: rule.dateIndex - 1,
            }
          }
          return rule
        })

      console.log('Removing date group at index:', index, {
        before: prev.dates.length,
        after: newDates.length,
        removedDateId: prev.dates[index]?.id,
      })

      return {
        ...prev,
        dates: newDates,
        customFeeRules: newCustomFeeRules,
      }
    })
  }

  const addCustomFeeRule = () => {
    setFormData((prev) => ({
      ...prev,
      customFeeRules: [
        ...(prev.customFeeRules || []),
        {
          dateIndex: undefined,
          perRemovedGroup: 0,
          perRestDay: 0,
          minFee: 0,
          maxFee: 0,
        },
      ],
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
      customFeeRules: prev.customFeeRules.filter((_, i) => i !== idx),
    }))
  }

  const addInclusionGroupForDate = (dateIdx) => {
    setFormData((prev) => {
      const newDates = [...prev.dates]
      const groups = [...(newDates[dateIdx].inclusion_groups || [])]
      groups.push({
        title: '',
        category: CATEGORY_OPTIONS[0],
        removable: true,
        items: [''],
      })
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

  const updateItinerary = (index, field, value) => {
    setFormData((prev) => {
      const newItineraries = [...prev.itineraries]
      newItineraries[index][field] = value

      if (field === 'day_number') {
        newItineraries.sort((a, b) => a.day_number - b.day_number)
      }

      return { ...prev, itineraries: newItineraries }
    })
  }

  const calculateTourDays = () => {
    if (!formData.dates[0]?.start_date || !formData.dates[0]?.end_date) {
      return 0
    }
    const start = new Date(formData.dates[0].start_date)
    const end = new Date(formData.dates[0].end_date)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    return days > 0 ? days : 0
  }

  const addMultipleItineraries = (count) => {
    if (count <= 0) return

    setFormData((prev) => {
      const maxDayNumber =
        prev.itineraries.length > 0
          ? Math.max(...prev.itineraries.map((it) => it.day_number || 0))
          : 0

      const newItineraries = []
      for (let i = 1; i <= count; i++) {
        newItineraries.push({
          day_number: maxDayNumber + i,
          title: '',
          description: '',
          image_url: '',
        })
      }

      return {
        ...prev,
        itineraries: [...prev.itineraries, ...newItineraries],
      }
    })
  }

  const addItinerary = () => {
    setFormData((prev) => {
      const maxDayNumber =
        prev.itineraries.length > 0
          ? Math.max(...prev.itineraries.map((it) => it.day_number || 0))
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
          },
        ],
      }
    })
  }

  const removeItinerary = (index) => {
    setFormData((prev) => {
      const newItineraries = prev.itineraries.filter((_, i) => i !== index)
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

  const uploadImageToImgBB = async (file, field) => {
    const maxSize = 10 * 1024 * 1024
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
      const errorMessage =
        error.response?.data?.error || error.message || 'Failed to upload image'
      showError(
        `Image upload failed: ${errorMessage}. Please check your file size (max 10MB) and format (JPEG, PNG, WebP only).`
      )
    }
  }

  const handleImageChange = (e, field) => {
    const file = e.target.files[0]
    if (file) {
      uploadImageToImgBB(file, field)
    }
  }

  const handleItineraryImageChange = (itinIndex, e) => {
    const file = e?.target?.files?.[0]
    if (!file) return
    uploadImageToImgBB(file, `itinerary_${itinIndex}`)
    setItineraryImagePreviews((prev) => ({
      ...prev,
      [itinIndex]: URL.createObjectURL(file),
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) return 'Title is required.'
    if (!formData.description.trim()) return 'Description is required.'
    if (!formData.destination_country || !formData.destination_country.trim())
      return 'Destination Country is required.'
    if (!formData.main_image_url) return 'Main Image is required.'
    if (!formData.panellum_url) return 'Panellum Image is required.'
    if (formData.dates.length === 0)
      return 'At least one date group is required.'
    for (const date of formData.dates) {
      if (!date.start_date) return 'Start Date is required for all date groups.'
      if (!date.end_date) return 'End Date is required for all date groups.'
      if (date.rate_per_pax <= 0) return 'Rate per Pax must be greater than 0.'
      if (!isEditMode && date.total_slots <= 0)
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
    const hasGroupedInclusions = (formData.dates || []).some(
      (d) =>
        Array.isArray(d.inclusion_groups) &&
        d.inclusion_groups.some(
          (g) =>
            Array.isArray(g.items) && g.items.some((it) => (it || '').trim())
        )
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

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      showError(validationError)
      return
    }
    setIsSubmitting(true)
    try {
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
        itineraries: formData.itineraries.map((it) => ({
          id: it.id || undefined,
          day_number: Number(it.day_number) || 0,
          title: it.title || '',
          description: it.description || '',
          image_url: it.image_url || '',
        })),
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
        })),
      }

      let tourId = id
      if (isEditMode) {
        await adminClient.put(`/tours/${id}`, payload)
      } else {
        const createRes = await adminClient.post('/tours/create', payload)
        tourId = createRes?.data?.tour?.id
      }

      if (tourId) {
        const tourRes = await adminClient.get(`/tours/${tourId}`)
        const createdDates = tourRes?.data?.dates || []

        for (let dIdx = 0; dIdx < formData.dates.length; dIdx++) {
          const createdDateId = createdDates[dIdx]?.id
          if (!createdDateId) continue

          const fr = formData.dates[dIdx].fee_rules
          if (fr) {
            await adminClient.put(`/tours/dates/${createdDateId}/fee-rules`, fr)
          }

          if (isEditMode) {
            try {
              const existingGroupsRes = await adminClient.get(
                `/tours/dates/${createdDateId}/inclusion-groups`
              )
              const existingGroups = Array.isArray(existingGroupsRes?.data)
                ? existingGroupsRes.data
                : []
              for (const eg of existingGroups) {
                if (eg && eg.id) {
                  await adminClient.delete(`/tours/inclusion-groups/${eg.id}`)
                }
              }
            } catch (error) {
              console.warn('Failed to reset inclusion groups:', error)
            }
          }

          const groups = formData.dates[dIdx].inclusion_groups || []
          for (const g of groups) {
            const title =
              g.category && g.category !== 'Custom…'
                ? g.category
                : g.title || ''
            if (!title) continue
            const groupRes = await adminClient.post(
              `/tours/dates/${createdDateId}/inclusion-groups`,
              {
                title,
                removable: g.removable !== false,
              }
            )
            const newGroupId = groupRes?.data?.id
            if (newGroupId) {
              for (const item of g.items || []) {
                const content = (item || '').trim()
                if (!content) continue
                await adminClient.post(
                  `/tours/inclusion-groups/${newGroupId}/items`,
                  {
                    content,
                  }
                )
              }
            }
          }
        }
      }

      showSuccess(
        `Tour package ${isEditMode ? 'updated' : 'created'} successfully!`
      )
      resetUnsavedChanges()
      navigate('/admin/tours')
    } catch (error) {
      console.error('Error saving tour:', error)
      showError(
        error.response?.data?.error ||
          `Failed to ${isEditMode ? 'update' : 'create'} tour package.`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackClick = () => {
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

  const scrollToSection = (sectionId) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  if (isLoading)
    return (
      <div className='tour-form__loading'>
        <div className='tour-form__loading-spinner'></div>
        <div className='tour-form__loading-text'>Loading tour package...</div>
      </div>
    )

  if (error) return <div className='tour-form__error'>{error}</div>

  return (
    <div className='tour-form'>
      {/* Header */}
      <div className='tour-form__header'>
        <div className='tour-form__header-left'>
          <button
            onClick={handleBackClick}
            className='tour-form__back-btn'
          >
            <IoChevronBack size={20} />
            <span>Back to Tours</span>
          </button>
          <h1 className='tour-form__title'>
            {isEditMode ? 'Edit Tour Package' : 'Create Tour Package'}
          </h1>
          {hasUnsavedChanges && (
            <span className='tour-form__unsaved-badge'>Unsaved Changes</span>
          )}
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className='tour-form__save-btn'
        >
          {isSubmitting ? 'Saving...' : 'Save Tour Package'}
        </button>
      </div>

      {/* Main Content */}
      <div className='tour-form__content'>
        {/* Sidebar Navigation */}
        <nav className='tour-form__sidebar'>
          <div className='tour-form__sidebar-inner'>
            <h3 className='tour-form__sidebar-title'>Sections</h3>
            <ul className='tour-form__sidebar-nav'>
              {[
                { id: 'general', label: 'General Info' },
                { id: 'dates', label: 'Dates & Pricing' },
                { id: 'fee-rules', label: 'Fee Rules' },
                { id: 'inclusions', label: 'Inclusions' },
                { id: 'itinerary', label: 'Itinerary' },
                { id: 'exclusions', label: 'Exclusions' },
                { id: 'payment-terms', label: 'Payment Terms' },
                { id: 'requirements', label: 'Requirements' },
                { id: 'notes', label: 'Notes' },
              ].map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`tour-form__sidebar-link ${
                      activeSection === section.id
                        ? 'tour-form__sidebar-link--active'
                        : ''
                    }`}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Form Sections */}
        <div className='tour-form__sections'>
          {/* General Information */}
          <section
            ref={(el) => (sectionRefs.current['general'] = el)}
            className='tour-form__section'
            id='general'
          >
            <h2 className='tour-form__section-title'>General Information</h2>
            <div className='tour-form__fields'>
              <div className='tour-form__field-group'>
                <label className='tour-form__label'>
                  Title <span className='tour-form__required'>*</span>
                </label>
                <input
                  type='text'
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className='tour-form__input'
                  placeholder='e.g., 7D5N Holy Land Tour Package'
                />
              </div>

              <div className='tour-form__field-group tour-form__field-group--full'>
                <label className='tour-form__label'>
                  Description <span className='tour-form__required'>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData('description', e.target.value)
                  }
                  className='tour-form__textarea'
                  rows='4'
                  placeholder='Provide a detailed description of the tour package...'
                />
              </div>

              <div className='tour-form__field-group'>
                <label className='tour-form__label'>
                  Main Image <span className='tour-form__required'>*</span>
                </label>
                <input
                  type='file'
                  accept='image/jpeg,image/png,image/gif,image/webp'
                  onChange={(e) => handleImageChange(e, 'main_image_url')}
                  className='tour-form__file-input'
                />
                {mainImagePreview && (
                  <img
                    src={mainImagePreview}
                    alt='Main Image Preview'
                    className='tour-form__image-preview'
                  />
                )}
              </div>

              <div className='tour-form__field-group'>
                <label className='tour-form__label'>
                  Panellum Image <span className='tour-form__required'>*</span>
                </label>
                <input
                  type='file'
                  accept='image/jpeg,image/png,image/gif,image/webp'
                  onChange={(e) => handleImageChange(e, 'panellum_url')}
                  className='tour-form__file-input'
                />
                {panellumImagePreview && (
                  <img
                    src={panellumImagePreview}
                    alt='Panellum Image Preview'
                    className='tour-form__image-preview'
                  />
                )}
              </div>

              <div className='tour-form__field-group'>
                <label className='tour-form__label'>
                  Destination Country{' '}
                  <span className='tour-form__required'>*</span>
                </label>
                <AsyncSelect
                  loadOptions={loadCountryOptions}
                  onChange={checkAndEnableVisa}
                  value={
                    formData.destination_country
                      ? {
                          value: formData.destination_country,
                          label: formData.destination_country,
                          requiresVisa: checkVisaRequirement(
                            formData.destination_country
                          ),
                        }
                      : null
                  }
                  styles={formSelectStyles}
                  placeholder='Search for a country...'
                  noOptionsMessage={() => 'No countries found'}
                  loadingMessage={() => 'Loading countries...'}
                  isClearable
                  isSearchable
                  cacheOptions
                  defaultOptions
                  formatOptionLabel={(option) => (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span>{option.label}</span>
                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        <span>{option.code}</span>
                        {option.requiresVisa && (
                          <span
                            style={{ color: '#e74c3c', fontWeight: 'bold' }}
                          >
                            VISA REQUIRED
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                />
                {formData.visa_required && (
                  <div className='tour-form__visa-notice'>
                    Visa processing will be automatically included for this
                    destination
                  </div>
                )}
              </div>

              <div className='tour-form__field-group'>
                <label className='tour-form__label'>
                  Status <span className='tour-form__required'>*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateFormData('status', e.target.value)}
                  className='tour-form__select'
                >
                  <option value='DRAFT'>Draft</option>
                  <option value='PUBLISHED'>Published</option>
                </select>
              </div>
            </div>
          </section>

          {/* Dates & Pricing */}
          <section
            ref={(el) => (sectionRefs.current['dates'] = el)}
            className='tour-form__section'
            id='dates'
          >
            <h2 className='tour-form__section-title'>Dates & Pricing</h2>
            <div className='tour-form__dates-list'>
              {formData.dates.map((dateGroup, index) => (
                <DateGroupCard
                  key={dateGroup.id || `date-${index}`}
                  index={index}
                  dateGroup={dateGroup}
                  updateDateGroup={updateDateGroup}
                  removeDateGroup={removeDateGroup}
                  isEditMode={isEditMode}
                />
              ))}
            </div>
            <div className='tour-form__actions'>
              <button
                onClick={() => addDateGroup(false)}
                className='tour-form__btn'
              >
                Add Date Group
              </button>
              <button
                onClick={() => addDateGroup(true)}
                className='tour-form__btn tour-form__btn--secondary'
              >
                Duplicate Last Date Group
              </button>
            </div>
          </section>

          {/* Fee Rules */}
          <section
            ref={(el) => (sectionRefs.current['fee-rules'] = el)}
            className='tour-form__section'
            id='fee-rules'
          >
            <h2 className='tour-form__section-title'>Fee Rules</h2>
            <FeeRulesSection
              formData={formData}
              updateFormData={updateFormData}
              addCustomFeeRule={addCustomFeeRule}
              updateCustomFeeRule={updateCustomFeeRule}
              removeCustomFeeRule={removeCustomFeeRule}
            />
          </section>

          {/* Inclusions */}
          <section
            ref={(el) => (sectionRefs.current['inclusions'] = el)}
            className='tour-form__section'
            id='inclusions'
          >
            <h2 className='tour-form__section-title'>Inclusions</h2>
            <InclusionsSection
              formData={formData}
              setFormData={setFormData}
              addInclusionGroupForDate={addInclusionGroupForDate}
              duplicateInclusionGroup={duplicateInclusionGroup}
              updateInclusionGroup={updateInclusionGroup}
              removeInclusionGroup={removeInclusionGroup}
              addInclusionGroupItem={addInclusionGroupItem}
              duplicateInclusionItem={duplicateInclusionItem}
              updateInclusionGroupItem={updateInclusionGroupItem}
              removeInclusionGroupItem={removeInclusionGroupItem}
              categoryOptions={CATEGORY_OPTIONS}
            />
          </section>

          {/* Itinerary */}
          <section
            ref={(el) => (sectionRefs.current['itinerary'] = el)}
            className='tour-form__section'
            id='itinerary'
          >
            <h2 className='tour-form__section-title'>Itinerary</h2>

            {/* Helper Text */}
            {(() => {
              const tourDays = calculateTourDays()
              const currentItineraryCount = formData.itineraries.length
              const hasDateRange =
                formData.dates[0]?.start_date && formData.dates[0]?.end_date

              if (hasDateRange && tourDays > 0) {
                const startDate = new Date(
                  formData.dates[0].start_date
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
                const endDate = new Date(
                  formData.dates[0].end_date
                ).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })

                return (
                  <div className='tour-form__itinerary-helper'>
                    <div className='tour-form__itinerary-info'>
                      <span className='tour-form__itinerary-badge'>
                        {tourDays} {tourDays === 1 ? 'Day' : 'Days'}
                      </span>
                      <span className='tour-form__itinerary-dates'>
                        {startDate} - {endDate}
                      </span>
                      {currentItineraryCount > 0 && (
                        <span className='tour-form__itinerary-count'>
                          ({currentItineraryCount}{' '}
                          {currentItineraryCount === 1
                            ? 'itinerary'
                            : 'itineraries'}{' '}
                          added)
                        </span>
                      )}
                    </div>
                  </div>
                )
              }
              return null
            })()}

            <div className='tour-form__itinerary-list'>
              {formData.itineraries.map((itinerary, itinIndex) => (
                <ItineraryCard
                  key={itinerary.id || `itinerary-${itinIndex}`}
                  itinIndex={itinIndex}
                  itinerary={itinerary}
                  updateItinerary={updateItinerary}
                  removeItinerary={removeItinerary}
                  handleItineraryImageChange={handleItineraryImageChange}
                  itineraryImagePreviews={itineraryImagePreviews}
                  canRemove={formData.itineraries.length > 1}
                />
              ))}
            </div>

            <div className='tour-form__itinerary-actions'>
              {(() => {
                const tourDays = calculateTourDays()
                const remainingDays = tourDays - formData.itineraries.length

                if (tourDays > 0 && remainingDays > 0) {
                  return (
                    <button
                      onClick={() => addMultipleItineraries(remainingDays)}
                      className='tour-form__btn tour-form__btn--primary'
                    >
                      Add Remaining {remainingDays}{' '}
                      {remainingDays === 1 ? 'Day' : 'Days'}
                    </button>
                  )
                }
                return null
              })()}
              <button
                onClick={addItinerary}
                className='tour-form__btn'
              >
                Add Single Day
              </button>
            </div>
          </section>

          {/* Exclusions */}
          <section
            ref={(el) => (sectionRefs.current['exclusions'] = el)}
            className='tour-form__section'
            id='exclusions'
          >
            <h2 className='tour-form__section-title'>Exclusions</h2>
            <SimpleListSection
              items={formData.exclusions}
              updateItem={updateExclusion}
              addItem={addExclusion}
              removeItem={removeExclusion}
              placeholder='e.g., Hotel quarantine if required'
              label='Exclusion'
            />
          </section>

          {/* Payment Terms */}
          <section
            ref={(el) => (sectionRefs.current['payment-terms'] = el)}
            className='tour-form__section'
            id='payment-terms'
          >
            <h2 className='tour-form__section-title'>Payment Terms</h2>
            <SimpleListSection
              items={formData.payment_terms}
              updateItem={updatePaymentTerm}
              addItem={addPaymentTerm}
              removeItem={removePaymentTerm}
              placeholder='e.g., Reservation fee: PHP 30,000'
              label='Payment Term'
            />
          </section>

          {/* Requirements */}
          <section
            ref={(el) => (sectionRefs.current['requirements'] = el)}
            className='tour-form__section'
            id='requirements'
          >
            <h2 className='tour-form__section-title'>Requirements</h2>
            <SimpleListSection
              items={formData.requirements}
              updateItem={updateRequirement}
              addItem={addRequirement}
              removeItem={removeRequirement}
              placeholder='e.g., Full vaccination'
              label='Requirement'
            />
          </section>

          {/* Notes */}
          <section
            ref={(el) => (sectionRefs.current['notes'] = el)}
            className='tour-form__section'
            id='notes'
          >
            <h2 className='tour-form__section-title'>Notes</h2>
            <SimpleListSection
              items={formData.notes}
              updateItem={updateNote}
              addItem={addNote}
              removeItem={removeNote}
              placeholder='e.g., Illegal entry subject to deportation'
              label='Note'
            />
          </section>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className='tour-form__save-bar'>
        <div className='tour-form__save-bar-inner'>
          <button
            onClick={handleBackClick}
            className='tour-form__btn tour-form__btn--secondary'
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='tour-form__save-btn'
          >
            {isSubmitting ? 'Saving...' : 'Save Tour Package'}
          </button>
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        title='Unsaved Changes'
        message='You have unsaved changes. Are you sure you want to leave without saving?'
        confirmText='Leave Without Saving'
        cancelText='Stay on Page'
      />
    </div>
  )
}

export default TourPackageForm
