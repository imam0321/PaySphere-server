# 💰 PaySphere - Digital Wallet API

A secure and role-based digital wallet system built with **Node.js**, **Express**, **Typescript**, and **MongoDB**, enabling users to manage their funds and agents to perform cash-in and cash-out operations. The system supports user authentication, wallet transactions, and transaction history tracking with proper validations and Modular MVC architecture.

## 🔗 Live Link

* **Frontend**: [https://paysphere-client.vercel.app](https://paysphere-client.vercel.app) 
* **Frontend Repository**: [https://github.com/imam0321/paysphere-client](https://github.com/imam0321/paysphere-client)
* **Backend**: [https://pay-sphere-server.vercel.app](https://pay-sphere-server.vercel.app)
---

## 🚀 Features

- 🧑‍💼 User and Agent Registration/Login
- 🔒 JWT Authentication with Refresh Token
- 🔁 Role-based Access Control (Admin, User, Agent)
- 💰 Wallet System with Add Money, Send, Cash In/Out
- 📜 Transaction History per User/Wallet
- 🛡️ Agent Approval/Suspension by Admin
- 🧾 Clean and Modular Codebase

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (Access & Refresh Tokens)
- **Validation**: Zod / Joi / Custom Middleware
- **Tools**: ts-node-dev, dotenv, eslint, bcryptjs, cookie-parser, cors, express-session,

---

## 📦 Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/paysphere-api.git
cd paysphere-api

npm install

npm run dev
```

## 📦 API Endpoints

#### ✅ Auth Module

| Method | Endpoint                | Access        | Description              |
| ------ | ----------------------- | ------------- | ------------------------ |
| POST   | `/auth/login`           | Public        | Login user or agent      |
| GET    | `/auth/me`              | Authenticated | Get current user profile |
| POST   | `/auth/refresh-token`   | Public        | Refresh access token     |
| POST   | `/auth/change-password` | Authenticated | Change password          |
| POST   | `/auth/logout`          | Authenticated | Logout user              |

#### 👤 User Module

| Method | Endpoint         | Access     | Description                   |
| ------ | ---------------- | ---------- | ----------------------------- |
| POST   | `/user/register` | Public     | Register a new user           |
| GET    | `/user/`         | Admin only | Get all users                 |
| GET    | `/user/:id`      | Admin only | Get single user or agent info |

#### 🧑‍💼 Agent Module

| Method | Endpoint             | Access     | Description          |
| ------ | -------------------- | ---------- | -------------------- |
| POST   | `/agent/register`    | Public     | Register a new agent |
| GET    | `/agent/`            | Admin only | Get all agents       |
| POST   | `/agent/approve/:id` | Admin only | Approve an agent     |
| POST   | `/agent/suspend/:id` | Admin only | Suspend an agent     |

#### 💰 Wallet Module

| Method | Endpoint              | Access     | Description                 |
| ------ | --------------------- | ---------- | --------------------------- |
| GET    | `/wallet/`            | Admin only | Get all wallets             |
| POST   | `/wallet/add-money`   | User only  | Add money to user wallet    |
| POST   | `/wallet/send`        | User only  | Send to another user wallet |
| POST   | `/wallet/cash-in`     | Agent only | Agent sends money to user   |
| POST   | `/wallet/cash-out`    | User only  | User requests withdrawal    |
| GET    | `/wallet/:id`         | Admin only | Get single wallet info      |
| POST   | `/wallet/block/:id`   | Admin only | Block a wallet              |
| POST   | `/wallet/unblock/:id` | Admin only | Unblock a wallet            |

#### 🔄 Transaction Module

| Method | Endpoint                      | Access     | Description                     |
| ------ | ----------------------------- | ---------- | ------------------------------- |
| GET    | `/transaction/`               | Admin only | Get all transactions            |
| GET    | `/transaction/:id`            | Admin only | Get single transaction          |
| GET    | `/transaction/my-transaction` | All Roles  | Get transaction history of self |

#### 🔄 Stats

| Method | Endpoint                      | Access     | Description                     |
| ------ | ----------------------------- | ---------- | ------------------------------- |
| GET    | `/stats/dashboard-stats`      | Admin only | Get user agent transaction count|
| GET    | `/stats/transaction-amount`   | Admin only | Get transaction amount 30/7days |
| GET    | `/stats/transaction-summary`  | Admin only | Get transaction summary         |

## ✅ Future Improvements

✅ Transaction status update endpoint

✅ Email verification / OTP

✅ Pagination and Filtering

✅ Swagger API documentation

✅ Unit & Integration Tests (Jest / Supertest)


## 📧 Contact

* Email: [imam.hossain0321@gmail.com](mailto:imam0321@gmail.com)