import { useLocation } from 'react-router-dom'
import { FaArrowsAltH } from 'react-icons/fa'
import { IoContractSharp, IoPersonSharp } from 'react-icons/io5'
import { useState } from 'react'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/airbnb.css'
import './PassengerDetails.css'
import { IoPersonCircle } from 'react-icons/io5'
import Select from 'react-select'
import { formSelectStyles } from '../../styles/client/reactSelectStyles'
import PrimaryButton from '../../components/client/PrimaryButton'
import { formatToYMD } from '../../utils/flightUtils.js'
import axios from 'axios'
import { formatPhoneForAmadeus } from '../../utils/stringUtils.js'

function PassengerForm({ passengers, handleChange }) {
    const [selectGender, setSelectGender] = useState('')

    function handleGenderSelection(gender) {
        setSelectGender(gender)
    }

    const titleOptions = [
        { value: 'mr', label: 'Mr' },
        { value: 'mrs', label: 'Mrs' },
        { value: 'ms', label: 'Ms' },
        { value: 'master', label: 'Master' },
        { value: 'miss', label: 'Miss' },
    ]

    return (
        <div className='passenger-form'>
            {passengers.map((passenger, index) => (
                <div
                    key={index}
                    className='passenger-form__item'
                >
                    <details className='passenger-form__details'>
                        <summary className='passenger-form__summary'>
                            <b> Passenger {index + 1}</b>
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
                                                opt.value === passenger.title
                                        ) || null
                                    }
                                    onChange={(selected) =>
                                        handleChange(
                                            index,
                                            'title',
                                            selected?.value || ''
                                        )
                                    }
                                    placeholder=''
                                    isSearchable={false}
                                    styles={formSelectStyles}
                                />
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
                                            handleGenderSelection('MALE')
                                        }}
                                        className={`passenger-form__gender-option ${
                                            selectGender === 'MALE'
                                                ? 'active'
                                                : ''
                                        }`}
                                    >
                                        Male
                                    </p>
                                    <p
                                        onClick={() => {
                                            handleGenderSelection('FEMALE')
                                            handleChange(
                                                index,
                                                'gender',
                                                'FEMALE'
                                            )
                                        }}
                                        className={`passenger-form__gender-option ${
                                            selectGender === 'FEMALE'
                                                ? 'active'
                                                : ''
                                        }`}
                                    >
                                        Female
                                    </p>
                                </div>
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
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Country Calling Code (e.g., 34)
                                </label>
                                <input
                                    type='text'
                                    className='passenger-form__input'
                                    value={
                                        passenger.contact.phones[0]
                                            ?.countryCallingCode || ''
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'contact.phones[0].countryCallingCode',
                                            e.target.value.replace(/^\+/, '') // Remove leading +
                                        )
                                    }
                                    required
                                />
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
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Nationality (e.g., PH)
                                </label>
                                <input
                                    type='text'
                                    className='passenger-form__input'
                                    value={
                                        passenger.documents[0]?.nationality ||
                                        ''
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'documents[0].nationality',
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                />
                            </div>
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Issuance Country (e.g., PH)
                                </label>
                                <input
                                    type='text'
                                    className='passenger-form__input'
                                    value={
                                        passenger.documents[0]
                                            ?.issuanceCountry || ''
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'documents[0].issuanceCountry',
                                            e.target.value.toUpperCase()
                                        )
                                    }
                                />
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

    const passengerCount =
        state.travelerCount.adults + state.travelerCount.children

    const flightOffer = state.flight.flight || []

    const [passengers, setPassengers] = useState(
        Array.from({ length: passengerCount }, (_, i) => ({
            id: `${i + 1}`,
            title: 'mr',
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
                    nationality: 'ES',
                    issuanceCountry: 'ES',
                    expiryDate: '2032-08-07',
                    issuanceDate: '2024-08-07',
                    validityCountry: 'ES',
                    placeOfBirth: 'Madrid',
                    holder: true,
                },
            ],
        }))
    )

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

    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async () => {
        setIsLoading(true)
        try {
            // Validate required fields
            for (const [index, passenger] of passengers.entries()) {
                if (!passenger.name.firstName || !passenger.name.lastName) {
                    throw new Error(
                        `Passenger ${
                            index + 1
                        }: First and last name are required`
                    )
                }
                if (!passenger.dateOfBirth) {
                    throw new Error(
                        `Passenger ${index + 1}: Date of birth is required`
                    )
                }
                if (
                    !passenger.contact.emailAddress &&
                    !passenger.contact.phones[0]?.number
                ) {
                    throw new Error(
                        `Passenger ${
                            index + 1
                        }: At least one contact method is required`
                    )
                }
                if (!passenger.contact.phones[0]?.countryCallingCode) {
                    throw new Error(
                        `Passenger ${
                            index + 1
                        }: Country calling code is required`
                    )
                }
                if (
                    passenger.documents[0]?.documentType === 'PASSPORT' &&
                    !passenger.documents[0]?.holder
                ) {
                    throw new Error(
                        `Passenger ${
                            index + 1
                        }: Passport holder field is required`
                    )
                }
            }

            const passengerData = {
                travelers: passengers,
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
                                countryCallingCode: '34', // Fixed format
                                number: '480080071',
                            },
                            {
                                deviceType: 'MOBILE',
                                countryCallingCode: '33', // Fixed format
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

            const response = await axios.post('/api/v1/bookings/flights', {
                flightOffer: flightOffer,
                passengerDetails: passengerData,
            })
            const { checkoutUrl } = response.data
            if (!checkoutUrl) throw new Error('Checkout URL missing')
            setIsLoading(false)
            window.location.href = checkoutUrl
        } catch (error) {
            console.error('Booking submission failed:', error)
            alert(
                error.message ||
                    error.response?.data?.message ||
                    'Booking failed. Please try again.'
            )
            setIsLoading(false)
        }
    }

    return (
        <div className='passenger-details'>
            <div className='passenger-details__travel-info'>
                <div className='passenger-details__route'>
                    <h3 className='passenger-details__origin'>{origin}</h3>
                    <FaArrowsAltH className='passenger-details__arrow' />
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
                        {passengerCount} Passenger
                        {passengerCount > 1 ? 's' : ''}
                    </p>
                </div>
            </div>
            <div className='passenger-details__form-wrapper'>
                <h2 className='passenger-details__form-title'>
                    <IoPersonCircle />
                    Passenger Information
                </h2>
                <PassengerForm
                    passengerCount={passengerCount}
                    passengers={passengers}
                    handleChange={handleChange}
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
