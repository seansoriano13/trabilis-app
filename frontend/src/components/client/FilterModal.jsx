import { IoChevronBack } from 'react-icons/io5'
import Modal from 'react-modal'
import AsyncSelect from 'react-select/async'
import { useAirports } from '../../context/AirportContext'
import { defaultAirportOptionsData } from '../../utils/defaultAirportOptions'
import { loadOptions } from '../../utils/airportOptionsLoader'
import './FilterModal.css'
import { flightNavInputStyles } from '../../styles/client/reactSelectStyles'
import { TRIP_TYPES, CABIN_CLASSES } from '../../utils/options'
import Select from 'react-select'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/light.css'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import debounce from 'lodash.debounce'
import PrimaryButton from './PrimaryButton'
import axios from 'axios'
import { formatToYMD } from '../../utils/flightUtils'

export default function FilterModal({
    isOpen,
    onClose,
    filters,
    setFilters,
    selectedFilter,
    setAllFlights,
    setIsLoading,
}) {
    const API_ENDPOINT = '/api/v1/flights/search'
    const prevFiltersRef = useRef(filters)

    const areFiltersEqual = (prev, curr) => {
        if (!prev || !curr) return false
        return (
            prev.tripType?.value === curr.tripType?.value &&
            prev.date === curr.date &&
            prev.origin?.value === curr.origin?.value &&
            prev.destination?.value === curr.destination?.value &&
            prev.travelerCount === curr.travelerCount &&
            prev.cabinClass?.value === curr.cabinClass?.value
        )
    }

    const getFormattedDate = () => {
        if (
            filters.tripType.value === 'round-trip' &&
            Array.isArray(filters.date)
        ) {
            return filters.date.map(formatToYMD)
        }
        return formatToYMD(filters.date)
    }

    const formattedDate = getFormattedDate()

    const searchFlights = async (
        tripType,
        date,
        origin,
        destination,
        travelerCount,
        cabinClass
    ) => {
        const response = await axios.post(API_ENDPOINT, {
            tripType,
            date,
            origin,
            destination,
            travelerCount,
            cabinClass,
        })
        return response.data
    }

    const fetchFlights = useCallback(async () => {
        if (areFiltersEqual(prevFiltersRef.current, filters)) {
            return
        }

        if (
            !filters.origin?.value ||
            !filters.destination?.value ||
            !filters.tripType?.value
        ) {
            console.warn('Missing required filter values. Skipping fetch.')
            return
        }
        setIsLoading(true)
        try {
            const data = await searchFlights(
                filters.tripType,
                formattedDate,
                filters.origin,
                filters.destination,
                filters.travelerCount,
                filters.cabinClass
            )
            setAllFlights(data.flights || [])
            prevFiltersRef.current = filters
            console.log('Flights fetched successfully')
        } catch (error) {
            console.error('Failed to fetch flights:', error)
        } finally {
            setIsLoading(false)
        }
    }, [filters])

    // Effect to trigger fetch on filter changes or isOpen toggle
    useEffect(() => {
        if (!isOpen) {
            fetchFlights()
        }
    }, [isOpen, fetchFlights])

    const debouncedChange = useMemo(
        () =>
            debounce((key, value) => {
                setFilters((prev) => ({ ...prev, [key]: value }))
            }, 300),
        [setFilters]
    )

    // Radio State
    const [selectedSortOption, setSelectedSortoption] = useState('best')

    const datepickerRef = useRef()
    const { airports: options, loading } = useAirports()
    const handleChange = (key, value) => {
        debouncedChange(key, value)
    }
    const handleTripTypeChange = (val) => {
        setFilters((prev) => ({
            ...prev,
            tripType: val,
            date: null,
        }))

        if (datepickerRef.current) {
            datepickerRef.current.flatpickr.clear()
        }
    }
    const { asyncLoader, defaultOptions } = loadOptions(
        options,
        defaultAirportOptionsData
    )

    const increment = (type) => {
        const current = filters.travelerCount ?? { adults: 1, children: 0 }
        const updated = {
            ...current,
            [type]: current[type] + 1,
        }
        handleChange('travelerCount', updated)
    }

    const decrement = (type) => {
        const current = filters.travelerCount ?? { adults: 1, children: 0 }

        const key = type === 'adult' ? 'adults' : 'children'
        const min = type === 'adult' ? 1 : 0

        if (current[key] > min) {
            const updated = {
                ...current,
                [key]: current[key] - 1,
            }
            handleChange('travelerCount', updated)
        }
    }

    // Derived Const
    const sortList = useMemo(() => {
        const defaultSortList = [
            {
                value: 'best',
                title: 'Best',
                sub: 'Best of Best',
            },
            {
                value: 'pricePerAdult',
                title: 'Price Per Adult',
                sub: 'Cheapest first',
            },
            {
                value: 'totalJourneyTime',
                title: 'Total journey time',
                sub: 'Fastest first',
            },
            {
                value: 'outboundDepartureTime',
                title: 'Outbound: Departure time',
                sub: 'Early - late',
            },
            {
                value: 'returnDepartureTime',
                title: 'Return: Departure time',
                sub: 'Early - late',
            },
        ]
        if (filters.tripType === 'one-way') {
            return defaultSortList.slice(0, -1)
        }
        return defaultSortList
    }, [filters.tripType])

    const renderContent = () => {
        const renderAsyncSelect = (name, value, placeholder) => (
            <div className='flight-nav__section'>
                <h2 className='flight-nav__heading'>Choose {name}</h2>
                <AsyncSelect
                    required
                    name={name}
                    cacheOptions
                    defaultOptions={defaultOptions}
                    loadOptions={asyncLoader}
                    onChange={(val) => {
                        handleChange(name, val)
                        onClose()
                    }}
                    value={value}
                    placeholder={loading ? 'Loading...' : placeholder}
                    styles={flightNavInputStyles}
                    isSearchable
                />
                <hr className='flight-result__line' />
            </div>
        )

        switch (selectedFilter) {
            case 'origin':
                return renderAsyncSelect(
                    'origin',
                    filters.origin,
                    'Select Origin'
                )

            case 'destination':
                return renderAsyncSelect(
                    'destination',
                    filters.destination,
                    'Select Destination'
                )

            case 'cabinAndtravellers':
                return (
                    <>
                        <div className='flight-nav__section'>
                            <p className='flight-nav__heading'>
                                <b>Choose cabin class and travellers</b>
                            </p>

                            <div className='flight-nav__cabin'>
                                <p className='flight-nav__label'>
                                    <b>Cabin class</b>
                                </p>
                                <Select
                                    name='cabinClass'
                                    defaultValue={filters.cabinClass}
                                    isSearchable={false}
                                    options={CABIN_CLASSES}
                                    onChange={(val) =>
                                        handleChange('cabinClass', val)
                                    }
                                    styles={flightNavInputStyles}
                                />
                            </div>

                            <div className='flight-nav__group'>
                                <div>
                                    <p className='flight-nav__label'>
                                        <b>Adults</b>
                                    </p>
                                    <p className='flight-nav__subtext'>
                                        Aged 18+
                                    </p>
                                </div>
                                <div className='flight-nav__controls'>
                                    <div>
                                        <button
                                            onClick={() => decrement('adult')}
                                            className='flight-nav__button'
                                        >
                                            -
                                        </button>
                                    </div>
                                    <span className='flight-nav__count'>
                                        {filters.travelerCount.adults}
                                    </span>
                                    <div>
                                        <button
                                            onClick={() => increment('adults')}
                                            className='flight-nav__button'
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className='flight-nav__group'>
                                <div>
                                    <p className='flight-nav__label'>
                                        <b>Children</b>
                                    </p>
                                    <p className='flight-nav__subtext'>
                                        Aged 0 to 17
                                    </p>
                                </div>
                                <div className='flight-nav__controls'>
                                    <button
                                        onClick={() => decrement('children')}
                                        className='flight-nav__button'
                                    >
                                        -
                                    </button>
                                    <span className='flight-nav__count'>
                                        {filters.travelerCount.children}
                                    </span>
                                    <button
                                        onClick={() => increment('children')}
                                        className='flight-nav__button'
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className='flight-nav__note'>
                                <p>
                                    Your age at time of travel must be valid for
                                    the age category booked. Airlines have
                                    restrictions on under 18s travelling alone.
                                </p>
                                <p>
                                    Age limits and policies for travelling with
                                    children may vary so please check with the
                                    airline before booking.
                                </p>
                            </div>
                        </div>
                        <PrimaryButton
                            onClick={onClose}
                            isBold={true}
                            buttonText={'Apply'}
                            className='flight-nav__apply'
                        />
                    </>
                )

            case 'date':
                return (
                    <div className='flight-nav__section'>
                        <h2 className='flight-nav__heading'>
                            Choose {selectedFilter}
                        </h2>
                        <p className='flight-nav__route'>
                            <b>From </b>
                            {filters.origin.label.split(' - ')[0]}
                            <br />
                            <b>to</b>{' '}
                            {filters.destination.label.split(' - ')[0]}
                        </p>
                        <Select
                            name='tripType'
                            defaultValue={filters.tripType}
                            isSearchable={false}
                            options={TRIP_TYPES}
                            onChange={handleTripTypeChange}
                            styles={flightNavInputStyles}
                        />
                        <div className='filter-modal-flatpickr'>
                            <Flatpickr
                                required
                                name='flightDate'
                                ref={datepickerRef}
                                placeholder='Dates'
                                value={(() => {
                                    if (filters.tripType.value === 'round-trip')
                                        return filters.date || []
                                    return filters.date ? [filters.date[0]] : []
                                })()}
                                onChange={(val) => {
                                    handleChange('date', val)
                                }}
                                options={{
                                    mode:
                                        filters.tripType.value === 'round-trip'
                                            ? 'range'
                                            : 'single',
                                    dateFormat: 'Y-m-d',
                                    altFormat:
                                        filters.tripType.value === 'round-trip'
                                            ? 'M j, Y \\t\\o M j, Y'
                                            : 'M j, Y',
                                    disableMobile: true,
                                    closeOnSelect: false,
                                    minDate: 'today',
                                    inline: true,
                                }}
                            />
                        </div>
                        <PrimaryButton
                            onClick={onClose}
                            isBold={true}
                            buttonText={'Apply'}
                            className='flight-nav__apply'
                        />
                    </div>
                )
            case 'sort':
                return (
                    <>
                        <div className='sort-modal'>
                            <div className='sort-modal__header'>
                                <p className='sort-modal__title'>
                                    <b>Sort by</b>
                                </p>
                            </div>
                            <div className='sort-modal__options'>
                                {sortList.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`sort-modal__option ${
                                            selectedSortOption === option.value
                                                ? 'checked'
                                                : ''
                                        }`}
                                    >
                                        <input
                                            type='radio'
                                            name='sortFlights'
                                            value={option.value}
                                            checked={
                                                selectedSortOption ===
                                                option.value
                                            }
                                            onChange={(e) =>
                                                setSelectedSortoption(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <p className='sort-modal__option-title'>
                                            {option.title}
                                        </p>
                                        <p className='sort-modal__option-sub'>
                                            {option.sub}
                                        </p>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <PrimaryButton
                            onClick={onClose}
                            isBold={true}
                            buttonText={'Apply'}
                            className='sort-modal__done-btn'
                        />
                    </>
                )
            case 'filter':
                return (
                    <>
                        <div className='custom-filter-modal'>
                            <div>
                                <h1>{selectedFilter.toUpperCase()}</h1> Coming
                                Soon!
                            </div>
                        </div>
                    </>
                )
            case 'notif':
                return (
                    <>
                        <div className='custom-filter-modal'>
                            <div>
                                <h1>{selectedFilter.toUpperCase()}</h1> Coming
                                Soon!
                            </div>
                        </div>
                    </>
                )
            default:
                return <p className='flight-nav__empty'>Select a filter</p>
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel='Filter Modal'
            className='filter-modal'
            overlayClassName='filter-modal__overlay'
        >
            <button
                className='filter-modal__back-btn'
                onClick={onClose}
            >
                <IoChevronBack className='filter-modal__back-icon' />
            </button>
            {renderContent()}
        </Modal>
    )
}
