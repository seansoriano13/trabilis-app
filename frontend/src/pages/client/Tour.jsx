import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IoIosArrowUp } from 'react-icons/io'
import { IoIosArrowDown } from 'react-icons/io'
import { FaCheck } from 'react-icons/fa6'
import axios from 'axios'
import './Tour.css'
import PrimaryButton from '../../components/client/PrimaryButton'
import { formatToLongDate } from '../../utils/flightUtils.js'

function Tour() {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    const { state } = useLocation()
    const [tour, setTour] = useState([])
    const [showFullDescription, setShowFullDescription] = useState(false)
    const [isDescHidden, setIsDescHidden] = useState({})
    const [selectedTab, setSelectedTab] = useState('inclusions')
    const [selectedDateId, setSelectedDateId] = useState(0)
    const [passengers, setPassengers] = useState({
        adults: 1,
        children: 0,
    })

    const tourDates = tour.dates || []
    const selectedDate = tourDates.find((date) => date.id === selectedDateId)

    useEffect(() => {
        const fetchTour = async () => {
            try {
                const response = await axios.get(
                    `${
                        import.meta.env.VITE_BACKEND_URL
                    }/api/v1/destinations/tour/${state.id}`
                )
                setTour(response.data)
                if (response.data.dates && response.data.dates.length > 0) {
                    setSelectedDateId(response.data.dates[0].id)
                }
            } catch (error) {
                console.log(error)
            }
        }
        fetchTour()
    }, [state.id])

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription)
    }

    const shortenDescription = (text, maxLength = 100) => {
        if (!text || text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }

    const handleCardClose = (id) => {
        setIsDescHidden((prev) => ({ ...prev, [id]: !prev[id] }))
    }

    const handleDateClick = (dateId) => {
        setSelectedDateId(selectedDateId === dateId ? null : dateId)
        setPassengers({ adults: 1, children: 0 })
    }

    const navigate = useNavigate()

    const handleBookClick = () => {
        navigate('booking', {
            state: {
                ...tour,
                selectedDateId,
                passengers,
                selectedDate,
                title: tour.title,
            },
        })
    }

    const availableSlots = selectedDate?.available_slots ?? 'Select a Date'

    const availableDates = tour?.dates?.map((date) => (
        <button
            key={date.id}
            onClick={() => handleDateClick(date.id)}
            className={`text-gray-800 text-sm border border-gray-400 rounded-sm p-2 cursor-pointer ${
                selectedDateId === date.id && 'bg-[#f7d100] text-black border-0'
            }`}
        >
            {`${formatToLongDate(date.start_date)} - ${formatToLongDate(
                date.end_date
            )}`}
        </button>
    ))

    const itineraries = selectedDate?.itineraries?.map((itinerary) => {
        const isCollapsed = isDescHidden[itinerary.id]
        return (
            <div
                key={itinerary.id}
                className='text-sm'
            >
                <div className='relative grid gap-4 border border-gray-400 rounded-xl px-6 py-4 shadow-md'>
                    <div className='text-gray-500'>
                        Day {itinerary.day_number}
                    </div>
                    <div className='font-bold'>{itinerary.title}</div>
                    <button
                        onClick={() => handleCardClose(itinerary.id)}
                        className='cursor-pointer'
                    >
                        <div className='absolute top-4 right-4 text-gray-500 text-2xl'>
                            {isCollapsed ? (
                                <IoIosArrowDown />
                            ) : (
                                <IoIosArrowUp />
                            )}
                        </div>
                    </button>
                    <div className={isCollapsed ? 'hidden' : ''}>
                        {itinerary.description}
                    </div>
                </div>
            </div>
        )
    })

    const inclusions = selectedDate?.inclusions?.map((inclusion, idx) =>
        inclusion?.trim() ? (
            <div
                key={idx}
                className='flex items-center gap-1'
            >
                <FaCheck className='text-green-700' />
                <div className='text-sm'>{inclusion}</div>
            </div>
        ) : null
    )

    const exclusions = selectedDate?.exclusions?.map((exclusion, idx) => (
        <div
            key={idx}
            className='flex items-center gap-1'
        >
            <FaCheck className='text-green-700' />
            <div className='text-sm'>{exclusion}</div>
        </div>
    ))

    const notes = selectedDate?.notes?.map((note, idx) => (
        <div
            key={idx}
            className='flex items-center gap-1'
        >
            <FaCheck className='text-green-700' />
            <div className='text-sm'>{note}</div>
        </div>
    ))

    const payment_terms = selectedDate?.payment_terms?.map((term, idx) => (
        <div
            key={idx}
            className='flex items-center gap-1'
        >
            <FaCheck className='text-green-700' />
            <div className='text-sm'>{term}</div>
        </div>
    ))

    const requirements = selectedDate?.requirements?.map((requirement, idx) => (
        <div
            key={idx}
            className='flex items-center gap-1'
        >
            <FaCheck className='text-green-700' />
            <div className='text-sm'>{requirement}</div>
        </div>
    ))

    return (
        <div className='tour-container'>
            <div className='tour-card--destinations'>
                {tour.main_image_url && (
                    <img
                        className='tour-card__image'
                        src={tour.main_image_url}
                        alt={tour.title || 'Tour Image'}
                    />
                )}
                <div className='tour-card__content max-w-[1200px] mx-auto mt-8'>
                    <div className='tour-card__header'>
                        <h1 className='tour-card__title'>
                            {tour.title || 'Tour Title'}
                        </h1>
                    </div>
                    <p className='tour-card__description text-xs'>
                        {showFullDescription
                            ? tour.description || 'No description available.'
                            : shortenDescription(tour.description)}
                        {tour.description && tour.description.length > 100 && (
                            <button
                                className='tour-card__description-toggle text-xs'
                                onClick={toggleDescription}
                            >
                                {showFullDescription ? 'See Less' : 'See More'}
                            </button>
                        )}
                    </p>
                    <div className='grid gap-2'>
                        <div className='text-sm text-gray-600'>
                            Available Dates
                        </div>
                        <div>{availableDates}</div>
                        <div className='text-sm text-gray-600'>
                            Available Slots: {availableSlots}
                        </div>
                        {selectedDate && (
                            <div className='text-sm text-gray-600'>
                                Rate per Pax:{' '}
                                {selectedDate.rate_per_pax
                                    ? `PHP ${selectedDate.rate_per_pax.toLocaleString()}`
                                    : 'N/A'}
                            </div>
                        )}
                    </div>
                    <div className='border-b py-4 border-gray-400'>
                        <div className='font-bold flex items-start gap-2 text-sm lg:text-base text-[#646466]'>
                            <i className='bi-calendar2-week'></i>
                            <span>
                                {tourDates.length > 0 &&
                                    `${Math.ceil(
                                        (new Date(tourDates[0].end_date) -
                                            new Date(tourDates[0].start_date)) /
                                            (1000 * 60 * 60 * 24)
                                    )} Days & ${Math.ceil(
                                        (new Date(tourDates[0].end_date) -
                                            new Date(tourDates[0].start_date)) /
                                            (1000 * 60 * 60 * 24) -
                                            1
                                    )} Nights`}
                            </span>
                        </div>
                    </div>
                    <div className='flex gap-2 py-2 text-[#646466]'>
                        <button
                            onClick={() => setSelectedTab('inclusions')}
                            className={`flex gap-1 cursor-pointer ${
                                selectedTab === 'inclusions' && 'text-black'
                            }`}
                        >
                            <i className='bi-gift'></i>
                            <span className='font-bold text-sm'>
                                Inclusions
                            </span>
                        </button>
                        <button
                            onClick={() => setSelectedTab('exclusions')}
                            className={`flex gap-1 cursor-pointer ${
                                selectedTab === 'exclusions' && 'text-black'
                            }`}
                        >
                            <i className='bi-x-circle'></i>
                            <span className='font-bold text-sm'>
                                Exclusions
                            </span>
                        </button>
                        <button
                            onClick={() => setSelectedTab('notes')}
                            className={`flex gap-1 cursor-pointer ${
                                selectedTab === 'notes' && 'text-black'
                            }`}
                        >
                            <i className='bi-file-text'></i>
                            <span className='font-bold text-sm'>Notes</span>
                        </button>
                        <button
                            onClick={() => setSelectedTab('payment_terms')}
                            className={`flex gap-1 cursor-pointer ${
                                selectedTab === 'payment_terms' && 'text-black'
                            }`}
                        >
                            <i className='bi-credit-card'></i>
                            <span className='font-bold text-sm'>
                                Payment Terms
                            </span>
                        </button>
                        <button
                            onClick={() => setSelectedTab('requirements')}
                            className={`flex gap-1 cursor-pointer ${
                                selectedTab === 'requirements' && 'text-black'
                            }`}
                        >
                            <i className='bi-check-circle'></i>
                            <span className='font-bold text-sm'>
                                Requirements
                            </span>
                        </button>
                    </div>
                    <div className='grid gap-2'>
                        {selectedTab === 'inclusions' && inclusions}
                        {selectedTab === 'exclusions' && exclusions}
                        {selectedTab === 'notes' && notes}
                        {selectedTab === 'payment_terms' && payment_terms}
                        {selectedTab === 'requirements' && requirements}
                    </div>
                    <div>
                        <div className='font-poppins font-bold text-lg mb-3 border-t-1 border-gray-400 py-4'>
                            Itinerary
                        </div>
                        <div className='grid gap-4'>{itineraries}</div>
                    </div>
                </div>
            </div>
            <div className='max-w-[1200px] mx-auto flex items-center gap-4 border-t justify-center border-gray-300 pt-4 px-4'>
                <span className='font-medium'>Adults</span>
                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        onClick={() =>
                            setPassengers((p) => ({
                                ...p,
                                adults: Math.max(1, p.adults - 1),
                            }))
                        }
                        className='px-3 py-1 bg-gray-200 rounded'
                    >
                        -
                    </button>
                    <span>{passengers.adults}</span>
                    <button
                        type='button'
                        onClick={() =>
                            setPassengers((p) => ({
                                ...p,
                                adults:
                                    p.adults < availableSlots
                                        ? p.adults + 1
                                        : p.adults,
                            }))
                        }
                        className='px-3 py-1 bg-gray-200 rounded'
                    >
                        +
                    </button>
                </div>

                <span className='font-medium'>Children</span>
                <div className='flex items-center gap-2'>
                    <button
                        type='button'
                        onClick={() =>
                            setPassengers((p) => ({
                                ...p,
                                children: Math.max(0, p.children - 1),
                            }))
                        }
                        className='px-3 py-1 bg-gray-200 rounded'
                    >
                        -
                    </button>
                    <span>{passengers.children}</span>
                    <button
                        type='button'
                        onClick={() =>
                            setPassengers((p) => ({
                                ...p,
                                children:
                                    p.adults + p.children < availableSlots
                                        ? p.children + 1
                                        : p.children,
                            }))
                        }
                        className='px-3 py-1 bg-gray-200 rounded'
                    >
                        +
                    </button>
                </div>

                {passengers === availableSlots && (
                    <div className='text-red-600'>Max Passengers Reached.</div>
                )}
                <PrimaryButton
                    onClick={handleBookClick}
                    className='tour-card__btn max-w-[1200px] mx-auto'
                    buttonText='Book Now'
                    disabled={
                        !selectedDate?.available_slots || passengers === 0
                    }
                />
            </div>
        </div>
    )
}

export default Tour
