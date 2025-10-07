const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: true
    }
});

// --- API Endpoints ---

// ... (GET '/', POST '/api/login', GET/POST '/api/users' endpoints are unchanged) ...
app.get('/', (req, res) => { res.send('Health Care System API is running!'); });
app.post('/api/login', async (req, res) => { const { username, password } = req.body; try { const [rows] = await pool.query('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password]); if (rows.length > 0) { const user = rows[0]; delete user.password; res.json({ success: true, user }); } else { res.status(401).json({ success: false, message: 'Invalid credentials' }); } } catch (error) { console.error('Login error:', error); res.status(500).json({ success: false, message: 'Database error.' }); } });
app.get('/api/users', async (req, res) => { try { const [rows] = await pool.query('SELECT id, username, role, name FROM Users'); res.json(rows); } catch (error) { res.status(500).json({ message: 'Failed to fetch users', error }); } });
app.post('/api/users', async (req, res) => { const { username, password, role, name } = req.body; try { const [result] = await pool.query('INSERT INTO Users (username, password, role, name) VALUES (?, ?, ?, ?)',[username, password, role, name]); res.status(201).json({ id: result.insertId, username, role, name }); } catch (error) { res.status(500).json({ message: 'Failed to create user', error }); } });


// --- Patient Management (Now with full CRUD) ---

// READ all patients
app.get('/api/patients', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Patients');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch patients', error });
    }
});

// CREATE a new patient
app.post('/api/patients', async (req, res) => {
    const { name, dob, gender, contact, email, address } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Patients (name, dob, gender, contact, email, address) VALUES (?, ?, ?, ?, ?, ?)',
            [name, dob, gender, contact, email, address]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add patient', error });
    }
});

// ** NEW: UPDATE an existing patient **
app.put('/api/patients/:id', async (req, res) => {
    const { id } = req.params;
    const { name, dob, gender, contact, email, address } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Patients SET name = ?, dob = ?, gender = ?, contact = ?, email = ?, address = ? WHERE id = ?',
            [name, dob, gender, contact, email, address, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.json({ id: parseInt(id), ...req.body });
    } catch (error) {
        console.error("Update patient error:", error);
        res.status(500).json({ message: 'Failed to update patient', error });
    }
});

// ** NEW: DELETE a patient **
app.delete('/api/patients/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // We must delete related records first due to foreign key constraints
        await pool.query('DELETE FROM MedicalRecords WHERE patientId = ?', [id]);
        await pool.query('DELETE FROM Appointments WHERE patientId = ?', [id]);
        
        // Now we can delete the patient
        const [result] = await pool.query('DELETE FROM Patients WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Patient not found' });
        }
        res.status(200).json({ success: true, message: 'Patient deleted successfully' });
    } catch (error) {
        console.error("Delete patient error:", error);
        res.status(500).json({ message: 'Failed to delete patient', error });
    }
});


// ... (Appointment and Medical Record endpoints are unchanged) ...
app.get('/api/appointments', async (req, res) => { try { const [rows] = await pool.query('SELECT * FROM Appointments ORDER BY date DESC'); res.json(rows); } catch (error) { res.status(500).json({ message: 'Failed to fetch appointments', error }); } });
app.post('/api/appointments', async (req, res) => { const { patientId, patientName, doctorName, date, reason } = req.body; try { const [result] = await pool.query('INSERT INTO Appointments (patientId, patientName, doctorName, date, reason, status) VALUES (?, ?, ?, ?, ?, ?)',[patientId, patientName, doctorName, date, reason, 'Scheduled']); res.status(201).json({ id: result.insertId, status: 'Scheduled', ...req.body }); } catch (error) { res.status(500).json({ message: 'Failed to schedule appointment', error }); } });
app.get('/api/medical-records', async (req, res) => { try { const [rows] = await pool.query('SELECT * FROM MedicalRecords'); res.json(rows); } catch (error) { res.status(500).json({ message: 'Failed to fetch medical records', error }); } });
app.post('/api/medical-records', async (req, res) => { const { patientId, doctorName, date, diagnosis, prescription, notes } = req.body; try { const [result] = await pool.query('INSERT INTO MedicalRecords (patientId, doctorName, date, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?)',[patientId, doctorName, date, diagnosis, prescription, notes]); res.status(201).json({ id: result.insertId, ...req.body }); } catch (error) { res.status(500).json({ message: 'Failed to add medical record', error }); } });


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

