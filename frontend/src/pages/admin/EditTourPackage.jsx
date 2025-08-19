import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IoChevronBack } from 'react-icons/io5'
import AdminPrimaryButton from '../../components/admin/AdminPrimaryButton'
import adminClient from '../../api/adminClient.js'
import './EditTourPackage.css'
import { AccordionSection, DateGroup } from './CreateTourPackage.jsx'

function EditTourPackage() {
    const { id } = useParams()
    const navigate = useNavigate()
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
                setFormData({
                    title: tour.title || '',
                    description: tour.description || '',
                    main_image_url: tour.main_image_url || '',
                    panellum_url: tour.panellum_url || '',
                    status: tour.status || 'DRAFT',
                    dates: tour.dates.map((date) => ({
                        id: date.id,
                        tour_package_id: date.tour_package_id,
                        start_date: date.start_date || '',
                        end_date: date.end_date || '',
                        rate_per_pax: date.rate_per_pax || 0,
                        reservation_fee_per_pax:
                            date.reservation_fee_per_pax || null,
                        total_slots: date.total_slots || 0,
                        available_slots: date.available_slots || 0,
                        inclusions: date.inclusions || [''],
                        exclusions: date.exclusions || [''],
                        payment_terms: date.payment_terms || [''],
                        requirements: date.requirements || [''],
                        notes: date.notes || [''],
                    })),
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

    const addDateGroup = () => {
        setFormData((prev) => ({
            ...prev,
            dates: [
                ...prev.dates,
                {
                    start_date: '',
                    end_date: '',
                    rate_per_pax: 0,
                    reservation_fee_per_pax: null,
                    total_slots: 0,
                    available_slots: 0,
                    inclusions: [''],
                    exclusions: [''],
                    payment_terms: [''],
                    requirements: [''],
                    notes: [''],
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

    if (isLoading) return <div className='tour-edit__loading'>Loading...</div>
    if (error) return <div className='tour-edit__error'>{error}</div>

    return (
        <div className='tour-edit'>
            <div className='tour-edit__header'>
                <div
                    onClick={handleBackClick}
                    className='tour-edit__header-back-button'
                >
                    <IoChevronBack size={24} />
                    <p className='tour-edit__header-back-text'>Back to Tours</p>
                </div>
            </div>

            <AccordionSection
                title='General Information'
                isOpen={openSections.general}
                toggle={() => toggleSection('general')}
            >
                <div className='tour-edit__form-fields'>
                    <div className='tour-edit__form-field'>
                        <label className='tour-edit__label'>Title *</label>
                        <input
                            type='text'
                            value={formData.title}
                            onChange={(e) =>
                                updateFormData('title', e.target.value)
                            }
                            className='tour-edit__input'
                            required
                        />
                    </div>
                    <div className='tour-edit__form-field'>
                        <label className='tour-edit__label'>
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                updateFormData('description', e.target.value)
                            }
                            className='tour-edit__textarea'
                            rows='4'
                            required
                        />
                    </div>
                    <div className='tour-edit__form-field'>
                        <label className='tour-edit__label'>Main Image *</label>
                        <input
                            type='file'
                            accept='image/jpeg,image/png,image/gif,image/webp'
                            onChange={(e) =>
                                handleImageChange(e, 'main_image_url')
                            }
                            className='tour-edit__input'
                        />
                        {mainImagePreview && (
                            <img
                                src={mainImagePreview}
                                alt='Main Image Preview'
                                className='tour-edit__image-preview'
                            />
                        )}
                    </div>
                    <div className='tour-edit__form-field'>
                        <label className='tour-edit__label'>
                            Panellum Image *
                        </label>
                        <input
                            type='file'
                            accept='image/jpeg,image/png,image/gif,image/webp'
                            onChange={(e) =>
                                handleImageChange(e, 'panellum_url')
                            }
                            className='tour-edit__input'
                        />
                        {panellumImagePreview && (
                            <img
                                src={panellumImagePreview}
                                alt='Panellum Image Preview'
                                className='tour-edit__image-preview'
                            />
                        )}
                    </div>
                    <div className='tour-edit__form-field'>
                        <label className='tour-edit__label'>Status *</label>
                        <select
                            value={formData.status}
                            onChange={(e) =>
                                updateFormData('status', e.target.value)
                            }
                            className='tour-edit__select'
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
                <div className='tour-edit__form-fields'>
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
                    <button
                        onClick={addDateGroup}
                        className='tour-edit__button-link'
                    >
                        + Add another travel date
                    </button>
                </div>
            </AccordionSection>

            <AccordionSection
                title='Itinerary'
                isOpen={openSections.itinerary}
                toggle={() => toggleSection('itinerary')}
            >
                <div className='tour-edit__form-fields'>
                    {formData.itineraries.map((itinerary, itinIndex) => (
                        <div
                            key={itinerary.id || `itinerary-${itinIndex}`}
                            className='tour-edit__itinerary-day'
                        >
                            <div className='tour-edit__form-field'>
                                <label className='tour-edit__label'>
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
                                    className='tour-edit__input'
                                    min='1'
                                    required
                                />
                            </div>
                            <div className='tour-edit__form-field'>
                                <label className='tour-edit__label'>
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
                                    className='tour-edit__input'
                                    required
                                    placeholder='e.g., Arrival to Amman'
                                />
                            </div>
                            <div className='tour-edit__form-field'>
                                <label className='tour-edit__label'>
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
                                    className='tour-edit__textarea'
                                    rows='3'
                                    required
                                    placeholder='e.g., Airport pickup, transfer to hotel'
                                />
                            </div>
                            {formData.itineraries.length > 1 && (
                                <button
                                    onClick={() => removeItinerary(itinIndex)}
                                    className='tour-edit__button-link tour-edit__button-link--remove'
                                >
                                    Remove Itinerary
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addItinerary}
                        className='tour-edit__button-link'
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
                <div className='tour-edit__form-fields'>
                    {formData.inclusions.map((inclusion, incIndex) => (
                        <div
                            key={`inclusion-${incIndex}`}
                            className='tour-edit__inclusions-item'
                        >
                            <div className='tour-edit__form-field'>
                                <label className='tour-edit__label'>
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
                                    className='tour-edit__input'
                                    required
                                    placeholder='e.g., Round trip airfare'
                                />
                            </div>
                            {formData.inclusions.length > 1 && (
                                <button
                                    onClick={() => removeInclusion(incIndex)}
                                    className='tour-edit__button-link tour-edit__button-link--remove'
                                >
                                    Remove Inclusion
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addInclusion}
                        className='tour-edit__button-link'
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
                <div className='tour-edit__form-fields'>
                    {formData.exclusions.map((exclusion, excIndex) => (
                        <div
                            key={`exclusion-${excIndex}`}
                            className='tour-edit__exclusions-item'
                        >
                            <div className='tour-edit__form-field'>
                                <label className='tour-edit__label'>
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
                                    className='tour-edit__input'
                                    required
                                    placeholder='e.g., Hotel quarantine if required'
                                />
                            </div>
                            {formData.exclusions.length > 1 && (
                                <button
                                    onClick={() => removeExclusion(excIndex)}
                                    className='tour-edit__button-link tour-edit__button-link--remove'
                                >
                                    Remove Exclusion
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addExclusion}
                        className='tour-edit__button-link'
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
                <div className='tour-edit__form-fields'>
                    {formData.payment_terms.map((term, termIndex) => (
                        <div
                            key={`payment-term-${termIndex}`}
                            className='tour-edit__payment-terms-item'
                        >
                            <div className='tour-edit__form-field'>
                                <label className='tour-edit__label'>
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
                                    className='tour-edit__input'
                                    required
                                    placeholder='e.g., Reservation fee: PHP 30,000'
                                />
                            </div>
                            {formData.payment_terms.length > 1 && (
                                <button
                                    onClick={() => removePaymentTerm(termIndex)}
                                    className='tour-edit__button-link tour-edit__button-link--remove'
                                >
                                    Remove Payment Term
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addPaymentTerm}
                        className='tour-edit__button-link'
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
                <div className='tour-edit__form-fields'>
                    {formData.requirements.map((requirement, reqIndex) => (
                        <div
                            key={`requirement-${reqIndex}`}
                            className='tour-edit__requirements-item'
                        >
                            <div className='tour-edit__form-field'>
                                <label className='tour-edit__label'>
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
                                    className='tour-edit__input'
                                    required
                                    placeholder='e.g., Full vaccination'
                                />
                            </div>
                            {formData.requirements.length > 1 && (
                                <button
                                    onClick={() => removeRequirement(reqIndex)}
                                    className='tour-edit__button-link tour-edit__button-link--remove'
                                >
                                    Remove Requirement
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addRequirement}
                        className='tour-edit__button-link'
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
                <div className='tour-edit__form-fields'>
                    {formData.notes.map((note, noteIndex) => (
                        <div
                            key={`note-${noteIndex}`}
                            className='tour-edit__notes-item'
                        >
                            <div className='tour-edit__form-field'>
                                <label className='tour-edit__label'>
                                    Note *
                                </label>
                                <input
                                    type='text'
                                    value={note}
                                    onChange={(e) =>
                                        updateNote(noteIndex, e.target.value)
                                    }
                                    className='tour-edit__input'
                                    required
                                    placeholder='e.g., Illegal entry subject to deportation'
                                />
                            </div>
                            {formData.notes.length > 1 && (
                                <button
                                    onClick={() => removeNote(noteIndex)}
                                    className='tour-edit__button-link tour-edit__button-link--remove'
                                >
                                    Remove Note
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addNote}
                        className='tour-edit__button-link'
                    >
                        + Add another note
                    </button>
                </div>
            </AccordionSection>

            <AdminPrimaryButton
                className='tour-edit__button-save'
                buttonText='Save'
                onClick={handleSubmit}
                disabled={isSubmitting}
            />
        </div>
    )
}

export default EditTourPackage
