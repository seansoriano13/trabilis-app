## Trabilis System Overview

### Executive summary
- Trabilis is a full‑stack travel platform for flight search/booking, tour packages and bookings, visa inquiries, booking tracking, and an admin back office.
- Key integrations: Amadeus (flights), Stripe (payments), Supabase (data + notifications), Pusher (realtime), PDFShift (PDF generation), Gmail SMTP (email).

### Tech stack
- Backend: Node.js (ESM), Express 5, Amadeus SDK, Stripe SDK, Supabase JS, MySQL (dev), PostgreSQL (prod), Nodemailer, Day.js.
- Frontend: React 19 + Vite, Tailwind CSS 4, React Router 7, Chart.js, Pusher JS.
- Hosting: Backend logs reference Render (`trabilis.onrender.com`). Frontend configured for static hosting (Vercel config present).

### Architecture and routing
- API base path: `/api/v1/*` (Express app in `backend/server.js`).
- Public routes:
  - Flights: `POST /flights/search`
  - Bookings (flights): `POST /bookings/flights` (initiate), `GET /bookings/status`, `GET /bookings/cancel`, `GET /bookings/track-booking`
  - Tours: `GET /destinations/tours`, `GET /destinations/tour/:id`, `POST /destinations/tour/booking`, `GET /destinations/tour/booking`, `PATCH /destinations/tours/booking/cancel/:id`
  - Visa: `POST /visa/inquiry`, `GET /visa/inquiries/track`
  - Webhooks: `POST /webhooks/stripe` (raw body, Stripe signature verified)
  - Preview (no auth): `/tours/:id/html|print`, `/flights/:id/html|print`
  - Proxy: `GET /proxy/image?url=...`
- Admin routes (protected by `adminAuthMiddleware` under `/api/v1/admin`):
  - Auth: `POST /login`, `GET /me`
  - Dashboard/stats: bookings, revenue, charts, notifications, resolve helper
  - Users: CRUD
  - Tours: CRUD; inclusion groups, items, fee rules
  - Bookings management: edit/cancel flights and tours; PDF/HTML/print (with `pdfAuthMiddleware`)
  - Appointments/Assignments: assign/reassign bookings, update status, list staff, list assigned
  - Visa admin: list/update inquiries, assign, update assignment status, list assigned

### Data storage
- Application DB (`backend/src/config/db.js`):
  - Development: MySQL via `mysql2` (uses `?` placeholders)
  - Production: PostgreSQL via `pg` (auto-converts `?` to `$n`)
  - Used for `flight_bookings` and flight-related updates
- Supabase:
  - Used for `tour_bookings`, `package_dates`, `tour_packages`, `admins`, `admin_notifications`, `visa_inquiries`
  - Both anon and service role clients configured server-side

### Core business flows
- Flight search (`searchFlights`): validates input, calls Amadeus Flight Offers Search, returns PHP‑denominated offers.
- Flight booking (`initiateFlightBooking`):
  1) Validate travelers and contacts
  2) Price re-check via Amadeus
  3) Create Amadeus order (with retry on “segment sell failure”)
  4) Insert booking as `PENDING_PAYMENT` into DB
  5) Create Stripe Checkout Session; persist `stripe_checkout_id`; return hosted URL
  - Webhook (`checkout.session.completed`): set `PAID_PENDING_TICKETING`, push admin notification (Supabase + Pusher), asynchronously finalize ticketing and email itinerary PDF.
- Tour booking: create `PENDING_PAYMENT` in Supabase; on webhook confirm payment, decrement `available_slots`, set `CONFIRMED`, notify admins, and email tour summary PDF.
- Visa inquiry: public submission with validation; insert into Supabase; send confirmation email; track endpoint returns inquiry status. Admin can assign to staff, update assignment status, and list assignments; Pusher notifies in realtime.
- Booking tracking: endpoint aggregates from DB/Supabase and formats readable departure/arrival statuses.

### Notifications, PDFs, and email
- Email via Nodemailer (Gmail SMTP env‑configurable)
- PDFs via PDFShift from HTML templates
  - Flight itinerary: built from Amadeus offer and passenger details
  - Tour confirmation: built from tour package and booking details
- Realtime via Pusher channel `admin-notifications` (plus persisted `admin_notifications` in Supabase)

### Frontend application
- React SPA with client and admin areas
  - Client: flight search/booking, booking tracking, tours browsing/booking, visa inquiry form
  - Admin: auth, dashboards (Chart.js), bookings management (edit/cancel, PDFs/print), staff assignments, inclusion groups, users
- Built with Vite + Tailwind; uses Axios, Supabase client, Pusher JS

### Security & operational notes
- Admin routes require `adminAuthMiddleware`; admin PDFs also require `pdfAuthMiddleware`
- Stripe webhooks verified with `STRIPE_WEBHOOK_SECRET` and raw body parsing
- CORS is currently `origin: '*'` (should be restricted in production)
- Secrets required: Amadeus, Stripe, Supabase, Gmail SMTP, PDFShift, Pusher
- Mixed storage (MySQL/Postgres + Supabase) increases operational complexity

### Configuration (env)
- Backend: `PORT`, `NODE_ENV`, MySQL dev (`LOCAL_DB_*`), Postgres prod (`PROD_DB_URL`), `AMADEUS_API_KEY/SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`, `SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY`, `GMAIL_SMTP_USER/PASS/FROM`, `PDFSHIFT_API_KEY`, Pusher creds
- Frontend: Vite envs for API base URL, Pusher key, Supabase anon key (not included in repo)

### Build & deploy
- Backend scripts: `npm run dev` (nodemon), `npm start` (node)
- Frontend scripts: `npm run dev`, `npm run build`, `npm run preview`
- Deployment: backend on Render (as referenced), frontend likely on Vercel/static hosting

### Risks and recommendations
- Move Pusher credentials to environment variables
- Pin Stripe API version to a valid supported date (current string appears future‑dated)
- Restrict CORS to trusted origins
- Review public HTML/print routes for data exposure
- Consider consolidating storage or adding a data access layer to manage cross‑store consistency
- Add rate limiting and centralized request validation for public endpoints
- Add structured logging, metrics, and integration tests (especially webhooks and ticketing finalization)



