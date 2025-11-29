# Local Setup & Implementation Guide for BottleSys Backend

This guide provides step-by-step instructions to set up the PostgreSQL database, run the Node.js/Express backend, and connect it to your existing React frontend.

**Date:** November 29, 2025

---

## Part 1: Database Setup (PostgreSQL)

### Step 1.1: Install PostgreSQL

If you don't have PostgreSQL installed, download it from the official website.

- **Website:** [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
- **Recommendation:** Install PostgreSQL version 14 or higher.
- **During installation:** You will be prompted to set a password for the default `postgres` superuser. **Remember this password.**

### Step 1.2: Create the Database

After installation, you need to create a dedicated database for this application.

1.  **Open a terminal or command prompt.**
2.  Connect to PostgreSQL using the `psql` command-line tool. You may be asked for the password you set during installation.

    ```bash
    psql -U postgres
    ```

3.  **Create a new database user and the database.** Run the following SQL commands. Replace `'your_strong_password'` with a secure password of your choice.

    ```sql
    -- Create a new user (role) for your application
    CREATE ROLE your_db_user WITH LOGIN PASSWORD 'your_strong_password';

    -- Create the database and set the new user as the owner
    CREATE DATABASE bottlesys_db OWNER your_db_user;
    ```

4.  **Exit psql:**

    ```sql
    \q
    ```

### Step 1.3: Run the Migration Script

Now, you will create the tables and seed initial data using the `V1__initial_schema.sql` script.

1.  **Navigate to the `backend` directory** in your terminal.

2.  **Run the script** using `psql`. This command executes the contents of the SQL file on the `bottlesys_db` database as the user you just created.

    ```bash
    # You will be prompted for the password for 'your_db_user'
    psql -U your_db_user -d bottlesys_db -f V1__initial_schema.sql
    ```

**Success!** Your database is now set up with all the necessary tables, relationships, and initial data.

---

## Part 2: Backend API Setup (Node.js/Express)

### Step 2.1: Prerequisites

- **Node.js:** Ensure you have Node.js (v18 or higher) and npm installed. Download from [https://nodejs.org/](https://nodejs.org/).

### Step 2.2: Install Dependencies

1.  **Navigate to the `backend` directory** in your terminal.
2.  **Install all required packages** from `package.json`:

    ```bash
    npm install
    ```

### Step 2.3: Configure Environment Variables

1.  In the `backend` directory, create a new file named `.env` by copying the example file.

    ```bash
    # For Linux/macOS
    cp .env.example .env

    # For Windows
    copy .env.example .env
    ```

2.  **Open the new `.env` file** and fill in the details. Use the database credentials you created in Part 1.

    ```ini
    # PostgreSQL Database Connection
    DB_USER=your_db_user
    DB_HOST=localhost
    DB_DATABASE=bottlesys_db
    DB_PASSWORD=your_strong_password # The password you set in Step 1.2
    DB_PORT=5432

    # API Server Port
    API_PORT=4000

    # JWT Secret Key for token generation (change this to a random string)
    JWT_SECRET=replace_this_with_a_long_random_secure_string_for_production
    ```

### Step 2.4: Run the Backend Server

You can now start the API server.

-   **For development (with auto-reloading via nodemon):**

    ```bash
    npm run dev
    ```

-   **For production:**

    ```bash
    npm start
    ```

If successful, you will see the following message in your console:

```
Successfully connected to PostgreSQL database.
Server is running on port 4000
```

**Your backend is now live and accessible at `http://localhost:4000`!**

---

## Part 3: Frontend Integration Guide

Your React frontend currently uses mock data from `src/lib/mock-data.ts`. To connect to your new backend, you need to replace the mock data calls with HTTP requests to your local API.

### Step 3.1: Install an HTTP Client (Optional but Recommended)

Using a library like `axios` can simplify API calls. If you don't have it, install it in your frontend project's root directory (not the `backend` directory).

```bash
# Navigate to your project root (where your frontend's package.json is)
npm install axios
```

### Step 3.2: Update Data Fetching Logic

Here's an example of how to modify a React component to fetch data from the API instead of the mock file.

**Example: Fetching complaints in `Dashboard.tsx`**

Let's assume your `Dashboard.tsx` currently does something like this:

```typescript
// BEFORE: Using mock data
import { mockComplaints } from '@/lib/mock-data';

// ...
const complaints = mockComplaints; // or some function call
// ...
```

You would change it to use `useEffect` and `fetch` (or `axios`) to get data from the API.

```typescript
// AFTER: Fetching from the API
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // if you installed it

// ... inside your component
const [complaints, setComplaints] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchComplaints = async () => {
    try {
      // Get the JWT token from where you store it (e.g., localStorage)
      const token = localStorage.getItem('authToken');

      if (!token) {
          throw new Error('No auth token found. Please log in.');
      }

      const response = await axios.get('http://localhost:4000/api/complaints', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setComplaints(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchComplaints();
}, []); // Empty dependency array means this runs once on mount

// Then, handle loading and error states in your JSX
if (loading) return <div>Loading complaints...</div>;
if (error) return <div>Error: {error}</div>;

// ... render your dashboard with the `complaints` data

```

### Step 3.3: Modify the Login Flow

Your `AuthContext.tsx` or login page needs to be updated to call the `/api/auth/login` endpoint. On successful login, **store the returned JWT token** in `localStorage` or `sessionStorage` so it can be sent with subsequent requests.

```typescript
// Example login function
const handleLogin = async (email, password) => {
  try {
    const response = await axios.post('http://localhost:4000/api/auth/login', { email, password });
    
    const { token, user } = response.data;

    // Store the token and user info
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Update your auth context state
    // e.g., setAuth({ user, token });
    
    // Redirect to dashboard
  } catch (error) {
    // Handle login error (e.g., show a toast notification)
    console.error('Login failed:', error.response?.data?.message || error.message);
  }
};
```

### Summary of Frontend Changes:

1.  **Login:** Update your login form to call `POST /api/auth/login`. Store the JWT token.
2.  **Data Fetching:** In every component that uses `mock-data.ts`, replace the logic with a `useEffect` hook that fetches data from the appropriate API endpoint (e.g., `GET /api/complaints`, `GET /api/users`).
3.  **Authenticated Requests:** For every API call to a protected route, include the `Authorization: Bearer <token>` header.
4.  **Create/Update Actions:** Change your forms (`NewComplaint.tsx`, etc.) to send `POST` or `PATCH` requests to the backend API instead of manipulating mock data arrays.

---

This completes the local setup. You now have a fully functional backend and database that your frontend can communicate with for a complete end-to-end testing experience.
