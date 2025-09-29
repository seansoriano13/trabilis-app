import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowsAltH } from 'react-icons/fa'
import { IoContractSharp, IoPersonSharp } from 'react-icons/io5'
import { useState, useEffect } from 'react'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/airbnb.css'
import './PassengerDetails.css'
import { IoPersonCircle } from 'react-icons/io5'
import Select from 'react-select'
import { formSelectStyles } from '../../styles/client/reactSelectStyles'
import PrimaryButton from '../../components/client/PrimaryButton'
import { formatToYMD } from '../../utils/flightUtils.js'
import axios from 'axios'
import { calculateAge, formatPhoneForAmadeus } from '../../utils/stringUtils.js'
import countries from '../../data/CountryCodes.json'

import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { FaArrowRight } from 'react-icons/fa6'

export function PassengerForm({
    passengers,
    handleChange,
    validationErrors,
    setValidationErrors,
}) {
    // Use traveler.gender from state; no shared gender UI state

    const countryOptions = countries.map((c) => ({
        value: c.dial_code.replace('+', ''), // "63"
        label: `${c.name} (${c.dial_code})`,
        code: c.code,
    }))

    // Use ISO country codes for nationality (Amadeus expects ISO 3166-1 alpha-2)
    const nationalityOptions = countries.map((c) => ({
        value: c.code, // e.g., "PH"
        label: `${c.name} (${c.code})`,
    }))

    const issuanceCountryOptions = countries.map((c) => ({
        value: c.code, // "PH"
        label: `${c.name} (${c.code})`, // "Philippines (PH)"
    }))

    const titleOptions = [
        { value: 'MR', label: 'Mr' },
        { value: 'MRS', label: 'Mrs' },
        { value: 'MS', label: 'Ms' },
        { value: 'MASTER', label: 'Master' },
        { value: 'MISS', label: 'Miss' },
    ]

    useEffect(() => {
        if (validationErrors.length > 0) {
            const errorIndices = [
                ...new Set(validationErrors.map((error) => error.index)),
            ]

            const firstErrorIndex = errorIndices[0]
            const detailsElement = document.querySelector(
                `.passenger-form__item:nth-child(${
                    firstErrorIndex + 1
                }) details`
            )
            if (detailsElement) {
                detailsElement.open = true
                setTimeout(() => {
                    detailsElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    })
                }, 100)
            }

            errorIndices.slice(1).forEach((index) => {
                const element = document.querySelector(
                    `.passenger-form__item:nth-child(${index + 1}) details`
                )
                if (element) {
                    element.open = true
                }
            })

            const timers = validationErrors.map((error) =>
                setTimeout(() => {
                    setValidationErrors((prevErrors) =>
                        prevErrors.filter(
                            (e) =>
                                !(
                                    e.index === error.index &&
                                    e.field === error.field &&
                                    e.message === error.message
                                )
                        )
                    )
                }, 5000)
            )

            return () => {
                timers.forEach((timer) => clearTimeout(timer))
            }
        }
    }, [validationErrors, setValidationErrors])

    return (
        <div className='passenger-form'>
            {passengers.map((passenger, index) => (
                <div
                    key={index}
                    className='passenger-form__item'
                >
                    <details className='passenger-form__details'>
                        <summary className='passenger-form__summary'>
                            <b>
                                {' '}
                                Passenger {index + 1} {`(${passenger.type})`}
                            </b>
                            <p className='passenger-form__notice'>
                                Please fill personal information as shown in the
                                passport
                            </p>
                        </summary>
                        <div className='passenger-form__fields'>
                            <h2 className='passenger-form__header'>
                                Personal Information
                            </h2>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Title
                                </label>
                                <Select
                                    className='passenger-form__select'
                                    options={titleOptions}
                                    value={
                                        titleOptions.find(
                                            (opt) =>
                                                opt.value === (passenger.title || '').toUpperCase()
                                        ) || null
                                    }
                                    onChange={(selected) =>
                                        handleChange(
                                            index,
                                            'title',
                                            (selected?.value || '').toUpperCase()
                                        )
                                    }
                                    placeholder=''
                                    isSearchable={false}
                                    styles={formSelectStyles}
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'title'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>

                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    First Name
                                </label>
                                <input
                                    type='text'
                                    className='passenger-form__input'
                                    value={passenger.name.firstName}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'name.firstName',
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'name.firstName'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Last Name
                                </label>
                                <input
                                    type='text'
                                    className='passenger-form__input'
                                    value={passenger.name.lastName}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'name.lastName',
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'name.lastName'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Gender
                                </label>
                                <div className='passenger-form__gender-options'>
                                    <p
                                        onClick={() => {
                                            handleChange(
                                                index,
                                                'gender',
                                                'MALE'
                                            )
                                        }}
                                        className={`passenger-form__gender-option ${
                                            passenger.gender === 'MALE'
                                                ? 'active'
                                                : ''
                                        }`}
                                    >
                                        Male
                                    </p>
                                    <p
                                        onClick={() => {
                                            handleChange(
                                                index,
                                                'gender',
                                                'FEMALE'
                                            )
                                        }}
                                        className={`passenger-form__gender-option ${
                                            passenger.gender === 'FEMALE'
                                                ? 'active'
                                                : ''
                                        }`}
                                    >
                                        Female
                                    </p>
                                </div>
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'gender'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Birth Date
                                </label>
                                <Flatpickr
                                    className='passenger-form__input'
                                    value={
                                        passenger.dateOfBirth
                                            ? new Date(passenger.dateOfBirth)
                                            : null
                                    }
                                    onChange={([date]) =>
                                        handleChange(
                                            index,
                                            'dateOfBirth',
                                            formatToYMD(date)
                                        )
                                    }
                                    options={{
                                        maxDate: 'today',
                                        dateFormat: 'Y-m-d',
                                        disableMobile: true,
                                        closeOnSelect: true,
                                    }}
                                    required
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'dateOfBirth'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Email
                                </label>
                                <input
                                    type='email'
                                    className='passenger-form__input'
                                    value={passenger.contact.emailAddress}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'contact.emailAddress',
                                            e.target.value
                                        )
                                    }
                                    required
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'contact.emailAddress'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Country Calling Code (e.g., 63)
                                </label>
                                <Select
                                    className='passenger-form__select'
                                    options={countryOptions}
						value={
							countryOptions.find(
								(opt) =>
									opt.value ===
									(passenger.contact.phones[0]
										?.countryCallingCode || '63')
							) || null
						}
                                    onChange={(selected) =>
                                        handleChange(
                                            index,
                                            'contact.phones[0].countryCallingCode',
                                            selected?.value || '' // just digits, e.g. "63"
                                        )
                                    }
                                    placeholder='Select country code'
                                    isSearchable
                                    styles={{
                                        ...formSelectStyles,
                                        control: (provided, state) => ({
                                            ...(formSelectStyles.control
                                                ? formSelectStyles.control(
                                                      provided,
                                                      state
                                                  )
                                                : provided),
                                            padding: '.5rem 1rem',
                                        }),
                                    }}
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field ===
                                                'contact.phones[0].countryCallingCode'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Phone
                                </label>
                                <input
                                    type='tel'
                                    className='passenger-form__input'
                                    value={
                                        passenger.contact.phones[0]?.number ||
                                        ''
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'contact.phones[0]',
                                            formatPhoneForAmadeus(
                                                e.target.value,
                                                passenger.contact.phones[0]
                                                    ?.countryCallingCode || '63'
                                            )
                                        )
                                    }
                                    required
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'contact.phones[0]'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                            <h2 className='passenger-form__header'>
                                Passport Information
                            </h2>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Passport Number
                                </label>
                                <input
                                    type='text'
                                    className='passenger-form__input'
                                    value={passenger.documents[0]?.number || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'documents[0].number',
                                            e.target.value
                                        )
                                    }
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'documents[0].number'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Nationality (e.g., PH)
                                </label>
                                <Select
                                    className='passenger-form__select'
                                    options={nationalityOptions}
                                    value={
                                        nationalityOptions.find(
                                            (opt) =>
                                                opt.value ===
                                                (passenger.documents[0]
                                                    ?.nationality || 'PH')
                                        ) || null
                                    }
                                    onChange={(selected) =>
                                        handleChange(
                                            index,
                                            'documents[0].nationality',
                                            selected?.value || ''
                                        )
                                    }
                                    placeholder=''
                                    isSearchable={true}
                                    styles={{
                                        ...formSelectStyles,
                                        control: (provided, state) => ({
                                            ...(formSelectStyles.control
                                                ? formSelectStyles.control(
                                                      provided,
                                                      state
                                                  )
                                                : provided),
                                            padding: '.5rem 1rem',
                                        }),
                                    }}
                                />

                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field ===
                                                'documents[0].nationality'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Issuance Country (e.g., PH)
                                </label>
                                <Select
                                    className='passenger-form__select'
                                    options={issuanceCountryOptions}
                                    value={
                                        issuanceCountryOptions.find(
                                            (opt) =>
                                                opt.value ===
                                                passenger.documents[0]
                                                    ?.issuanceCountry
                                        ) || null
                                    }
                                    onChange={(selected) =>
                                        handleChange(
                                            index,
                                            'documents[0].issuanceCountry',
                                            selected?.value || ''
                                        )
                                    }
                                    placeholder=''
                                    isSearchable={true}
                                    styles={{
                                        ...formSelectStyles,
                                        control: (provided, state) => ({
                                            ...(formSelectStyles.control
                                                ? formSelectStyles.control(
                                                      provided,
                                                      state
                                                  )
                                                : provided),
                                            padding: '.5rem 1rem',
                                        }),
                                    }}
                                />

                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field ===
                                                'documents[0].issuanceCountry'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Passport Expiry Date
                                </label>
                                <Flatpickr
                                    className='passenger-form__input'
                                    value={
                                        passenger.documents[0]?.expiryDate
                                            ? new Date(
                                                  passenger.documents[0].expiryDate
                                              )
                                            : null
                                    }
                                    onChange={([date]) =>
                                        handleChange(
                                            index,
                                            'documents[0].expiryDate',
                                            formatToYMD(date)
                                        )
                                    }
                                    options={{
                                        minDate: 'today',
                                        dateFormat: 'Y-m-d',
                                        disableMobile: true,
                                        closeOnSelect: true,
                                    }}
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field ===
                                                'documents[0].expiryDate'
                                    )
                                    .map((e) => (
                                        <p
                                            key={`${e.index}-${e.field}-${
                                                e.message
                                            }-${Date.now()}`}
                                            className='error-message'
                                        >
                                            {e.message}
                                        </p>
                                    ))}
                            </div>
                        </div>
                    </details>
                </div>
            ))}
        </div>
    )
}

