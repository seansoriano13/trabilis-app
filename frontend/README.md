# Trabilis Frontend

React-based frontend for the Trabilis travel management platform.

## 🏗️ Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **Supabase** - Database client
- **React Icons** - Icon library

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── admin/       # Admin-specific components
│   │   └── client/      # Client-facing components
│   │
│   ├── pages/           # Page components
│   │   ├── admin/       # Admin panel pages
│   │   └── client/      # Public pages
│   │
│   ├── layouts/         # Layout components
│   │   ├── AdminLayout.jsx
│   │   └── ClientLayout.jsx
│   │
│   ├── context/         # React contexts
│   │   ├── AirportContext.jsx
│   │   └── AirlinesContext.jsx
│   │
│   ├── api/             # API clients
│   │   ├── adminClient.js
│   │   └── supabaseClient.js
│   │
│   ├── utils/           # Utility functions
│   │   ├── flightUtils.js
│   │   └── dateUtils.js
│   │
│   ├── styles/          # Global styles
│   │   ├── admin/       # Admin styles
│   │   └── client/      # Client styles
│   │
│   ├── data/            # Static data
│   │   └── CountryCodes.json
│   │
│   ├── App.jsx          # Main app component
│   └── main.jsx         # Entry point
│
├── public/              # Static assets
│   ├── images/
│   └── client/
│
├── index.html
├── vite.config.js
├── tailwind.config.cjs
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Required environment variables:

```env
VITE_BACKEND_URL=http://localhost:3001
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPEN_WEATHER_API_KEY=your-weather-api-key
```

### Running the App

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`.

## 📱 Features

### Client-Facing Features

#### Home Page

- Hero section with call-to-action
- Featured destinations
- Service highlights
- Testimonials

#### Flights

- Flight search with filters
- Real-time availability
- Multi-city and round-trip options
- Passenger details form
- Stripe payment integration

#### Tours

- Browse tour packages
- View detailed itineraries
- Check availability
- Book with multiple passengers
- Customizable packages

#### Visa Consultation

- Submit visa inquiries
- Multiple visa types
- Document upload
- Track application status

### Admin Panel

#### Dashboard

- Booking statistics
- Revenue charts
- Recent bookings
- Quick actions

#### Bookings Management

- View all flight/tour bookings
- Update booking status
- Send confirmation emails
- Generate invoices/PDFs

#### Tours Management

- Create/edit tour packages
- Manage dates and availability
- Upload images
- Set pricing and inclusions

#### Visa Management

- View visa inquiries
- Track processing status
- Assign to consultants
- Update application progress

## 🎨 Styling

The app uses Tailwind CSS with custom configurations:

- Custom color palette
- Responsive breakpoints
- Custom utility classes
- Component-specific styles in CSS modules

## 🔐 Authentication

Admin routes are protected with JWT authentication:

- Login via admin panel
- Token stored in localStorage
- Automatic redirect on session expiry
- Token included in API requests

## 🌐 API Integration

API calls are made through:

- `adminClient.js` - Admin API calls with auth
- `supabaseClient.js` - Direct database queries
- Axios interceptors for auth and error handling

## 📦 Building for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory with:

- Minified JavaScript
- Optimized CSS
- Code splitting
- Asset optimization

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard:
   ```env
   VITE_BACKEND_URL=https://your-render-backend-url.onrender.com
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_OPEN_WEATHER_API_KEY=your-weather-api-key
   ```
4. Deploy

**Important**: The `VITE_BACKEND_URL` must point to your deployed Render backend URL, not localhost.

Configuration is in `vercel.json`.

### Manual Deployment

1. Build the app: `npm run build`
2. Serve the `dist/` directory
3. Ensure environment variables are set

## 🧪 Testing

```bash
npm run lint  # Run ESLint
```

## 🎯 Key Components

### Client Components

- `FlightSearch` - Flight search form
- `FlightResults` - Display search results
- `TourCard` - Tour package card
- `PassengerForm` - Passenger details input
- `VisaForm` - Visa inquiry form

### Admin Components

- `BookingTable` - Bookings data table
- `TourEditor` - Tour package editor
- `DashboardStats` - Statistics widgets
- `AssignmentModal` - Task assignment

## 🔧 Configuration Files

- `vite.config.js` - Vite configuration
- `tailwind.config.cjs` - Tailwind CSS config
- `eslint.config.js` - ESLint rules
- `vercel.json` - Vercel deployment config

## 📱 Responsive Design

The app is fully responsive with breakpoints:

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## ♿ Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Screen reader friendly

## 🐛 Common Issues

### Build Fails

- Clear node_modules and reinstall
- Check Node.js version (18+)
- Verify all env variables are set

### API Calls Fail

- Check `VITE_BACKEND_URL` is correct
- Ensure backend is running
- Check browser console for CORS errors

### Images Not Loading

- Verify image paths
- Check public folder structure
- Ensure images are in `public/` directory

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test on multiple devices/browsers
4. Submit a pull request

## 📞 Support

For issues or questions, contact: lindelatravelctws@gmail.com
