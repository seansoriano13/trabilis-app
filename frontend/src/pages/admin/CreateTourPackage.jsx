import { useState } from 'react'
import { IoChevronBack, IoChevronDown, IoChevronUp } from 'react-icons/io5'
import adminClient from '../../api/adminClient.js'
import axios from 'axios'
import './CreateTourPackage.css'
import { useNavigate } from 'react-router-dom'

const AdminPrimaryButton = ({ buttonText, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className='admin-primary-button'
    >
        {buttonText}
    </button>
)

export const AccordionSection = ({ title, isOpen, toggle, children }) => (
    <div className='accordion-section'>
        <button
            className='accordion-section__button'
            onClick={toggle}
        >
            <span className='accordion-section__title'>{title}</span>
            {isOpen ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
        </button>
        {isOpen && <div className='accordion-section__content'>{children}</div>}
    </div>
)

export const DateGroup = ({
    index,
    dateGroup,
    updateDateGroup,
    removeDateGroup,
    autofillDateGroup,
}) => (
    <div className='date-group'>
        <h3 className='date-group__title'>Date Group {index + 1}</h3>
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
            {index > 0 && (
                <button
                    onClick={() => removeDateGroup(index)}
                    className='button-link button-link--remove'
                >
                    Remove Date Group
                </button>
            )}
            {/* {index > 0 && (
                <button
                    onClick={() => autofillDateGroup(index)}
                    className='button-link'
                >
                    Autofill from Previous
                </button>
            )} */}
        </div>
    </div>
)

function CreateTourPackage() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'DRAFT',
        main_image_url: '',
        panellum_url: '',
        dates: [
            {
                start_date: '',
                end_date: '',
                rate_per_pax: 0,
                total_slots: 0,
                available_slots: 0,
            },
        ],
        itineraries: [{ day_number: 1, title: '', description: '' }],
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
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [mainImagePreview, setMainImagePreview] = useState(null)
    const [panellumImagePreview, setPanellumImagePreview] = useState(null)
    const navigate = useNavigate()

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
            newDates[index] = { ...newDates[index], [field]: value }
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
                    total_slots: 0,
                    available_slots: 0,
                },
            ],
        }))
    }

    const autofillDateGroup = (index) => {
        setFormData((prev) => {
            const newDates = [...prev.dates]
            const prevDateGroup = prev.dates[index - 1]
            newDates[index] = {
                ...newDates[index],
                start_date: prevDateGroup.start_date,
                end_date: prevDateGroup.end_date,
                rate_per_pax: prevDateGroup.rate_per_pax,
                total_slots: prevDateGroup.total_slots,
                available_slots: prevDateGroup.total_slots,
            }
            return { ...prev, dates: newDates }
        })
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
                    { day_number: nextDay, title: '', description: '' },
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

    const updateInclusion = (incIndex, value) => {
        setFormData((prev) => {
            const newInclusions = [...prev.inclusions]
            newInclusions[incIndex] = value
            return { ...prev, inclusions: newInclusions }
        })
    }

    const addInclusion = () => {
        setFormData((prev) => ({
            ...prev,
            inclusions: [...prev.inclusions, ''],
        }))
    }

    const removeInclusion = (incIndex) => {
        setFormData((prev) => ({
            ...prev,
            inclusions: prev.inclusions.filter(
                (_, index) => index !== incIndex
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
                `${import.meta.env.VITE_IMG_BB_API_URL}?key=${
                    import.meta.env.VITE_IMG_BB_API_KEY
                }`,
                formData
            )
            const imageUrl = response.data.data.url
            updateFormData(field, imageUrl)
            if (field === 'main_image_url') {
                setMainImagePreview(URL.createObjectURL(file))
            } else if (field === 'panellum_url') {
                setPanellumImagePreview(URL.createObjectURL(file))
            }
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Failed to upload image to ImgBB.')
        }
    }

    const handleImageChange = (e, field) => {
        const file = e.target.files[0]
        if (file) {
            uploadImageToImgBB(file, field)
        }
    }

    const validateForm = () => {
        if (!formData.title.trim()) return 'Title is required.'
        if (!formData.description.trim()) return 'Description is required.'
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
        if (
            formData.inclusions.length === 0 ||
            formData.inclusions.every((inc) => !inc.trim())
        )
            return 'At least one non-empty inclusion is required.'
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
            alert(validationError)
            return
        }
        setIsSubmitting(true)
        try {
            const payload = {
                ...formData,
                dates: formData.dates.map((date) => ({
                    ...date,
                    itineraries: formData.itineraries,
                    inclusions: formData.inclusions,
                    exclusions: formData.exclusions,
                    payment_terms: formData.payment_terms,
                    requirements: formData.requirements,
                    notes: formData.notes,
                })),
            }
            await adminClient.post('/tours/create', payload)
            alert('Tour package created successfully!')
            navigate('/admin/tours')
        } catch (error) {
            console.error('Error creating tour:', error)
            alert('Failed to create tour package.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBackClick = () => {
        navigate('/admin/tours')
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
                            autofillDateGroup={autofillDateGroup}
                        />
                    ))}
                    <button
                        onClick={addDateGroup}
                        className='button-link'
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
                            key={incIndex}
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
        </div>
    )
}

export default CreateTourPackage
