# Role-Based Activity Audit Logging System

A production-grade **Role-Based Activity Audit Logging System** built with **MySQL 8.x**, **Node.js (Express)**, and **React (Vite)** with Tailwind CSS.

---

## 🏛️ System Architecture Overview

```
                  ┌────────────────────────────────────────┐
                  │          React (Vite) Frontend         │
                  │ - Role Switcher (Admin / Member)       │
                  │ - Document Workspace (CRUD UI)         │
                  │ - Audit Feed & Visual Diff Modal       │
                  └──────────────────┬─────────────────────┘
                                     │ HTTP (x-user-id Header)
                                     ▼
                  ┌────────────────────────────────────────┐
                  │       Express API Backend Server       │
                  │ - CRUD Routes (/api/documents)         │
                  │ - Non-Blocking auditLogger Middleware │
                  │ - Audit Query Routes (/api/audit-logs) │
                  └──────────────────┬─────────────────────┘
                                     │ mysql2/promise Connection Pool
                                     ▼
                  ┌────────────────────────────────────────┐
                  │           MySQL 8.x Database           │
                  │ - users table                          │
                  │ - documents table                      │
                  │ - audit_logs table (JSON old/new state)│
                  └────────────────────────────────────────┘
```

---

## 📁 Directory Structure

```
role-based-audit-logger/
├── database/
│   └── schema.sql              # MySQL Workbench compatible DDL script with seed data
├── backend/
│   ├── .env.example            # Database & port environment variables
│   ├── package.json            # Express & mysql2 dependencies
│   ├── db.js                   # mysql2/promise connection pool
│   ├── server.js               # Main Express application server
│   ├── middleware/
│   │   └── auditLogger.js      # Non-blocking state diff & audit interceptor middleware
│   └── routes/
│       ├── users.js            # User list endpoint
│       ├── documents.js        # Document CRUD endpoints + auditLogger
│       └── auditLogs.js        # Audit trail query endpoint with filters
├── frontend/
│   ├── package.json            # React & Vite dependencies
│   ├── vite.config.js          # Vite config with API reverse proxy
│   ├── index.html              # Tailwind CSS setup & font configuration
│   └── src/
│       ├── main.jsx            # Entry point
│       ├── App.jsx             # Top-level state & tab navigation
│       ├── index.css           # Glassmorphic UI & scrollbar styles
│       ├── utils/
│       │   └── diffHelper.js   # JSON comparison & diff generator logic
│       └── components/
│           ├── Header.jsx          # Identity switcher header
│           ├── DocumentEditor.jsx  # Document list & RBAC actions
│           ├── DocumentModal.jsx   # Create/Edit modal dialog
│           ├── AuditFeed.jsx       # Human-readable timeline feed & filters
│           └── DiffModal.jsx       # Visual side-by-side JSON diff viewer
└── README.md
```

---

## 🚀 Step-by-Step Setup Guide

### Step 1: Database Setup (MySQL 8.x / MySQL Workbench)
1. Open **MySQL Workbench** (or your MySQL client of choice).
2. Connect to your MySQL server (version 8.0+ recommended for native JSON support).
3. Open and execute the script located at `database/schema.sql`.
4. Verify that database `audit_logging_db` and tables (`users`, `documents`, `audit_logs`) were created and populated with seed data.

### Step 2: Backend Setup (Node.js + Express)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Edit `.env` to configure your MySQL connection details:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_actual_mysql_password
   DB_NAME=audit_logging_db
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *The backend will start at `http://localhost:5000`.*

### Step 3: Frontend Setup (React + Vite)
1. In a new terminal window, navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

## 💡 Key Design & Tech Lead Highlights

1. **Non-Blocking Audit Middleware (`auditLogger.js`)**:
   - Executes audit database inserts asynchronously using `setImmediate` **after** the core HTTP response is dispatched to the client (`res.json`).
   - Wrapped in robust `try...catch` blocks to ensure DB audit logging errors gracefully fail silently without breaking or delaying core user operations.

2. **State Diff Recording (`old_data` vs `new_data`)**:
   - For `UPDATE` operations, the middleware fetches the pre-mutation snapshot (`old_data`) before the database write occurs.
   - Upon successful HTTP 2xx completion, it captures post-mutation state (`new_data`) and computes field-level differences.

3. **MySQL JSON Native Type**:
   - Uses MySQL 8.x `JSON` data type for `old_data` and `new_data` columns, allowing structured storage and indexing via standard SQL expressions.

4. **Composite Indexing**:
   - Includes composite index `idx_resource_type_id (resource_type, resource_id)` and `idx_timestamp (timestamp)` for sub-millisecond audit query performance across millions of audit records.

5. **Visual Diff Modal**:
   - Provides a side-by-side JSON and field-level breakdown highlighting added (green), removed (red), and modified (amber) fields.
