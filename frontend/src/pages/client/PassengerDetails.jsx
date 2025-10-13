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
import { getNationalityOptions } from '../../utils/nationalityMapping'

import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { FaArrowRight } from 'react-icons/fa6'

export function PassengerForm({
    passengers,
    handleChange,
    validationErrors,
    setValidationErrors,
    tourPackage,
}) {
    // Use traveler.gender from state; no shared gender UI state

    const countryOptions = countries.map((c) => ({
        value: c.dial_code.replace('+', ''), // "63"
        label: `${c.name} (${c.dial_code})`,
        code: c.code,
    }))

    // Use nationality names with country codes as values
    const nationalityOptions = getNationalityOptions()

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
                            
                            {/* Title field - only for adults */}
                            {passenger.type === 'ADULT' && (
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
                            )}

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
                            
                            {/* Gender field - for all passengers (adults and children) */}
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
                            {/* Contact fields - only for adults */}
                            {passenger.type === 'ADULT' && (
                                <>
                                    <div className='passenger-form__field'>
                                        <label className='passenger-form__label'>
                                            Email
                                        </label>
                                        <input
                                            type='email'
                                            className='passenger-form__input'
                                            value={passenger.contact?.emailAddress || ''}
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
                                                        (passenger.contact?.phones?.[0]
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
                                                passenger.contact?.phones?.[0]?.number ||
                                                ''
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    index,
                                                    'contact.phones[0]',
                                                    formatPhoneForAmadeus(
                                                        e.target.value,
                                                        passenger.contact?.phones?.[0]
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
                                </>
                            )}
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
                                    Nationality
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
                                    placeholder='Select nationality'
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
                                    Passport Issuance Date
                                </label>
                                <Flatpickr
                                    className='passenger-form__input'
                                    value={
                                        passenger.documents[0]?.issuanceDate
                                            ? new Date(
                                                  passenger.documents[0].issuanceDate
                                              )
                                            : null
                                    }
                                    onChange={([date]) =>
                                        handleChange(
                                            index,
                                            'documents[0].issuanceDate',
                                            formatToYMD(date)
                                        )
                                    }
                                    options={{
                                        maxDate: 'today',
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
                                                'documents[0].issuanceDate'
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
                            <div className='passenger-form__field'>
                                <label className='passenger-form__label'>
                                    Validity Country (e.g., PH)
                                </label>
                                <Select
                                    className='passenger-form__select'
                                    options={issuanceCountryOptions}
                                    value={
                                        issuanceCountryOptions.find(
                                            (opt) =>
                                                opt.value ===
                                                (passenger.documents[0]
                                                    ?.validityCountry || 'PH')
                                        ) || null
                                    }
                                    onChange={(selected) =>
                                        handleChange(
                                            index,
                                            'documents[0].validityCountry',
                                            selected?.value || ''
                                        )
                                    }
                                    placeholder='Select validity country'
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
                                                'documents[0].validityCountry'
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
                                    Place of Birth
                                </label>
                                <input
                                    type='text'
                                    className='passenger-form__input'
                                    value={passenger.documents[0]?.placeOfBirth || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'documents[0].placeOfBirth',
                                            e.target.value
                                        )
                                    }
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'documents[0].placeOfBirth'
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
                                    Birth Place 
                                </label>
                                <input
                                    type='text'
                                    className='passenger-form__input'
                                    value={passenger.documents[0]?.birthPlace || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'documents[0].birthPlace',
                                            e.target.value
                                        )
                                    }
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'documents[0].birthPlace'
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
                                    Issuance Location 
                                </label>
                                <input
                                    type='text'
                                    className='passenger-form__input'
                                    value={passenger.documents[0]?.issuanceLocation || ''}
                                    onChange={(e) =>
                                        handleChange(
                                            index,
                                            'documents[0].issuanceLocation',
                                            e.target.value
                                        )
                                    }
                                />
                                {validationErrors
                                    .filter(
                                        (e) =>
                                            e.index === index &&
                                            e.field === 'documents[0].issuanceLocation'
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
                            
                            {/* Linked Adult field - only for children */}
                            {passenger.type === 'CHILD' && (
                                <div className='passenger-form__field'>
                                    <label className='passenger-form__label'>
                                        Linked Adult
                                    </label>
                                    <Select
                                        className='passenger-form__select'
                                        options={passengers
                                            .filter((p, idx) => p.type === 'ADULT' && idx !== index)
                                            .map((adult, idx) => ({
                                                value: adult.id || `${idx + 1}`,
                                                label: `${adult.name?.firstName || ''} ${adult.name?.lastName || ''}`.trim() || `Adult ${idx + 1}`
                                            }))}
                                        value={
                                            passengers
                                                .filter((p, idx) => p.type === 'ADULT' && idx !== index)
                                                .find((adult) => adult.id === passenger.linkedAdultId)
                                                ? {
                                                    value: passenger.linkedAdultId,
                                                    label: `${passengers.find(p => p.id === passenger.linkedAdultId)?.name?.firstName || ''} ${passengers.find(p => p.id === passenger.linkedAdultId)?.name?.lastName || ''}`.trim()
                                                }
                                                : null
                                        }
                                        onChange={(selected) =>
                                            handleChange(
                                                index,
                                                'linkedAdultId',
                                                selected?.value || ''
                                            )
                                        }
                                        placeholder='Select linked adult'
                                        isSearchable={false}
                                        styles={formSelectStyles}
                                    />
                                    {validationErrors
                                        .filter(
                                            (e) =>
                                                e.index === index &&
                                                e.field === 'linkedAdultId'
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
                            )}

                            {/* Visa Status Section - only show if tour package requires visa */}
                            {tourPackage?.visa_required && (
                                <>
                                    <h2 className='passenger-form__header'>
                                        Visa Status
                                    </h2>
                                    <div className='passenger-form__field'>
                                        <label className='passenger-form__label'>
                                            Do you need visa processing?
                                        </label>
                                        <Select
                                            className='passenger-form__select'
                                            options={[
                                                { value: 'not_applicable', label: 'Not Applicable' },
                                                { value: 'already_has', label: 'I already have a visa' },
                                                { value: 'needs_processing', label: 'I need visa processing' }
                                            ]}
                                            value={{
                                                value: passenger.visa_status || 'not_applicable',
                                                label: passenger.visa_status === 'already_has' ? 'I already have a visa' :
                                                       passenger.visa_status === 'needs_processing' ? 'I need visa processing' :
                                                       'Not Applicable'
                                            }}
                                            onChange={(selected) =>
                                                handleChange(
                                                    index,
                                                    'visa_status',
                                                    selected?.value || 'not_applicable'
                                                )
                                            }
                                            placeholder='Select visa status'
                                            isSearchable={false}
                                            styles={formSelectStyles}
                                        />
                                        {validationErrors
                                            .filter(
                                                (e) =>
                                                    e.index === index &&
                                                    e.field === 'visa_status'
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

                                    {/* Visa Type and Status - only show if passenger already has visa */}
                                    {passenger.visa_status === 'already_has' && (
                                        <>
                                            <div className='passenger-form__field'>
                                                <label className='passenger-form__label'>
                                                    Visa Type
                                                </label>
                                                <Select
                                                    className='passenger-form__select'
                                                    options={[
                                                        { value: 'Tourist Visa', label: 'Tourist Visa' },
                                                        { value: 'Business Visa', label: 'Business Visa' },
                                                        { value: 'Student Visa', label: 'Student Visa' },
                                                        { value: 'Fiancee Visa', label: 'Fiancee Visa' },
                                                        { value: 'Spousal Visa', label: 'Spousal Visa' }
                                                    ]}
                                                    value={{
                                                        value: passenger.visa_type || '',
                                                        label: passenger.visa_type || ''
                                                    }}
                                                    onChange={(selected) =>
                                                        handleChange(
                                                            index,
                                                            'visa_type',
                                                            selected?.value || ''
                                                        )
                                                    }
                                                    placeholder='Select visa type'
                                                    isSearchable={false}
                                                    styles={formSelectStyles}
                                                />
                                                {validationErrors
                                                    .filter(
                                                        (e) =>
                                                            e.index === index &&
                                                            e.field === 'visa_type'
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
                                                    Visa Status
                                                </label>
                                                <Select
                                                    className='passenger-form__select'
                                                    options={[
                                                        { value: 'valid', label: 'Valid' },
                                                        { value: 'expiring_soon', label: 'Expiring Soon (within 6 months)' },
                                                        { value: 'expired', label: 'Expired' },
                                                        { value: 'not_specified', label: 'Not Specified' }
                                                    ]}
                                                    value={{
                                                        value: passenger.existing_visa_status || 'not_specified',
                                                        label: passenger.existing_visa_status === 'valid' ? 'Valid' :
                                                               passenger.existing_visa_status === 'expiring_soon' ? 'Expiring Soon (within 6 months)' :
                                                               passenger.existing_visa_status === 'expired' ? 'Expired' :
                                                               'Not Specified'
                                                    }}
                                                    onChange={(selected) =>
                                                        handleChange(
                                                            index,
                                                            'existing_visa_status',
                                                            selected?.value || 'not_specified'
                                                        )
                                                    }
                                                    placeholder='Select visa status'
                                                    isSearchable={false}
                                                    styles={formSelectStyles}
                                                />
                                                {validationErrors
                                                    .filter(
                                                        (e) =>
                                                            e.index === index &&
                                                            e.field === 'existing_visa_status'
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

                                            {/* Visa Expiry Date - only show if visa is valid or expiring soon */}
                                            {(passenger.existing_visa_status === 'valid' || passenger.existing_visa_status === 'expiring_soon') && (
                                                <div className='passenger-form__field'>
                                                    <label className='passenger-form__label'>
                                                        Visa Expiry Date
                                                    </label>
                                                    <input
                                                        type='date'
                                                        className='passenger-form__input'
                                                        value={passenger.visa_expiry_date || ''}
                                                        onChange={(e) =>
                                                            handleChange(
                                                                index,
                                                                'visa_expiry_date',
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                    {validationErrors
                                                        .filter(
                                                            (e) =>
                                                                e.index === index &&
                                                                e.field === 'visa_expiry_date'
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
                                            )}
                                        </>
                                    )}

                                    {/* Visa Processing Notice */}
                                    {passenger.visa_status === 'needs_processing' && (
                                        <div className='visa-processing-notice'>
                                            <div className='visa-processing-notice__content'>
                                                <h4 className='visa-processing-notice__title'>
                                                    ✅ Visa Processing Included
                                                </h4>
                                                <p className='visa-processing-notice__text'>
                                                    Our team will assist you with visa processing. Required documents will be collected after booking confirmation.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Visa Assistance Notice for Expired Visas */}
                                    {passenger.visa_status === 'already_has' && passenger.existing_visa_status === 'expired' && (
                                        <div className='visa-assistance-notice'>
                                            <div className='visa-assistance-notice__content'>
                                                <h4 className='visa-assistance-notice__title'>
                                                    ⚠️ Visa Assistance Recommended
                                                </h4>
                                                <p className='visa-assistance-notice__text'>
                                                    Your visa has expired. We recommend visa processing assistance to ensure smooth travel. Would you like to include visa processing in your booking?
                                                </p>
                                                <div className='visa-assistance-notice__actions'>
                                                    <button
                                                        type='button'
                                                        className='visa-assistance-notice__btn visa-assistance-notice__btn--primary'
                                                        onClick={() => handleChange(index, 'visa_status', 'needs_processing')}
                                                    >
                                                        Yes, Include Visa Processing
                                                    </button>
                                                    <button
                                                        type='button'
                                                        className='visa-assistance-notice__btn visa-assistance-notice__btn--secondary'
                                                        onClick={() => handleChange(index, 'visa_status', 'not_applicable')}
                                                    >
                                                        No, I'll Handle It Myself
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
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
        Array.from({ length: totalPassengers }, (_, i) => {
            const isAdult = i < adults
            const basePassenger = {
                id: `${i + 1}`,
                type: isAdult ? 'ADULT' : 'CHILD',
                name: {
                    firstName: '',
                    lastName: '',
                },
                dateOfBirth: '',
                documents: [
                    {
                        documentType: 'PASSPORT',
                        number: '',
                        nationality: 'PH',
                        issuanceCountry: 'PH',
                        expiryDate: '',
                        issuanceDate: '',
                        validityCountry: 'PH',
                        placeOfBirth: '',
                        birthPlace: '', // For Amadeus compatibility
                        issuanceLocation: '', // For Amadeus compatibility
                        holder: true,
                    },
                ],
            }

            // Add adult-specific fields
            if (isAdult) {
                basePassenger.title = ''
                basePassenger.gender = ''
                basePassenger.contact = {
                    emailAddress: '',
                    phones: [
                        {
                            deviceType: 'MOBILE',
                            countryCallingCode: '63',
                            number: '',
                        },
                    ],
                }
            } else {
                // Add child-specific fields
                basePassenger.gender = '' // No default gender for children
                // Link to the first adult (index 0, so id = '1')
                basePassenger.linkedAdultId = '' // No default linked adult
                // Ensure children don't have contact fields in form data
                basePassenger.contact = undefined
            }

            return basePassenger
        })
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
    const [termsAccepted, setTermsAccepted] = useState(false)

    const handleSubmit = async () => {
        const errors = []
        setIsLoading(true)

        try {
            for (const [index, passenger] of passengers.entries()) {
                try {
                    const age = calculateAge(passenger.dateOfBirth)

                    // Title validation - only for adults
                    if (passenger.type === 'ADULT' && !passenger.title) {
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

                    // Gender validation - for all passengers
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

                    // Contact validation - only for adults
                    if (passenger.type === 'ADULT') {
                        // Ensure contact object exists for adults
                        if (!passenger.contact) {
                            passenger.contact = {
                                emailAddress: '',
                                phones: [{ countryCallingCode: '', number: '' }]
                            }
                        }

                        if (
                            !passenger.contact?.emailAddress &&
                            !passenger.contact?.phones?.[0]?.number
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

                        if (!passenger.contact?.phones?.[0]?.countryCallingCode) {
                            errors.push({
                                index,
                                field: 'contact.phones[0].countryCallingCode',
                                message: 'Country calling code is required',
                            })
                        }
                    }

                    // For children, ensure they have contact info from linked adult
                    if (passenger.type === 'CHILD') {
                        const linkedAdult = passengers.find(adult => adult.id === passenger.linkedAdultId)
                        if (!linkedAdult || !linkedAdult.contact) {
                            errors.push({
                                index,
                                field: 'linkedAdultId',
                                message: 'Linked adult must have contact information',
                            })
                        }
                    }

                    // Linked adult validation - only for children
                    if (passenger.type === 'CHILD') {
                        if (!passenger.linkedAdultId) {
                            errors.push({
                                index,
                                field: 'linkedAdultId',
                                message: 'Linked adult is required for child passengers',
                            })
                        } else {
                            // Verify the linked adult exists and is an adult
                            const linkedAdult = passengers.find(p => p.id === passenger.linkedAdultId)
                            if (!linkedAdult || linkedAdult.type !== 'ADULT') {
                                errors.push({
                                    index,
                                    field: 'linkedAdultId',
                                    message: 'Please select a valid adult passenger',
                                })
                            }
                        }
                    }

                    // Passport validation - only if passport document exists
                    if (passenger.documents && passenger.documents[0]) {
                        if (
                            passenger.documents[0].documentType === 'PASSPORT' &&
                            !passenger.documents[0].holder
                        ) {
                            errors.push({
                                index,
                                field: 'documents[0].holder',
                                message: 'Passport holder field is required',
                            })
                        }
                    }
                } catch (error) {
                    errors.push({
                        index,
                        field: 'dateOfBirth',
                        message: error.message || 'Invalid date of birth',
                    })
                }
            }

            // Check if terms are accepted
            if (!termsAccepted) {
                errors.push({
                    index: -1,
                    field: 'terms',
                    message: 'You must accept the terms and conditions to proceed'
                })
            }

            if (errors.length > 0) {
                setValidationErrors(errors)
                setIsLoading(false)
                return
            }

            // Normalize travelers to match API expectations
            const normalizedTravelers = passengers.map((p, idx) => {
                const baseTraveler = {
                    id: `${idx + 1}`,
                    type: (p.type || '').toUpperCase(),
                    name: {
                        firstName: p.name?.firstName || '',
                        lastName: p.name?.lastName || '',
                    },
                    dateOfBirth: p.dateOfBirth || '',
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
                            birthPlace: p.documents?.[0]?.birthPlace || '', // For Amadeus compatibility
                            issuanceLocation: p.documents?.[0]?.issuanceLocation || '', // For Amadeus compatibility
                            holder: Boolean(p.documents?.[0]?.holder),
                        },
                    ],
                }

                // Add gender for all passengers
                baseTraveler.gender = (p.gender || 'MALE').toUpperCase()

                // Add adult-specific fields
                if (p.type === 'ADULT') {
                    baseTraveler.title = (p.title || 'MR').toUpperCase()
                    baseTraveler.contact = {
                        emailAddress: p.contact?.emailAddress || '',
                        phones: [
                            {
                                deviceType: 'MOBILE',
                                countryCallingCode:
                                    p.contact?.phones?.[0]?.countryCallingCode || '63',
                                number: p.contact?.phones?.[0]?.number || '',
                            },
                        ],
                    }
                }

                // Add child-specific fields
                if (p.type === 'CHILD') {
                    baseTraveler.linkedAdultId = p.linkedAdultId || ''
                    
                    // Find the linked adult to get their contact info
                    const linkedAdult = passengers.find(adult => adult.id === p.linkedAdultId)
                    if (linkedAdult && linkedAdult.contact) {
                        // Use linked adult's contact information for the child
                        baseTraveler.contact = {
                            emailAddress: linkedAdult.contact.emailAddress || '',
                            phones: linkedAdult.contact.phones || []
                        }
                    } else {
                        // Fallback contact info if linked adult not found
                        baseTraveler.contact = {
                            emailAddress: '',
                            phones: [{
                                deviceType: 'MOBILE',
                                countryCallingCode: '63',
                                number: ''
                            }]
                        }
                    }
                }

                return baseTraveler
            })

            const passengerData = {
                travelers: normalizedTravelers,
                remarks: {
                    general: [
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'All Guests, including children and infants, must present valid identification at check-in.',
                        },
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'Check-in begins 3 hours prior to the flight for seat assignment and closes 75 minutes prior to the scheduled departure.',
                        },
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'Carriage and other services provided by the carrier are subject to conditions of carriage, which are hereby incorporated by reference. These conditions may be obtained from the issuing carrier.',
                        },
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'Transportation and other services provided by the carrier are subjected to conditions of contract and other important notices. Please ensure that you have received these notices, and if not, contact the booking partner or issuing carrier to obtain a copy prior to the commencement of your trip.',
                        },
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'If the passenger journey involves an ultimate destination or stop in a country other than the country of departure, the Warsaw Convention may be applicable and this convention governs and on most case limits the liability of carriers for death or personal injury and in respect of loss of or damage to baggage.',
                        },
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'Please check the figures / timings as they may change time to time without any notice to the passenger.',
                        },
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'For Infants valid birth certificate is required.',
                        },
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'ONLINE BOOKING FROM LINDELA TRAVEL AND TOURS',
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
                            firstName: 'LINDELA',
                            lastName: 'TRAVEL AND TOURS',
                        },
                        companyName: 'LINDELA TRAVEL AND TOURS',
                        purpose: 'STANDARD',
                        phones: [
                            {
                                deviceType: 'MOBILE',
                                countryCallingCode: '63',
                                number: '9296106660',
                            },
                        ],
                        emailAddress: 'lindelatravelandtours@gmail.com',
                        address: {
                            lines: ['Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street'],
                            postalCode: '1227',
                            cityName: 'Makati',
                            countryCode: 'PH',
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

            // Additional validation before API call
            const validationErrors = []
            normalizedTravelers.forEach((traveler, index) => {
                if (!traveler.contact || (!traveler.contact.emailAddress && !traveler.contact.phones?.[0]?.number)) {
                    validationErrors.push(`Traveler ${index + 1} (${traveler.type}) is missing contact information`)
                }
                if (traveler.type === 'CHILD' && !traveler.linkedAdultId) {
                    validationErrors.push(`Child traveler ${index + 1} is missing linkedAdultId`)
                }
            })
            
            if (validationErrors.length > 0) {
                console.error('Validation errors before API call:', validationErrors)
                alert('Validation errors: ' + validationErrors.join(', '))
                setIsLoading(false)
                return
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

            {/* Terms and Conditions Section */}
            <div className="terms-section">
                <h3 className="terms-title">Terms and Conditions</h3>
                <div className="terms-content">
                    <div className="terms-text">
                        <p><strong>Important Travel Information:</strong></p>
                        <ul>
                            <li>All Guests, including children and infants, must present valid identification at check-in.</li>
                            <li>Check-in begins 3 hours prior to the flight for seat assignment and closes 75 minutes prior to the scheduled departure.</li>
                            <li>Carriage and other services provided by the carrier are subject to conditions of carriage, which are hereby incorporated by reference. These conditions may be obtained from the issuing carrier.</li>
                            <li>Transportation and other services provided by the carrier are subjected to conditions of contract and other important notices. Please ensure that you have received these notices, and if not, contact the booking partner or issuing carrier to obtain a copy prior to the commencement of your trip.</li>
                            <li>If the passenger journey involves an ultimate destination or stop in a country other than the country of departure, the Warsaw Convention may be applicable and this convention governs and on most case limits the liability of carriers for death or personal injury and in respect of loss of or damage to baggage.</li>
                            <li>Please check the figures / timings as they may change time to time without any notice to the passenger.</li>
                            <li>For Infants valid birth certificate is required.</li>
                        </ul>
                    </div>
                    <div className="terms-checkbox">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="checkbox-input"
                            />
                            <span className="checkbox-text">
                                I have read and agree to the terms and conditions above
                            </span>
                        </label>
                        {validationErrors.some(error => error.field === 'terms') && (
                            <div className="error-message">
                                {validationErrors.find(error => error.field === 'terms')?.message}
                            </div>
                        )}
                    </div>
                </div>
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
