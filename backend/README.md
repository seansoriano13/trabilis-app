# Trabilis Backend API

Express.js backend server for the Trabilis travel management platform.

## 🏗️ Architecture

The backend is built with:
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database with real-time features
- **Amadeus API** - Flight search and booking
- **Stripe** - Payment processing
- **Brevo** - Transactional emails
- **Puppeteer** - PDF generation

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── amadeus.js   # Amadeus API client
│   │   ├── db.js        # Database utilities (legacy)
│   │   ├── stripe.js    # Stripe client
│   │   └── supabaseClient.js
│   │
│   ├── controllers/     # Request handlers
│   │   ├── admin/       # Admin-only controllers
│   │   ├── flightController.js
│   │   ├── tourController.js
│   │   ├── visaInquiryController.js
│   │   └── webhookController.js
│   │
│   ├── routes/          # API routes
│   │   ├── adminRoutes.js
│   │   ├── flightRoutes.js
│   │   ├── tourRoutes.js
│   │   └── webhookRoutes.js
│   │
│   ├── services/        # Business logic
│   │   ├── brevoEmailService.js
│   │   ├── bookingService.js
│   │   ├── imageUploadService.js
│   │   └── templates/   # Email templates
│   │
│   ├── middlewares/     # Custom middlewares
│   │   ├── adminAuthMiddleware.js
│   │   └── pdfAuthMiddleware.js
│   │
│   ├── utils/           # Utility functions
│   │   ├── airportUtils.js
│   │   ├── flightutils.js
│   │   └── airlinesUtils.js
│   │
│   └── data/            # Static data
│       ├── airports-mini.json
│       ├── airlines.json
│       └── aircraftTypes.json
│
├── public/              # Static files
├── server.js           # Application entry point
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- API keys (Amadeus, Stripe, Brevo, ImgBB)

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Fill in your API keys and configuration. See `.env.example` for detailed descriptions.

### Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3001` (or the PORT specified in `.env`).

## 📡 API Endpoints

### Public Endpoints

#### Flights
- `POST /api/v1/flights/search` - Search for flights
- `GET /api/v1/flights/metadata` - Get airports, airlines data

#### Tours
- `GET /api/v1/destinations/tours` - List all tours
- `GET /api/v1/destinations/tour/:id` - Get tour details

#### Bookings
- `POST /api/v1/bookings/flights` - Create flight booking
- `POST /api/v1/bookings/tours` - Create tour booking
- `GET /api/v1/bookings/track/:reference` - Track booking

#### Visa
- `POST /api/v1/visa/inquiry` - Submit visa inquiry

#### Webhooks
- `POST /api/v1/webhooks/stripe` - Stripe payment webhooks

### Admin Endpoints (Require JWT Authentication)

#### Authentication
- `POST /api/v1/admin/login` - Admin login

#### Dashboard
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics

#### Bookings Management
- `GET /api/v1/admin/bookings/flights` - List flight bookings
- `GET /api/v1/admin/bookings/tours` - List tour bookings
- `PATCH /api/v1/admin/bookings/:id` - Update booking status

#### Tours Management
- `GET /api/v1/admin/tours` - List tours
- `POST /api/v1/admin/tours` - Create tour
- `PUT /api/v1/admin/tours/:id` - Update tour
- `DELETE /api/v1/admin/tours/:id` - Delete tour

#### Visa Management
- `GET /api/v1/admin/visa/inquiries` - List visa inquiries
- `PATCH /api/v1/admin/visa/:id` - Update visa status

#### Images
- `POST /api/v1/images/upload-image` - Upload and optimize image

## 🔐 Authentication

Admin endpoints use JWT Bearer token authentication:

```javascript
headers: {
  'Authorization': 'Bearer <your-jwt-token>'
}
```

Tokens are obtained through the `/api/v1/admin/login` endpoint.

## 🗄️ Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- `flight_bookings` - Flight booking records
- `tour_bookings` - Tour booking records
- `tour_packages` - Tour package definitions
- `package_dates` - Available dates for tours
- `visa_inquiries` - Visa consultation requests
- `visa_processing` - Visa application tracking
- `admins` - Admin users

## 🔧 Key Services

### Flight Service
Integrates with Amadeus API for:
- Flight search
- Flight booking
- Flight offers validation

### Email Service
Uses Brevo for transactional emails:
- Booking confirmations
- Payment receipts
- Visa inquiry confirmations

### PDF Generation
Uses Puppeteer to generate PDFs:
- Flight itineraries
- Tour booking summaries

### Image Service
Handles image uploads with:
- TinyPNG compression (optional)
- ImgBB hosting

## 🧪 Testing

```bash
npm test
```

Test endpoints are available in development mode at `/api/v1/test/*`.

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set on your hosting platform (Render, Heroku, etc.).

### Build & Start

```bash
npm install
npm start
```

### Health Check

The root endpoint `/` returns "Node Server Running!" when healthy.

## 🐛 Error Handling

The application includes:
- Global error handlers for unhandled rejections
- Startup validation for required environment variables
- Detailed error logging
- User-friendly error messages

## 📝 Logging

Logs include:
- Server startup information
- API request errors
- Database operation status
- External API call results

## 🔒 Security

- CORS configured for specific origins
- JWT authentication for admin routes
- Environment variables for sensitive data
- Stripe webhook signature verification
- Input validation on all endpoints

## 📊 Performance

- Caching for static data (airports, airlines)
- Optimized database queries
- Image compression before upload
- Puppeteer reuses browser instances

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For issues or questions, contact: lindelatravelctws@gmail.com

