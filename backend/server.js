require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
pool.connect((err) => {
    if (err) {
        console.error('Database connection error', err.stack);
    } else {
        console.log('Successfully connected to PostgreSQL database.');
    }
});

// --- AUTH MIDDLEWARE ---
const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Access Denied: No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access Denied: Malformed token' });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: You do not have the required role.' });
      }
      next();
    } catch (error) {
      res.status(400).json({ message: 'Invalid Token' });
    }
  };
};

// --- API ROUTES ---

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '8h' });
        
        res.json({ 
            message: 'Login successful', 
            token, 
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});


// --- Complaint Routes ---

// POST /api/complaints (Create new complaint - Outlet role)
app.post('/api/complaints', authMiddleware(['Outlet']), async (req, res) => {
    try {
        const { outlet_name, outlet_phone, outlet_email, sku, batch_number, quantity, production_date, expiry_date, issue_type_id, description, photos } = req.body;
        const sales_rep_id = req.user.id;

        // Generate unique complaint code
        const countResult = await pool.query('SELECT COUNT(*) FROM complaints');
        const complaintCount = parseInt(countResult.rows[0].count, 10) + 1;
        const complaint_code = `CMP-${String(complaintCount).padStart(6, '0')}`;

        const newComplaint = await pool.query(
            'INSERT INTO complaints (complaint_code, outlet_name, outlet_phone, outlet_email, sales_rep_id, sku, batch_number, quantity, production_date, expiry_date, issue_type_id, description, photos, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
            [complaint_code, outlet_name, outlet_phone, outlet_email, sales_rep_id, sku, batch_number, quantity, production_date, expiry_date, issue_type_id, description, photos, 'Pending Validation']
        );

        // Log history
        await pool.query(
            'INSERT INTO complaint_history (complaint_id, changed_by_id, status_to, remarks) VALUES ($1, $2, $3, $4)',
            [newComplaint.rows[0].id, req.user.id, 'Pending Validation', 'Complaint created.']
        );

        res.status(201).json(newComplaint.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating complaint' });
    }
});

// GET /api/complaints (Get all complaints - role-based access)
app.get('/api/complaints', authMiddleware(), async (req, res) => {
    const { role, id } = req.user;
    let query = 'SELECT c.*, u.name as sales_rep_name, it.name as issue_type_name FROM complaints c JOIN users u ON c.sales_rep_id = u.id JOIN issue_types it ON c.issue_type_id = it.id';
    const queryParams = [];

    if (role === 'Sales Rep') {
        query += ' WHERE c.sales_rep_id = $1';
        queryParams.push(id);
    } else if (role === 'Outlet') {
        // Outlets should probably see complaints they filed, but the schema doesn't link them directly.
        // Assuming an outlet user is also a sales rep for now.
         query += ' WHERE c.sales_rep_id = $1';
         queryParams.push(id);
    }
    // Admin, EXCO, QC, FGS can see all

    query += ' ORDER BY c.created_at DESC';

    try {
        const result = await pool.query(query, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching complaints' });
    }
});

// GET /api/complaints/:id (Get single complaint)
app.get('/api/complaints/:id', authMiddleware(), async (req, res) => {
    try {
        const { id } = req.params;
        const complaintQuery = 'SELECT c.*, u.name as sales_rep_name, it.name as issue_type_name FROM complaints c JOIN users u ON c.sales_rep_id = u.id JOIN issue_types it ON c.issue_type_id = it.id WHERE c.id = $1';
        const complaintResult = await pool.query(complaintQuery, [id]);

        if (complaintResult.rows.length === 0) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        const historyResult = await pool.query('SELECT h.*, u.name as changed_by_name FROM complaint_history h JOIN users u ON h.changed_by_id = u.id WHERE h.complaint_id = $1 ORDER BY h.created_at ASC', [id]);

        res.json({ complaint: complaintResult.rows[0], history: historyResult.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching complaint details' });
    }
});

// PATCH /api/complaints/:id/status (Generic status update)
app.patch('/api/complaints/:id/status', authMiddleware(), async (req, res) => {
    const { id } = req.params;
    const { status, remarks, ...otherFields } = req.body;
    const { id: userId, role } = req.user;

    // Permissions check
    const validTransitions = {
        'Sales Rep': ['Validated', 'Forwarded to FGS'],
        'FGS Warehouse': ['Forwarded to QC', 'Replacement Approved'],
        'QC Lab': ['QC Report Uploaded'],
        'Finance': ['ERP Updated'],
        'Admin': ['Closed']
    };

    if (!status || !validTransitions[role] || !validTransitions[role].includes(status)) {
        return res.status(403).json({ message: `Forbidden: Role '${role}' cannot set status to '${status}'` });
    }

    try {
        const currentComplaintResult = await pool.query('SELECT status FROM complaints WHERE id = $1', [id]);
        if (currentComplaintResult.rows.length === 0) return res.status(404).json({ message: 'Complaint not found'});
        const currentStatus = currentComplaintResult.rows[0].status;

        // Build dynamic update query
        const fieldEntries = Object.entries(otherFields);
        const setClauses = fieldEntries.map(([key], i) => `${key} = $${i + 3}`).join(', ');
        const queryValues = [status, id, ...fieldEntries.map(([, value]) => value)];

        let updateQuery = `UPDATE complaints SET status = $1, ${setClauses} WHERE id = $2 RETURNING *`;
        if(fieldEntries.length === 0) {
             updateQuery = `UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *`;
             queryValues.splice(2);
        }
        
        const updatedComplaint = await pool.query(updateQuery, queryValues);

        // Log history
        await pool.query(
            'INSERT INTO complaint_history (complaint_id, changed_by_id, status_from, status_to, remarks) VALUES ($1, $2, $3, $4, $5)',
            [id, userId, currentStatus, status, remarks || `Status updated to ${status}`]
        );

        res.json(updatedComplaint.rows[0]);
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ message: 'Failed to update complaint' });
    }
});


// --- User Management Routes (Admin only) ---
app.get('/api/users', authMiddleware(['Admin']), async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, phone, department, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Issue Types Management Routes (Admin only) ---
app.get('/api/issue-types', authMiddleware(['Admin']), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM issue_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Server Initialization ---
const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
