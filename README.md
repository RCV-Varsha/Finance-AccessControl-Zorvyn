# Finance Data Processing and Access Control Backend

Welcome to the Finance Data Processing and Access Control Backend! This is a robust, production-ready Node.js REST API designed to manage organizational financial records. It strictly enforces Role-Based Access Control (RBAC) to ensure that only authorized personnel (Viewers, Analysts, and Admins) can access, aggregate, or mutate sensitive financial data.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs
- **Security:** express-rate-limit

## Core Features
- **Secure Authentication:** User registration and login using encrypted passwords and JWTs.
- **Strict Role-Based Access Control:** Routes dynamically check whether a user acts as a `Viewer`, `Analyst`, or `Admin`.
- **Financial Record CRUD:** Endpoints for creating, reading, updating, and deleting incomes and expenses.
- **Dynamic Filtering & Search:** Search by keywords, or filter by exact dates, categories, and record types.
- **Data Aggregation:** Dedicated dashboard endpoints for high-level business intelligence.
- **Pagination:** Clean cursor-like pagination handling to ensure fast response times for massive datasets.
- **Rate Limiting:** Protection against bot spam and abuse via IP-based rate limiting.

---

## Project Architecture

This project strictly adheres to a clean, multi-layer architecture to ensure long-term maintainability:
- `/routes` - Maps HTTP methods and URL paths to their respective controllers.
- `/controllers` - Handles HTTP requests, extracts parameters, and formulates JSON responses.
- `/services` - **The Core Engine.** This layer extracts complex business logic and database queries away from the controller. This keeps controllers lightweight and allows business rules (like complex pagination math or `$or` search queries) to be easily re-used or tested.
- `/models` - Mongoose schemas defining database structure and validation rules.
- `/middleware` - Gatekeepers for the application (e.g., verifying JWTs, checking roles, handling global errors, rate limiting).

---

## API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Create a new user (Defaults to Viewer).
- `POST /api/auth/login` - Exchange credentials for a JWT token.

### Financial Records
- `GET /api/records` - View financial records (Filters: type, category, date, search, page, limit).
- `POST /api/records` - Add a new record (Admin only).
- `PUT /api/records/:id` - Update a record (Admin only).
- `DELETE /api/records/:id` - Delete a record (Admin only).

### Dashboard (Analyst & Admin Only)
- `GET /api/dashboard/summary` - Aggregates total incomes, total expenses, and net balance.
- `GET /api/dashboard/categories` - Breaks down spending/income by category.
- `GET /api/dashboard/trends` - Analyzes month-over-month financial trends.
- `GET /api/dashboard/recent` - Retrieves the 5 most recent transactions.

---

## Step-by-Step Demo Flow (Testing with Postman)

Want to see how it works? Follow this flow in Postman:

1. **Register a User:**
   - Method: `POST` / URL: `http://localhost:5000/api/auth/register`
   - Body (JSON): `{"name": "John", "email": "john@test.com", "password": "password123"}`
   - *Note: You'll need to manually change this user's role to "Admin" directly in MongoDB compass to test Admin endpoints.*

2. **Login:**
   - Method: `POST` / URL: `http://localhost:5000/api/auth/login`
   - Body (JSON): `{"email": "john@test.com", "password": "password123"}`
   - *Action: Copy the `token` string from the response.*

3. **Configure Authentication:**
   - For all following requests, go to the **Headers** tab in Postman.
   - Add Key: `Authorization` / Value: `Bearer <YOUR_COPIED_TOKEN>`

4. **Create a Record (Requires Admin):**
   - Method: `POST` / URL: `http://localhost:5000/api/records`
   - Body (JSON): `{"amount": 5000, "type": "income", "category": "Salary", "description": "March paycheck"}`

5. **Test the Dashboard (Requires Analyst/Admin):**
   - Method: `GET` / URL: `http://localhost:5000/api/dashboard/summary`
   - *Action: Observe the highly aggregated financial totals.*

6. **Test Search & Pagination:**
   - Method: `GET` / URL: `http://localhost:5000/api/records?search=paycheck&page=1&limit=5`
   - *Action: See the paginated wrapper surrounding your record data.*

7. **Test Role-Based Restriction:**
   - Try to hit `POST /api/records` using a token belonging to a `Viewer` user. You will immediately receive a `403 Forbidden` error.

---

## Example Requests & Responses

### 1. Login Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Creating a Record Response
```json
{
  "success": true,
  "message": "Record created successfully",
  "data": {
    "amount": 5000,
    "type": "income",
    "category": "Salary",
    "description": "March paycheck",
    "_id": "648a7b...",
    "createdAt": "2023-11-20T10:00:00Z"
  }
}
```

### 3. Pagination & Search Response
```json
{
  "success": true,
  "count": 1,
  "pagination": {
    "total": 12,
    "page": 1,
    "pages": 3
  },
  "data": [
    {
      "amount": 5000,
      "category": "Salary",
      "description": "March paycheck"
    }
  ]
}
```

---

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repo-link>
   cd Finance-AccessControl-Zorvyn
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory and add your connection variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/finance_dashboard
   JWT_SECRET=super_secret_jwt_key
   JWT_EXPIRES_IN=1d
   NODE_ENV=development
   ```

4. **Start the Server:**
   ```bash
   npm run dev
   ```
   The server will boot up via Nodemon on `http://localhost:5000`.

---

## Recent Quality Enhancements

- **Pagination:** Ensures that the GET `/api/records` endpoint never crashes the system or client by attempting to load thousands of records at once.
- **Regex Search:** Makes finding specific, buried transactions effortless by matching case-insensitive partial strings against descriptions and categories.
- **Rate Limiting:** A global express-rate-limit middleware caps users to 100 requests per 15 minutes, drastically reducing exposure to brute-force credential stuffing.

---

## Design Decisions

- **Why MongoDB?** Financial metadata (like categories, specific custom descriptors) can vary heavily. MongoDB's flexible schema allows for fast iteration, and MongoDB Aggregation pipelines are notoriously powerful for exactly the kind of dashboard metrics we needed.
- **Why JWT?** JWT allows our REST API to remain completely stateless. Instead of managing complex server-side sessions, the frontend cryptographically proves its identity with every request.
- **Why a Service Layer?** It allows multiple controllers (or eventually, cron jobs/scripts) to reuse the `RecordService.getRecords` logic without duplicating query structure.
- **Why Middleware for RBAC?** Decoupling authorization logic right at the route level (before the request ever touches a controller) guarantees secure-by-default behavior.

## Assumptions Made
- The dashboard is fundamentally organizational, not personal. Financial records are stored globally for the company/org rather than perfectly isolated per-user. Viewers can see records, but Admins/Analysts see the global aggregate.
- Only Admins have the explicit authority to manually enter or delete physical financial records.

## Future Improvements
- **Automated Seeding:** A script to automatically inject mock data and a pre-configured Admin account upon first installation.
- **Cursor Pagination:** Standard offset-pagination (`skip/limit`) performs poorly on data exceeding hundreds of thousands of rows. Transitioning to cursor-based pagination would improve latency.
- **Dedicated Frontend:** Hooking up a React or Next.js SPA to beautifully visualize the MongoDB aggregation data via charts and graphs.
