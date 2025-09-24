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
    const [searchData, setSearchData] = useState(state)

    useEffect(() => {
        if (!state) {
            const stored = sessionStorage.getItem('searchResults')
            if (stored) setSearchData(JSON.parse(stored))
        }
    }, [state])

    if (!searchData) console.log('No Flight search results')

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

    // Nearby date fares state
    const [nearbyFares, setNearbyFares] = useState([])
    const [isNearbyLoading, setIsNearbyLoading] = useState(false)

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

    // Fetch cheapest fare for a given date using existing backend endpoint
    const fetchCheapestForDate = async (targetDate) => {
        try {
            const payload = {
                tripType: searchData?.tripType || filters.tripType,
                date: Array.isArray(searchData?.date || filters.date)
                    ? [formatToYMD(targetDate), formatToYMD(targetDate)]
                    : formatToYMD(targetDate),
                origin: searchData?.origin || filters.origin,
                destination: searchData?.destination || filters.destination,
                travelerCount:
                    searchData?.travelerCount || filters.travelerCount,
                cabinClass: searchData?.cabinClass || filters.cabinClass,
            }

            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/flights/search`,
                payload
            )
            const flights = res?.data?.flights?.outbound || []
            if (!flights.length) return { price: null, currency: 'PHP' }
            const cheapest = flights.reduce((min, f) => {
                const p = parseFloat(f?.price?.total || Infinity)
                return p < parseFloat(min?.price?.total || Infinity) ? f : min
            }, flights[0])
            return {
                price: parseFloat(cheapest.price.total),
                currency: cheapest.price.currency,
            }
        } catch (e) {
            return { price: null, currency: 'PHP' }
        }
    }

    // Build nearby (+/- 3 days) fare strip
    useEffect(() => {
        const baseDate = Array.isArray(date) ? date[0] : date
        if (!baseDate) return
        // Only run for valid Date
        const base = baseDate instanceof Date ? baseDate : new Date(baseDate)
        if (isNaN(base)) return

        let isCancelled = false
        const loadNearby = async () => {
            setIsNearbyLoading(true)
            const offsets = [-3, -2, -1, 0, 1, 2, 3]
            const dates = offsets.map((o) => addDays(base, o))
            try {
                const results = await Promise.all(
                    dates.map((d) => fetchCheapestForDate(d))
                )
                if (isCancelled) return
                const data = dates.map((d, idx) => ({
                    date: d,
                    ...results[idx],
                    ymd: formatToYMD(d),
                }))
                setNearbyFares(data)
            } finally {
                if (!isCancelled) setIsNearbyLoading(false)
            }
        }
        loadNearby()
        return () => {
            isCancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.origin, filters.destination, filters.cabinClass, filters.travelerCount, date])

    const handleSelectNearbyDate = async (d) => {
        setIsLoading(true)
        try {
            const payload = {
                tripType: filters.tripType,
                date: Array.isArray(filters.date)
                    ? [formatToYMD(d), formatToYMD(d)]
                    : formatToYMD(d),
                origin: filters.origin,
                destination: filters.destination,
                travelerCount: filters.travelerCount,
                cabinClass: filters.cabinClass,
            }
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/flights/search`,
                payload
            )
            const data = res?.data?.flights || []
            setAllFlights(data)
            setFilters((prev) => ({ ...prev, date: d }))
            setCurrentPage(0)
        } catch (e) {
            // noop UI keeps previous results
        } finally {
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
                            <div className='mt-4 px-4'>
                                <div className='flex gap-2 overflow-x-auto no-scrollbar py-2 justify-center'>
                                    {(isNearbyLoading ? Array.from({ length: 7 }) : nearbyFares).map((item, idx) => {
                                        const isSelected = item && formatToYMD(item.date) === formatToYMD(Array.isArray(date) ? date[0] : date)
                                        return (
                                            <button
                                                key={idx}
                                                className={clsx(
                                                    'rounded-md border px-3 py-2 min-w-[110px] text-left cursor-pointer',
                                                    isSelected
                                                        ? 'bg-yellow-200 border-yellow-400'
                                                        : 'bg-white border-gray-200'
                                                )}
                                                disabled={isNearbyLoading}
                                                onClick={() => item && handleSelectNearbyDate(item.date)}
                                            >
                                                <div className='text-xs opacity-70'>
                                                    {formatToLongDate(item?.date || new Date()).split(',').slice(0, 2).join(', ')}
                                                </div>
                                                <div className='font-semibold'>
                                                    {item?.price
                                                        ? `${item.currency} ${formatPrice(item.price)}`
                                                        : '—'}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
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
