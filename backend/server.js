const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// --- Database Connection Pool ---
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

// Simple test route
app.get('/', (req, res) => {
    res.send('Health Care System API is running!');
});

// 1. Authentication
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM Users WHERE username = ? AND password = ?', [username, password]); // In a real app, hash passwords!
        if (rows.length > 0) {
            const user = rows[0];
            delete user.password;
            res.json({ success: true, user });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Database error during login.' });
    }
});

// 2. User Management
app.get('/api/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, role, name FROM Users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error });
    }
});

app.post('/api/users', async (req, res) => {
    const { username, password, role, name } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Users (username, password, role, name) VALUES (?, ?, ?, ?)',
            [username, password, role, name]
        );
        res.status(201).json({ id: result.insertId, username, role, name });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user', error });
    }
});

// 3. Patient Management
app.get('/api/patients', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Patients');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch patients', error });
    }
});

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

// 4. Appointment Management
app.get('/api/appointments', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Appointments ORDER BY date DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch appointments', error });
    }
});

app.post('/api/appointments', async (req, res) => {
    const { patientId, patientName, doctorName, date, reason } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Appointments (patientId, patientName, doctorName, date, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
            [patientId, patientName, doctorName, date, reason, 'Scheduled']
        );
        res.status(201).json({ id: result.insertId, status: 'Scheduled', ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Failed to schedule appointment', error });
    }
});

// 5. Medical Records
app.get('/api/medical-records', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM MedicalRecords');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch medical records', error });
    }
});

app.post('/api/medical-records', async (req, res) => {
    const { patientId, doctorName, date, diagnosis, prescription, notes } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO MedicalRecords (patientId, doctorName, date, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?)',
            [patientId, doctorName, date, diagnosis, prescription, notes]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Failed to add medical record', error });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});