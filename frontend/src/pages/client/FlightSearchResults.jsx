// 🔗 React & Router
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// 🎨 Styles
import './FlightSearchResults.css'

// 🧠 Utils
import { extractFlightLeg, formatToLongDate } from '../../utils/flightUtils'
import { formatToYMD } from '../../utils/flightUtils'
import axios from 'axios'
import { Duration } from 'luxon'
// import { useAirports } from '../../context/AirportContext'
// import { defaultAirportOptionsData } from '../../utils/defaultAirportOptions'

// 🧩 Components
import PrimaryButton from '../../components/client/PrimaryButton'
import FlightResultCard from '../../components/client/FlightResultCard'
import { SyncLoader } from 'react-spinners'
import ReactPaginate from 'react-paginate'

// 🎯 Icons
import {
    FaBell,
    FaHotel,
    FaPlane,
    FaCarSide,
    FaAngleDown,
    FaArrowRight,
} from 'react-icons/fa'
import { IoAirplane, IoChevronBack, IoChevronForward } from 'react-icons/io5'
import { MdFavorite, MdFavoriteBorder } from 'react-icons/md'

// 🧰 Utils
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import FilterModal from '../../components/client/FilterModal'

function FlightSearchResults() {
    // Context
    // const { airports: options } = useAirports()

    // Navigation State
    const navigate = useNavigate()
    const { state } = useLocation()
    const [allFlights, setAllFlights] = useState(state?.flights.flights ?? [])

    const [activeTab, setActiveTab] = useState('flights')
    const [_searchData, setSearchData] = useState(state)

    useEffect(() => {
        if (!state) {
            const stored = sessionStorage.getItem('searchResults')
            if (stored) setSearchData(JSON.parse(stored))
        }
    }, [state])

    const getInitialFilters = () => {
        const saved = localStorage.getItem('savedFilters')
        const parsed = saved ? JSON.parse(saved) : {}

        // Always prioritize new state on first load
        return {
            origin: state?.origin ?? parsed.origin ?? null,
            destination: state?.destination ?? parsed.destination ?? null,
            date: state?.date ?? parsed.date ?? null,
            travelerCount: state?.travelerCount ?? parsed.travelerCount ?? 1,
            tripType: state?.tripType ?? parsed.tripType ?? 'one-way',
            cabinClass: state?.cabinClass ?? parsed.cabinClass ?? null,
            activeTab: parsed.activeTab ?? 'flights',
        }
    }

    const [filters, setFilters] = useState(getInitialFilters)

    useEffect(() => {
        localStorage.setItem('savedFilters', JSON.stringify(filters))
    }, [filters])

    const { origin, destination, date, travelerCount, cabinClass } = filters

    // Derived Data
    const outboundFlights = allFlights.outbound ?? [0]
    const itemsPerPage = 10
    const currency = outboundFlights[0].price.currency

    // UI States
    const [currentPage, setCurrentPage] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedFilter, setSelectedFilter] = useState(null)
    const [sortBy, setSortBy] = useState('best')
    const [flightIsFavorite, setflightIsFavorite] = useState({})
    const [isDisabled, setIsDisabled] = useState(false)
    const [isDateLoading, setIsDateLoading] = useState(false)
    const [loadingDate, setLoadingDate] = useState(null)

    // Nearby date fares state
    const [nearbyFares, setNearbyFares] = useState([])
    const [isNearbyLoading, setIsNearbyLoading] = useState(false)
    const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
    
    // Selected date index for UI
    const [selectedDateIndex, setSelectedDateIndex] = useState(0)

    // Persist selected date index
    useEffect(() => {
        const savedIndex = localStorage.getItem('selectedDateIndex')
        if (savedIndex !== null) {
            setSelectedDateIndex(parseInt(savedIndex))
        }
        
        // Clear old cache entries on component mount
        const keys = Object.keys(localStorage)
        const oldCacheKeys = keys.filter(key => 
            key.startsWith('flight_date_') || 
            key.startsWith('date_cache_') ||
            key.startsWith('nearby_fares_') // Clear all flexible dates cache
        )
        if (oldCacheKeys.length > 0) {
            console.log('[FLEXIBLE DATES] Clearing old cache entries:', oldCacheKeys.length)
            oldCacheKeys.forEach(key => localStorage.removeItem(key))
        }
    }, [])

    // Save selected date index
    useEffect(() => {
        localStorage.setItem('selectedDateIndex', selectedDateIndex.toString())
    }, [selectedDateIndex])


    // Window resize listener
    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        setIsLoading(true)

        const timer = setTimeout(() => setIsLoading(false), 500)

        return () => clearTimeout(timer)
    }, [sortBy, activeTab])

    useEffect(() => {
        const html = document.documentElement
        const body = document.body

        if (isModalOpen) {
            html.style.overflow = 'hidden'
            body.style.overflow = 'hidden'
        } else {
            html.style.overflow = ''
            body.style.overflow = ''
        }

        return () => {
            html.style.overflow = ''
            body.style.overflow = ''
        }
    }, [isModalOpen])

    // Utils
    const handlePageClick = ({ selected }) => {
        setIsLoading(true)
        setCurrentPage(selected)

        setTimeout(() => {
            setIsLoading(false)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 1000)
    }

    const formatPrice = (price) =>
        parseFloat(price).toLocaleString('en-US', {
            maximumFractionDigits: 2,
        })

    const getTotalMinutes = (flight) =>
        flight.itineraries
            .flatMap((itinerary) => itinerary.segments)
            .reduce(
                (sum, segment) =>
                    sum + Duration.fromISO(segment.duration).as('minutes'),
                0
            )

    const getScore = (flight) => {
        const price = parseFloat(flight.price.total)
        const duration = getTotalMinutes(flight)
        return price * 0.7 + duration * 0.3
    }

    const formatMinutes = (min) =>
        Duration.fromObject({ minutes: min }).toFormat("h'h' mm'm'")

    const getFlightMetrics = (flight) => ({
        price: parseFloat(flight?.price?.total ?? Infinity),
        duration: flight?.itineraries?.[0]?.segments?.[0]?.duration
            ? Duration.fromISO(flight.itineraries[0].segments[0].duration).as(
                  'minutes'
              )
            : Infinity,
        score: (flight) => {
            const price = parseFloat(flight?.price?.total ?? Infinity)
            const duration = flight?.itineraries?.[0]?.segments?.[0]?.duration
                ? Duration.fromISO(
                      flight.itineraries[0].segments[0].duration
                  ).as('minutes')
                : Infinity
            return isFinite(price) && isFinite(duration)
                ? price * 0.7 + duration * 0.3
                : Infinity
        },
    })

    const findOptimalFlights = (flights) => {
        if (!flights?.length) {
            return {
                cheapest: null,
                fastest: null,
                best: null,
            }
        }

        return flights.reduce(
            (acc, flight) => {
                const metrics = getFlightMetrics(flight)

                // Cheapest
                if (
                    metrics.price < getFlightMetrics(acc.cheapest ?? {}).price
                ) {
                    acc.cheapest = flight
                }

                // Fastest
                if (
                    metrics.duration <
                    getFlightMetrics(acc.fastest ?? {}).duration
                ) {
                    acc.fastest = flight
                }

                // Best
                if (
                    metrics.score(flight) <
                    getFlightMetrics(acc.best ?? {}).score(acc.best ?? {})
                ) {
                    acc.best = flight
                }

                return acc
            },
            {
                cheapest: flights[0],
                fastest: flights[0],
                best: flights[0],
            }
        )
    }

    const formatFlightDetails = (flight, formatPrice, formatMinutes) => {
        if (!flight) {
            return { price: '-', duration: '-' }
        }
        return {
            price: flight?.price?.total ? formatPrice(flight.price.total) : '-',
            duration: formatMinutes(getFlightMetrics(flight).duration),
        }
    }

    const { cheapest, fastest, best } = findOptimalFlights(outboundFlights)

    const cheapestFlightDetails = formatFlightDetails(
        cheapest,
        formatPrice,
        formatMinutes
    )
    const fastestFlightDetails = formatFlightDetails(
        fastest,
        formatPrice,
        formatMinutes
    )
    const bestFlightDetails = formatFlightDetails(
        best,
        formatPrice,
        formatMinutes
    )

    const cheapestFlightPrice = cheapestFlightDetails.price
    const cheapestFlightDuration = cheapestFlightDetails.duration
    const fastestFlightPrice = fastestFlightDetails.price
    const fastestFlightDuration = fastestFlightDetails.duration
    const bestFlightPrice = bestFlightDetails.price
    const bestFlightDuration = bestFlightDetails.duration

    // Sort Flight Cards
    const sortedFlights = [...outboundFlights].sort((a, b) => {
        if (sortBy === 'cheapest') {
            return parseFloat(a.price.total) - parseFloat(b.price.total)
        }
        if (sortBy === 'fastest') {
            return getTotalMinutes(a) - getTotalMinutes(b)
        }
        if (sortBy === 'best') {
            return getScore(a) - getScore(b)
        }
        return 0
    })

    const totalPages = Math.ceil(sortedFlights.length / itemsPerPage)
    const startIndex = currentPage * itemsPerPage
    const lastIndex = startIndex + itemsPerPage

    const paginatedFlights = sortedFlights.slice(startIndex, lastIndex)

    const flightsResult = paginatedFlights.map((flight, index) => {
        const outboundData = extractFlightLeg(flight.itineraries[0])
        const inboundData = flight.itineraries[1]
            ? extractFlightLeg(flight.itineraries[1])
            : null

        const currency = flight.price.currency
        const price = formatPrice(flight.price.total)

        const handleFavoriteClick = (id) => {
            if (isDisabled) return

            setIsDisabled(true)
            setflightIsFavorite((prev) => ({
                ...prev,
                [id]: !prev[id],
            }))

            setTimeout(() => {
                setIsDisabled(false)
            }, 500)
        }

        return (
            <FlightResultCard
                key={flight.id}
                index={index}
                flight={flight}
                currency={currency}
                price={price}
                handleFavoriteClick={() => handleFavoriteClick(flight.id)}
                flightIsFavorite={flightIsFavorite}
                outboundData={outboundData}
                inboundData={inboundData}
                travelerCount={filters.travelerCount}
            />
        )
    })

    const handleClick = (tab) => {
        setActiveTab(tab)
    }

    const handleSelectFlightCard = (selectedCard) => {
        setSortBy(selectedCard)
        setCurrentPage(0)
    }

    const handleBackClick = () => {
        const searchFormData = {
            origin,
            destination,
            date,
            travelerCount,
            cabinClass,
        }

        sessionStorage.setItem('searchForm', JSON.stringify(searchFormData))

        navigate('/flights', { state: searchFormData })
    }

    // Helper to add days to a Date instance safely
    const addDays = (d, days) => {
        const base = d instanceof Date ? d : new Date(d)
        const copy = new Date(base)
        copy.setDate(copy.getDate() + days)
        return copy
    }

    // Generate cache key based on search parameters
    const getCacheKey = (origin, destination, cabinClass, travelerCount) => {
        return `nearby_fares_${origin?.value}_${destination?.value}_${cabinClass?.value}_${travelerCount?.adults}_${travelerCount?.children}`
    }

    // Check if cache is valid (not expired)
    const isCacheValid = (timestamp) => {
        const TEN_MINUTES = 10 * 60 * 1000
        // Use normal cache behavior to avoid excessive API calls
        return Date.now() - timestamp < TEN_MINUTES
    }

    // Get cached data if valid
    const getCachedFares = (cacheKey) => {
        try {
            const cached = localStorage.getItem(cacheKey)
            if (!cached) return null
            const { data, timestamp } = JSON.parse(cached)
            if (!isCacheValid(timestamp)) return null
            
            // Convert date strings back to Date objects
            return data.map(item => ({
                ...item,
                date: new Date(item.date)
            }))
        } catch {
            return null
        }
    }

    // Simplified flexible dates fetch using single API call
    const fetchFlexibleDates = async (dates) => {
        try {
            const originValue = filters.origin?.value
            const destinationValue = filters.destination?.value
            
            if (!originValue || !destinationValue) {
                throw new Error('Origin and destination are required')
            }

            console.log('[FLEXIBLE DATES] Fetching flexible dates for', dates.length, 'dates')
            
            // Clear old cache entries to avoid conflicts
            const keys = Object.keys(localStorage)
            const oldCacheKeys = keys.filter(key => key.startsWith('flight_date_') || key.startsWith('date_cache_'))
            oldCacheKeys.forEach(key => {
                localStorage.removeItem(key)
                console.log('[FLEXIBLE DATES] Removed old cache:', key)
            })
            
            // Check cache first
            const cacheKey = getCacheKey(filters.origin, filters.destination, filters.cabinClass, filters.travelerCount)
            const cachedData = getCachedFares(cacheKey)
            if (cachedData) {
                console.log('[FLEXIBLE DATES] Using cached data')
                setNearbyFares(cachedData)
                return
            }
            
            // Single API call to get all dates at once
            const payload = {
                origin: originValue,
                destination: destinationValue,
                travelerCount: filters.travelerCount,
                cabinClass: filters.cabinClass?.value || 'ECONOMY'
            }

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/flights/flexible-dates`,
                payload,
                { timeout: 15000 }
            )
            
            const flightDates = res?.data?.data || []
            console.log('[FLEXIBLE DATES] Received', flightDates.length, 'flight dates from API')
            console.log('[FLEXIBLE DATES] API Response:', res?.data)
            console.log('[FLEXIBLE DATES] Flight dates data:', flightDates)
            
            // Transform API response to match expected format
            const transformedData = dates.map(d => {
                const ymd = formatToYMD(d)
                const flightDate = flightDates.find(fd => fd.departureDate === ymd)
                
                return {
                    date: d,
                    price: flightDate?.price || null,
                    currency: flightDate?.currency || 'PHP',
                    ymd: ymd,
                    flights: flightDate?.flights || []
                }
            })
            
            console.log('[FLEXIBLE DATES] Transformed data:', transformedData)
            setNearbyFares(transformedData)
            
            // Cache the results
            try {
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: transformedData,
                    timestamp: Date.now()
                }))
                console.log('[FLEXIBLE DATES] Cached results')
            } catch {
                // Silently fail if localStorage is full
            }
            
        } catch (error) {
            console.error('[FLEXIBLE DATES] Error fetching flexible dates:', error.message)
            // Show empty data on error
            const emptyData = dates.map(d => ({
                date: d,
                price: null,
                currency: 'PHP',
                ymd: formatToYMD(d),
                flights: []
            }))
            setNearbyFares(emptyData)
        }
    }

    // Build nearby fare strip with responsive date count
    useEffect(() => {
        const baseDate = Array.isArray(date) ? date[0] : date
        if (!baseDate) return
        // Only run for valid Date
        const base = baseDate instanceof Date ? baseDate : new Date(baseDate)
        if (isNaN(base)) return

        let isCancelled = false
        const loadNearby = async () => {
            const cacheKey = getCacheKey(filters.origin, filters.destination, filters.cabinClass, filters.travelerCount)
            
            // Try to get from cache first
            const cachedData = getCachedFares(cacheKey)
            if (cachedData) {
                console.log('[FLEXIBLE DATES] Using cached data')
                
                // Check if cached data has any prices - if not, skip cache
                const hasAnyPrices = cachedData.some(d => d.price !== null)
                if (!hasAnyPrices) {
                    console.log('[FLEXIBLE DATES] Cached data has no prices, fetching fresh data...')
                } else {
                    setNearbyFares(cachedData)
                    setIsNearbyLoading(false)
                    return
                }
            }
            
            setIsNearbyLoading(true)
            
            // Responsive date offsets based on screen size (future dates only)
            const getResponsiveOffsets = () => {
                if (screenWidth < 640) { // Mobile: 3 days
                    return [0, 1, 2, 3]
                } else if (screenWidth < 1024) { // Tablet: 5 days
                    return [0, 1, 2, 3, 4]
                } else { // Desktop: 7 days
                    return [0, 1, 2, 3, 4, 5, 6]
                }
            }
            
            const offsets = getResponsiveOffsets()
            const dates = offsets.map((o) => addDays(base, o))
            
            try {
                console.log(`[FLEXIBLE DATES] Fetching ${offsets.length} dates using Flight Inspiration API`)
                
                // Use single API call for all dates
                await fetchFlexibleDates(dates)
                
                console.log(`[FLEXIBLE DATES] Single API call completed for ${offsets.length} dates`)
                
            } catch (error) {
                console.error('[FLEXIBLE DATES] Error in flexible dates fetch:', error)
                
                // Fallback: show empty prices
                const emptyData = dates.map((d) => ({
                            date: d,
                            price: null,
                            currency: 'PHP',
                            ymd: formatToYMD(d),
                    flights: []
                }))
                setNearbyFares(emptyData)
            } finally {
                if (!isCancelled) setIsNearbyLoading(false)
            }
        }
        loadNearby()
        return () => {
            isCancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.origin, filters.destination, filters.cabinClass, filters.travelerCount, date, screenWidth])

    const handleSelectNearbyDate = async (d, dateIndex) => {
        console.log('[FLEXIBLE DATES] Date clicked:', d, 'Index:', dateIndex)
        setIsDateLoading(true)
        setLoadingDate(formatToYMD(d))
        
        // Update selected index immediately for UI feedback
        setSelectedDateIndex(dateIndex)
        
        try {
            const dateStr = formatToYMD(d)
            
            // Check if we have flights for this date from the flexible dates response
            const nearbyFare = nearbyFares.find(fare => fare.ymd === dateStr)
            console.log('[FLEXIBLE DATES] Checking nearbyFare for', dateStr, ':', nearbyFare)
            
            if (nearbyFare && nearbyFare.flights && nearbyFare.flights.length > 0) {
                console.log('[FLEXIBLE DATES] Using flights from flexible dates response for:', dateStr)
                const formattedData = { outbound: nearbyFare.flights }
                setAllFlights(formattedData)
                setFilters((prev) => ({ ...prev, date: d }))
                setCurrentPage(0)
                return
            }
            
            console.log('[FLEXIBLE DATES] No flights found in flexible response for:', dateStr)
            console.log('[FLEXIBLE DATES] Available nearbyFares:', nearbyFares.map(f => ({ ymd: f.ymd, hasFlights: f.flights?.length > 0 })))
            
            // If no flights in flexible response, make a regular search
            console.log('[FLEXIBLE DATES] No flights in flexible response, making regular search for:', dateStr)
            setIsLoading(true)
            
            const payload = {
                tripType: filters.tripType,
                date: dateStr,
                origin: filters.origin,
                destination: filters.destination,
                travelerCount: filters.travelerCount,
                cabinClass: filters.cabinClass,
            }

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/flights/search`,
                payload,
                { timeout: 10000 }
            )
            
            const flights = res?.data?.flights?.outbound || []
            if (flights.length > 0) {
                const formattedData = { outbound: flights }
                setAllFlights(formattedData)
                setFilters((prev) => ({ ...prev, date: d }))
                setCurrentPage(0)
            } else {
                console.warn('[FLEXIBLE DATES] No flights found for selected date:', dateStr)
            }
        } catch (error) {
            console.error('[FLEXIBLE DATES] Error selecting date:', error.message)
            // UI keeps previous results on error
        } finally {
            setIsDateLoading(false)
            setLoadingDate(null)
            setIsLoading(false)
        }
    }


    return (
        <div className='flight-results pt-[var(--default-padding-top)] lg:pt-25 md:pt-35'>
            <FilterModal
                filters={filters}
                setFilters={setFilters}
                selectedFilter={selectedFilter}
                setSelectedFilter={setSelectedFilter}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                setAllFlights={setAllFlights}
                setIsLoading={setIsLoading}
            />
            <div className='flight-nav max-w-[1200px] mx-auto'>
                <div className='flight-nav__tabs'>
                    {/* Flights Button */}
                    <PrimaryButton
                        className={`flight-nav__tab ${
                            activeTab === 'flights'
                                ? ''
                                : 'flight-nav__tab--disabled'
                        }`}
                        isBold={true}
                        icon={<FaPlane />}
                        buttonText={'Flights'}
                        onClick={() => handleClick('flights')}
                    />
                    {/* Hotels Button */}
                    <PrimaryButton
                        className={`flight-nav__tab ${
                            activeTab === 'hotels'
                                ? ''
                                : 'flight-nav__tab--disabled'
                        }`}
                        isBold={true}
                        icon={<FaHotel />}
                        buttonText={'Hotels'}
                        onClick={() => handleClick('hotels')}
                    />
                    {/* Car Hire Button */}
                    <PrimaryButton
                        className={`flight-nav__tab ${
                            activeTab === 'carHire'
                                ? ''
                                : 'flight-nav__tab--disabled'
                        }`}
                        isBold={true}
                        icon={<FaCarSide />}
                        buttonText={'Car Hire'}
                        onClick={() => handleClick('carHire')}
                    />
                </div>

                <div className='flight-nav__location'>
                    <IoChevronBack
                        className='flight-nav__back-icon'
                        onClick={handleBackClick}
                    />
                    <button
                        onClick={() => {
                            setSelectedFilter('destination')
                            setIsModalOpen(true)
                        }}
                        className='flight-nav__input'
                    >
                        {/* Destination */}
                        {
                            (filters.destination ?? destination)?.label?.split(
                                ' - '
                            )[0]
                        }
                    </button>
                </div>

                <div className='flight-nav__filters'>
                    <button
                        onClick={() => {
                            setSelectedFilter('origin')
                            setIsModalOpen(true)
                        }}
                        className='flight-nav__filter'
                    >
                        {/* Origin */}
                        From{' '}
                        {
                            (filters.origin ?? destination)?.label?.split(
                                ' - '
                            )[0]
                        }
                        <FaAngleDown />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedFilter('cabinAndtravellers')
                            setIsModalOpen(true)
                        }}
                        className='flight-nav__filter'
                    >
                        {/* Passenger Count */}
                        {travelerCount.adults + travelerCount.children}{' '}
                        Travellers
                        <FaAngleDown />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedFilter('date')
                            setIsModalOpen(true)
                        }}
                        className='flight-nav__filter'
                    >
                        {/* Date */}
                        {Array.isArray(date) && date.length === 2
                            ? `${formatToLongDate(
                                  date[0]
                              )} to ${formatToLongDate(date[1])}`
                            : formatToLongDate(date) || 'Select Date'}
                        <FaAngleDown />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedFilter('cabinAndtravellers')
                            setIsModalOpen(true)
                        }}
                        className='flight-nav__filter'
                    >
                        {/* Cabin Class */}
                        {cabinClass.label} <FaAngleDown />
                    </button>
                </div>
            </div>

            <div className='flight-results__main'>
                {activeTab === 'flights' && (
                    <>
                        <div className='flight-results__panel max-w-[1200px] mx-auto w-screen'>
                            <div className='flight-results__header '>
                                <div className='flight-results__title'>
                                    <h2>Flights</h2>
                                    <p>Results: {sortedFlights.length}</p>
                                </div>
                                <div className='flight-results__actions'>
                                    <button
                                        onClick={() => {
                                            setSelectedFilter('filter')
                                            setIsModalOpen(true)
                                        }}
                                        className='flight-results__btn'
                                    >
                                        Filter
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedFilter('sort')
                                            setIsModalOpen(true)
                                        }}
                                        className='flight-results__btn'
                                    >
                                        Sort
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedFilter('notif')
                                            setIsModalOpen(true)
                                        }}
                                        className='flight-results__btn'
                                    >
                                        <FaBell />
                                    </button>
                                </div>
                            </div>
                            {/* Nearby dates fare strip */}
                            <div className='lg:mt-4 mt-6 px-0 lg:px-4 lg:px-0'>
                                <div className='mb-2 sm:mb-3'>
                                    <h3 className='text-base sm:text-lg font-semibold text-gray-800 text-center'>
                                        Flexible Dates - Compare Prices
                                    </h3>
                                    <p className='text-xs sm:text-sm text-gray-600 text-center mt-1'>
                                        Click on any date to see available flights
                                    </p>
                                </div>
                                <div className='flex justify-evenly gap-3 lg:gap-4 overflow-x-auto no-scrollbar py-2 sm:py-4 lg:px-4 px-0'>
                                    {(isNearbyLoading ? Array.from({ length: screenWidth < 640 ? 4 : screenWidth < 1024 ? 5 : 7 }) : nearbyFares).map((item, idx) => {
                                        const dateObj = item?.date ? (item.date instanceof Date ? item.date : new Date(item.date)) : null
                                        const isSelected = idx === selectedDateIndex
                                        const isToday = item && dateObj && formatToYMD(dateObj) === formatToYMD(new Date())
                                        const isWeekend = dateObj && (dateObj.getDay() === 0 || dateObj.getDay() === 6)
                                        const isThisDateLoading = isDateLoading && loadingDate === formatToYMD(dateObj)
                                        
                                        return (
                                            <button
                                                key={idx}
                                                className={clsx(
                                                    'relative rounded-lg sm:rounded-xl border-2 px-2 sm:px-4 py-2 sm:py-3 min-w-[90px] sm:min-w-[120px] text-left cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105 group flex-shrink-0',
                                                    isSelected
                                                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 border-yellow-600 shadow-lg ring-2 ring-yellow-300 ring-opacity-50'
                                                        : 'bg-white border-gray-200 hover:border-yellow-300 hover:bg-yellow-50',
                                                    isNearbyLoading && 'animate-pulse bg-gray-100',
                                                    isThisDateLoading && 'bg-blue-50 border-blue-300 animate-pulse'
                                                )}
                                                disabled={isNearbyLoading || isThisDateLoading}
                                                onClick={() => {
                                                    console.log('[FLEXIBLE DATES] Button clicked:', { item, dateObj, idx, isNearbyLoading, disabled: isNearbyLoading })
                                                    if (item && dateObj && !isNearbyLoading) {
                                                        handleSelectNearbyDate(dateObj, idx)
                                                    } else {
                                                        console.log('[FLEXIBLE DATES] Click ignored - missing data or loading')
                                                    }
                                                }}
                                            >
                                                {/* Day indicator */}
                                                <div className={clsx(
                                                    'text-xs font-medium mb-1',
                                                    isSelected ? 'text-yellow-900' : 'text-gray-500',
                                                    isToday && 'text-blue-600 font-bold'
                                                )}>
                                                    {isToday ? 'TODAY' : formatToLongDate(dateObj || new Date()).split(',')[0].toUpperCase()}
                                                </div>
                                                
                                                {/* Date */}
                                                <div className={clsx(
                                                    'text-sm font-semibold mb-1',
                                                    isSelected ? 'text-yellow-900' : 'text-gray-800',
                                                    isWeekend && !isSelected && 'text-blue-600'
                                                )}>
                                                    {dateObj ? dateObj.getDate() : '—'}
                                                </div>
                                                
                                                {/* Price */}
                                                <div className={clsx(
                                                    'text-xs font-bold',
                                                    isSelected ? 'text-yellow-900' : 'text-gray-900',
                                                    !item?.price && 'text-gray-400',
                                                    isThisDateLoading && 'text-blue-600'
                                                )}>
                                                    {isThisDateLoading 
                                                        ? 'Loading...' 
                                                        : item?.price
                                                            ? `${item.currency} ${formatPrice(item.price)}`
                                                            : isNearbyLoading ? '...' : '—'}
                                                </div>
                                                
                                                {/* Selected indicator */}
                                                {isSelected && (
                                                    <div className='absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-600 rounded-full border-2 border-white'></div>
                                                )}
                                                
                                                {/* Weekend indicator */}
                                                {isWeekend && !isSelected && (
                                                    <div className='absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full'></div>
                                                )}
                                                
                                                {/* Loading overlay */}
                                                {isThisDateLoading && (
                                                    <div className='absolute inset-0 rounded-lg sm:rounded-xl bg-blue-100 bg-opacity-50 flex items-center justify-center'>
                                                        <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                                                    </div>
                                                )}
                                                
                                                {/* Hover effect overlay */}
                                                <div className={clsx(
                                                    'absolute inset-0 rounded-lg sm:rounded-xl opacity-0 transition-opacity duration-200',
                                                    !isSelected && !isThisDateLoading && 'group-hover:opacity-10 group-hover:bg-yellow-400'
                                                )}></div>
                                            </button>
                                        )
                                    })}
                                </div>
                                
                                {/* Loading indicator */}
                                {isNearbyLoading && (
                                    <div className='flex justify-center mt-2'>
                                        <div className='flex space-x-1'>
                                            <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-bounce'></div>
                                            <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-bounce' style={{animationDelay: '0.1s'}}></div>
                                            <div className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-400 rounded-full animate-bounce' style={{animationDelay: '0.2s'}}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className='flight-results__summary'>
                                <div
                                    className={clsx(
                                        'flight-results__card',
                                        sortBy === 'best' &&
                                            'flight-results__card--selected'
                                    )}
                                    onClick={() => {
                                        handleSelectFlightCard('best')
                                    }}
                                >
                                    <p className='flight-results__label'>
                                        Best
                                    </p>
                                    <p className='flight-results__price'>
                                        <b>
                                            {currency} {bestFlightPrice}
                                        </b>
                                    </p>
                                    <p className='flight-results__duration'>
                                        {bestFlightDuration}
                                    </p>
                                </div>
                                <div
                                    className={clsx(
                                        'flight-results__card',
                                        sortBy === 'cheapest' &&
                                            'flight-results__card--selected'
                                    )}
                                    onClick={() => {
                                        handleSelectFlightCard('cheapest')
                                    }}
                                >
                                    <p className='flight-results__label'>
                                        Cheapest
                                    </p>
                                    <p className='flight-results__price'>
                                        <b>
                                            {currency} {cheapestFlightPrice}
                                        </b>
                                    </p>
                                    <p className='flight-results__duration'>
                                        {cheapestFlightDuration}
                                    </p>
                                </div>
                                <div
                                    className={clsx(
                                        'flight-results__card',
                                        sortBy === 'fastest' &&
                                            'flight-results__card--selected'
                                    )}
                                    onClick={() => {
                                        handleSelectFlightCard('fastest')
                                    }}
                                >
                                    <p className='flight-results__label'>
                                        Fastest
                                    </p>
                                    <p className='flight-results__price'>
                                        <b>
                                            {currency} {fastestFlightPrice}
                                        </b>
                                    </p>
                                    <p className='flight-results__duration'>
                                        {fastestFlightDuration}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <section className='flight-results__list'>
                            {allFlights.length === 0 && (
                                <>
                                    <h2 className='flight-results__empty'>
                                        No Flights Found {':('}
                                    </h2>
                                </>
                            )}
                            {isLoading ? (
                                <div className='flight-result__spinner'>
                                    <SyncLoader
                                        color='#f7d100'
                                        size={10}
                                    />
                                </div>
                            ) : (
                                flightsResult
                            )}

                            {!isLoading && totalPages > 1 && (
                                <ReactPaginate
                                    previousLabel={<IoChevronBack />}
                                    nextLabel={<IoChevronForward />}
                                    breakLabel={'...'}
                                    pageCount={totalPages}
                                    marginPagesDisplayed={1}
                                    pageRangeDisplayed={3}
                                    onPageChange={handlePageClick}
                                    forcePage={currentPage}
                                    containerClassName={'pagination'}
                                    activeClassName={'active'}
                                />
                            )}
                        </section>
                    </>
                )}

                {activeTab === 'hotels' && (
                    <>
                        {isLoading ? (
                            <div className='flight-result__spinner'>
                                <SyncLoader
                                    color='#f7d100'
                                    size={10}
                                />
                            </div>
                        ) : (
                            <h1 className='hotel-main-header'>
                                Hotels Coming Soon!
                            </h1>
                        )}
                    </>
                )}

                {activeTab === 'carHire' && (
                    <>
                        {isLoading ? (
                            <div className='flight-result__spinner'>
                                <SyncLoader
                                    color='#f7d100'
                                    size={10}
                                />
                            </div>
                        ) : (
                            <h1 className='car-hire-main-header'>
                                Car Hire Coming Soon!
                            </h1>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default FlightSearchResults

