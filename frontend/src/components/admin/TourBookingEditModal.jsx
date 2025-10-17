import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Select from 'react-select'
import AsyncSelect from 'react-select/async'
import ReactFlatpickr from 'react-flatpickr'
import 'flatpickr/dist/themes/material_red.css'
import { useSnackbar } from '../../context/SnackbarContext'
import { useAirports } from '../../context/AirportContext'
import { useAirlines } from '../../context/AirlinesContext'
import { loadOptions } from '../../utils/airportOptionsLoader'
import { defaultAirportOptionsData } from '../../utils/defaultAirportOptions'
import { getAircraftOptions } from '../../utils/metadataApi'
import adminClient from '../../api/adminClient'
import useUnsavedChanges from '../../hooks/useUnsavedChanges'
import UnsavedChangesModal from '../UnsavedChangesModal'
import '../../styles/unsaved-changes.css'

const TourBookingEditModal = ({ 
    isOpen, 
    booking, 
    onClose, 
    onSubmit
}) => {
    const { showSuccess, showError } = useSnackbar()
    const [editLoading, setEditLoading] = useState(false)
    const [editForm, setEditForm] = useState({
        status: '',
        assigned_to: '',
        assignment_status: 'pending',
        flight_details: {
            outbound: [ { airline: '', pnr: '', departure: '', arrival: '', date: '' } ],
            return: [ { airline: '', pnr: '', departure: '', arrival: '', date: '' } ]
        }
    })
    const [, setDraftSaved] = useState(false)
    const [tripType, setTripType] = useState('round-trip')
    const [adminOptions, setAdminOptions] = useState([])
    const [loadingAdmins, setLoadingAdmins] = useState(false)
    const [showUnsavedModal, setShowUnsavedModal] = useState(false)

    // Initial form data for comparison
    const initialFormData = {
        status: '',
        assigned_to: '',
        assignment_status: 'pending',
        flight_details: {
            outbound: [ { airline: '', pnr: '', departure: '', arrival: '', date: '' } ],
            return: [ { airline: '', pnr: '', departure: '', arrival: '', date: '' } ]
        }
    }

    // Unsaved changes hook
    const {
        hasUnsavedChanges,
        resetUnsavedChanges
    } = useUnsavedChanges(initialFormData, editForm, {
        enabled: isOpen,
        trackBeforeUnload: false // Don't track browser close for modals
    })

    // Context hooks for flight details
    const { airports } = useAirports()
    const { airlines, loading: airlinesLoading } = useAirlines()
    const { asyncLoader, defaultOptions } = loadOptions(airports, defaultAirportOptionsData)
    const [aircraftOptions, setAircraftOptions] = useState([])
    const [aircraftLoading, setAircraftLoading] = useState(false)

    // Memoized airline options for better performance
    const airlineOptions = useMemo(() => {
        return (airlines || [])
            .filter(a => a && a.label)
            .map(a => ({ value: a.value, label: a.label, logo: a.logo }))
    }, [airlines])

    // Async loader for airlines with debouncing
    const loadAirlines = useCallback((inputValue) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const searchTerm = (inputValue || '').toLowerCase().trim()
                
                if (!searchTerm) {
                    resolve(airlineOptions.slice(0, 20))
                    return
                }
                
                const filteredAirlines = airlineOptions
                    .filter(airline => 
                        airline.label && 
                        airline.label.toLowerCase().includes(searchTerm)
                    )
                    .slice(0, 50)
                
                resolve(filteredAirlines)
            }, 100)
        })
    }, [airlineOptions])

    // Load aircraft options
    const loadAircraftOptions = useCallback(async () => {
        if (aircraftOptions.length > 0) return
        
        setAircraftLoading(true)
        try {
            const response = await getAircraftOptions()
            if (response.success) {
                setAircraftOptions(response.data || [])
            } else {
                console.warn('No aircraft options received')
                setAircraftOptions([])
            }
        } catch (error) {
            console.error('Error loading aircraft options:', error)
            setAircraftOptions([])
        } finally {
            setAircraftLoading(false)
        }
    }, [aircraftOptions.length])

    // Status options for tours
    const statusOptions = [
        { value: 'CONFIRMED', label: 'Confirmed', color: '#28a745' },
        { value: 'PENDING_PAYMENT', label: 'Pending Payment', color: '#fd7e14' },
        { value: 'CANCELLED', label: 'Cancelled', color: '#dc3545' }
    ]

    const assignmentStatusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Approved' }
    ]

    // Admin options for assignment
    const fetchAdminOptions = useCallback(async () => {
        setLoadingAdmins(true)
        try {
            const response = await adminClient.get('/appointments/all-staff')
            if (response.data.success) {
                const options = response.data.data.map(admin => ({
                    value: admin.id,
                    label: `${admin.first_name} ${admin.last_name} (${admin.email})`,
                    email: admin.email,
                    name: `${admin.first_name} ${admin.last_name}`
                }))
                setAdminOptions(options)
            }
        } catch (error) {
            console.error('Error fetching admin options:', error)
        } finally {
            setLoadingAdmins(false)
        }
    }, [])

    const initializeModal = useCallback(async () => {
        await fetchAdminOptions()
        await loadAircraftOptions()
        
        // Get tour package dates for smart flight date defaults
        const tourStartDate = booking.package_dates?.start_date
        const tourEndDate = booking.package_dates?.end_date
        
        // Calculate smart flight dates
        const getSmartFlightDates = () => {
            if (!tourStartDate || !tourEndDate) {
                return { outboundDate: '', returnDate: '' }
            }
            
            const startDate = new Date(tourStartDate)
            const endDate = new Date(tourEndDate)
            
            // Outbound: Usually day before tour starts
            const outboundDate = new Date(startDate)
            outboundDate.setDate(startDate.getDate() - 1)
            
            // Return: Usually day after tour ends
            const returnDate = new Date(endDate)
            returnDate.setDate(endDate.getDate() + 1)
            
            return {
                outboundDate: outboundDate.toISOString().split('T')[0],
                returnDate: returnDate.toISOString().split('T')[0]
            }
        }
        
        const smartDates = getSmartFlightDates()
        
        // Check if there's a saved draft and auto-load it
        const draftKey = `tour_booking_draft_${booking.id}`
        const savedDraft = localStorage.getItem(draftKey)
        
        let initialFormData
        let initialTripType = 'round-trip'
        
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft)
                initialFormData = parsedDraft
                initialTripType = parsedDraft.tripType || 'round-trip'
            } catch (error) {
                console.error('Error parsing saved draft:', error)
                initialFormData = null
            }
        }
        
        // If no draft or draft parsing failed, create fresh form with smart dates
        if (!initialFormData) {
            const fd = booking.flight_details || {}
            const normalizeLeg = (leg) => {
                if (!leg) return [ { airline: '', pnr: '', departure: '', arrival: '', date: '', aircraft: '' } ]
                if (Array.isArray(leg)) {
                    return leg.length ? leg.map(seg => ({
                        airline: seg.airline || '',
                        pnr: seg.pnr || seg.flight_no || '',
                        departure: seg.departure || '',
                        arrival: seg.arrival || '',
                        date: seg.date || '',
                        aircraft: seg.aircraft || '',
                        terminal: seg.terminal || '',
                        arrival_date: seg.arrival_date || ''
                    })) : [ { airline: '', pnr: '', departure: '', arrival: '', date: '', aircraft: '' } ]
                }
                return [ {
                    airline: leg.airline || '',
                    pnr: leg.pnr || leg.flight_no || '',
                    departure: leg.departure || '',
                    arrival: leg.arrival || '',
                    date: leg.date || '',
                    aircraft: leg.aircraft || '',
                    terminal: leg.terminal || '',
                    arrival_date: leg.arrival_date || ''
                } ]
            }
            
            // Handle both old and new flight_details structure
            const outbound = normalizeLeg(fd.outbound || fd.outboundSegments)
            const returnFlights = normalizeLeg(fd.return || fd.inbound || fd.returnSegments)
            
            // Pre-populate dates if not already set
            if (outbound.length > 0 && !outbound[0].date && smartDates.outboundDate) {
                outbound[0].date = smartDates.outboundDate
            }
            if (returnFlights.length > 0 && !returnFlights[0].date && smartDates.returnDate) {
                returnFlights[0].date = smartDates.returnDate
            }
            
            initialFormData = {
                status: booking.status,
                assigned_to: booking.assigned_to || '',
                assignment_status: booking.assignment_status || 'pending',
                flight_details: {
                    outbound,
                    return: returnFlights
                }
            }
        }
        
        setEditForm(initialFormData)
        setTripType(initialTripType)
    }, [booking, fetchAdminOptions, loadAircraftOptions])

    // Initialize modal when booking changes
    useEffect(() => {
        if (isOpen && booking) {
            initializeModal()
        }
    }, [isOpen, booking, initializeModal])

    // Save draft functionality
    const saveDraft = () => {
        if (!booking) return
        const draftKey = `tour_booking_draft_${booking.id}`
        const draftData = {
            ...editForm,
            tripType,
            savedAt: new Date().toISOString()
        }
        localStorage.setItem(draftKey, JSON.stringify(draftData))
        setDraftSaved(true)
        
        setTimeout(() => setDraftSaved(false), 2000)
    }

    // Clear draft functionality
    const clearDraft = () => {
        if (!booking) return
        const draftKey = `tour_booking_draft_${booking.id}`
        localStorage.removeItem(draftKey)
        
        // Reset form to original booking data
        setEditForm({
            status: booking.status,
            assigned_to: booking.assigned_to || '',
            assignment_status: booking.assignment_status || 'pending',
            flight_details: (() => {
                const fd = booking.flight_details || {}
                const normalizeLeg = (leg) => {
                    if (!leg) return [ { airline: '', pnr: '', departure: '', arrival: '', date: '', aircraft: '' } ]
                    if (Array.isArray(leg)) {
                        return leg.length ? leg.map(seg => ({
                            airline: seg.airline || '',
                            pnr: seg.pnr || seg.flight_no || '',
                            departure: seg.departure || '',
                            arrival: seg.arrival || '',
                            date: seg.date || '',
                            aircraft: seg.aircraft || '',
                            terminal: seg.terminal || '',
                            arrival_date: seg.arrival_date || ''
                        })) : [ { airline: '', pnr: '', departure: '', arrival: '', date: '', aircraft: '' } ]
                    }
                    return [ {
                        airline: leg.airline || '',
                        pnr: leg.pnr || leg.flight_no || '',
                        departure: leg.departure || '',
                        arrival: leg.arrival || '',
                        date: leg.date || '',
                        aircraft: leg.aircraft || '',
                        terminal: leg.terminal || '',
                        arrival_date: leg.arrival_date || ''
                    } ]
                }
                
                const outbound = normalizeLeg(fd.outbound || fd.outboundSegments)
                const returnFlights = normalizeLeg(fd.return || fd.inbound || fd.returnSegments)
                
                return {
                    outbound,
                    return: returnFlights
                }
            })()
        })
        setTripType('round-trip')
        showSuccess('Draft cleared! Form reset to original booking data.')
    }

    // Auto-populate flight dates when trip type changes
    const handleTripTypeChange = (newTripType) => {
        setTripType(newTripType)
        
        if (newTripType === 'round-trip' && booking) {
            const tourEndDate = booking.package_dates?.end_date
            if (tourEndDate) {
                const returnDate = new Date(tourEndDate)
                returnDate.setDate(returnDate.getDate() + 1)
                const smartReturnDate = returnDate.toISOString().split('T')[0]
                
                setEditForm(prev => ({
                    ...prev,
                    flight_details: {
                        ...prev.flight_details,
                        return: prev.flight_details.return.map((seg, idx) => 
                            idx === 0 && !seg.date ? { ...seg, date: smartReturnDate } : seg
                        )
                    }
                }))
            }
        }
    }

    // Handle form changes
    const handleFormChange = (field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const handleFlightChange = (direction, field, value, index = 0) => {
        setEditForm(prev => ({
            ...prev,
            flight_details: {
                ...prev.flight_details,
                [direction]: (prev.flight_details?.[direction] || []).map((seg, i) => i === index ? { ...seg, [field]: value } : seg)
            }
        }))
    }

    const addSegment = (direction) => {
        setEditForm(prev => ({
            ...prev,
            flight_details: {
                ...prev.flight_details,
                [direction]: [
                    ...(prev.flight_details?.[direction] || []),
                    { airline: '', pnr: '', departure: '', arrival: '', departure_time: '', arrival_time: '', aircraft: '', terminal: '' }
                ]
            }
        }))
    }

    const removeSegment = (direction, index) => {
        setEditForm(prev => ({
            ...prev,
            flight_details: {
                ...prev.flight_details,
                [direction]: (prev.flight_details?.[direction] || []).filter((_, i) => i !== index)
            }
        }))
    }

    const handleCloseModal = () => {
        if (hasUnsavedChanges) {
            setShowUnsavedModal(true)
            return
        }
        
        // Auto-save draft before closing
        saveDraft()
        
        setEditForm({
            status: '',
            assigned_to: '',
            assignment_status: 'pending',
            flight_details: {
                outbound: [ { airline: '', pnr: '', departure: '', arrival: '', date: '' } ],
                return: [ { airline: '', pnr: '', departure: '', arrival: '', date: '' } ]
            }
        })
        setDraftSaved(false)
        onClose()
    }

    const handleConfirmClose = () => {
        setShowUnsavedModal(false)
        // Auto-save draft before closing
        saveDraft()
        
        setEditForm({
            status: '',
            assigned_to: '',
            assignment_status: 'pending',
            flight_details: {
                outbound: [ { airline: '', pnr: '', departure: '', arrival: '', date: '' } ],
                return: [ { airline: '', pnr: '', departure: '', arrival: '', date: '' } ]
            }
        })
        setDraftSaved(false)
        onClose()
    }

    const handleCancelClose = () => {
        setShowUnsavedModal(false)
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setEditLoading(true)
        try {
            const submitData = {
                status: editForm.status,
                assigned_to: editForm.assigned_to || null,
                assignment_status: editForm.assignment_status,
                flight_details: {
                    outbound: (editForm.flight_details?.outbound || []).filter(segment => 
                        segment.airline || segment.pnr || segment.departure || segment.arrival || segment.date
                    ),
                    return: tripType === 'round-trip' ? 
                        (editForm.flight_details?.return || []).filter(segment => 
                            segment.airline || segment.pnr || segment.departure || segment.arrival || segment.date
                        ) : []
                }
            }
            
            await onSubmit(submitData)
            resetUnsavedChanges()
            handleCloseModal()
        } catch (error) {
            console.error('Error updating booking:', error)
            showError('Error updating booking. Please try again.')
        } finally {
            setEditLoading(false)
        }
    }

    if (!isOpen || !booking) return null

    return (
        <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content modal-wide" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header modal-header-sticky">
                    <h3>
                        Edit Tour Booking
                        {hasUnsavedChanges && (
                            <span className='unsaved-indicator'>•</span>
                        )}
                    </h3>
                    <div className="modal-header-actions">
                        <button 
                            className="modal-close" 
                            onClick={handleCloseModal}
                            disabled={editLoading}
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <form onSubmit={handleEditSubmit} className="edit-form">
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <Select
                            value={statusOptions.find(option => option.value === editForm.status)}
                            onChange={(selectedOption) => 
                                handleFormChange('status', selectedOption?.value || '')
                            }
                            options={statusOptions}
                            placeholder="Select status"
                            isSearchable={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                            formatOptionLabel={(option) => (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div 
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            backgroundColor: option.color,
                                            marginRight: 8
                                        }}
                                    />
                                    {option.label}
                                </div>
                            )}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="assigned_to">Assigned To</label>
                        <Select
                            value={adminOptions.find(option => option.value === editForm.assigned_to)}
                            onChange={(selectedOption) => 
                                handleFormChange('assigned_to', selectedOption?.value || '')
                            }
                            options={adminOptions}
                            placeholder={loadingAdmins ? 'Loading admins...' : 'Select admin'}
                            isSearchable={true}
                            isLoading={loadingAdmins}
                            isClearable={true}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="assignment_status">Assignment Status</label>
                        <Select
                            value={assignmentStatusOptions.find(option => option.value === editForm.assignment_status)}
                            onChange={(selectedOption) => 
                                handleFormChange('assignment_status', selectedOption?.value || 'pending')
                            }
                            options={assignmentStatusOptions}
                            placeholder="Select assignment status"
                            isSearchable={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="trip_type">Trip Type</label>
                        <Select
                            value={{ value: tripType, label: tripType === 'round-trip' ? 'Round-trip' : 'One-way' }}
                            onChange={(opt) => handleTripTypeChange(opt?.value || 'round-trip')}
                            options={[{ value: 'round-trip', label: 'Round-trip' }, { value: 'one-way', label: 'One-way' }]}
                            isSearchable={false}
                            className="react-select-container"
                            classNamePrefix="react-select"
                        />
                    </div>

                    <div className="form-group">
                        <div className="form-group-header">
                            <label>Flight Details (Optional)</label>
                            <button 
                                type="button"
                                className="btn btn-outline btn-sm"
                                onClick={clearDraft}
                                disabled={editLoading}
                                title="Clear draft and reset to original booking data"
                            >
                                Clear
                            </button>
                        </div>
                        <p className="form-help-text">
                            Add flight information for this tour booking. This will appear in the PDF receipt.
                        </p>
                        <div className="flight-details-grid">
                            <div className="flight-group">
                                <h5>Outbound</h5>
                                {(editForm.flight_details?.outbound || []).map((seg, idx) => (
                                    <div key={`outbound-${idx}`} className="grid-2">
                                    <AsyncSelect
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder={airlinesLoading ? 'Loading airlines...' : 'Select airline...'}
                                        cacheOptions
                                        defaultOptions={airlineOptions.length > 0 ? airlineOptions.slice(0, 20) : []}
                                        loadOptions={loadAirlines}
                                        value={airlineOptions.find(o => o.value === (seg?.airline || '')) || null}
                                        onChange={(opt) => handleFlightChange('outbound', 'airline', opt?.value || '', idx)}
                                        isClearable
                                        isLoading={airlinesLoading}
                                        noOptionsMessage={() => airlinesLoading ? 'Loading airlines...' : 'No airlines found'}
                                        loadingMessage={() => 'Searching airlines...'}
                                        isSearchable
                                        minInputLength={0}
                                        maxMenuHeight={200}
                                    />
                                    <input
                                        type="text"
                                        placeholder="PNR"
                                        value={seg?.pnr || ''}
                                        onChange={(e) => handleFlightChange('outbound', 'pnr', e.target.value, idx)}
                                    />
                                    <ReactFlatpickr
                                        options={{ 
                                            enableTime: true,
                                            dateFormat: 'Y-m-d H:i',
                                            time_24hr: false,
                                            placeholder: 'Departure Date & Time'
                                        }}
                                        value={seg?.date || ''}
                                        onChange={(dates) => handleFlightChange('outbound', 'date', dates?.[0] ? dates[0].toISOString() : '', idx)}
                                        style={{
                                            background: '#fff',
                                            border: '1px solid #ced4da',
                                            borderRadius: 4,
                                            padding: '7px 10px',
                                            height: 38,
                                            width: '100%'
                                        }}
                                    />
                                    <AsyncSelect
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Departure Airport"
                                        cacheOptions
                                        defaultOptions={(defaultOptions || []).slice(0, 10)}
                                        loadOptions={asyncLoader}
                                        value={seg?.departure ? { label: seg.departure, value: seg.departure } : null}
                                        onChange={(opt) => handleFlightChange('outbound', 'departure', opt?.label || '', idx)}
                                        isClearable
                                    />
                                    <ReactFlatpickr
                                        options={{ 
                                            enableTime: true,
                                            dateFormat: 'Y-m-d H:i',
                                            time_24hr: false,
                                            placeholder: 'Arrival Date & Time'
                                        }}
                                        value={seg?.arrival_date || ''}
                                        onChange={(dates) => handleFlightChange('outbound', 'arrival_date', dates?.[0] ? dates[0].toISOString() : '', idx)}
                                        style={{
                                            background: '#fff',
                                            border: '1px solid #ced4da',
                                            borderRadius: 4,
                                            padding: '7px 10px',
                                            height: 38,
                                            width: '100%'
                                        }}
                                    />
                                    <AsyncSelect
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Arrival Airport"
                                        cacheOptions
                                        defaultOptions={(defaultOptions || []).slice(0, 10)}
                                        loadOptions={asyncLoader}
                                        value={seg?.arrival ? { label: seg.arrival, value: seg.arrival } : null}
                                        onChange={(opt) => handleFlightChange('outbound', 'arrival', opt?.label || '', idx)}
                                        isClearable
                                    />
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder={aircraftLoading ? 'Loading aircraft...' : 'Aircraft'}
                                        options={aircraftOptions}
                                        value={aircraftOptions.find(o => o.value === (seg?.aircraft || '')) || null}
                                        onChange={(opt) => handleFlightChange('outbound', 'aircraft', opt?.value || '', idx)}
                                        isClearable
                                        isLoading={aircraftLoading}
                                        noOptionsMessage={() => 'No aircraft found'}
                                        isSearchable
                                        maxMenuHeight={200}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Terminal"
                                        value={seg?.terminal || ''}
                                        onChange={(e) => handleFlightChange('outbound', 'terminal', e.target.value, idx)}
                                    />
                                    <div className="segment-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => addSegment('outbound')}>+ Segment</button>
                                        {(editForm.flight_details?.outbound?.length || 1) > 1 && (
                                            <button type="button" className="btn btn-danger" onClick={() => removeSegment('outbound', idx)}>Remove</button>
                                        )}
                                    </div>
                                </div>
                                ))}
                            </div>
                            {tripType === 'round-trip' && (
                            <div className="flight-group">
                                <h5>Return</h5>
                                {(editForm.flight_details?.return || []).map((seg, idx) => (
                                <div key={`return-${idx}`} className="grid-2">
                                    <AsyncSelect
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder={airlinesLoading ? 'Loading airlines...' : 'Select airline...'}
                                        cacheOptions
                                        defaultOptions={airlineOptions.length > 0 ? airlineOptions.slice(0, 20) : []}
                                        loadOptions={loadAirlines}
                                        value={airlineOptions.find(o => o.value === (seg?.airline || '')) || null}
                                        onChange={(opt) => handleFlightChange('return', 'airline', opt?.value || '', idx)}
                                        isClearable
                                        isLoading={airlinesLoading}
                                        noOptionsMessage={() => airlinesLoading ? 'Loading airlines...' : 'No airlines found'}
                                        loadingMessage={() => 'Searching airlines...'}
                                        isSearchable
                                        minInputLength={0}
                                        maxMenuHeight={200}
                                    />
                                    <input
                                        type="text"
                                        placeholder="PNR"
                                        value={seg?.pnr || ''}
                                        onChange={(e) => handleFlightChange('return', 'pnr', e.target.value, idx)}
                                    />
                                    <ReactFlatpickr
                                        options={{ 
                                            enableTime: true,
                                            dateFormat: 'Y-m-d H:i',
                                            time_24hr: false,
                                            placeholder: 'Departure Date & Time'
                                        }}
                                        value={seg?.date || ''}
                                        onChange={(dates) => handleFlightChange('return', 'date', dates?.[0] ? dates[0].toISOString() : '', idx)}
                                        style={{
                                            background: '#fff',
                                            border: '1px solid #ced4da',
                                            borderRadius: 4,
                                            padding: '7px 10px',
                                            height: 38,
                                            width: '100%'
                                        }}
                                    />
                                    <AsyncSelect
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Departure Airport"
                                        cacheOptions
                                        defaultOptions={(defaultOptions || []).slice(0, 10)}
                                        loadOptions={asyncLoader}
                                        value={seg?.departure ? { label: seg.departure, value: seg.departure } : null}
                                        onChange={(opt) => handleFlightChange('return', 'departure', opt?.label || '', idx)}
                                        isClearable
                                    />
                                    <ReactFlatpickr
                                        options={{ 
                                            enableTime: true,
                                            dateFormat: 'Y-m-d H:i',
                                            time_24hr: false,
                                            placeholder: 'Arrival Date & Time'
                                        }}
                                        value={seg?.arrival_date || ''}
                                        onChange={(dates) => handleFlightChange('return', 'arrival_date', dates?.[0] ? dates[0].toISOString() : '', idx)}
                                        style={{
                                            background: '#fff',
                                            border: '1px solid #ced4da',
                                            borderRadius: 4,
                                            padding: '7px 10px',
                                            height: 38,
                                            width: '100%'
                                        }}
                                    />
                                    <AsyncSelect
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder="Arrival Airport"
                                        cacheOptions
                                        defaultOptions={(defaultOptions || []).slice(0, 10)}
                                        loadOptions={asyncLoader}
                                        value={seg?.arrival ? { label: seg.arrival, value: seg.arrival } : null}
                                        onChange={(opt) => handleFlightChange('return', 'arrival', opt?.label || '', idx)}
                                        isClearable
                                    />
                                    <Select
                                        className="react-select-container"
                                        classNamePrefix="react-select"
                                        placeholder={aircraftLoading ? 'Loading aircraft...' : 'Aircraft'}
                                        options={aircraftOptions}
                                        value={aircraftOptions.find(o => o.value === (seg?.aircraft || '')) || null}
                                        onChange={(opt) => handleFlightChange('return', 'aircraft', opt?.value || '', idx)}
                                        isClearable
                                        isLoading={aircraftLoading}
                                        noOptionsMessage={() => 'No aircraft found'}
                                        isSearchable
                                        maxMenuHeight={200}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Terminal"
                                        value={seg?.terminal || ''}
                                        onChange={(e) => handleFlightChange('return', 'terminal', e.target.value, idx)}
                                    />
                                    <div className="segment-actions">
                                        <button type="button" className="btn btn-secondary" onClick={() => addSegment('return')}>+ Segment</button>
                                        {(editForm.flight_details?.return?.length || 1) > 1 && (
                                            <button type="button" className="btn btn-danger" onClick={() => removeSegment('return', idx)}>Remove</button>
                                        )}
                                    </div>
                                </div>
                                ))}
                            </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-actions modal-actions-sticky">
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={handleCloseModal}
                            disabled={editLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={editLoading}
                        >
                            {editLoading ? (
                                <>
                                    <div className="loading-spinner-small"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    Update Booking
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Unsaved Changes Modal */}
            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onConfirm={handleConfirmClose}
                onCancel={handleCancelClose}
                title="Unsaved Changes"
                message="You have unsaved changes. Are you sure you want to close without saving?"
                confirmText="Close Without Saving"
                cancelText="Stay in Modal"
            />
        </div>
    )
}

export default TourBookingEditModal
