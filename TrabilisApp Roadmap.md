# Trabilis App v2.0 - The Complete Modernization Plan (Node.js Edition)

**Project Manager:** Your Friendly AI Guide
**Lead Developer:** You!
**Timeline:** 1-2 Months
**Core Stack:** React (Vite), Node.js, Express.js, MySQL

---

## **Phase 0: The Unshakeable Foundation (Week 1, Days 1-3)**

*Objective: Establish a clean, professional JS-ecosystem development environment and project structure.*

- [x] **Git Repo Cleanup:**
    - [x] Follow "Nuke and Pave" or "Rewind Time" method to start with a clean history.
    - [x] Create a perfect `.gitignore` file (`/node_modules`, `/backend/node_modules`, `*.env`, `/dist`, etc.).
    - [x] Make a clean initial commit on the `main` branch.
    - [x] Create and switch to a `develop` branch.
- [x] **Development Tools:**
    - [x] Node.js (LTS), npm/yarn installed.
    - [x] VS Code configured with Prettier & ESLint. **(PHP formatters no longer needed!)**
    - [x] Postman installed.
    - [x] Laragon running for **MySQL database ONLY**.
- [x] **React Frontend Project Setup (`/react-frontend`):**
    - [x] Create project with Vite (`npm create vite@latest`).
    - [x] Install dependencies: `npm install axios react-router-dom`.
    - [x] Set up folder structure (`src/pages`, `src/components`, etc.).
    - [x] Create `.env` file with `VITE_API_BASE_URL=http://localhost:3001/api/v1`. (We'll use port 3001 for our backend).
- [x] **Node.js Backend Project Setup (`/backend`):**
    - [x] `cd backend && npm init -y`.
    - [x] Install dependencies: `npm install express cors mysql2 dotenv`. Install dev dependency for auto-restarting server: `npm install --save-dev nodemon`.
    - [x] Create a `.env` file in the `/backend` root. Add your `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT=3001`, and API keys.
    - [x] Create your main server file: `server.js`.
    - [x] **In `server.js`:**
        - [x] Require `express`, `cors`, and `dotenv`.
        - [x] Initialize your Express app: `const app = express();`.
        - [ ] Apply middleware: `app.use(cors());` and `app.use(express.json());`.
        - [ ] Create a basic "hello world" route: `app.get('/', (req, res) => res.send('Backend is running!'));`.
        - [ ] Make the app listen on the port from your `.env` file.
    - [ ] Add a `start` script to your `/backend/package.json`: `"start": "nodemon server.js"`.
    - [ ] **Test:** Run `npm start` in the `/backend` terminal. Go to `http://localhost:3001` in your browser. You should see "Backend is running!".

---

## **Phase 1: First End-to-End Slice - Flight Search (Week 1, Days 4-7)**

*Objective: Get the frontend talking to the backend to fetch real data from AviationStack. Master the full-stack JS request cycle.*

- [ ] **Backend - Database Connection Module:**
    - [ ] Create a file like `/backend/src/config/db.js`.
    - [ ] Use the `mysql2/promise` library to create and export a **connection pool**. Read credentials from `process.env`.
- [ ] **Backend API Endpoint: Flight Search (`GET /api/v1/flights/search`)**
    - [ ] Create a router file: `/backend/src/routes/flightRoutes.js`. Define the `/search` route here.
    - [ ] Create a controller file: `/backend/src/controllers/flightController.js`.
    - [ ] In the `searchFlights` controller function:
        - [ ] Use `async/await`.
        - [ ] Validate query parameters from `req.query`.
        - [ ] `try/catch` block for error handling.
        - [ ] Use `axios` to call the AviationStack API.
        - [ ] Process the response and send it back with `res.status(200).json({ flights: formattedData });`.
    - [ ] In `server.js`, import and use your flight router: `app.use('/api/v1/flights', flightRoutes);`.
- [ ] **API Testing:**
    - [ ] Use Postman to test `GET http://localhost:3001/api/v1/flights/search`.
- [ ] **React Frontend Integration:**
    - [ ] Create `react-frontend/src/api/flightApi.js` and a `searchFlights` function using `axios`.
    - [ ] In `FlightsSearchPage.jsx`, call this function on form submit and manage state (`loading`, `error`, `data`).
    - [ ] Display the results.
- [ ] **Documentation:**
    - [ ] Start `API_DOCUMENTATION.md`. Document this endpoint, including query params and example response.

---

## **Phase 2 & 3: Core Features (Combine & Iterate) (Weeks 2-6)**

*Objective: Build out the core booking flows for both flights and tours. This is the bulk of the work. You will be building React components and Node.js endpoints in parallel.*

### **Module: Flight Booking**

- [ ] **Database:** Design and create `flight_bookings` table in MySQL.
- [ ] **Backend API Endpoints (in new `bookingRoutes.js` and `bookingController.js`):**
    - [ ] `POST /api/v1/bookings/flights`: **Initiate Booking.**
        - Takes flight and passenger data in `req.body`.
        - Re-verifies with AviationStack.
        - Creates `PENDING_PAYMENT` record in DB.
        - Calls PayMongo API to create Checkout Session.
        - Returns `{ checkoutUrl: '...' }`.
    - [ ] `POST /api/v1/webhooks/paymongo`: **Webhook Handler.**
        - **Verify signature!**
        - Updates booking to `PAID_PENDING_FULFILLMENT`.
        - Triggers internal admin notification.
        - Responds `200 OK`.
    - [ ] `POST /api/v1/admin/bookings/flights/:id/fulfill`: **Fulfillment.** (Protected Route).
        - Takes PNR/E-Ticket in `req.body`.
        - Updates booking to `CONFIRMED_FULFILLED`.
        - **PDF Generation:** Use a Node.js library like `pdfkit` (instead of TCPDF).
        - **Email Sending:** Use a Node.js library like `nodemailer` (instead of PhpMailer).
- [ ] **React Frontend:**
    - [ ] Build passenger details form.
    - [ ] Implement payment redirect flow.
    - [ ] Build success/cancel pages.
    - [ ] **Admin Panel:** Build the fulfillment UI.

### **Module: Tour Packages**

- [ ] **Database:** Design and create tables for `tour_packages`, `package_dates`, `tour_bookings`, etc.
- [ ] **Backend API Endpoints:**
    - [ ] **Admin CRUD:** `GET, POST, PUT, DELETE` for `/api/v1/admin/tour-packages`.
    - [ ] **Public:** `GET /api/v1/tour-packages` (list) and `GET /api/v1/tour-packages/:id` (details).
    - [ ] `POST /api/v1/bookings/tours`: **Initiate Reservation.**
        - Checks slot availability.
        - Creates `PENDING_PAYMENT_RESERVATION_FEE` booking.
        - Calls PayMongo API for reservation fee payment.
- [ ] **React Frontend:**
    - [ ] **Admin Panel:** Build the detailed Tour Package creation/edit form.
    - [ ] **Client Side:** Build package listing and detail pages (with Panellum).
    - [ ] Implement reservation fee payment flow.

### **Module: Admin Authentication**

- [ ] **Backend API:**
    - [ ] `POST /api/v1/admin/login`: Checks user/pass. For stateless REST APIs, it should return a **JWT (JSON Web Token)**.
- [ ] **Backend Middleware:**
    - [ ] Create an `authMiddleware.js` that verifies the JWT from the request headers. Protect admin routes with this middleware.
- [ ] **React Frontend:**
    - [ ] Update `AuthContext` to save the JWT to local storage and send it in the headers of protected API requests using an `axios` interceptor.
    - [ ] Update `ProtectedRoute.jsx` to check for the JWT.

---

## **Phase 4: Finalization & Deployment (Weeks 7-8+)**

*Objective: Polish, test, document, and deploy the full-stack application.*

- [ ] **Error Handling:**
    - [ ] Implement a global error-handling middleware in your Express app to catch all errors and send consistent JSON error responses.
- [ ] **Final Testing:**
    - [ ] End-to-end testing of all flows.
    - [ ] Test webhook reliability on a staging environment.
- [ ] **Documentation Polish:**
    - [ ] Finalize `README.md` files (root, frontend, backend) and `API_DOCUMENTATION.md`.
- [ ] **Build & Deployment:**
    - [ ] **Backend:** Deploy the `/backend` Node.js app to a platform like **Render** or **Heroku**. Configure production environment variables.
    - [ ] **Frontend:** Build the React app (`npm run build`) and deploy the `/dist` folder to a platform like **Vercel** or **Netlify**. Configure `VITE_API_BASE_URL` to point to your live backend URL.
- [ ] **Post-Deployment:**
    - [ ] Final sanity checks.
    - [ ] **Celebrate! You've built a modern, full-stack JavaScript application.**