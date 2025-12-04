
# BrasilCard Digital Wallet API

## 📖 Overview

This is a robust RESTful API developed for a digital financial wallet system. Ideally designed for the **BrasilCard** financial institution, this application allows users to register, authenticate, and manage their finances in real-time.

The project was built using **Nest.js**, focusing on scalability, security, and maintainability. It implements advanced software engineering concepts such as:

* **Event-Driven Architecture (EDA):** Asynchronous processing for auditing and balance updates using `EventEmitter2`.
* **Modular Monolith:** Clean separation of concerns (Auth, Users, Wallet).
* **Design Patterns:** Repository Pattern for data access and Strategy Pattern for transaction processing (Deposit, Transfer, Reversal).
* **Solid Principles & Clean Code:** Ensuring high code quality and testability.
* **Security:** JWT Authentication via HttpOnly Cookies and Bcrypt hashing.
* **CORS Support:** Configured to allow secure cross-origin requests from frontend applications.

## 🛠 Tech Stack

* **Framework:** Nest.js (Node.js)
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Drizzle ORM
* **Containerization:** Docker & Docker Compose
* **Documentation:** Swagger / OpenAPI
* **Testing:** Jest

---

## 🚀 Getting Started

Follow these steps to set up the project. You can run it in **Development Mode** (Node.js local) or **Production Mode** (Docker).

### 1. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/silvadouglasFull/brasil-card-digital-wallet.git
cd brasil-card-digital-wallet
git checkout develop-v1.0
npm install
````

### 2\. Environment Configuration

Create a `.env` file in the root directory.

**`.env` file content:**

```env
DB_USER=brasiluser
DB_PASS=Lf64uzy2DK
DB_NAME=brasilcard
DB_PORT=5432
# Note: When running migrations from host, use localhost. Inside docker, the app uses 'db' host.
DATABASE_URL="postgres://brasiluser:Lf64uzy2DK@localhost:5432/brasilcard"
PORT=3000
JWT_SECRET=f0PYo5YEqeom3i3XOv8SADNEGmhqkIFpqwlTHhJTQHjdOkN+SPmvG4xsDc5REkvL
```

-----

## 🗄️ Database Setup (Migrations & Seeds)

Regardless of how you run the API (Local or Docker), you must initialize the database schema and populate it with data. The database container must be running (Step 3 below).

### Apply Migrations

Creates the tables in the PostgreSQL database.

```bash
npx drizzle-kit generate && npx drizzle-kit migrate
```

### Run Seeders

Populates the database with mock users, accounts, and transactions for testing.

  * **Default Password:** `123456`
  * **Note:** The script outputs a valid email to use for login.

<!-- end list -->

```bash
npm run seed
```

-----

## ▶️ Execution Options

### Option A: Local Development

Run the API directly on your machine with Hot-Reload.

1.  **Start Database Only:**
    ```bash
    docker-compose up -d db
    ```
2.  **Run Migrations & Seeds:** (See section above).
3.  **Start API:**
    ```bash
    npm run start:dev
    ```

### Option B: Running with Docker (Production Build)

Run the entire application (API + Database) in isolated containers using a Multi-Stage Docker build.

1.  **Build and Start Containers:**
    ```bash
    docker-compose up -d --build
    ```
2.  **Initialize Database:**
    Since the database port is exposed, you can run migrations from your host machine:
    ```bash
    npx drizzle-kit generate
    npx drizzle-kit migrate
    npm run seed
    ```
3.  **Access:** The API is available at `http://localhost:3000/api/docs`.

-----

## 📚 API Documentation

The API includes auto-generated Swagger documentation. Once the server is running, visit:

👉 **[http://localhost:3000/api/docs](https://www.google.com/search?q=http://localhost:3000/api/docs)**

### Key Routes Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/auth/login` | Authenticates user and sets HttpOnly Cookie. |
| **Users** | `POST` | `/users` | Registers a new user (creates account auto). |
| **Wallet** | `GET` | `/wallet/balance` | **[NEW]** Retrieves current user balance and account info. |
| **Wallet** | `GET` | `/wallet/statement` | **[NEW]** Retrieves transaction history (statement). |
| **Wallet** | `POST` | `/wallet/transaction` | Creates a transaction (Deposit/Transfer/Reversal). |

-----

## 💻 Consuming the API (JavaScript Fetch Examples)

Below are examples of how to consume the API using the native browser `fetch` API.

**Note:** The API relies on **HttpOnly Cookies**. You must always set `credentials: 'include'` in your requests.

### 1\. User Login

```javascript
const loginData = {
  email: "user@example.com",
  password: "securepassword123"
};

fetch("http://localhost:3000/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(loginData),
  credentials: "include" // Important: Receives the Set-Cookie header
})
.then(response => response.json())
.then(data => console.log("Login Success:", data));
```

### 2\. Get Balance (Dashboard)

```javascript
fetch("http://localhost:3000/wallet/balance", {
  method: "GET",
  credentials: "include" // Important: Sends the Auth Cookie
})
.then(response => response.json())
.then(data => console.log("Current Balance:", data.balance));
```

### 3\. Get Statement (History)

```javascript
fetch("http://localhost:3000/wallet/statement", {
  method: "GET",
  credentials: "include"
})
.then(response => response.json())
.then(history => console.table(history));
```

### 4\. Create Transaction

```javascript
const transactionData = {
  amount: 150.00,
  type: "TRANSFER", // DEPOSIT | TRANSFER | REVERSAL
  toAccountId: "target-account-uuid-here" // Required for Transfer
};

fetch("http://localhost:3000/wallet/transaction", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(transactionData),
  credentials: "include"
})
.then(response => response.json())
.then(data => console.log("Status:", data.status));
```

-----

## 🧪 Running Tests

The application includes unit tests, specifically for the critical business logic (Strategies and Listeners).

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:cov
```

## 🏗 Architecture Highlights

  * **Transactional Integrity:** Financial operations use database transactions to ensure atomicity.
  * **Race Condition Safety:** Transfers use atomic SQL updates (`balance = balance - amount`) with conditional logic to prevent negative balances during concurrent requests.
  * **Asynchronous Auditing:** Transactions are created in a `PROCESSING` state. An event listener processes the balance update in the background, simulating a real-world auditing queue.

<!-- end list -->
