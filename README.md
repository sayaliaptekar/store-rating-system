# ⭐ Store Rating System

A full-stack web application that allows users to discover stores, submit ratings, and manage their accounts. The system provides separate dashboards for Administrators, Store Owners, and Normal Users.

The application is built using React for the frontend, Node.js and Express.js for the backend, and MySQL for database management.

---

## 🚀 Features

### 👤 Normal User

- User registration and login
- Secure authentication using JWT
- Search stores by name or address
- View overall store ratings
- Submit a rating from 1 to 5 stars
- View previously submitted rating
- Update/change password
- Logout functionality

### 🛠️ Administrator

- Admin authentication
- Admin dashboard
- View total users
- View total store owners
- View total normal users
- View total stores
- View total ratings
- View average rating
- Add new users
- Add Store Owners
- Add Administrators
- Add new stores
- Assign stores to store owners
- Search users
- Filter users by role
- Sort users
- Search stores
- Sort stores
- Delete users
- Remove stores

### 🏪 Store Owner

- Owner authentication
- Owner dashboard
- View assigned store details
- View average store rating
- View total ratings
- View users who rated the store
- View rating date
- Logout functionality

---

# 🏗️ Project Architecture

```text
store-rating-system/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── ownerController.js
│   │   ├── ratingController.js
│   │   ├── storeController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   │
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── ownerRoutes.js
│   │   ├── ratingRoutes.js
│   │   ├── storeRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── scripts/
│   │   ├── createAdmin.js
│   │   └── createOwner.js
│   │
│   ├── utils/
│   │   └── validation.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore

🛠️ Technologies Used
Frontend
React.js
JavaScript (ES6+)
React Router DOM
Axios
HTML5
CSS3
Vite
Backend
Node.js
Express.js
REST API
JWT Authentication
Middleware-based authorization
Environment variables using dotenv
Password hashing
CORS
Database
MySQL
SQL
Relational database design
Development & Testing Tools
Visual Studio Code
Git
GitHub
Postman
MySQL / MySQL Workbench
npm
