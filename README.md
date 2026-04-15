# 🏨 Guest House Booking System

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)](https://reactjs.org/)
[![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)](https://www.postgresql.org/)
[![Tailwind](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC)](https://tailwindcss.com/)

A modern, robust, and full-stack Guest House Booking System designed with a focus on **fairness, consistency, and DBMS excellence**. This project was developed as part of a **DBMS Lab Project**, implementing advanced features like an automated waitlist promotion engine using PostgreSQL's native calendar math.

---

## 🌟 Key Features

### 📅 Advanced Booking & Availability
- **Real-time Search**: Search for rooms by location or type with instant availability checks.
- **Overlap Prevention**: Strict validation to ensure no two confirmed bookings conflict for the same room.
- **Status Tracking**: Visual indicators for `CONFIRMED`, `CANCELLED`, and `WAITLISTED` bookings.

### 🚀 Auto-Promotion Engine (Waitlist Logic)
One of the core highlights of this project is its **fair allocation system**. 
- If a room is fully booked, users can join a **Waitlist**.
- **The "Master Fix" Logic**: When a confirmed booking is cancelled, the system automatically triggers a scan of the `waiting_list`. 
- Using PostgreSQL's `OVERLAPS` operator, it identifies the next person in line whose requested stay conflicts with the vacated slot and **automatically promotes** them to a `CONFIRMED` status.
- **Multi-check Consistency**: Promotion only happens if the waitlisted candidate doesn't conflict with any *other* existing confirmed bookings.

### 🔐 Secure Authentication & Verification
- **JWT-Based Auth**: Secure session management.
- **Email OTP Verification**: Registration requires a 6-digit OTP sent via **Nodemailer** to ensure valid user emails.
- **Password Hashing**: High-security storage using `bcrypt`.

### 🖼️ Integrated Asset Management
- **Cloudinary Integration**: Room images are managed and served via Cloudinary.
- **Dynamic Uploads**: Support for updating room thumbnails in real-time.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (v7)
- **State/API**: Axios, React Hooks
- **Feedback**: React Hot Toast (Micro-animations and notifications)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon/Local)
- **File Handling**: Multer + Cloudinary
- **Messaging**: Nodemailer (GMAIL Service)

---

## 🗄️ Database Architecture

The system is designed with **ACID compliance** and **Data Integrity** at its core.

### 📊 Schema Overview
| Table | Key Responsibility |
| :--- | :--- |
| `users` | Stores verified user profiles and hashed credentials. |
| `rooms` | Detailed room catalogue (price, type, location, images). |
| `bookings` | Primary table for confirmed stays and cancellation history. |
| `waiting_list` | Buffer for users awaiting room availability. |

### 🛠️ DBMS Highlights
- **Normalization**: Tables are structured to adhere to 3NF, minimizing redundancy.
- **Native SQL Power**: Heavy reliance on `OVERLAPS` and `TO_CHAR` for performant date manipulation within the DB layer.
- **Consistency**: Hard-deletion for waitlist promotion and soft-deletion (status update) for booking history.

---

## 🏗️ Architecture Review & Technical Debt

This project was built to balance stringent academic requirements with real-world design patterns. Below is a transparent engineering review of the system's strengths and areas mapped for future architectural maturity.

### ✅ The Architectural Wins
* **Database-Level Date Math (`OVERLAPS`)**: Instead of fetching all booking rows into Node.js arrays and looping through them, the system offloads date-collision computation entirely to the PostgreSQL engine using native `OVERLAPS`. This is highly memory-efficient.
* **Intelligent Auto-Promotion Engine**: The queue system delegates complex conditional logic directly to the database. By chaining `NOT EXISTS` with nested `OVERLAPS`, it strictly locates the optimal promotion candidate in a single powerful transaction.
* **Premium Asynchronous UI**: A strictly separated React SPA utilizing highly customized, context-aware Tailwind tokens over generic component libraries.

### ⚠️ Known Limitations & Future Scope
* **Race Conditions (Concurrency Restrictions)**: Currently, booking creation performs an asynchronous `SELECT` before an `INSERT`. In a high-traffic, production MAANG environment, identical-millisecond requests could cause double-bookings. **Future Fix:** Implement strict SQL Transactions (`BEGIN`, `COMMIT`) with `SERIALIZABLE` isolation or table-level `FOR UPDATE` locks.
* **Waitlist Data Truncation**: When a user joins the waitlist, the schema bypasses storing `num_visitors` and `purpose_of_visit`. If auto-promoted, the system relies on programmatic fallbacks (e.g., defaulting to 1 guest). **Future Fix:** Execute a database schema migration to add these specific columns to the `waiting_list` table.
* **Synchronous Thread Blocking (Emails)**: Nodemailer fires directly on the execution thread. If Google's SMTP server times out, the booking function could hang. **Future Fix:** Decouple email dispatch via a background message queue (like Redis or RabbitMQ).
* **Missing Pagination**: The endpoints currently fetch all data arrays without bounds. **Future Fix:** Add `LIMIT` and `OFFSET` pagination layers to ensure the server remains scalable under 100k+ records.

---

## ⚙️ Installation & Setup

### 1. Prerequisite
- Node.js (v18+)
- PostgreSQL installed and running
- Cloudinary Account
- Gmail App Password (for Nodemailer)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` folder (or copy from `.env.example`):
```env
PORT=5000
DATABASE_URL=postgres://user:password@localhost:5432/guesthouse_db
JWT_SECRET=your_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Run the server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📜 License
This project is licensed under the ISC License.
