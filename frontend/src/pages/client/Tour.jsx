import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Tour.css'
import PrimaryButton from '../../components/client/PrimaryButton'

function Tour() {
    const { state } = useLocation()
    const [tour, setTour] = useState([])
    const [selectedDateId, setSelectedDateId] = useState(null)
    const [showFullDescription, setShowFullDescription] = useState(false)
    const [passengers, setPassengers] = useState(1)
    const [openSections, setOpenSections] = useState({
        inclusions: false,
        exclusions: false,
        notes: false,
        payment_terms: false,
        requirements: false,
        itineraries: false,
    })

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await axios.get(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/api/v1/destinations/tour/${state.id}`
                )
                setTour(response.data)
            } catch (error) {
                console.log(error)
            }
        }
        fetchTour()
    }, [state.id])

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription)
    }

    const handleDateClick = (dateId) => {
        setSelectedDateId(selectedDateId === dateId ? null : dateId)
        setPassengers(1) // Reset passengers when changing date
    }

    const toggleSection = (section) => {
        setOpenSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }))
    }

    const shortenDescription = (text, maxLength = 100) => {
        if (!text || text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }

    const navigate = useNavigate()
    const handleBookClick = () => {
        const selectedDate = tour.dates?.find(
            (date) => date.id === selectedDateId
        )
        navigate(`booking`, {
            state: { ...tour, selectedDateId, passengers, selectedDate },
        })
    }

    const handlePassengerChange = (e) => {
        const selectedDate = tour.dates?.find(
            (date) => date.id === selectedDateId
        )
        const maxPassengers = selectedDate?.available_slots || 1
        let value = parseInt(e.target.value, 10)
        if (isNaN(value)) value = 1
        if (value < 1) value = 1
        if (value > maxPassengers) value = maxPassengers
        setPassengers(value)
    }

    return (
        <div className='tour-container'>
            <div className='tour-card'>
                {tour.main_image_url && (
                    <img
                        className='tour-card__image'
                        src={tour.main_image_url}
                        alt={tour.title || 'Tour Image'}
                    />
                )}
                <div className='tour-card__content'>
                    <div className='tour-card__header'>
                        <h1 className='tour-card__title'>
                            {tour.title || 'Tour Title'}
                        </h1>
                    </div>
                    <p className='tour-card__description'>
                        {showFullDescription
                            ? tour.description || 'No description available.'
                            : shortenDescription(tour.description)}
                        {tour.description && tour.description.length > 100 && (
                            <button
                                className='tour-card__description-toggle'
                                onClick={toggleDescription}
                            >
                                {showFullDescription ? 'See Less' : 'See More'}
                            </button>
                        )}
                    </p>
                    {tour.dates && tour.dates.length > 0 && (
                        <div className='tour-card__section'>
                            <h2 className='tour-card__section-title'>
                                Available Dates
                            </h2>
                            <div className='tour-card__date-buttons'>
                                {tour.dates.map((date, index) => (
                                    <button
                                        key={date.id}
                                        className={`tour-card__date-button ${
                                            selectedDateId === date.id
                                                ? 'tour-card__date-button--active'
                                                : ''
                                        }`}
                                        onClick={() => handleDateClick(date.id)}
                                    >
                                        Option {index + 1}:{' '}
                                        {new Date(
                                            date.start_date
                                        ).toLocaleDateString()}{' '}
                                        -{' '}
                                        {new Date(
                                            date.end_date
                                        ).toLocaleDateString()}
                                    </button>
                                ))}
                            </div>
                            {selectedDateId &&
                                tour.dates
                                    .filter(
                                        (date) => date.id === selectedDateId
                                    )
                                    .map((date) => (
                                        <div
                                            key={date.id}
                                            className='tour-card__date-details'
                                        >
                                            <div className='tour-card__detail'>
                                                <span className='tour-card__detail-label'>
                                                    Rate per Pax:
                                                </span>
                                                <span className='tour-card__detail-value'>
                                                    {date.rate_per_pax
                                                        ? `PHP ${date.rate_per_pax.toLocaleString()}`
                                                        : 'N/A'}
                                                </span>
                                            </div>
                                            <div className='tour-card__detail'>
                                                <span className='tour-card__detail-label'>
                                                    Available Slots:
                                                </span>
                                                <span className='tour-card__detail-value'>
                                                    {date.available_slots ??
                                                        'N/A'}
                                                </span>
                                            </div>
                                            <div className='tour-card__detail'>
                                                <span className='tour-card__detail-label'>
                                                    Total Slots:
                                                </span>
                                                <span className='tour-card__detail-value'>
                                                    {date.total_slots ?? 'N/A'}
                                                </span>
                                            </div>
                                            <div className='tour-card__detail'>
                                                <span className='tour-card__detail-label'>
                                                    Number of Passengers:
                                                </span>
                                                <input
                                                    type='number'
                                                    value={passengers}
                                                    onChange={
                                                        handlePassengerChange
                                                    }
                                                    min='1'
                                                    max={date.available_slots}
                                                    className='tour-card__passenger-input'
                                                />
                                            </div>
                                            {date.inclusions &&
                                                date.inclusions.length > 0 && (
                                                    <div className='tour-card__accordion'>
                                                        <button
                                                            className='tour-card__accordion-toggle'
                                                            onClick={() =>
                                                                toggleSection(
                                                                    'inclusions'
                                                                )
                                                            }
                                                        >
                                                            Inclusions
                                                            <span
                                                                className={`tour-card__accordion-icon ${
                                                                    openSections.inclusions
                                                                        ? 'tour-card__accordion-icon--open'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {openSections.inclusions
                                                                    ? '−'
                                                                    : '+'}
                                                            </span>
                                                        </button>
                                                        {openSections.inclusions && (
                                                            <div className='tour-card__accordion-content'>
                                                                <ul className='tour-card__list-items'>
                                                                    {date.inclusions.map(
                                                                        (
                                                                            item,
                                                                            i
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className='tour-card__list-item'
                                                                            >
                                                                                {
                                                                                    item
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            {date.exclusions &&
                                                date.exclusions.length > 0 && (
                                                    <div className='tour-card__accordion'>
                                                        <button
                                                            className='tour-card__accordion-toggle'
                                                            onClick={() =>
                                                                toggleSection(
                                                                    'exclusions'
                                                                )
                                                            }
                                                        >
                                                            Exclusions
                                                            <span
                                                                className={`tour-card__accordion-icon ${
                                                                    openSections.exclusions
                                                                        ? 'tour-card__accordion-icon--open'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {openSections.exclusions
                                                                    ? '−'
                                                                    : '+'}
                                                            </span>
                                                        </button>
                                                        {openSections.exclusions && (
                                                            <div className='tour-card__accordion-content'>
                                                                <ul className='tour-card__list-items'>
                                                                    {date.exclusions.map(
                                                                        (
                                                                            item,
                                                                            i
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className='tour-card__list-item'
                                                                            >
                                                                                {
                                                                                    item
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            {date.notes &&
                                                date.notes.length > 0 && (
                                                    <div className='tour-card__accordion'>
                                                        <button
                                                            className='tour-card__accordion-toggle'
                                                            onClick={() =>
                                                                toggleSection(
                                                                    'notes'
                                                                )
                                                            }
                                                        >
                                                            Notes
                                                            <span
                                                                className={`tour-card__accordion-icon ${
                                                                    openSections.notes
                                                                        ? 'tour-card__accordion-icon--open'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {openSections.notes
                                                                    ? '−'
                                                                    : '+'}
                                                            </span>
                                                        </button>
                                                        {openSections.notes && (
                                                            <div className='tour-card__accordion-content'>
                                                                <ul className='tour-card__list-items'>
                                                                    {date.notes.map(
                                                                        (
                                                                            item,
                                                                            i
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className='tour-card__list-item'
                                                                            >
                                                                                {
                                                                                    item
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            {date.payment_terms &&
                                                date.payment_terms.length >
                                                    0 && (
                                                    <div className='tour-card__accordion'>
                                                        <button
                                                            className='tour-card__accordion-toggle'
                                                            onClick={() =>
                                                                toggleSection(
                                                                    'payment_terms'
                                                                )
                                                            }
                                                        >
                                                            Payment Terms
                                                            <span
                                                                className={`tour-card__accordion-icon ${
                                                                    openSections.payment_terms
                                                                        ? 'tour-card__accordion-icon--open'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {openSections.payment_terms
                                                                    ? '−'
                                                                    : '+'}
                                                            </span>
                                                        </button>
                                                        {openSections.payment_terms && (
                                                            <div className='tour-card__accordion-content'>
                                                                <ul className='tour-card__list-items'>
                                                                    {date.payment_terms.map(
                                                                        (
                                                                            item,
                                                                            i
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className='tour-card__list-item'
                                                                            >
                                                                                {
                                                                                    item
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            {date.requirements &&
                                                date.requirements.length >
                                                    0 && (
                                                    <div className='tour-card__accordion'>
                                                        <button
                                                            className='tour-card__accordion-toggle'
                                                            onClick={() =>
                                                                toggleSection(
                                                                    'requirements'
                                                                )
                                                            }
                                                        >
                                                            Requirements
                                                            <span
                                                                className={`tour-card__accordion-icon ${
                                                                    openSections.requirements
                                                                        ? 'tour-card__accordion-icon--open'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {openSections.requirements
                                                                    ? '−'
                                                                    : '+'}
                                                            </span>
                                                        </button>
                                                        {openSections.requirements && (
                                                            <div className='tour-card__accordion-content'>
                                                                <ul className='tour-card__list-items'>
                                                                    {date.requirements.map(
                                                                        (
                                                                            item,
                                                                            i
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    i
                                                                                }
                                                                                className='tour-card__list-item'
                                                                            >
                                                                                {
                                                                                    item
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            {date.itineraries &&
                                                date.itineraries.length > 0 && (
                                                    <div className='tour-card__accordion'>
                                                        <button
                                                            className='tour-card__accordion-toggle'
                                                            onClick={() =>
                                                                toggleSection(
                                                                    'itineraries'
                                                                )
                                                            }
                                                        >
                                                            Itinerary
                                                            <span
                                                                className={`tour-card__accordion-icon ${
                                                                    openSections.itineraries
                                                                        ? 'tour-card__accordion-icon--open'
                                                                        : ''
                                                                }`}
                                                            >
                                                                {openSections.itineraries
                                                                    ? '−'
                                                                    : '+'}
                                                            </span>
                                                        </button>
                                                        {openSections.itineraries && (
                                                            <div className='tour-card__accordion-content'>
                                                                <ul className='tour-card__list-items'>
                                                                    {date.itineraries.map(
                                                                        (
                                                                            item
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    item.id
                                                                                }
                                                                                className='tour-card__list-item'
                                                                            >
                                                                                Day{' '}
                                                                                {
                                                                                    item.day_number
                                                                                }
                                                                                :{' '}
                                                                                {
                                                                                    item.title
                                                                                }
                                                                            </li>
                                                                        )
                                                                    )}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            <PrimaryButton
                                                onClick={handleBookClick}
                                                className='tour-card__btn'
                                                buttonText='Book Now'
                                                disabled={
                                                    !date.available_slots ||
                                                    passengers === 0
                                                }
                                            />
                                        </div>
                                    ))}
                        </div>
                    )}
                    {tour.panellum_url && (
                        <div className='tour-card__virtual-tour'>
                            <h2 className='tour-card__virtual-tour-title'>
                                Virtual Tour Preview
                            </h2>
                            <img
                                className='tour-card__virtual-tour-image'
                                src={tour.panellum_url}
                                alt='Virtual Tour Preview'
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Tour
