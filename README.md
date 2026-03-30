# BidForge — Freelance Reverse Auction System

A full-stack Freelance Reverse Auction platform built with React, Node.js/Express, and PostgreSQL.
Implements all UML diagrams: Use Case, Class, Sequence, Collaboration, Activity, and Statechart.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, React Router v6         |
| Backend    | Node.js, Express.js               |
| Database   | PostgreSQL via Sequelize ORM       |
| Auth       | JWT (JSON Web Tokens) + bcryptjs  |

---

## Project Structure

```
freelance-auction/
├── backend/
│   ├── config/
│   │   ├── database.js        # Sequelize connection
│   │   └── schema.sql         # Raw SQL schema (optional)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── auctionController.js
│   │   ├── bidController.js
│   │   ├── feedbackController.js
│   │   ├── paymentController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── auth.js            # JWT verify + role guard
│   ├── models/
│   │   ├── index.js           # All associations
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Freelancer.js
│   │   ├── Administrator.js
│   │   ├── Project.js
│   │   ├── Auction.js
│   │   ├── Bid.js             # calculateScore()
│   │   ├── Feedback.js
│   │   └── Payment.js
│   ├── routes/
│   │   └── index.js           # All API routes
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ProtectedRoute.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── auth/           Register.js, Login.js
    │   │   ├── client/         ClientDashboard, PostProject, ProjectDetail, ClientProjects, ClientPayments
    │   │   ├── freelancer/     FreelancerDashboard, BrowseProjects, FreelancerProjectDetail, MyBids
    │   │   ├── admin/          AdminDashboard, AdminUsers, AdminProjects, AdminAuctions
    │   │   └── Home.js
    │   ├── services/
    │   │   └── api.js          # All Axios API calls
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## Setup Instructions

### 1. PostgreSQL Database

```bash
# Create database
psql -U postgres
CREATE DATABASE freelance_auction;
\q
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=freelance_auction
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_super_secret_key

# Start server (tables auto-created by Sequelize sync)
npm run dev
# → Runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start React app
npm start
# → Runs on http://localhost:3000
```

---

## Creating an Admin Account

Admin accounts must be inserted directly into the database:

```sql
-- 1. Insert into users table
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@bidforge.com', '$2a$12...hashed_password...', 'admin');

-- 2. Insert into administrators table
INSERT INTO administrators (user_id, access_level)
VALUES (<user_id from above>, 'superadmin');
```

Or use Node.js to hash the password:
```js
const bcrypt = require('bcryptjs');
console.log(await bcrypt.hash('adminpassword', 12));
```

---

## UML → Code Mapping

| UML Element            | Implementation                                |
|------------------------|-----------------------------------------------|
| User (base class)      | `models/User.js` — login(), logout(), updateProfile() |
| Client class           | `models/Client.js` — postProjects(), viewBids(), selectFreelancer(), giveFeedback() |
| Freelancer class       | `models/Freelancer.js` — viewProjects(), submitBids() |
| Administrator class    | `models/Administrator.js` — manageUser(), monitorAuction() |
| Project class          | `models/Project.js` — createProject(), updateProject(), closeProject() |
| Auction class          | `models/Auction.js` — openAuction(), closeAuction() |
| Bid class              | `models/Bid.js` — calculateScore() |
| Feedback class         | `models/Feedback.js` — submitFeedback() |
| Register User UC       | `POST /api/auth/register` |
| Login User UC          | `POST /api/auth/login` |
| Post Project UC        | `POST /api/projects` |
| Submit Bid UC          | `POST /api/bids` |
| Select Freelancer UC   | `POST /api/projects/:id/select-freelancer` |
| View Project UC        | `GET /api/projects` + `GET /api/projects/:id` |
| Evaluate & Rank Bids   | `GET /api/auctions/:id/ranked-bids` |
| Make Payment UC        | `POST /api/payments` |
| Provide Rating UC      | `POST /api/feedbacks` |
| Monitor Auction (Admin)| `GET /api/admin/auctions` |

---

## API Endpoints Summary

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile

POST   /api/projects
GET    /api/projects
GET    /api/projects/client/my
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/select-freelancer

POST   /api/auctions
GET    /api/auctions/:id
PUT    /api/auctions/:id/close
GET    /api/auctions/:id/ranked-bids

POST   /api/bids
GET    /api/bids/auction/:auctionId
GET    /api/bids/my
PUT    /api/bids/:id
DELETE /api/bids/:id

POST   /api/feedbacks
GET    /api/feedbacks/freelancer/:id
GET    /api/feedbacks/project/:id

POST   /api/payments
GET    /api/payments/my
GET    /api/payments/project/:id

GET    /api/admin/users
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
GET    /api/admin/stats
GET    /api/admin/projects
GET    /api/admin/auctions
```
