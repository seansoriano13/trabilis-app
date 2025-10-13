# Trabilis Travel Management System

A comprehensive travel management platform offering flight booking, tour packages, and visa consultation services.

## 🌟 Overview

Trabilis is a full-stack web application that provides:
- ✈️ **Flight Booking** - Search and book flights using the Amadeus API
- 🏝️ **Tour Packages** - Browse and book curated travel packages
- 📋 **Visa Consultation** - Submit visa inquiries and track applications
- 👨‍💼 **Admin Dashboard** - Manage bookings, tours, and customer inquiries
- 💳 **Payment Processing** - Secure payments via Stripe

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │ ◄─────► │  Express.js API │ ◄─────► │    Supabase     │
│   (Vercel)      │         │    (Render)     │         │   (PostgreSQL)  │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                    │
                                    ├─────► Amadeus API (Flights)
                                    ├─────► Stripe (Payments)
                                    ├─────► Brevo (Emails)
                                    └─────► ImgBB (Image Hosting)
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Supabase** account and project
- **Amadeus** API credentials (test or production)
- **Stripe** account and API keys
- **Brevo** (formerly Sendinblue) account for email service
- **ImgBB** API key for image uploads

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd trabilis-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your actual API keys and configuration (see [Environment Variables](#environment-variables) section below).

Start the backend server:

```bash
npm run dev    # Development
npm start      # Production
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration.

Start the frontend development server:

```bash
npm run dev    # Development
npm run build  # Production build
```

The frontend will run on `http://localhost:5173`

## 🔐 Environment Variables

### Backend Environment Variables

See `backend/.env.example` for a complete list with descriptions. Key variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (`development` or `production`) | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `AMADEUS_API_KEY` | Amadeus API client ID | Yes |
| `AMADEUS_API_SECRET` | Amadeus API client secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Yes |
| `BREVO_API_KEY` | Brevo API key for emails | Yes |
| `JWT_SECRET` | Secret for JWT token signing | Yes |
| `IMG_BB_API_KEY` | ImgBB API key for image uploads | Yes |
| `TINIFY_API_KEY` | TinyPNG API key (optional) | No |

### Frontend Environment Variables

See `frontend/.env.example` for details:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BACKEND_URL` | Backend API URL | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `VITE_OPEN_WEATHER_API_KEY` | OpenWeather API key | Yes |

## 📦 Project Structure

```
trabilis-app/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route controllers
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── middlewares/ # Custom middlewares
│   │   └── utils/       # Utility functions
│   ├── server.js        # Entry point
│   └── package.json
│
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── layouts/     # Layout components
│   │   ├── context/     # React contexts
│   │   ├── utils/       # Utility functions
│   │   └── styles/      # CSS files
│   ├── public/          # Static assets
│   └── package.json
│
└── README.md           # This file
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Guide

**Backend (Render):**
1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your repository
4. Set environment variables in Render dashboard
5. Deploy

**Frontend (Vercel):**
1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 🔧 Common Issues

### CORS Errors
- Ensure `FRONTEND_URL` is correctly set in backend `.env`
- Check that your frontend URL matches exactly (including http/https)

### Database Connection Issues
- Verify Supabase credentials are correct
- Check that your Supabase project is active
- Ensure Row Level Security (RLS) policies are properly configured

### Payment Webhook Issues
- For local testing, use Stripe CLI to forward webhooks
- Ensure `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint

## 📚 Documentation

- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Deployment Guide](./DEPLOYMENT.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

[Add your license here]

## 📞 Support

For questions or support, contact: lindelatravelctws@gmail.com

---

Built with ❤️ by the Trabilis Team

