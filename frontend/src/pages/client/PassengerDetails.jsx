import { useLocation } from 'react-router-dom'
import { FaArrowsAltH } from 'react-icons/fa'
import { IoContractSharp, IoPersonSharp } from 'react-icons/io5'
import { useState, useEffect } from 'react'
import Flatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/airbnb.css'
import './PassengerDetails.css'
import { IoPersonCircle } from 'react-icons/io5'
import Select from 'react-select'
import { formSelectStyles } from '../../styles/client/reactSelectStyles'
import { useSnackbar } from '../../context/SnackbarContext'
import PrimaryButton from '../../components/client/PrimaryButton'
import { formatToYMD } from '../../utils/flightUtils.js'
import axios from 'axios'
import { calculateAge, formatPhoneForAmadeus } from '../../utils/stringUtils.js'
import countries from '../../data/CountryCodes.json'
import { getNationalityOptions } from '../../utils/nationalityMapping'
import Modal from 'react-modal'

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
                                                    'contact.phones[0].number',
                                                    formatPhoneForAmadeus(
                                                        e.target.value,
                                                        passenger.contact?.phones?.[0]
                                                            ?.countryCallingCode || '63'
                                                    ).number
                                                )
                                            }
                                            required
                                        />
                                        {validationErrors
                                            .filter(
                                                (e) =>
                                                    e.index === index &&
                                                    e.field === 'contact.phones[0].number'
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
                                    Validity Country (Auto Filled)
                                </label>
                                <Select
                                    isDisabled={true}
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
                                    Issuance Location (e.g. New-York)
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
    const { showError } = useSnackbar()

    const [, setPassengerData] = useState(state)

    useEffect(() => {
        if (!state) {
            const stored = sessionStorage.getItem('passengerData')
            if (stored) setPassengerData(JSON.parse(stored))
        }
    }, [state])

    // const navigate = useNavigate() // Removed - no longer needed

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
                    firstName: isAdult ? 'John' : 'Jane',
                    lastName: 'Doe',
                },
                dateOfBirth: isAdult ? '1990-01-15' : '2015-06-20',
                documents: [
                    {
                        documentType: 'PASSPORT',
                        number: isAdult ? 'P1234567' : 'P7654321',
                        nationality: 'PH',
                        issuanceCountry: 'PH',
                        expiryDate: '2030-12-31', // 5+ years in future
                        issuanceDate: '2020-01-15', // Past date
                        validityCountry: 'PH',
                        birthPlace: 'Manila', // For Amadeus compatibility
                        issuanceLocation: 'Manila', // For Amadeus compatibility
                        holder: true,
                    },
                ],
            }

            // Add adult-specific fields
            if (isAdult) {
                basePassenger.title = 'MR'
                basePassenger.gender = 'MALE'
                basePassenger.contact = {
                    emailAddress: 'arkadatax03@gmail.com',
                    phones: [
                        {
                            deviceType: 'MOBILE',
                            countryCallingCode: '63',
                            number: '9123456789',
                        },
                    ],
                }
            } else {
                // Add child-specific fields
                basePassenger.gender = 'FEMALE' // Default gender for children
                // Link to the first adult (index 0, so id = '1')
                basePassenger.linkedAdultId = '1' // Link to first adult
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
        
        // Handle nested field updates (like 'name.firstName', 'contact.emailAddress', etc.)
        for (let i = 0; i < keys.length - 1; i++) {
            if (keys[i].includes('[') && keys[i].includes(']')) {
                // Handle array access like 'phones[0]'
                const arrayName = keys[i].split('[')[0]
                const arrayIndex = parseInt(keys[i].split('[')[1].split(']')[0])
                target = target[arrayName] = target[arrayName] || []
                target = target[arrayIndex] = target[arrayIndex] || {}
            } else {
                target = target[keys[i]] = target[keys[i]] || {}
            }
        }
        
        const finalKey = keys[keys.length - 1]
        if (finalKey.includes('[') && finalKey.includes(']')) {
            // Handle array access for final key
            const arrayName = finalKey.split('[')[0]
            const arrayIndex = parseInt(finalKey.split('[')[1].split(']')[0])
            target[arrayName] = target[arrayName] || []
            target[arrayName][arrayIndex] = value
        } else {
            target[finalKey] = value
        }
        
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
    const [showTermsModal, setShowTermsModal] = useState(false)

    const handleSubmit = async () => {
        const errors = []
        setIsLoading(true)

        try {
            for (const [index, passenger] of passengers.entries()) {
                try {
                    // Validate date of birth before calculating age
                    if (passenger.dateOfBirth) {
                        const birthDate = new Date(passenger.dateOfBirth)
                        if (isNaN(birthDate.getTime())) {
                            errors.push({
                                index,
                                field: 'dateOfBirth',
                                message: 'Invalid date format. Please use YYYY-MM-DD format',
                            })
                            continue // Skip age calculation for invalid dates
                        }
                    }
                    
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
                    } else {
                        // Validate birth date is reasonable
                        const birthDate = new Date(passenger.dateOfBirth)
                        const today = new Date()
                        const minDate = new Date(1900, 0, 1) // January 1, 1900
                        
                        if (birthDate > today) {
                            errors.push({
                                index,
                                field: 'dateOfBirth',
                                message: 'Date of birth cannot be in the future',
                            })
                        } else if (birthDate < minDate) {
                            errors.push({
                                index,
                                field: 'dateOfBirth',
                                message: 'Please enter a valid birth date',
                            })
                        }
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
                                field: 'contact.phones[0].number',
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
                        const doc = passenger.documents[0]
                        
                        if (doc.documentType === 'PASSPORT' && !doc.holder) {
                            errors.push({
                                index,
                                field: 'documents[0].holder',
                                message: 'Passport holder field is required',
                            })
                        }
                        
                        // Validate passport expiry date (must be at least 6 months in the future)
                        if (doc.expiryDate) {
                            const expiryDate = new Date(doc.expiryDate)
                            const today = new Date()
                            const sixMonthsFromNow = new Date()
                            sixMonthsFromNow.setMonth(today.getMonth() + 6)
                            
                            if (expiryDate <= sixMonthsFromNow) {
                                errors.push({
                                    index,
                                    field: 'documents[0].expiryDate',
                                    message: 'Passport must be valid for at least 6 months from today',
                                })
                            }
                        }
                        
                        // Validate passport issuance date (cannot be in the future)
                        if (doc.issuanceDate) {
                            const issuanceDate = new Date(doc.issuanceDate)
                            const today = new Date()
                            
                            if (issuanceDate > today) {
                                errors.push({
                                    index,
                                    field: 'documents[0].issuanceDate',
                                    message: 'Passport issuance date cannot be in the future',
                                })
                            }
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
                        {
                            subType: 'GENERAL_MISCELLANEOUS',
                            text: 'TICKETING AGREEMENT: Reservation will be automatically cancelled if payment is not completed within 6 days. Cancellation occurs at 00:00 local time on the 6th day.',
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
                        companyName: 'Amadeus', // Use correct Amadeus format
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
                            lines: ['1 rue de Paris'], // Use correct Amadeus format
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
                showError('Validation errors: ' + validationErrors.join(', '))
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
            
            // Extract error message from response
            let errorMessage = 'Booking failed. Please try again.'
            let errorDetails = ''
            
            if (error.response?.data?.error) {
                errorMessage = error.response.data.error
                errorDetails = error.response.data.details || ''
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.message) {
                errorMessage = error.message
            }
            
            // Check for specific Amadeus error codes and provide user-friendly messages
            if (error.response?.data?.errors && error.response.data.errors.length > 0) {
                const amadeusError = error.response.data.errors[0]
                
                if (amadeusError.code === 34651 && amadeusError.title === 'SEGMENT SELL FAILURE') {
                    errorMessage = 'Flight No Longer Available'
                    errorDetails = 'This flight segment is no longer available for booking. This commonly happens in our test environment. Please try selecting a different flight or search for new flights.'
                } else if (amadeusError.code === 34652) {
                    errorMessage = 'Flight Offer Expired'
                    errorDetails = 'This flight offer has expired. Please search for new flights and try again.'
                } else if (amadeusError.code === 34653) {
                    errorMessage = 'Insufficient Seats'
                    errorDetails = 'Not enough seats available for your booking. Please try with fewer passengers or select a different flight.'
                } else if (amadeusError.code === 141) {
                    errorMessage = 'Service Temporarily Unavailable'
                    errorDetails = 'The flight booking service is experiencing technical difficulties. Please try again in a few minutes.'
                }
            }
            
            // Set validation errors to show in UI
            setValidationErrors([{
                index: -1,
                field: 'booking',
                message: errorMessage + (errorDetails ? ` - ${errorDetails}` : '')
            }])
            
            // Scroll to top to show error
            window.scrollTo({ top: 0, behavior: 'smooth' })
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
                {/* Booking Error Display */}
                {validationErrors.some(error => error.field === 'booking') && (
                    <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
                        <div className='flex items-start'>
                            <div className='flex-shrink-0'>
                                <svg className='h-5 w-5 text-red-400' viewBox='0 0 20 20' fill='currentColor'>
                                    <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z' clipRule='evenodd' />
                                </svg>
                            </div>
                            <div className='ml-3'>
                                <h3 className='text-sm font-medium text-red-800'>
                                    Booking Error
                                </h3>
                                <div className='mt-2 text-sm text-red-700'>
                                    {validationErrors
                                        .filter(error => error.field === 'booking')
                                        .map((error, index) => (
                                            <p key={index}>{error.message}</p>
                                        ))
                                    }
                                </div>
                                <div className='mt-3'>
                                    <button
                                        type='button'
                                        onClick={() => setValidationErrors(prev => prev.filter(error => error.field !== 'booking'))}
                                        className='text-sm font-medium text-red-800 hover:text-red-600 underline'
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='passenger-details__form-title'>
                        <IoPersonCircle />
                        Passenger Information
                    </h2>
                    <div className='flex gap-2'>
                        <button
                            type='button'
                            onClick={() => {
                                if (confirm('Clear all passenger data and start fresh?')) {
                                    setPassengers(prev => prev.map(p => ({
                                        ...p,
                                        name: { firstName: '', lastName: '' },
                                        dateOfBirth: '',
                                        gender: '',
                                        title: '',
                                        contact: p.type === 'ADULT' ? {
                                            emailAddress: '',
                                            phones: [{ deviceType: 'MOBILE', countryCallingCode: '63', number: '' }]
                                        } : undefined,
                                        documents: [{
                                            ...p.documents[0],
                                            number: '',
                                            expiryDate: '',
                                            issuanceDate: '',
                                            birthPlace: '',
                                            issuanceLocation: ''
                                        }]
                                    })))
                                }
                            }}
                            className='px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors'
                        >
                            Clear All
                        </button>
                        <button
                            type='button'
                            onClick={() => {
                                setPassengers(prev => prev.map((p) => {
                                    const isAdult = p.type === 'ADULT'
                                    return {
                                        ...p,
                                        name: {
                                            firstName: isAdult ? 'John' : 'Jane',
                                            lastName: 'Doe',
                                        },
                                        dateOfBirth: isAdult ? '1990-01-15' : '2015-06-20',
                                        gender: isAdult ? 'MALE' : 'FEMALE',
                                        title: isAdult ? 'MR' : '',
                                        contact: isAdult ? {
                                            emailAddress: 'test@example.com',
                                            phones: [{
                                                deviceType: 'MOBILE',
                                                countryCallingCode: '63',
                                                number: '9123456789',
                                            }]
                                        } : undefined,
                                        documents: [{
                                            ...p.documents[0],
                                            number: isAdult ? 'P1234567' : 'P7654321',
                                            expiryDate: '2030-12-31',
                                            issuanceDate: '2020-01-15',
                                            birthPlace: 'Manila',
                                            issuanceLocation: 'Manila'
                                        }]
                                    }
                                }))
                            }}
                            className='px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors'
                        >
                            Fill Test Data
                        </button>
                    </div>
                </div>
                <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                    <p className='text-sm text-yellow-800'>
                        <strong>Testing Mode:</strong> Form is pre-filled with valid test data. 
                        You can modify any field or use the buttons above to clear/fill data.
                    </p>
                </div>
                <PassengerForm
                    passengers={passengers}
                    handleChange={handleChange}
                    validationErrors={validationErrors}
                    setValidationErrors={setValidationErrors}
                />
            </div>

            {/* Terms and Conditions Section */}
            <div className='mt-6 p-6 bg-yellow-50 rounded-lg border border-yellow-200 max-w-[1200px] mx-auto'>
                <div className='flex items-start space-x-3'>
                    <input
                        type='checkbox'
                        id='terms-checkbox'
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className='mt-1 h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded'
                    />
                    <label htmlFor='terms-checkbox' className='text-sm text-gray-700'>
                        I have read and agree to the{' '}
                        <button
                            type='button'
                            onClick={() => setShowTermsModal(true)}
                            className='text-yellow-600 hover:text-yellow-800 underline font-semibold'
                        >
                            Terms and Conditions
                        </button>
                    </label>
                </div>
                {validationErrors.some(error => error.field === 'terms') && (
                    <div className='mt-2 text-red-600 text-sm font-medium flex items-center gap-2'>
                        <i className='bi-exclamation-triangle text-red-500'></i>
                        {validationErrors.find(error => error.field === 'terms')?.message}
                    </div>
                )}
            </div>

            {/* Terms and Conditions Modal */}
            <Modal
                isOpen={showTermsModal}
                onRequestClose={() => setShowTermsModal(false)}
                className='modal'
                overlayClassName='modal__overlay'
            >
                <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden'>
                    <div className='flex justify-between items-center p-6 border-b'>
                        <h2 className='text-2xl font-bold text-gray-900'>Terms and Conditions</h2>
                        <button
                            onClick={() => setShowTermsModal(false)}
                            className='text-gray-400 hover:text-gray-600 text-2xl'
                        >
                            ×
                        </button>
                    </div>
                    <div className='p-6 overflow-y-auto max-h-[70vh]'>
                        <div className='prose max-w-none text-sm text-gray-700 space-y-4'>
                            {/* Flight Terms */}
                            <section>
                                <h3 className='text-lg font-semibold text-gray-900'>Important Travel Information</h3>
                                <ul className='list-disc pl-6 space-y-1'>
                                    <li>All Guests, including children and infants, must present valid identification at check-in.</li>
                                    <li>Check-in begins 3 hours prior to the flight for seat assignment and closes 75 minutes prior to the scheduled departure.</li>
                                    <li>Carriage and other services provided by the carrier are subject to conditions of carriage, which are hereby incorporated by reference. These conditions may be obtained from the issuing carrier.</li>
                                    <li>Transportation and other services provided by the carrier are subjected to conditions of contract and other important notices. Please ensure that you have received these notices, and if not, contact the booking partner or issuing carrier to obtain a copy prior to the commencement of your trip.</li>
                                    <li>If the passenger journey involves an ultimate destination or stop in a country other than the country of departure, the Warsaw Convention may be applicable and this convention governs and on most case limits the liability of carriers for death or personal injury and in respect of loss of or damage to baggage.</li>
                                    <li>Please check the figures / timings as they may change time to time without any notice to the passenger.</li>
                                    <li>For Infants valid birth certificate is required.</li>
                                </ul>
                            </section>

                            {/* Ticketing Agreement Information */}
                            <section>
                                <h3 className='text-lg font-semibold text-gray-900'>Ticketing Agreement</h3>
                                <p>By proceeding with this booking, you agree to the following ticketing terms:</p>
                                <ul className='list-disc pl-6 space-y-1'>
                                    <li><strong>Automatic Cancellation:</strong> If payment is not completed within 6 days of booking, your reservation will be automatically cancelled.</li>
                                    <li><strong>Cancellation Time:</strong> The cancellation will occur at 00:00 (midnight) local time on the 6th day if no time is specified.</li>
                                    <li><strong>Ticket Issuance:</strong> Tickets will be issued immediately upon successful payment confirmation.</li>
                                    <li><strong>Important:</strong> Please ensure payment is completed promptly to secure your booking and prevent automatic cancellation.</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                    <div className='flex justify-end p-6 border-t'>
                        <button
                            onClick={() => setShowTermsModal(false)}
                            className='px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>

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
