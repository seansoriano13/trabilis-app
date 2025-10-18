<!-- b5d8c708-24cb-41df-bbcd-ab451c97e343 d0e7d033-7dc8-40a7-a8e8-9d7fd36eea17 -->
# Flight Tracking Enhancement Plan

## Phase 5.1: Track Flight Button in Success Page

### Changes to `frontend/src/pages/client/FlightBookingSuccess.jsx`

**Location**: Lines 259-268 (Action buttons section)

**Current Code**:

```jsx
<button
    onClick={() => fetchStatus()}
    className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600...'
    disabled={polling}
>
    <i className={`bi-arrow-clockwise mr-2 ${polling ? 'animate-spin' : ''}`}></i>
    {polling ? 'Refreshing…' : 'Refresh status'}
</button>
```

**Replace With**:

```jsx
<button
    onClick={() => navigate('/track-booking', { 
        state: { 
            bookingRef: bookingReference, 
            bookingType: 'flight', 
            autoSearch: true 
        } 
    })}
    className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600...'
>
    <i className='bi-radar mr-2'></i>
    Track Flight
</button>
```

**Why**: This provides better UX by navigating to the dedicated tracking page with real-time data instead of just refreshing the current status.

---

## Phase 5.2: Real-Time Flight Tracking

### 1. Backend Changes: `backend/src/controllers/trackBookingController.js`

**Current Behavior**: Returns flight data from database only (static data stored at booking time)

**New Behavior**: Fetch live data from Amadeus API, fallback to database if API fails

**Add new function** (after line 26, before `export const trackBookingStatus`):

```javascript
async function fetchLiveFlightData(amadeusOrderId) {
    try {
        console.log(`[TRACK BOOKING] Fetching live data for order: ${amadeusOrderId}`)
        const response = await amadeus.booking.flightOrder(amadeusOrderId).get()
        const order = response.data
        
        logAmadeusSuccess('booking.flightOrder.get', response, {
            orderId: amadeusOrderId
        })
        
        // Extract flight segments from live order
        const flightOffer = order.flightOffers?.[0]
        if (!flightOffer) {
            console.warn('[TRACK BOOKING] No flight offers in Amadeus response')
            return null
        }
        
        const allSegments = flightOffer.itineraries.flatMap(itin => itin.segments)
        
        if (allSegments.length > 0) {
            const firstSeg = allSegments[0]
            const lastSeg = allSegments.at(-1)
            
            return {
                outbound: {
                    departure: formatPoint(firstSeg.departure),
                    arrival: formatPoint(firstSeg.arrival),
                },
                inbound: allSegments.length > 1 ? {
                    departure: formatPoint(lastSeg.departure),
                    arrival: formatPoint(lastSeg.arrival),
                } : null,
                source: 'live', // Indicate this is live data
                lastUpdated: new Date().toISOString()
            }
        }
        
        return null
    } catch (error) {
        console.warn('[TRACK BOOKING] Failed to fetch live data from Amadeus:', error.message)
        logAmadeusError('booking.flightOrder.get', error, {
            orderId: amadeusOrderId
        })
        return null
    }
}
```

**Modify `trackBookingStatus` function** (lines 28-116):

In the `if (isFlight)` block (around line 63), replace lines 63-90 with:

```javascript
if (isFlight) {
    // Try to fetch live data from Amadeus first
    let liveData = null
    if (data.amadeus_order_id) {
        liveData = await fetchLiveFlightData(data.amadeus_order_id)
    }
    
    if (liveData) {
        // Use live data from Amadeus
        console.log('[TRACK BOOKING] Using live Amadeus data')
        bookingData = liveData
    } else {
        // Fallback to database data
        console.log('[TRACK BOOKING] Using database fallback data')
        const flightOffer = typeof data.amadeus_flight_offer === 'string'
            ? JSON.parse(data.amadeus_flight_offer)
            : data.amadeus_flight_offer

        const allSegments = flightOffer.itineraries.flatMap(
            (itinerary) => itinerary.segments
        )

        if (allSegments.length > 0) {
            const firstSeg = allSegments[0]
            const lastSeg = allSegments.at(-1)

            bookingData = {
                outbound: {
                    departure: formatPoint(firstSeg.departure),
                    arrival: formatPoint(firstSeg.arrival),
                },
                inbound: allSegments.length > 1 ? {
                    departure: formatPoint(lastSeg.departure),
                    arrival: formatPoint(lastSeg.arrival),
                } : null,
                source: 'database', // Indicate this is cached data
                lastUpdated: data.updated_at || data.created_at
            }
        }
    }
}
```

