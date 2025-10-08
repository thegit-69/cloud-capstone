const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Import bcrypt
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const saltRounds = 10; // The cost factor for hashing

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
    ssl: { rejectUnauthorized: true }
});

// --- API Endpoints ---

// ... (GET '/' is unchanged) ...
app.get('/', (req, res) => { res.send('Health Care System API is running!'); });

// --- SECURED AUTHENTICATION ---

// ** UPDATED: Secure Login Endpoint **
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    try {
        // 1. Find the user by username only
        const [rows] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const user = rows[0];

        // 2. Compare the provided password with the stored hash
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            // 3. Passwords match, login is successful
            delete user.password; // Never send the hash back to the client
            res.json({ success: true, user });
        } else {
            // 4. Passwords do not match
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Database error during login.' });
    }
});

// ** UPDATED: Secure User Creation Endpoint **
app.post('/api/users', async (req, res) => {
    const { username, password, role, name } = req.body;
    try {
        // 1. Hash the plain-text password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 2. Store the hashed password in the database
        const [result] = await pool.query(
            'INSERT INTO Users (username, password, role, name) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role, name]
        );
        res.status(201).json({ id: result.insertId, username, role, name });
    } catch (error) {
        // Handle cases where the username might already exist
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Username already exists.' });
        }
        res.status(500).json({ message: 'Failed to create user', error });
    }
});


// ... (All other endpoints for Patients, Appointments, Medical Records remain unchanged) ...
app.get('/api/users', async (req, res) => { try { const [rows] = await pool.query('SELECT id, username, role, name FROM Users'); res.json(rows); } catch (error) { res.status(500).json({ message: 'Failed to fetch users', error }); } });
app.get('/api/patients', async (req, res) => { try { const [rows] = await pool.query('SELECT * FROM Patients'); res.json(rows); } catch (error) { res.status(500).json({ message: 'Failed to fetch patients', error }); } });
app.post('/api/patients', async (req, res) => { const { name, dob, gender, contact, email, address } = req.body; try { const [result] = await pool.query('INSERT INTO Patients (name, dob, gender, contact, email, address) VALUES (?, ?, ?, ?, ?, ?)',[name, dob, gender, contact, email, address]); res.status(201).json({ id: result.insertId, ...req.body }); } catch (error) { res.status(500).json({ message: 'Failed to add patient', error }); } });
app.put('/api/patients/:id', async (req, res) => { const { id } = req.params; const { name, dob, gender, contact, email, address } = req.body; try { const [result] = await pool.query('UPDATE Patients SET name = ?, dob = ?, gender = ?, contact = ?, email = ?, address = ? WHERE id = ?',[name, dob, gender, contact, email, address, id]); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Patient not found' }); } res.json({ id: parseInt(id), ...req.body }); } catch (error) { res.status(500).json({ message: 'Failed to update patient', error }); } });
app.delete('/api/patients/:id', async (req, res) => { const { id } = req.params; try { await pool.query('DELETE FROM MedicalRecords WHERE patientId = ?', [id]); await pool.query('DELETE FROM Appointments WHERE patientId = ?', [id]); const [result] = await pool.query('DELETE FROM Patients WHERE id = ?', [id]); if (result.affectedRows === 0) { return res.status(404).json({ message: 'Patient not found' }); } res.status(200).json({ success: true, message: 'Patient deleted successfully' }); } catch (error) { res.status(500).json({ message: 'Failed to delete patient', error }); } });
app.get('/api/appointments', async (req, res) => { try { const [rows] = await pool.query('SELECT * FROM Appointments ORDER BY date DESC'); res.json(rows); } catch (error) { res.status(500).json({ message: 'Failed to fetch appointments', error }); } });
app.post('/api/appointments', async (req, res) => { const { patientId, patientName, doctorName, date, reason } = req.body; try { const [result] = await pool.query('INSERT INTO Appointments (patientId, patientName, doctorName, date, reason, status) VALUES (?, ?, ?, ?, ?, ?)',[patientId, patientName, doctorName, date, reason, 'Scheduled']); res.status(201).json({ id: result.insertId, status: 'Scheduled', ...req.body }); } catch (error) { res.status(500).json({ message: 'Failed to schedule appointment', error }); } });
app.get('/api/medical-records', async (req, res) => { try { const [rows] = await pool.query('SELECT * FROM MedicalRecords'); res.json(rows); } catch (error) { res.status(500).json({ message: 'Failed to fetch medical records', error }); } });
app.post('/api/medical-records', async (req, res) => { const { patientId, doctorName, date, diagnosis, prescription, notes } = req.body; try { const [result] = await pool.query('INSERT INTO MedicalRecords (patientId, doctorName, date, diagnosis, prescription, notes) VALUES (?, ?, ?, ?, ?, ?)',[patientId, doctorName, date, diagnosis, prescription, notes]); res.status(201).json({ id: result.insertId, ...req.body }); } catch (error) { res.status(500).json({ message: 'Failed to add medical record', error }); } });


// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});