import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IoIosArrowUp } from 'react-icons/io'
import { IoIosArrowDown } from 'react-icons/io'
import { FaCheck } from 'react-icons/fa6'
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
    const [passengers, setPassengers] = useState(1)

    const tourDates = tour.dates || []

    const selectedDate = tourDates[selectedDateId]

    useEffect(() => {
        if (state) {
            setTour(state)
        }
    }, [state])

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

    const handleDateClick = (index) => {
        setSelectedDateId(index)
    }

    const title = tour?.title

    const navigate = useNavigate()

    const handleBookClick = () => {
        navigate('booking', {
            state: {
                ...tour,
                selectedDateId,
                passengers,
                selectedDate,
                title,
            },
        })
    }

    const availableSlots =
        tourDates?.[selectedDateId]?.available_slots ?? '...loading'

    const availableDates = tour?.dates?.map((date, index) => {
        return (
            <button
                key={index}
                onClick={() => handleDateClick(index)}
                className={`text-gray-800 text-sm border border-gray-400 rounded-sm p-2 cursor-pointer ${
                    selectedDateId === index &&
                    'bg-[#f7d100] text-black border-0'
                }`}
            >{`${formatToLongDate(date.start_date)} - ${formatToLongDate(
                date.end_date
            )}`}</button>
        )
    })

    const itineraries = tourDates[0]?.itineraries?.map((itinerary) => {
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
                        onClick={() => {
                            handleCardClose(itinerary.id)
                        }}
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

    const inclusions = tourDates[0]?.inclusions?.map((inclusion) => {
        return (
            <div className='flex items-center gap-1'>
                <FaCheck className='text-green-700' />
                <div className='text-sm'>{inclusion}</div>
            </div>
        )
    })

    const exclusions = tourDates[0]?.exclusions?.map((exclusion) => {
        return (
            <div className='flex items-center gap-1'>
                <FaCheck className='text-green-700' />
                <div className='text-sm'>{exclusion}</div>
            </div>
        )
    })

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
                <div className='tour-card__content'>
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
                    </div>
                    <div className='border-b py-4 border-gray-400'>
                        <div className='font-bold flex items-start gap-2 text-sm lg:text-base text-[#646466]'>
                            <i className='bi-calendar2-week'></i>
                            <span>
                                {tourDates.map(
                                    (date) =>
                                        `${Math.ceil(
                                            (new Date(date.end_date) -
                                                new Date(date.start_date)) /
                                                (1000 * 60 * 60 * 24)
                                        )} Days & ${Math.ceil(
                                            (new Date(date.end_date) -
                                                new Date(date.start_date)) /
                                                (1000 * 60 * 60 * 24) -
                                                1
                                        )} Nights`
                                )}
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
                    </div>

                    <div className='grid gap-2'>
                        {selectedTab === 'inclusions' ? inclusions : exclusions}
                    </div>

                    <div>
                        <div className='font-poppins font-bold text-lg mb-3 border-t-1 border-gray-400 py-4'>
                            Itinerary
                        </div>
                        <div className='grid gap-4'>{itineraries}</div>
                    </div>
                </div>
            </div>

            <div className='flex items-center gap-4 border-t justify-center border-gray-300 pt-4 w-4/5 mx-auto'>
                <span className='font-medium'>Passengers</span>
                <div className='flex items-center gap-2'>
                    <button
                        onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                        className='px-3 py-1 bg-gray-200 rounded'
                    >
                        -
                    </button>
                    <span>{passengers}</span>
                    <button
                        onClick={() => setPassengers((p) => p + 1)}
                        className='px-3 py-1 bg-gray-200 rounded'
                    >
                        +
                    </button>
                </div>
            </div>

            <PrimaryButton
                onClick={() => handleBookClick()}
                className='tour-card__btn'
                buttonText='Book Now'
            />
        </div>
    )
}

export default Tour
