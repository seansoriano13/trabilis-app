import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import { IoPersonCircle } from 'react-icons/io5'
import Modal from 'react-modal'
import './TourBooking.css'
import flightsHeroDesktop from '/images/flights-hero-desktop.jpg'
import { PassengerForm } from './PassengerDetails.jsx'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import UnsavedChangesModal from '../../components/UnsavedChangesModal'
import '../../styles/unsaved-changes.css'
// import { useSnackbar } from '../../context/SnackbarContext' // Available for future use

const PrimaryButton = ({ onClick, className, buttonText, isBold, loading }) => (
  <button
    type='button'
    onClick={onClick}
    className={`w-full py-3 px-4 bg-[#f7d100] text-black font-${
      isBold ? 'semibold' : 'medium'
    } rounded-md shadow hover:bg-[#ffe347] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors ${className}`}
    disabled={loading}
  >
    {loading ? 'Processing...' : buttonText}
  </button>
)

function TourBooking() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const { state } = useLocation()
  const {
    selectedDateId,
    passengers,
    selectedDate,
    title,
    tourPackage,
    customization: customizationData,
  } = state
  const totalPassengers = passengers.adults + passengers.children
  // Snackbar available for future use
  // const { showSuccess, showError, showWarning, showInfo } = useSnackbar()

  // passengers data like flights (but no documents)
  const [formData, setFormData] = useState({
    passengers: Array.from({ length: totalPassengers }, (_, i) => ({
      id: `${i + 1}`,
      type: i < passengers.adults ? 'ADULT' : 'CHILD',
      title: i < passengers.adults ? (i === 0 ? 'Mr' : 'Ms') : undefined,
      name: {
        firstName: i < passengers.adults ? (i === 0 ? 'John' : 'Jane') : 'Alex',
        lastName: 'Smith',
      },
      gender: i < passengers.adults ? 'MALE' : 'FEMALE',
      dateOfBirth:
        i < passengers.adults
          ? i === 0
            ? '1985-06-15'
            : '1990-03-22'
          : '2015-08-10',
      contact:
        i < passengers.adults
          ? {
              emailAddress: i === 0 ? 'arkadatax03@gmail.com' : '',
              phones: [
                {
                  deviceType: 'MOBILE',
                  countryCallingCode: '63',
                  number: i === 0 ? '9123456789' : '',
                },
              ],
            }
          : undefined,
      documents:
        i < passengers.adults
          ? [
              {
                documentType: 'PASSPORT',
                number: `P${String(i + 1).padStart(7, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
                nationality: 'PH',
                issuanceCountry: 'PH',
                expiryDate: '2027-12-31',
                issuanceDate: '2022-01-01',
                validityCountry: 'PH',
                placeOfBirth: 'Manila',
                birthPlace: 'Manila',
                issuanceLocation: 'Manila',
                holder: true,
              },
            ]
          : [],
      // Visa status fields
      visa_status: 'not_applicable', // 'not_applicable', 'already_has', 'needs_processing'
      visa_type: '', // 'Tourist Visa', 'Business Visa', 'Student Visa', 'Fiancee Visa', 'Spousal Visa'
      existing_visa_status: 'not_specified', // 'valid', 'expired', 'expiring_soon', 'not_specified'
      visa_expiry_date: '', // Date when visa expires
    })),
    payment_type: 'FULL',
  })

  // Initial form data for comparison - empty structure without placeholders
  const initialFormData = {
    passengers: Array.from({ length: totalPassengers }, (_, i) => ({
      id: `${i + 1}`,
      type: i < passengers.adults ? 'ADULT' : 'CHILD',
      title: i < passengers.adults ? (i === 0 ? 'Mr' : 'Ms') : undefined,
      name: {
        firstName: '',
        lastName: '',
      },
      gender: i < passengers.adults ? 'MALE' : 'FEMALE',
      dateOfBirth: '',
      contact:
        i < passengers.adults
          ? {
              emailAddress: '',
              phones: [
                {
                  deviceType: 'MOBILE',
                  countryCallingCode: '63',
                  number: '',
                },
              ],
            }
          : undefined,
      documents:
        i < passengers.adults
          ? [
              {
                documentType: 'PASSPORT',
                number: '',
                nationality: 'PH',
                issuanceCountry: 'PH',
                expiryDate: '',
                issuanceDate: '',
                validityCountry: 'PH',
                placeOfBirth: '',
                birthPlace: '',
                issuanceLocation: '',
                holder: true,
              },
            ]
          : [],
      visa_status: 'not_applicable',
      visa_type: '',
      existing_visa_status: 'not_specified',
      visa_expiry_date: '',
    })),
    payment_type: 'FULL',
  }

  // Unsaved changes hook
  const { resetUnsavedChanges } = useUnsavedChanges(initialFormData, formData, {
    enabled: true,
    trackBeforeUnload: true, // Track browser close for client forms
  })

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsRef, setTermsRef] = useState(null)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const reservation_per_pax = state.dates[0].reservation_fee_per_pax
  const needsVisaDisclaimer = formData.passengers.some(
    (p) => p.visa_status === 'already_has'
  )

  const handlePassengerChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.passengers]
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

      return { ...prev, passengers: updated }
    })
    setError(null)
  }

  // const handlePaymentTypeChange = (e) => {
  //     const { value } = e.target
  //     setFormData((prev) => ({ ...prev, payment_type: value }))
  // }

  const validateForm = () => {
    const lead = formData.passengers[0]

    // Validate lead passenger (required for booking)
    if (!lead.name.firstName?.trim())
      return 'Lead passenger first name is required'
    if (!lead.name.lastName?.trim())
      return 'Lead passenger last name is required'
    if (!lead.contact.emailAddress?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return 'Valid email is required for lead passenger'
    if (!lead.contact.phones[0]?.number?.match(/^\d{10,15}$/))
      return 'Valid phone number is required for lead passenger'

    // Validate other passengers (just need names)
    for (let i = 1; i < formData.passengers.length; i++) {
      const passenger = formData.passengers[i]
      if (!passenger.name.firstName?.trim())
        return `First name is required for passenger ${i + 1}`
      if (!passenger.name.lastName?.trim())
        return `Last name is required for passenger ${i + 1}`
    }

    // Check if terms are accepted
    if (!termsAccepted) {
      // Scroll to terms section
      if (termsRef) {
        termsRef.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }
      return 'You must accept the terms and conditions to proceed'
    }

    return null
  }

  const handleConfirmLeave = () => {
    setShowUnsavedModal(false)
    // Allow navigation to proceed
  }

  const handleCancelLeave = () => {
    setShowUnsavedModal(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setLoading(false)
      return
    }

    try {
      // Extract lead passenger info (first passenger)
      const leadPassenger = formData.passengers[0]

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/destinations/tour/booking`,
        {
          package_date_id: selectedDateId,
          num_pax: totalPassengers,
          lead_booker_details: {
            firstName: leadPassenger.name.firstName,
            lastName: leadPassenger.name.lastName,
            email: leadPassenger.contact.emailAddress,
            phone: leadPassenger.contact.phones[0].number,
          },
          passenger_details: formData.passengers,
          visa_statuses: formData.passengers.map((passenger, index) => ({
            passenger_index: index,
            passenger_name: `${passenger.name.firstName} ${passenger.name.lastName}`,
            passenger_email: passenger.contact?.emailAddress || '',
            status: passenger.visa_status || 'not_applicable',
            visa_type: passenger.visa_type || '',
            existing_visa_status:
              passenger.existing_visa_status || 'not_specified',
            visa_expiry_date: passenger.visa_expiry_date || null,
          })),
          payment_type: formData.payment_type,
          customization: customizationData,
        },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (response.data.checkoutUrl) {
        resetUnsavedChanges()
        window.location.href = response.data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        'Failed to initiate booking. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const paxCount = totalPassengers
  const perPax = selectedDate?.rate_per_pax || 0
  const baseTotal = perPax * paxCount
  const rules = selectedDate?.fee_rules || {
    perRemovedGroup: 5000,
    perRestDay: 3000,
    minFee: 5000,
    maxFee: 50000,
  }
  let customizationFee = 0
  if (customizationData?.enabled) {
    // Prefer clientTotals from previous screen if present
    customizationFee = customizationData?.clientTotals?.customizationFee ?? 0
    if (!customizationData?.clientTotals) {
      const groups = customizationData?.removedInclusionGroupIds?.length || 0
      const rests = customizationData?.restDayNumbers?.length || 0
      const uncapped =
        groups * (rules.perRemovedGroup || 0) + rests * (rules.perRestDay || 0)
      customizationFee = uncapped
      if (customizationFee > 0 && customizationFee < (rules.minFee || 0))
        customizationFee = rules.minFee || 0
      if (customizationFee > (rules.maxFee || Number.MAX_SAFE_INTEGER))
        customizationFee = rules.maxFee
    }
  }
  const grandTotal = baseTotal + customizationFee

  return (
    <div className='passenger-details passenger-details--tour pt-[var(--default-padding-top)] lg:pt-25 md:pt-35'>
      <div className='hero-background'>
        <img
          className='hero-image'
          src={flightsHeroDesktop}
          alt='Tour Hero'
        />
      </div>

      <div className='max-w-[1200px] mx-auto w-screen px-4 lg:px-0 pt-[var(--default-padding-top)] lg:pt-25 md:pt-35 bg-black'>
        <div className='grid lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200'>
              <h2 className='passenger-details__form-title flex items-center gap-3 text-xl font-semibold text-gray-800'>
                <IoPersonCircle className='text-yellow-500' />
                Passenger Information
              </h2>
              <PassengerForm
                passengers={formData.passengers}
                handleChange={handlePassengerChange}
                validationErrors={[]}
                setValidationErrors={() => {}}
                tourPackage={tourPackage}
              />

              <div className='mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200'>
                <label className='block text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                  <i className='bi-credit-card text-yellow-500'></i>
                  <div>Payment Type</div>
                </label>
                <div className='inline-flex rounded-lg border border-gray-300 overflow-hidden shadow-sm'>
                  <button
                    type='button'
                    className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${formData.payment_type === 'FULL' ? 'bg-[#f7d100] text-black shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() =>
                      setFormData((p) => ({ ...p, payment_type: 'FULL' }))
                    }
                    disabled={loading}
                  >
                    <i className='bi-check-circle mr-2'></i>
                    Full Payment
                  </button>
                  <button
                    type='button'
                    className={`px-6 py-3 text-sm font-medium border-l border-gray-300 transition-all duration-200 ${formData.payment_type === 'RESERVATION' ? 'bg-[#f7d100] text-black shadow-md' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() =>
                      setFormData((p) => ({
                        ...p,
                        payment_type: 'RESERVATION',
                      }))
                    }
                    disabled={loading}
                  >
                    <i className='bi-clock mr-2'></i>
                    Reservation
                  </button>
                </div>

                {formData.payment_type === 'RESERVATION' && (
                  <div className='mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                    <label className='block text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2'>
                      <i className='bi-info-circle text-blue-500'></i>
                      Reservation Fee Per Pax
                    </label>
                    <input
                      type='text'
                      disabled
                      defaultValue={`PHP ${reservation_per_pax}`}
                      className='mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm sm:text-sm py-3 px-4 font-semibold text-gray-800'
                    />
                  </div>
                )}

                {error && (
                  <div className='mt-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-red-600 text-sm font-medium flex items-center gap-2'>
                      <i className='bi-exclamation-triangle text-red-500'></i>
                      {error}
                    </p>
                  </div>
                )}

                {/* Terms and Conditions Section */}
                <div
                  ref={setTermsRef}
                  className='mt-6 p-6 bg-yellow-50 rounded-lg '
                >
                  {needsVisaDisclaimer && (
                    <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2'>
                      <i className='bi-info-circle text-blue-500 mt-0.5'></i>
                      <p className='text-sm text-blue-800'>
                        <strong>Notice:</strong> Our Terms and Conditions have
                        been updated to include important information about visa
                        requirements. Please review them carefully.
                      </p>
                    </div>
                  )}
                  <div className='flex items-start space-x-3'>
                    <input
                      type='checkbox'
                      id='terms-checkbox'
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className='mt-1 h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='terms-checkbox'
                      className='text-sm text-gray-700'
                    >
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
                </div>
              </div>
            </div>
          </div>
          <aside className='lg:col-span-1'>
            <div className='bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky top-24'>
              <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4'>
                <i className='bi-receipt text-yellow-500'></i>
                Booking Summary
              </h3>
              <div className='mt-4 space-y-3 text-sm text-gray-700'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Tour</span>
                  <span className='font-semibold text-right max-w-[60%] text-gray-800'>
                    {title}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Dates</span>
                  <span className='font-semibold text-gray-800'>
                    {new Date(selectedDate.start_date).toLocaleDateString()} -{' '}
                    {new Date(selectedDate.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Passengers</span>
                  <span className='font-semibold text-gray-800'>
                    {totalPassengers}
                  </span>
                </div>
                {perPax > 0 && (
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Rate per Pax</span>
                    <span className='font-semibold text-gray-800'>
                      PHP {perPax.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
              <div className='mt-6 border-t border-gray-200 pt-4 space-y-3 text-sm'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600'>Base Total</span>
                  <span className='font-semibold text-gray-800'>
                    PHP {baseTotal.toLocaleString()}
                  </span>
                </div>
                {customizationData?.enabled && (
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600'>Customization Fee</span>
                    <span className='font-semibold text-gray-800'>
                      PHP {customizationFee.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className='flex justify-between items-center text-base font-bold pt-3 mt-3 border-t border-gray-300'>
                  <span className='text-gray-800'>Grand Total</span>
                  <span className='text-yellow-600 text-lg'>
                    PHP {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <PrimaryButton
                onClick={handleSubmit}
                className='mt-6'
                buttonText='Proceed To Payment'
                isBold={true}
                loading={loading}
              />
            </div>
          </aside>
        </div>
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
            <h2 className='text-2xl font-bold text-gray-900'>
              Terms and Conditions
            </h2>
            <button
              onClick={() => setShowTermsModal(false)}
              className='text-gray-400 hover:text-gray-600 text-2xl'
            >
              ×
            </button>
          </div>
          <div className='p-6 overflow-y-auto max-h-[70vh]'>
            <div className='prose max-w-none text-sm text-gray-700 space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900'>
                Travel & Tours
              </h3>

              <section>
                <h4 className='font-semibold text-gray-900'>DEFINITIONS</h4>
                <ul className='list-disc pl-6 space-y-1'>
                  <li>
                    <strong>"We" and "us"</strong>, as your Travel Consultants
                    and Visa consultants.
                  </li>
                  <li>
                    <strong>"Consultant"</strong> means an employee of Lindela
                    Travel and tours, with the authority to book Products.
                  </li>
                  <li>
                    <strong>"You"</strong> means a person who makes a booking
                    for a product with us.
                  </li>
                  <li>
                    <strong>"Your consultant"</strong> means the particular
                    consultant or consultants with whom you negotiate the
                    booking of a product.
                  </li>
                  <li>
                    <strong>"Supplier"</strong> means a third-party company or a
                    person who provides products, including a wholesaler of such
                    products.
                  </li>
                  <li>
                    <strong>"Product"</strong> means travel and holiday-related
                    products and services including accommodation, leisure
                    activities, and various forms of transport, including
                    packaged combinations thereof.
                  </li>
                  <li>
                    <strong>"Travel documents"</strong> means any document
                    (whether in electronic form or otherwise) used to confirm an
                    arrangement with a supplier, including (without limitation)
                    airline tickets, hotel vouchers, and tour vouchers.
                  </li>
                  <li>
                    <strong>"Force Majeure"</strong> means an act of God, peril
                    of the sea, accident of navigation, war (including civil
                    war), sabotage, riot, insurrection, civil commission, coup
                    d'etat, national emergency, martial law, fire(including
                    wildfire), explosion, lightning, flood, tsunami, cyclone,
                    hurricane, tornado or other major weather events,
                    earthquake, landslide, volcanic eruption or another natural
                    catastrophe, epidemic, pandemic, quarantine, outbreaks of
                    infectious disease or any other public health crisis,
                    radiation or radioactive contamination, national strike or
                    other major lack of availability of labor, raw materials or
                    energy beyond the control of the affected party.
                  </li>
                </ul>
              </section>

              {needsVisaDisclaimer && (
                <section className='bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-4'>
                  <h4 className='font-semibold text-gray-900 flex items-center gap-2'>
                    <i className='bi-exclamation-triangle text-yellow-600'></i>
                    IMPORTANT: VISA VALIDITY DISCLAIMER
                  </h4>
                  <p className='mt-2'>
                    You have indicated that one or more passengers already
                    possess a valid visa for the destination country.
                    <strong>
                      {' '}
                      You are solely responsible for ensuring that all visas are
                      valid, current, and meet the entry requirements for your
                      travel dates.
                    </strong>
                  </p>
                  <p className='mt-2'>
                    Lindela Travel and Tours is not responsible for verifying
                    the validity, authenticity, or compliance of existing visas.
                    We strongly recommend that you:
                  </p>
                  <ul className='list-disc pl-6 space-y-1 mt-2'>
                    <li>
                      Verify your visa expiry date is at least 6 months beyond
                      your travel dates (or as required by the destination
                      country)
                    </li>
                    <li>
                      Confirm your visa type permits the purpose of your travel
                    </li>
                    <li>
                      Check with the relevant embassy or consulate for current
                      entry requirements
                    </li>
                    <li>
                      Ensure your passport validity meets destination country
                      requirements
                    </li>
                  </ul>
                  <p className='mt-2 font-semibold text-gray-900'>
                    Lindela Travel and Tours shall not be held liable for any
                    denied boarding, entry refusal, deportation, fines, or other
                    consequences arising from invalid, expired, or inappropriate
                    visa documentation. Any costs incurred due to visa-related
                    issues are your sole responsibility.
                  </p>
                </section>
              )}

              <section>
                <h4 className='font-semibold text-gray-900'>
                  Terms & Conditions
                </h4>
                <p>
                  Please read the following terms and conditions carefully. You
                  must not make any booking unless you are 18 years of age or
                  older and understand and agree with the following terms and
                  conditions.
                </p>
                <p>
                  These terms and conditions apply to bookings you make with a
                  consultant (in the office, over the phone, or by email) as
                  well as online bookings made via our website. These terms and
                  conditions govern our relationship with you. Once we accept a
                  booking from you on behalf of a supplier, you will also have a
                  separate contract with the supplier, which will be governed by
                  other terms and conditions.
                </p>
              </section>

              <section>
                <h4 className='font-semibold text-gray-900'>
                  EXECUTIVE SUMMARY
                </h4>
                <p>
                  Although you should read all of the terms and conditions, the
                  following is a summary of the most important:
                </p>
                <ul className='list-disc pl-6 space-y-1'>
                  <li>
                    Prices, including in some cases, of confirmed bookings, may
                    be subject to change.
                  </li>
                  <li>
                    Some confirmed bookings are non-refundable if canceled by
                    you and it is your responsibility to check if this applies.
                  </li>
                  <li>
                    We will be entitled to retain our service fees even if a
                    booking is canceled or does not proceed for any reason which
                    is not our fault.
                  </li>
                  <li>
                    It is your responsibility to make yourself aware of all
                    information relevant to your travel plans, including but not
                    limited to visa requirements and health precautions.
                  </li>
                  <li>
                    We are not your agent and may receive additional fees or
                    other incentives from suppliers.
                  </li>
                  <li>
                    We are not liable for the accuracy of any published supplier
                    content including websites and brochures.
                  </li>
                </ul>
              </section>

              <section>
                <h4 className='font-semibold text-gray-900'>
                  PRICES AND TAXES
                </h4>
                <p>
                  All prices that we quote are in Philippine Peso and based on
                  twin share accommodation unless otherwise stated. Please note
                  that prices quoted are subject to change at the discretion of
                  the supplier prior to booking. Price changes may occur after
                  booking because of matters outside our control which increase
                  the cost of the product.
                </p>
              </section>

              <section>
                <h4 className='font-semibold text-gray-900'>PRODUCTS</h4>
                <p>
                  All products that we quote on are subject to availability and
                  may be withdrawn or varied by the supplier without notice. All
                  Products and services are exclusively provided by LINDELA
                  TRAVEL AND TOURS and in business partners.
                </p>
                <p>
                  Our Products are but not limited to Airline Tickets, Hotel
                  Accommodations, Local & International Package tours, Land
                  Arrangements, Passport Assistance, and Travel Insurance.
                </p>
              </section>

              <section>
                <h4 className='font-semibold text-gray-900'>
                  CHANGE AND CANCELLATION FEES
                </h4>
                <p>
                  Be aware that some confirmed bookings are not refundable if
                  canceled, and also may not be transferable to another date or
                  otherwise changed. Changes and cancellations of reservations
                  or bookings may incur fees or penalties of 50% of the total
                  amount of packages.
                </p>
              </section>

              <section>
                <h4 className='font-semibold text-gray-900'>REFUNDS</h4>
                <p>
                  Your entitlement to a refund for canceled bookings is subject
                  to the relevant supplier's terms and conditions. If we are
                  managing or arranging a refund for a canceled booking on your
                  behalf it will not be paid to you until the supplier provides
                  the refund to us.
                </p>
              </section>

              <section>
                <h4 className='font-semibold text-gray-900'>
                  DEPOSITS AND PAYMENTS
                </h4>
                <p>
                  You will be required to pay a deposit (or deposits) when
                  booking. The deposit amount varies depending on the product
                  booked and the lead time to travel. All deposits are
                  non-refundable for changes of mind or cancellations by you.
                </p>
              </section>

              <section>
                <h4 className='font-semibold text-gray-900'>LIABILITY</h4>
                <p>
                  To the extent permitted by law, we do not accept any liability
                  in contract, tort, or otherwise for any injury, damage, loss
                  (including consequential loss), delay, additional expense, or
                  inconvenience caused directly or indirectly by the acts,
                  omissions, or default, whether negligent or otherwise, of
                  third party providers over whom we have no direct control.
                </p>
              </section>

              <section>
                <h4 className='font-semibold text-gray-900'>GOVERNING LAW</h4>
                <p>
                  If any dispute arises between you and us, the laws applicable
                  in the Philippines will apply. You irrevocably and
                  unconditionally submit to the exclusive jurisdiction of the
                  courts of the Philippines.
                </p>
              </section>

              <section>
                <h4 className='font-semibold text-gray-900'>
                  SUMMARY OF OBLIGATIONS
                </h4>
                <p>
                  Before making a booking, it is important that you meet the
                  following requirements:
                </p>
                <ul className='list-disc pl-6 space-y-1'>
                  <li>
                    You are over the age of eighteen (18) and have sufficient
                    funds to pay for the travel services.
                  </li>
                  <li>
                    You have read our terms and conditions and if booking for
                    third parties warrants that you have their authority to do
                    so.
                  </li>
                  <li>
                    You have read the terms and conditions of any applicable
                    "Suppliers" and agree to be bound by those.
                  </li>
                  <li>
                    You are responsible for checking the accuracy of all
                    documents provided to you.
                  </li>
                  <li>
                    You are responsible for confirming departure times of any
                    booking services at least 24 hours prior to travel.
                  </li>
                  <li>
                    You accept that passports, visas, and other required
                    identification documents are your responsibility.
                  </li>
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

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
        title='Unsaved Changes'
        message='You have unsaved changes. Are you sure you want to leave without saving?'
        confirmText='Leave Without Saving'
        cancelText='Stay on Page'
      />
    </div>
  )
}

export default TourBooking
