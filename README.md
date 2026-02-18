# 💊 PharmaAssist

A modern, full-stack MERN (MongoDB, Express, React, Node.js) pharmacy management web application with an intuitive UI for patients, pharmacies, delivery agents, and administrators.

## 🚀 Features

- **Patient Dashboard** – Prescription uploads, medication reminders, stock alerts, refill requests, and delivery tracking
- **Pharmacy Dashboard** – Order management, prescription verification, and dispatch control
- **Delivery Agent Dashboard** – Task management, map integration, and real-time status updates
- **Admin Dashboard** – Platform-wide management and analytics
- **Email Notifications** – Automated email alerts for orders and reminders
- **Stripe Integration** – Secure payment processing
- **JWT Authentication** – Role-based access control

## 🛠️ Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React.js, Vite, CSS               |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB Atlas                     |
| Auth       | JWT (JSON Web Tokens)             |
| Payments   | Stripe                            |
| Email      | Nodemailer (Gmail)                |

## 📁 Project Structure

```
pharma-assist/
├── client/          # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
├── server/          # Node.js + Express backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── .env.example
│   └── package.json
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Stripe account (for payments)
- Gmail account with App Password enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Eldho99/PharmaAssist.git
   cd PharmaAssist
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

**Start the backend server:**
```bash
cd server
npm run dev
```

**Start the frontend (in a new terminal):**
```bash
cd client
npm run dev
```

The app will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

## 🔐 Environment Variables

Copy `server/.env.example` to `server/.env` and fill in your credentials:

| Variable           | Description                          |
|--------------------|--------------------------------------|
| `PORT`             | Server port (default: 5000)          |
| `MONGO_URI`        | MongoDB Atlas connection string      |
| `JWT_SECRET`       | Secret key for JWT tokens            |
| `STRIPE_SECRET_KEY`| Stripe secret key                    |
| `EMAIL_USER`       | Gmail address for notifications      |
| `EMAIL_PASS`       | Gmail App Password                   |

## 📄 License

This project is licensed under the MIT License.
