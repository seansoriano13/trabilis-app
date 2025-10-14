# PDF Generation Testing Guide

This guide explains how to test PDF generation functionality for both Flight and Tour bookings using various test scripts and payloads.

## 🧪 Available Test Scripts

### 1. Simple Test Script
**File:** `test-pdf-simple.js`
**Purpose:** Quick test with default mock data
**Usage:**
```bash
node test-pdf-simple.js
```
**What it does:**
- Tests both Flight and Tour PDF generation
- Uses basic mock data
- Generates `test-flight.pdf` and `test-tour.pdf`

### 2. Comprehensive Test Script
**File:** `test-pdf-generation.js`
**Purpose:** Full test suite with detailed mock data
**Usage:**
```bash
node test-pdf-generation.js
```
**What it does:**
- Tests Flight PDF with comprehensive mock data
- Tests Tour PDF with detailed itinerary
- Attempts to test with real booking data (if available)
- Creates timestamped PDF files in `test-pdfs/` directory

### 3. Custom Payload Test Script
**File:** `test-pdf-with-payload.js`
**Purpose:** Test with custom JSON payloads
**Usage:**
```bash
# Test with default mock data
node test-pdf-with-payload.js flight
node test-pdf-with-payload.js tour

# Test with custom payload file
node test-pdf-with-payload.js flight example-flight-payload.json
node test-pdf-with-payload.js tour example-tour-payload.json
```

## 📄 Example Payload Files

### Flight Payload
**File:** `example-flight-payload.json`
**Contains:**
- Complete flight booking data structure
- Amadeus flight offer with itineraries
- Passenger details with documents
- Search criteria
- Pricing information

### Tour Payload
**File:** `example-tour-payload.json`
**Contains:**
- Complete tour booking data structure
- Detailed itinerary with 5 days
- Passenger information
- Inclusions, exclusions, and requirements
- Payment terms and notes

## 🚀 Quick Start

1. **Test with default data:**
   ```bash
   node test-pdf-simple.js
   ```

2. **Test with custom flight data:**
   ```bash
   node test-pdf-with-payload.js flight example-flight-payload.json
   ```

3. **Test with custom tour data:**
   ```bash
   node test-pdf-with-payload.js tour example-tour-payload.json
   ```

## 📊 Test Results

### Expected Output
- ✅ PDF generation success messages
- 📄 PDF file size information
- ⏱️ Generation time
- 💾 File save location

### Sample Output
```
✅ Flight PDF generated successfully!
📄 PDF Size: 1337902 bytes (1306.54 KB)
⏱️  Generation Time: 4899ms
💾 PDF saved to: test-flight-2025-10-14T08-06-38-385Z.pdf
```

## 🔧 Creating Custom Payloads

### Flight Payload Structure
```json
{
  "booking_reference": "TRB-FLT-XXXXXX",
  "pnr": "PNR123",
  "status": "TICKETED",
  "e_ticket_numbers": ["ET123456789"],
  "currency": "PHP",
  "amadeus_flight_offer": {
    "itineraries": [...],
    "price": {...},
    "travelerPricings": [...]
  },
  "passenger_details": {
    "travelers": [...]
  }
}
```

### Tour Payload Structure
```json
{
  "bookingReference": "TRB-TOUR-XXXXXX",
  "email": "test@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "tourTitle": "Tour Package Name",
  "startDate": "2024-03-15",
  "endDate": "2024-03-22",
  "passengerCount": 2,
  "passengers": [...],
  "itinerary": [...],
  "inclusions": [...],
  "exclusions": [...]
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Puppeteer/Chrome Issues:**
   - Ensure Chrome is installed
   - Check Chrome executable path
   - Verify system permissions

2. **Template Not Found:**
   - Ensure HTML templates exist in `src/services/templates/`
   - Check file paths and permissions

3. **Memory Issues:**
   - Large PDFs may require more memory
   - Consider reducing image sizes
   - Check system resources

### Debug Mode
All scripts include detailed debug output:
- 🔍 PUPPETEER DEBUG messages
- 📧 Email PDF Generation logs
- 📊 Data transformation details

## 📁 Generated Files

### File Naming Convention
- **Simple test:** `test-flight.pdf`, `test-tour.pdf`
- **Comprehensive test:** `test-pdfs/test-flight-{timestamp}.pdf`
- **Custom payload test:** `test-{type}-{timestamp}.pdf`

### File Locations
- Simple test files: `backend/` directory
- Comprehensive test files: `backend/test-pdfs/` directory
- Custom payload test files: `backend/` directory

## 🔄 Integration with Existing Tests

The test scripts integrate with existing test endpoints:

### API Endpoints
- `GET /api/test/mock-pdf` - Generate mock flight PDF
- `GET /api/test/real-pdf?bookingReference=XXX` - Generate real booking PDF
- `POST /api/test/flight-email` - Test flight confirmation email
- `POST /api/test/tour-email` - Test tour confirmation email

### Database Integration
- Uses real booking data when available
- Falls back to mock data for testing
- Supports both Supabase and MySQL connections

## 📈 Performance Metrics

### Typical Performance
- **Flight PDF:** 1.3-1.4 MB, 4-6 seconds
- **Tour PDF:** 1.3-1.4 MB, 5-7 seconds
- **Memory usage:** ~50-100 MB during generation

### Optimization Tips
- Use smaller images for faster generation
- Reduce HTML complexity for better performance
- Consider caching for repeated generations

## 🎯 Next Steps

1. **Customize payloads** for your specific use cases
2. **Add more test scenarios** as needed
3. **Integrate with CI/CD** for automated testing
4. **Monitor performance** in production environment

## 📞 Support

If you encounter issues:
1. Check the debug output for specific error messages
2. Verify all dependencies are installed
3. Ensure proper file permissions
4. Check system resources (memory, disk space)

---

**Happy Testing! 🚀**