**Add import** at top of file (line 1):

```javascript
import { amadeus, logAmadeusError, logAmadeusSuccess } from '../config/amadeus.js'
```

---

### 2. Frontend Changes: `frontend/src/pages/client/TrackBooking.jsx`

**Add import** (line 1):

```javascript
import { useLocation } from 'react-router-dom'
```

**Add auto-search logic** (after line 48, inside the component):

```javascript
const location = useLocation()

// Auto-search when coming from success page
useEffect(() => {
    if (location.state?.autoSearch && location.state?.bookingRef) {
        setBookingRef(location.state.bookingRef)
        setBookingType(location.state.bookingType || 'flight')
        
        // Trigger search automatically
        const autoSearch = async () => {
            setIsLoading(true)
            try {
                const type = location.state.bookingType || 'flight'
                const ref = location.state.bookingRef
                
                if (type === 'visa') {
                    const res = await axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/api/v1/visa/inquiries/track?inquiryReference=${ref}`
                    )
                    setResult({ type: 'visa', inquiry: res.data })
                } else {
                    const res = await axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/api/v1/bookings/track-booking?bookingReference=${ref}&bookingType=${type}`
                    )
                    setResult({ type: 'booking', ...res.data })
                }
            } catch (err) {
                console.error('Auto-search failed:', err)
            } finally {
                setIsLoading(false)
            }
        }
        
        autoSearch()
    }
}, [location.state])
```

**Add data source indicator** (after line 457, inside the flight card footer):

```javascript
{result.bookingData?.source && (
    <div className='text-xs text-gray-500 flex items-center gap-1'>
        <i className={`bi-${result.bookingData.source === 'live' ? 'broadcast' : 'database'}`}></i>
        <span>
            {result.bookingData.source === 'live' ? 'Real-time data' : 'Cached data'}
        </span>
        {result.bookingData.lastUpdated && (
            <span className='ml-2'>
                Updated: {new Date(result.bookingData.lastUpdated).toLocaleTimeString()}
            </span>
        )}
    </div>
)}
```

---

## Testing Checklist

1. **Success Page Navigation**:

   - [ ] Click "Track Flight" button from success page
   - [ ] Verify navigation to `/track-booking` with correct state
   - [ ] Verify auto-search triggers automatically
   - [ ] Verify booking reference pre-filled in input

2. **Real-Time Tracking**:

   - [ ] Verify live data fetched from Amadeus (check console logs)
   - [ ] Verify "Real-time data" indicator shows when live data available
   - [ ] Verify flight status updates reflect real-time changes

3. **Fallback Behavior**:

   - [ ] Test with invalid/old `amadeus_order_id`
   - [ ] Verify database fallback works
   - [ ] Verify "Cached data" indicator shows on fallback
   - [ ] Verify no errors shown to user when API fails

4. **Manual Tracking**:

   - [ ] Navigate directly to `/track-booking`
   - [ ] Verify no auto-search happens
   - [ ] Verify manual search still works
   - [ ] Verify localStorage persistence works

5. **Edge Cases**:

   - [ ] Test with flight bookings that have no `amadeus_order_id` (old bookings)
   - [ ] Test with one-way vs round-trip flights
   - [ ] Test with multiple passengers
   - [ ] Test Amadeus API rate limiting (multiple rapid refreshes)

---

## Risk Mitigation

1. **API Failures**: Graceful fallback to database data ensures users always see something
2. **Performance**: Async/await with try-catch prevents blocking or crashes
3. **Rate Limits**: Console logging helps monitor API usage patterns
4. **Cost Control**: Consider adding caching layer in future if costs become concern

---

## Files Modified

1. `frontend/src/pages/client/FlightBookingSuccess.jsx` - Button replacement
2. `frontend/src/pages/client/TrackBooking.jsx` - Auto-search + data source indicator
3. `backend/src/controllers/trackBookingController.js` - Amadeus API integration + fallback logic

**Total Changes**: 3 files, ~100 lines of code added/modified