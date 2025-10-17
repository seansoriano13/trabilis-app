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
    const [selectedDateId, setSelectedDateId] = useState(null)
    const [passengers, setPassengers] = useState({
        adults: 1,
        children: 0,
    })

    console.log(tour)

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
                console.log('🔍 FRONTEND DEBUG - Tour data received:', {
                    tourId: state.id,
                    datesCount: response.data.dates?.length || 0,
                    firstDateInclusionGroups: response.data.dates?.[0]?.inclusion_groups?.length || 0,
                    firstDateInclusionGroupsData: response.data.dates?.[0]?.inclusion_groups || [],
                    tourLevelFeeRules: response.data.fee_rules || {},
                    firstDateFeeRules: response.data.dates?.[0]?.fee_rules || {},
                })
                setTour(response.data)
                if (response.data.dates && response.data.dates.length > 0) {
                    setSelectedDateId(response.data.dates[0].id)
                }
            } catch (error) {
                console.error('Failed to fetch tour:', error)
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
        setSelectedDateId(dateId)
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
        // Use tour-level fee_rules as default, with per-date overrides
        const feeRules = selectedDate?.fee_rules || tour.fee_rules || {
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
                tourPackage: tour, // Explicitly pass tour as tourPackage
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

    const itineraries = tour?.itineraries
        ?.sort((a, b) => {
            const dayA = parseInt(a.day_number) || 0
            const dayB = parseInt(b.day_number) || 0
            return dayA - dayB
        })
        ?.map((itinerary) => {
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
                    <div 
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isCollapsed 
                                ? 'max-h-0 opacity-0' 
                                : 'max-h-[2000px] opacity-100'
                        }`}
                        aria-hidden={isCollapsed}
                    >
                        {isRest ? (
                            <div className='flex items-center justify-center py-8 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200'>
                                <div className='text-center'>
                                    <div className='text-4xl mb-2'>😴</div>
                                    <div className='italic text-gray-600 font-medium text-lg'>Rest Day</div>
                                    <div className='text-sm text-gray-500 mt-1'>Take time to relax and recharge</div>
                                </div>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {itinerary.image_url ? (
                                    <div className='flex flex-col md:flex-row gap-4 md:gap-6'>
                                        {/* Image on the left */}
                                        <div className='flex-shrink-0 w-full md:w-80 lg:w-96'>
                                            <div className='relative group overflow-hidden rounded-xl shadow-lg'>
                                                <img
                                                    src={itinerary.image_url}
                                                    alt={`Day ${itinerary.day_number} - ${itinerary.title}`}
                                                    className='w-full h-48 md:h-64 lg:h-72 object-cover transition-transform duration-300 group-hover:scale-105'
                                                    loading='lazy'
                                                    onError={(e) => {
                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZjNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFVuYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg=='
                                                        e.target.alt = 'Image unavailable'
                                                    }}
                                                />
                                                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                                            </div>
                                        </div>
                                        
                                        {/* Description on the right */}
                                        <div className='flex-1 min-w-0'>
                                            <div className='prose prose-sm max-w-none'>
                                                <div 
                                                    id={`desc-${itinerary.id}`}
                                                    className='text-gray-700 leading-relaxed whitespace-pre-line line-clamp-3'
                                                >
                                                    {itinerary.description || 'No description available for this day.'}
                                                </div>
                                            </div>
                                            {itinerary.description && itinerary.description.length > 200 && (
                                                <button
                                                    className='text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 flex items-center gap-1 mt-2'
                                                    onClick={() => {
                                                        // Add expand/collapse functionality for long descriptions
                                                        const element = document.getElementById(`desc-${itinerary.id}`)
                                                        if (element) {
                                                            element.classList.toggle('line-clamp-3')
                                                        }
                                                    }}
                                                >
                                                    <span>Read more</span>
                                                    <IoIosArrowDown className='text-xs' />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className='prose prose-sm max-w-none'>
                                        <div 
                                            id={`desc-${itinerary.id}`}
                                            className='text-gray-700 leading-relaxed whitespace-pre-line line-clamp-3'
                                        >
                                            {itinerary.description || 'No description available for this day.'}
                                        </div>
                                        {itinerary.description && itinerary.description.length > 200 && (
                                            <button
                                                className='text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 flex items-center gap-1 mt-2'
                                                onClick={() => {
                                                    // Add expand/collapse functionality for long descriptions
                                                    const element = document.getElementById(`desc-${itinerary.id}`)
                                                    if (element) {
                                                        element.classList.toggle('line-clamp-3')
                                                    }
                                                }}
                                            >
                                                <span>Read more</span>
                                                <IoIosArrowDown className='text-xs' />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
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

    const legacyInclusions = tour?.inclusions?.map((inclusion, idx) => {
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
        const showList = itemsSanitized.length > 0
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
    const exclusions = tour?.exclusions?.map((exclusion, idx) => {
        const text = sanitizeText(exclusion)
        return text ? (
            <div key={idx} className='flex items-center gap-1'>
                <FaCircleXmark className='text-red-600' />
                <div className='text-sm'>{text}</div>
            </div>
        ) : null
    })

    const notes = tour?.notes?.map((note, idx) => {
        const text = sanitizeText(note)
        return text ? (
            <div key={idx} className='flex items-center gap-1'>
                <FaRegFileLines className='text-gray-700' />
                <div className='text-sm'>{text}</div>
            </div>
        ) : null
    })

    const payment_terms = tour?.payment_terms?.map((term, idx) => {
        const text = sanitizeText(term)
        return text ? (
            <div key={idx} className='flex items-center gap-1'>
                <FaCreditCard className='text-indigo-700' />
                <div className='text-sm'>{text}</div>
            </div>
        ) : null
    })

    const requirements = tour?.requirements?.map((requirement, idx) => {
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
                    <div className='relative overflow-hidden'>
                        <img
                            className='tour-card__image'
                            src={tour.main_image_url}
                            alt={tour.title || 'Tour Image'}
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
                    </div>
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
                    <div className='grid gap-4 bg-gray-50 rounded-xl p-6'>
                        <div className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                            <i className='bi-calendar-event text-yellow-500'></i>
                            Available Dates
                        </div>
                        <div className='flex flex-wrap gap-3'>{availableDates}</div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='text-sm text-gray-600 flex items-center gap-2'>
                                <i className='bi-people text-blue-500'></i>
                                <span>Available Slots: <span className='font-semibold text-gray-800'>{availableSlots}</span></span>
                            </div>
                            {selectedDate && (
                                <div className='text-sm text-gray-600 flex items-center gap-2'>
                                    <i className='bi-currency-dollar text-green-500'></i>
                                    <span>Rate per Pax: <span className='font-semibold text-gray-800'>
                                        {selectedDate.rate_per_pax
                                            ? `PHP ${selectedDate.rate_per_pax.toLocaleString()}`
                                            : 'N/A'}
                                    </span></span>
                                </div>
                            )}
                        </div>
                        {/* Customize Tour controls */}
                        <div className='mt-4 border border-gray-300 rounded-lg p-6 bg-white shadow-sm'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <div className='font-semibold text-gray-800 flex items-center gap-2'>
                                        <i className='bi-gear text-yellow-500'></i>
                                        Customize this tour
                                    </div>
                                    <div className='text-sm text-gray-500 mt-1'>Remove inclusion groups or mark rest days</div>
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

                            <div className='mt-4 flex items-center gap-3 text-sm'>
                                <span className='px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1'>
                                    <i className='bi-x-circle text-xs'></i>
                                    Removed: {removedGroupIds.size}
                                </span>
                                <span className='px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center gap-1'>
                                    <i className='bi-moon text-xs'></i>
                                    Rest days: {restDayNumbers.size}
                                </span>
                            </div>

                            {/* Pricing summary */}
                            <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                                <div className='text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2'>
                                    <i className='bi-calculator text-yellow-500'></i>
                                    Pricing Summary
                                </div>
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
                                        <div className='space-y-2'>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-gray-600'>Base Total</span>
                                                <span className='font-semibold text-gray-800'>PHP {base.toLocaleString()}</span>
                                            </div>
                                            <div className='flex justify-between items-center'>
                                                <span className='text-gray-600'>Customization Fee</span>
                                                <span className='font-semibold text-gray-800'>PHP {fee.toLocaleString()}</span>
                                            </div>
                                            <div className='pt-2 mt-2 border-t border-gray-300 flex justify-between items-center'>
                                                <span className='font-bold text-gray-800'>Grand Total</span>
                                                <span className='font-bold text-lg text-yellow-600'>PHP {total.toLocaleString()}</span>
                                            </div>
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
                                {selectedDate &&
                                    `${Math.ceil(
                                        (new Date(selectedDate.end_date) -
                                            new Date(selectedDate.start_date)) /
                                            (1000 * 60 * 60 * 24)
                                    )} Days & ${Math.ceil(
                                        (new Date(selectedDate.end_date) -
                                            new Date(selectedDate.start_date)) /
                                            (1000 * 60 * 60 * 24) -
                                            1
                                    )} Nights`}
                            </span>
                        </div>
                    </div>
                    <div className='flex flex-wrap gap-2 py-4 text-[#646466] border-b border-gray-200'>
                        <button
                            onClick={() => setSelectedTab('inclusions')}
                            className={`flex gap-2 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 ${
                                selectedTab === 'inclusions' 
                                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' 
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <i className='bi-gift'></i>
                            <span className='font-semibold text-sm'>
                                Inclusions
                            </span>
                        </button>
                        <button
                            onClick={() => setSelectedTab('exclusions')}
                            className={`flex gap-2 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 ${
                                selectedTab === 'exclusions' 
                                    ? 'bg-red-100 text-red-800 border border-red-300' 
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <i className='bi-x-circle'></i>
                            <span className='font-semibold text-sm'>
                                Exclusions
                            </span>
                        </button>
                        <button
                            onClick={() => setSelectedTab('notes')}
                            className={`flex gap-2 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 ${
                                selectedTab === 'notes' 
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <i className='bi-file-text'></i>
                            <span className='font-semibold text-sm'>Notes</span>
                        </button>
                        <button
                            onClick={() => setSelectedTab('payment_terms')}
                            className={`flex gap-2 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 ${
                                selectedTab === 'payment_terms' 
                                    ? 'bg-green-100 text-green-800 border border-green-300' 
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <i className='bi-credit-card'></i>
                            <span className='font-semibold text-sm'>
                                Payment Terms
                            </span>
                        </button>
                        <button
                            onClick={() => setSelectedTab('requirements')}
                            className={`flex gap-2 cursor-pointer px-4 py-2 rounded-lg transition-all duration-200 ${
                                selectedTab === 'requirements' 
                                    ? 'bg-purple-100 text-purple-800 border border-purple-300' 
                                    : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        >
                            <i className='bi-check-circle'></i>
                            <span className='font-semibold text-sm'>
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
            
            {/* Sticky Booking Section */}
            <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50'>
                <div className='max-w-[1200px] mx-auto flex flex-col gap-4 justify-center py-4 px-4'>
                    <div className='bg-gray-50 rounded-xl p-4 grid gap-4'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2'>
                            <i className='bi-people text-yellow-500'></i>
                            Select Passengers
                        </h3>
                        <div className='flex items-center gap-8 flex-wrap'>
                            <div className='flex items-center gap-4'>
                                <span className='font-medium text-gray-700'>Adults</span>
                                <div className='flex items-center gap-3'>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            setPassengers((p) => ({
                                                ...p,
                                                adults: Math.max(1, p.adults - 1),
                                            }))
                                        }
                                        className='w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200'
                                    >
                                        <i className='bi-dash text-gray-600'></i>
                                    </button>
                                    <span className='w-8 text-center font-semibold text-gray-800'>{passengers.adults}</span>
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
                                        className='w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200'
                                    >
                                        <i className='bi-plus text-gray-600'></i>
                                    </button>
                                </div>
                            </div>

                            <div className='flex items-center gap-4'>
                                <span className='font-medium text-gray-700'>Children</span>
                                <div className='flex items-center gap-3'>
                                    <button
                                        type='button'
                                        onClick={() =>
                                            setPassengers((p) => ({
                                                ...p,
                                                children: Math.max(0, p.children - 1),
                                            }))
                                        }
                                        className='w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200'
                                    >
                                        <i className='bi-dash text-gray-600'></i>
                                    </button>
                                    <span className='w-8 text-center font-semibold text-gray-800'>{passengers.children}</span>
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
                                        className='w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors duration-200'
                                    >
                                        <i className='bi-plus text-gray-600'></i>
                                    </button>
                                </div>
                            </div>

                            {passengers.adults + passengers.children === availableSlots && (
                                <div className='text-red-600 flex items-center gap-1'>
                                    <i className='bi-exclamation-triangle text-sm'></i>
                                    Max Passengers Reached
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className='flex justify-center'>
                        <PrimaryButton
                            onClick={handleBookClick}
                            className='tour-card__btn'
                            buttonText='Book Now'
                            disabled={
                                !selectedDate?.available_slots || (passengers.adults + passengers.children) === 0
                            }
                        />
                    </div>
                </div>
            </div>
        
        </div>
    )
}

export default Tour
