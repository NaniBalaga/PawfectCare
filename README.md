# 🐾 PawfectCare

> A modern full-stack pet care and grooming appointment management system.

PawfectCare is a full-stack web application designed to make pet care management simple for pet owners and service providers.

Pet owners can create accounts, manage their pets, explore available grooming services, and book appointments. Administrators can manage services, users, appointments, and monitor platform statistics through an admin dashboard.

---

## ✨ Features

### 👤 Authentication

* User registration and login
* Secure password hashing with bcrypt
* JWT-based authentication
* User and administrator roles
* Protected API routes
* Admin access verification

### 🐶 Pet Management

* Add pets to your profile
* Store pet name, type, breed, and age
* Edit existing pet information
* Remove pets
* Automatically remove associated appointments when a pet is deleted

### ✂️ Grooming Services

* Browse available pet care services
* View service descriptions
* View pricing
* View service duration
* Administrators can add services
* Administrators can delete services

### 📅 Appointment Management

* Book appointments for registered pets
* Select a grooming/service option
* Choose an appointment date
* Track appointment status
* Appointment statuses:

  * Pending
  * Confirmed
  * Completed
  * Cancelled
* Administrators can update appointment status
* Administrators can remove appointments

### 🛠️ Admin Dashboard

Administrators can manage the complete platform from a centralized dashboard.

* View total users
* View total appointments
* View pending appointments
* Manage registered users
* Manage services
* Manage appointments
* Update appointment statuses
* Delete users
* Delete services
* Delete appointments

### 🎨 Modern UI

* Responsive React interface
* Clean pet-care focused design
* Dashboard navigation
* Animated UI elements
* Toast notifications
* Mobile-friendly layouts
* Separate user and administrator experiences

---

## 🧑‍💻 Technology Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Framer Motion
* React Icons
* React Hot Toast

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* CORS
* dotenv

---

## 📁 Project Structure

```text
PawfectCare/
│
├── backend/
│   ├── models/
│   │   ├── Appointment.js
│   │   ├── Pet.js
│   │   ├── Service.js
│   │   └── User.js
│   │
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd PawfectCare
```

### 2. Setup the backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Start the backend:

```bash
npm run dev
```

The API will run on:

```text
http://localhost:5000
```

---

### 3. Setup the frontend

Open another terminal:

```bash
cd PawfectCare/frontend
npm install
npm run dev
```

Vite will provide the local development URL, usually:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

The backend requires the following environment variables:

| Variable     | Description                            |
| ------------ | -------------------------------------- |
| `MONGO_URL`  | MongoDB connection string              |
| `JWT_SECRET` | Secret key used for JWT authentication |
| `PORT`       | Backend server port                    |

Never commit your real `.env` file.

---

## 🔑 API Overview

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

### Services

```text
GET    /api/services
POST   /api/services
DELETE /api/services/:id
```

### Pets

```text
GET    /api/pets
POST   /api/pets
PUT    /api/pets/:id
DELETE /api/pets/:id
```

### Appointments

```text
GET    /api/appointments
POST   /api/appointments
PUT    /api/appointments/:id/status
DELETE /api/appointments/:id
```

### Admin

```text
GET    /api/users
DELETE /api/users/:id
GET    /api/stats
```

---

## 🔒 Security

PawfectCare uses:

* bcrypt password hashing
* JWT authentication
* Protected API endpoints
* Role-based authorization
* Environment variables for sensitive configuration
* Owner-level authorization for pet operations

Sensitive configuration should always remain outside version control.

---

## 🚀 Future Improvements

Possible future enhancements include:

* Online payments
* Email appointment notifications
* SMS reminders
* Pet profile photos
* Veterinarian management
* Service provider profiles
* Appointment calendar
* Search and filtering
* Reviews and ratings
* Admin analytics
* Cloud image storage
* Deployment with production environment variables

---

## 📌 Project Status

**Status:** Active Development

PawfectCare is currently designed as a full-stack project for managing pet care services, pets, users, and appointments.

---

## 👨‍💻 Author

**NaniBalaga**

Built with ❤️ using React, Node.js, Express, and MongoDB.

---

## 📄 License

This project is licensed under the MIT License.
