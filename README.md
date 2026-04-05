# Finance Data Processing and Access Control Backend

A full-featured Node.js backend system for a finance dashboard where users interact with financial data based on assigned roles (Viewer, Analyst, Admin). Built with Express.js, MongoDB + Mongoose, and secured with JWT role-based access control.

## Setup Instructions

1. **Prerequisites**: Node.js and MongoDB installed on your system.
2. **Install Dependencies**: 
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory (one is already provided in the codebase) and add:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/finance_dashboard
   JWT_SECRET=super_secret_jwt_key_that_should_be_long_and_secure
   JWT_EXPIRES_IN=1d
   NODE_ENV=development
   ```
4. **Start MongoDB**:
   Ensure your local MongoDB instance is running. If you are using a local service, it should be running on the default port. You can use MongoDB Compass to connect to `mongodb://localhost:27017` to verify.

5. **Run the Application**:
   - For development mode (uses nodemon for hot-reloading):
     ```bash
     npm run dev
     ```
   - For standard execution (without nodemon):
     ```bash
     node server.js
     ```
   The server will start on `http://localhost:5000` (or your configured `PORT`).

6. **Interacting with the API**:
   You can test the endpoints using Postman, cURL, or any API client.
   - **Register a User**: `POST http://localhost:5000/api/auth/register` (creates a user with the `Viewer` role).
   - **Login**: `POST http://localhost:5000/api/auth/login` to receive your JWT token.
   - **Access Protected Routes**: Pass the token in the headers as `Authorization: Bearer <your_jwt_token>`.
   - *Note: To perform administrative actions, you must manually change your user's role to `Admin` in your MongoDB database the first time.*

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user (receives Viewer role by default)
- `POST /api/auth/login` - Login to get JWT
- `PUT /api/auth/users/:id` - Manage user roles/status (Admin only)

### Financial Records
- `GET /api/records` - View records (Viewer, Analyst, Admin)
  *Query params: `type`, `category`, `startDate`, `endDate`*
- `POST /api/records` - Create a record (Admin only)
- `PUT /api/records/:id` - Update a record (Admin only)
- `DELETE /api/records/:id` - Delete a record (Admin only)

### Dashboard Summaries
- `GET /api/dashboard/summary` - Get total income, expenses, and net balance (Analyst, Admin)
- `GET /api/dashboard/categories` - Get category-level breakdowns (Analyst, Admin)
- `GET /api/dashboard/trends` - Get aggregated monthly data (Analyst, Admin)
- `GET /api/dashboard/recent` - View recent transactions (Analyst, Admin)

## Design Decisions

- **Service Layer Pattern**: You will notice `/services` folders that separate the database operations from the HTTP routing in `/controllers`. This prevents massive, unreadable controller functions and promotes reusability. 
- **Separation of Concerns and Structure**: Using `/routes`, `/controllers`, `/services`, `/models`, and `/middleware` creates a well-organized file structure that mimics real-world enterprise applications.
- **Role-Based Access (Middleware)**: I separated `protect` (verifies token) and `authorize` (checks roles). This keeps authentication distinct from authorization, making the security logic highly modular.
- **Fat Models**: I've placed the password-hashing logic directly into the Mongoose User Schema via `pre('save')` hooks. This ensures that no matter where in the app a user is made, they never get saved with a loose, plain-text password. 
- **Centralized Error Handling**: Rather than filling up controllers with `try catch` blocks that duplicate `res.status(500).json(...)`, exceptions are caught and passed via `next(err)` to a global error handler in `/middleware`.

## Assumptions Made
- A Viewer should theoretically be able to read individual financial records, but dashboard aggregations containing organization-wide insights are locked behind Analyst or Admin privileges.
- All endpoints returning data collections use `-1` sorting on date to bring the newest items first.
- Admins are the only users who can add manual records right now to ensure tight security over financial data.
