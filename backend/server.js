require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Supabase Connection
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized.');

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
        const { data: users, error } = await supabase.from('users').select('*').eq('email', email);
        if (error) throw error;
        const user = users[0];
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
app.post('/api/complaints', authMiddleware(['Outlet', 'Sales Rep']), async (req, res) => {
    try {
        const { outlet_name, outlet_phone, outlet_email, sku, batch_number, quantity, production_date, expiry_date, issue_type_id, description, photos } = req.body;
        const sales_rep_id = req.user.id;

        const { count, error: countError } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
        if(countError) throw countError;

        const complaint_code = `CMP-${String(count + 1).padStart(6, '0')}`;

        const { data: newComplaint, error: insertError } = await supabase
            .from('complaints')
            .insert({
                complaint_code, outlet_name, outlet_phone, outlet_email, sales_rep_id, sku, batch_number, quantity, production_date, expiry_date, issue_type_id, description, photos, status: 'Pending Validation'
            })
            .select()
            .single();

        if (insertError) throw insertError;

        const { error: historyError } = await supabase.from('complaint_history').insert({
            complaint_id: newComplaint.id,
            changed_by_id: req.user.id,
            status_to: 'Pending Validation',
            remarks: 'Complaint created.'
        });

        if (historyError) throw historyError;

        res.status(201).json(newComplaint);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating complaint' });
    }
});

app.get('/api/complaints', authMiddleware(), async (req, res) => {
    const { role, id } = req.user;
    let query = supabase.from('complaints').select('*, sales_rep:users!sales_rep_id(name), issue_type:issue_types(name)');

    if (role === 'Sales Rep' || role === 'Outlet') {
        query = query.eq('sales_rep_id', id);
    }

    query = query.order('created_at', { ascending: false });

    try {
        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching complaints' });
    }
});

app.get('/api/complaints/:id', authMiddleware(), async (req, res) => {
    try {
        const { id } = req.params;
        const { data: complaint, error: complaintError } = await supabase
            .from('complaints')
            .select('*, sales_rep:users!sales_rep_id(name), issue_type:issue_types(name)')
            .eq('id', id)
            .single();

        if (complaintError) throw complaintError;
        if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

        const { data: history, error: historyError } = await supabase
            .from('complaint_history')
            .select('*, changed_by:users!changed_by_id(name)')
            .eq('complaint_id', id)
            .order('created_at', { ascending: true });

        if (historyError) throw historyError;

        res.json({ complaint, history });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching complaint details' });
    }
});

app.patch('/api/complaints/:id/status', authMiddleware(), async (req, res) => {
    const { id } = req.params;
    const { status, remarks, ...otherFields } = req.body;
    const { id: userId, role } = req.user;

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
        const { data: currentComplaint, error: fetchError } = await supabase.from('complaints').select('status').eq('id', id).single();
        if (fetchError) throw fetchError;
        if (!currentComplaint) return res.status(404).json({ message: 'Complaint not found'});
        
        const { data: updatedComplaint, error: updateError } = await supabase
            .from('complaints')
            .update({ status, ...otherFields })
            .eq('id', id)
            .select()
            .single();
        
        if (updateError) throw updateError;

        const { error: historyError } = await supabase.from('complaint_history').insert({
            complaint_id: id,
            changed_by_id: userId,
            status_from: currentComplaint.status,
            status_to: status,
            remarks: remarks || `Status updated to ${status}`
        });

        if (historyError) throw historyError;

        res.json(updatedComplaint);
    } catch (error) {
        console.error('Error updating complaint status:', error);
        res.status(500).json({ message: 'Failed to update complaint' });
    }
});


// --- User Management Routes (Admin only) ---
app.get('/api/users', authMiddleware(['Admin']), async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id, name, email, phone, department, role, created_at').order('created_at', { ascending: false });
    if(error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Issue Types Management Routes (Admin only) ---
app.get('/api/issue-types', authMiddleware(['Admin', 'Outlet', 'Sales Rep']), async (req, res) => {
  try {
    const { data, error } = await supabase.from('issue_types').select('*').order('name');
    if(error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// --- Server Initialization ---
const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