function PassengerDetails() {
    const { state } = useLocation()

    const [, setPassengerData] = useState(state)

    useEffect(() => {
        if (!state) {
            const stored = sessionStorage.getItem('passengerData')
            if (stored) setPassengerData(JSON.parse(stored))
        }
    }, [state])

    const navigate = useNavigate()

    const { adults, children } = state.travelerCount
    const totalPassengers = adults + children

    const flightOffer = state.flight.flight || []

    const [passengers, setPassengers] = useState(
        Array.from({ length: totalPassengers }, (_, i) => ({
            id: `${i + 1}`,
            type: i < adults ? 'ADULT' : 'CHILD',
            title: 'MR',
            name: {
                firstName: 'Sean',
                lastName: 'Soriano',
            },
            gender: 'MALE',
            dateOfBirth: '2000-08-07',
            contact: {
                emailAddress: 'arkadatax03@gmail.com',
                phones: [
                    {
                        deviceType: 'MOBILE',
						countryCallingCode: '63',
                        number: '9927831240',
                    },
                ],
            },
            documents: [
                {
                    documentType: 'PASSPORT',
                    number: 'AB1234567',
                    nationality: 'PH',
                    issuanceCountry: 'PH',
                    expiryDate: '2032-08-07',
                    issuanceDate: '2024-08-07',
                    validityCountry: 'PH',
                    placeOfBirth: 'Manila',
                    holder: true,
                },
            ],
        }))
    )

    // HandleChange inputs
    const handleChange = (index, field, value) => {
        const updated = [...passengers]
        const keys = field.split('.')
        let target = updated[index]
        for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]] = target[keys[i]] || {}
        }
        target[keys[keys.length - 1]] = value
        setPassengers(updated)
    }

    const origin = state.origin
    const destination = state.destination
    const inboundDeparture = state.inboundDeparture
    const outboundDeparture = state.outboundDeparture
    const tripType = !inboundDeparture ? 'oneWay' : 'roundTrip'

    const [isLoading, setIsLoading] = useState(false)
    const [validationErrors, setValidationErrors] = useState([])

    const handleSubmit = async () => {
        const errors = []
        setIsLoading(true)

        try {
            for (const [index, passenger] of passengers.entries()) {
                try {
                    const age = calculateAge(passenger.dateOfBirth)

                    if (!passenger.title) {
                        errors.push({
                            index,
                            field: 'title',
                            message: 'Title is required',
                        })
                    }

                    if (!passenger.name.firstName) {
                        errors.push({
                            index,
                            field: 'name.firstName',
                            message: 'First name is required',
                        })
                    }

                    if (!passenger.name.lastName) {
                        errors.push({
                            index,
                            field: 'name.lastName',
                            message: 'Last name is required',
                        })
                    }

                    if (!passenger.gender) {
                        errors.push({
                            index,
                            field: 'gender',
                            message: 'Gender is required',
                        })
                    }

                    if (!passenger.dateOfBirth) {
                        errors.push({
                            index,
                            field: 'dateOfBirth',
                            message: 'Date of birth is required',
                        })
                    }

                    if (passenger.type === 'CHILD' && age >= 12) {
                        errors.push({
                            index,
                            field: 'dateOfBirth',
                            message: 'Child must be under 12 years old',
                        })
                    }

                    if (
                        !passenger.contact.emailAddress &&
                        !passenger.contact.phones[0]?.number
                    ) {
                        errors.push({
                            index,
                            field: 'contact.emailAddress',
                            message: 'At least email or phone is required',
                        })
                        errors.push({
                            index,
                            field: 'contact.phones[0]',
                            message: 'At least email or phone is required',
                        })
                    }

                    if (!passenger.contact.phones[0]?.countryCallingCode) {
                        errors.push({
                            index,
                            field: 'contact.phones[0].countryCallingCode',
                            message: 'Country calling code is required',
                        })
                    }

                    if (
                        passenger.documents[0]?.documentType === 'PASSPORT' &&
                        !passenger.documents[0]?.holder
                    ) {
                        errors.push({
                            index,
                            field: 'documents[0].holder',
                            message: 'Passport holder field is required',
                        })
                    }
                } catch (error) {
                    errors.push({
                        index,
                        field: 'dateOfBirth',
                        message: error.message || 'Invalid date of birth',
                    })
                }
            }

            if (errors.length > 0) {
                setValidationErrors(errors)
                setIsLoading(false)
                return
            }

            // Normalize travelers to match API expectations
            const normalizedTravelers = passengers.map((p, idx) => ({
                id: `${idx + 1}`,
                type: (p.type || '').toUpperCase(),
                title: (p.title || 'MR').toUpperCase(),
                gender: (p.gender || '').toUpperCase(),
                name: {
                    firstName: p.name?.firstName || '',
                    lastName: p.name?.lastName || '',
                },
                dateOfBirth: p.dateOfBirth || '',
                contact: {
                    emailAddress: p.contact?.emailAddress || '',
                    phones: [
                        {
                            deviceType: 'MOBILE',
                            countryCallingCode:
                                p.contact?.phones?.[0]?.countryCallingCode || '63',
                            number: p.contact?.phones?.[0]?.number || '',
                        },
                    ],
                },
                documents: [
                    {
                        documentType: p.documents?.[0]?.documentType || 'PASSPORT',
                        number: p.documents?.[0]?.number || '',
                        nationality: p.documents?.[0]?.nationality || 'PH',
                        issuanceCountry: p.documents?.[0]?.issuanceCountry || 'PH',
                        expiryDate: p.documents?.[0]?.expiryDate || '',
                        issuanceDate: p.documents?.[0]?.issuanceDate || '',
                        validityCountry: p.documents?.[0]?.validityCountry || 'PH',
                        placeOfBirth: p.documents?.[0]?.placeOfBirth || '',
                        holder: Boolean(p.documents?.[0]?.holder),
                    },
                ],
            }))

            const passengerData = {
                travelers: normalizedTravelers,
                remarks: {
                    general: [
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'ONLINE BOOKING FROM INCREIBLE VIAJES',
                        },
                    ],
                },
                ticketingAgreement: {
                    option: 'DELAY_TO_CANCEL',
                    delay: '6D',
                },
                contacts: [
                    {
                        addresseeName: {
                            firstName: 'PABLO',
                            lastName: 'RODRIGUEZ',
                        },
                        companyName: 'INCREIBLE VIAJES',
                        purpose: 'STANDARD',
                        phones: [
                            {
                                deviceType: 'LANDLINE',
                                countryCallingCode: '34',
                                number: '480080071',
                            },
                            {
                                deviceType: 'MOBILE',
                                countryCallingCode: '33',
                                number: '480080072',
                            },
                        ],
                        emailAddress: 'support@increibleviajes.es',
                        address: {
                            lines: ['Calle Prado, 16'],
                            postalCode: '28014',
                            cityName: 'Madrid',
                            countryCode: 'ES',
                        },
                    },
                ],
            }

            const searchCriteria = {
                tripType,
                origin,
                destination,
                inboundDeparture,
                outboundDeparture,
                travelerCount: { adults, children },
            }

            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/flights`,
                {
                    flightOffer: flightOffer,
                    passengerDetails: passengerData,
                    searchCriteria,
                }
            )

            const { checkoutUrl } = response.data
            if (!checkoutUrl) throw new Error('Checkout URL missing')

            setIsLoading(false)
            window.location.href = checkoutUrl
        } catch (error) {
            console.error('Booking submission failed:', error)
            console.log(
                'Error response:',
                JSON.stringify(error.response?.data, null, 2)
            )
            console.log('Error status:', error.response?.status)
            setIsLoading(false)
            alert(
                error.response?.data?.error ||
                    'Booking failed. Please try again.'
            )
            navigate('/flights', {
                state: {
                    origin,
                    destination,
                    inboundDeparture,
                    outboundDeparture,
                    travelerCount: { adults, children },
                },
            })
        }
    }

    return (
        <div className='passenger-details passenger-details--client-flight pt-[var(--default-padding-top)] lg:pt-25 md:pt-35'>
            <div className='passenger-details__travel-info max-w-[1200px] mx-auto w-screen'>
                <div className='passenger-details__route'>
                    <h3 className='passenger-details__origin'>{origin}</h3>
                    {tripType === 'roundTrip' ? (
                        <FaArrowRightArrowLeft className='passenger-details__arrow' />
                    ) : (
                        <FaArrowRight className='passenger-details__arrow' />
                    )}
                    <h3 className='passenger-details__destination'>
                        {destination}
                    </h3>
                </div>
                <div className='passenger-details__meta'>
                    <p className='passenger-details__dates'>
                        {inboundDeparture}
                    </p>
                    <p className='passenger-details__dates'>
                        {outboundDeparture}
                    </p>
                </div>
                <div className='passenger-details__count-group'>
                    <IoPersonSharp className='passenger-details__icon' />
                    <p className='passenger-details__count'>
                        {totalPassengers} Passenger
                        {totalPassengers > 1 ? 's' : ''}
                    </p>
                </div>
            </div>
            <div className='passenger-details__form-wrapper'>
                <h2 className='passenger-details__form-title'>
                    <IoPersonCircle />
                    Passenger Information
                </h2>
                <PassengerForm
                    passengers={passengers}
                    handleChange={handleChange}
                    validationErrors={validationErrors}
                    setValidationErrors={setValidationErrors}
                />
            </div>

            <PrimaryButton
                onClick={() => handleSubmit()}
                className='passenger-details__btn'
                buttonText='Proceed To Payment'
                isBold={true}
                loading={isLoading}
            />
        </div>
    )
}

export default PassengerDetails
