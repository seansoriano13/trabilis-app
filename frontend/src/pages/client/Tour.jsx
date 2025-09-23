import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IoIosArrowUp } from 'react-icons/io'
import { IoIosArrowDown } from 'react-icons/io'
import { FaCheck, FaCircleXmark, FaRegFileLines, FaCreditCard, FaCircleCheck } from 'react-icons/fa6'
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

    // Customization state
    const [customizeEnabled, setCustomizeEnabled] = useState(false)
    const [removedGroupIds, setRemovedGroupIds] = useState(new Set())
    const [restDayNumbers, setRestDayNumbers] = useState(new Set())

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
        // Reset customization when switching dates
        setCustomizeEnabled(false)
        setRemovedGroupIds(new Set())
        setRestDayNumbers(new Set())
    }

    const navigate = useNavigate()

    const handleBookClick = () => {
        const paxCount = passengers.adults + passengers.children
        const baseTotal = (selectedDate?.rate_per_pax || 0) * paxCount
        const feeRules = selectedDate?.fee_rules || {
            perRemovedGroup: 5000,
            perRestDay: 3000,
            minFee: 5000,
            maxFee: 50000,
        }

        const customizationFeeUncapped = removedGroupIds.size * (feeRules.perRemovedGroup || 0) +
            restDayNumbers.size * (feeRules.perRestDay || 0)
        let customizationFee = customizationFeeUncapped
        if (customizationFee > 0 && customizationFee < (feeRules.minFee || 0)) customizationFee = feeRules.minFee || 0
        if (customizationFee > (feeRules.maxFee || Number.MAX_SAFE_INTEGER)) customizationFee = feeRules.maxFee

        const customizationPayload = customizeEnabled
            ? {
                  enabled: true,
                  removedInclusionGroupIds: Array.from(removedGroupIds),
                  restDayNumbers: Array.from(restDayNumbers),
                  clientTotals: {
                      baseTotal,
                      customizationFee,
                      grandTotal: baseTotal + customizationFee,
                  },
              }
            : undefined

        navigate('booking', {
            state: {
                ...tour,
                selectedDateId,
                passengers,
                selectedDate,
                title: tour.title,
                customization: customizationPayload,
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
        const isRest = restDayNumbers.has(itinerary.day_number)
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
                    {customizeEnabled && (
                        <label className='flex items-center gap-2 text-xs text-gray-600'>
                            <input
                                type='checkbox'
                                checked={isRest}
                                onChange={(e) => {
                                    setRestDayNumbers((prev) => {
                                        const next = new Set(prev)
                                        if (e.target.checked) next.add(itinerary.day_number)
                                        else next.delete(itinerary.day_number)
                                        return next
                                    })
                                }}
                            />
                            Make this a Rest Day
                        </label>
                    )}
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
                        {isRest ? (
                            <div className='italic text-gray-500'>Rest Day</div>
                        ) : (
                            itinerary.description
                        )}
                    </div>
                </div>
            </div>
        )
    })

    // Legacy inclusions rendering (fallback)
    const sanitizeText = (val) => {
        if (val == null) return ''
        const str = String(val)
        return str.replace(/^"+|"+$/g, '').trim()
    }

    const legacyInclusions = selectedDate?.inclusions?.map((inclusion, idx) => {
        const text = sanitizeText(inclusion)
        return text ? (
            <div key={idx} className='flex items-center gap-1'>
                <FaCheck className='text-green-700' />
                <div className='text-sm'>{text}</div>
            </div>
        ) : null
    })

    // New grouped inclusions rendering
    const groupedInclusions = selectedDate?.inclusion_groups?.map((group) => {
        const isRemoved = removedGroupIds.has(group.id)
        const titleText = sanitizeText(group.title)
        const itemsSanitized = (group.items || []).map((it) => sanitizeText(it)).filter(Boolean)
        const showList = itemsSanitized.length > 1 || (itemsSanitized.length === 1 && itemsSanitized[0] !== titleText)
        return (
            <div key={group.id} className={`border border-gray-400 rounded-lg px-4 py-3 ${isRemoved ? 'bg-gray-50' : 'bg-white'}`}>
                <div className='flex items-center gap-3'>
                <FaCheck className='text-green-700' />
                    <div className='font-semibold text-sm text-gray-800'>{titleText}</div>
                    {customizeEnabled ? (
                        <label className='flex items-center gap-2 text-xs text-gray-700'>
                            <input
                                type='checkbox'
                                checked={!isRemoved}
                                disabled={!group.removable}
                                onChange={(e) => {
                                    setRemovedGroupIds((prev) => {
                                        const next = new Set(prev)
                                        if (e.target.checked) next.delete(group.id)
                                        else next.add(group.id)
                                        return next
                                    })
                                }}
                            />
                            {group.removable ? (
                                <span>Include</span>
                            ) : (
                                <span className='bg-gray-200 text-gray-700 px-2 py-0.5 rounded-sm'>Required</span>
                            )}
                        </label>
                    ) : null}
                </div>
                {showList && (
                    <ul className={`mt-2 list-disc pl-5 ${isRemoved ? 'opacity-60' : ''}`}>
                        {itemsSanitized.map((item, idx) => (
                            <li key={idx} className='text-xs lg:text-sm text-gray-700'>{item}</li>
                        ))}
                    </ul>
                )}
            </div>
        )
    })

    const exclusions = selectedDate?.exclusions?.map((exclusion, idx) => {
        const text = sanitizeText(exclusion)
        return text ? (
            <div key={idx} className='flex items-center gap-1'>
                <FaCircleXmark className='text-red-600' />
                <div className='text-sm'>{text}</div>
            </div>
        ) : null
    })

    const notes = selectedDate?.notes?.map((note, idx) => {
        const text = sanitizeText(note)
        return text ? (
            <div key={idx} className='flex items-center gap-1'>
                <FaRegFileLines className='text-gray-700' />
                <div className='text-sm'>{text}</div>
            </div>
        ) : null
    })

    const payment_terms = selectedDate?.payment_terms?.map((term, idx) => {
        const text = sanitizeText(term)
        return text ? (
            <div key={idx} className='flex items-center gap-1'>
                <FaCreditCard className='text-indigo-700' />
                <div className='text-sm'>{text}</div>
            </div>
        ) : null
    })

    const requirements = selectedDate?.requirements?.map((requirement, idx) => {
        const text = sanitizeText(requirement)
        return text ? (
            <div key={idx} className='flex items-center gap-1'>
                <FaCircleCheck className='text-green-700' />
                <div className='text-sm'>{text}</div>
            </div>
        ) : null
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
                    <div className='grid gap-3'>
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
                        {/* Customize Tour controls */}
                        <div className='mt-2 border border-gray-300 rounded-lg p-4 bg-white shadow-sm'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <div className='font-medium text-gray-800'>Customize this tour</div>
                                    <div className='text-xs text-gray-500'>Remove inclusion groups or mark rest days</div>
                                </div>
                                <button
                                    type='button'
                                    role='switch'
                                    aria-checked={customizeEnabled}
                                    onClick={() => {
                                        const next = !customizeEnabled
                                        setCustomizeEnabled(next)
                                        if (!next) {
                                            setRemovedGroupIds(new Set())
                                            setRestDayNumbers(new Set())
                                        }
                                    }}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${customizeEnabled ? 'bg-[#f7d100] focus:ring-[#f7d100]' : 'bg-gray-300 focus:ring-gray-400'}`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${customizeEnabled ? 'translate-x-5' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>

                            <div className='mt-3 flex items-center gap-3 text-xs'>
                                <span className='px-2 py-0.5 rounded-full bg-gray-100 text-gray-700'>Removed: {removedGroupIds.size}</span>
                                <span className='px-2 py-0.5 rounded-full bg-gray-100 text-gray-700'>Rest days: {restDayNumbers.size}</span>
                            </div>

                            {/* Pricing summary */}
                            <div className='mt-3 text-sm text-gray-700'>
                                {(() => {
                                    const paxCount = passengers.adults + passengers.children
                                    const base = (selectedDate?.rate_per_pax || 0) * paxCount
                                    const rules = selectedDate?.fee_rules || { perRemovedGroup: 5000, perRestDay: 3000, minFee: 5000, maxFee: 50000 }
                                    const uncapped = removedGroupIds.size * (rules.perRemovedGroup || 0) + restDayNumbers.size * (rules.perRestDay || 0)
                                    let fee = uncapped
                                    if (fee > 0 && fee < (rules.minFee || 0)) fee = rules.minFee || 0
                                    if (fee > (rules.maxFee || Number.MAX_SAFE_INTEGER)) fee = rules.maxFee
                                    const total = base + fee
                                    return (
                                        <div className='space-y-1'>
                                            <div className='flex justify-between'><span>Base Total</span><span className='font-medium'>PHP {base.toLocaleString()}</span></div>
                                            <div className='flex justify-between'><span>Customization Fee</span><span className='font-medium'>PHP {fee.toLocaleString()}</span></div>
                                            <div className='pt-1 mt-1 border-t border-gray-200 flex justify-between font-semibold'><span>Grand Total</span><span>PHP {total.toLocaleString()}</span></div>
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>
                       
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
                        {selectedTab === 'inclusions' && (
                            selectedDate?.inclusion_groups?.length
                                ? groupedInclusions
                                : legacyInclusions
                        )}
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
            <div className='max-w-[1200px] mx-auto flex flex-col gap-3 border-t justify-center border-gray-300 pt-4 px-4'>
                <div className='flex items-center gap-4 flex-wrap'>
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
        </div>
    )
}

export default Tour
