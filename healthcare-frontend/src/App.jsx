import React, { useState, useEffect, useMemo } from 'react';

// --- MOCK DATA & API ---
// This simulates your Azure MySQL database with more comprehensive data.
let mockUsers = [
    { id: 1, username: 'admin', password: 'password123', role: 'Admin', name: 'System Admin' },
    { id: 2, username: 'dr.turing', password: 'password123', role: 'Doctor', name: 'Dr. Alan Turing' },
    { id: 3, username: 'reception', password: 'password123', role: 'Receptionist', name: 'Alex Ray' },
    { id: 4, username: 'dr.lovelace', password: 'password123', role: 'Doctor', name: 'Dr. Ada Lovelace' },
];

let mockPatients = [
    { id: 1, name: 'John Smith', dob: '1985-02-20', gender: 'Male', contact: '555-0101', email: 'john.smith@email.com', address: '123 Maple St, Anytown' },
    { id: 2, name: 'Jane Doe', dob: '1992-07-15', gender: 'Female', contact: '555-0102', email: 'jane.doe@email.com', address: '456 Oak Ave, Anytown' },
    { id: 3, name: 'Peter Jones', dob: '1978-11-30', gender: 'Male', contact: '555-0103', email: 'peter.jones@email.com', address: '789 Pine Ln, Anytown' },
];

let mockMedicalRecords = [
    { id: 1, patientId: 1, doctorName: 'Dr. Alan Turing', date: '2025-09-15', diagnosis: 'Hypertension', prescription: 'Lisinopril 10mg', notes: 'Advised lifestyle and diet changes.' },
    { id: 2, patientId: 2, doctorName: 'Dr. Ada Lovelace', date: '2025-09-20', diagnosis: 'Seasonal Allergies', prescription: 'Cetirizine 10mg', notes: 'Prescribed antihistamines.' },
];

let mockAppointments = [
    { id: 1, patientId: 1, patientName: 'John Smith', doctorName: 'Dr. Alan Turing', date: new Date().toISOString().split('T')[0] + ' 10:00', reason: 'Annual Checkup', status: 'Scheduled' },
    { id: 2, patientId: 2, patientName: 'Jane Doe', doctorName: 'Dr. Ada Lovelace', date: new Date().toISOString().split('T')[0] + ' 11:30', reason: 'Fever and cough', status: 'Scheduled' },
];

const mockApi = {
  login: async (username, password) => {
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (user) return { success: true, user };
    return { success: false, message: 'Invalid credentials' };
  },
  registerUser: async (username, password, role, name) => {
    if (mockUsers.some(u => u.username === username)) return { success: false, message: 'Username already exists' };
    const newUser = { id: mockUsers.length + 1, username, password, role, name };
    mockUsers.push(newUser);
    return { success: true, user: newUser };
  },
  addAppointment: async (appointment) => {
    const newAppointment = { ...appointment, id: mockAppointments.length + 1, status: 'Scheduled' };
    mockAppointments.push(newAppointment);
    return newAppointment;
  },
  getUsers: async () => ([...mockUsers]),
  getPatients: async () => ([...mockPatients]),
  getMedicalRecords: async () => ([...mockMedicalRecords]),
  getAppointments: async () => ([...mockAppointments]),
  addPatient: async (patient) => {
    const newPatient = { ...patient, id: mockPatients.length + 1 };
    mockPatients.push(newPatient);
    return newPatient;
  },
  updatePatient: async (patient) => {
    mockPatients = mockPatients.map(p => p.id === patient.id ? patient : p);
    return patient;
  },
  addMedicalRecord: async (record) => {
    const newRecord = { ...record, id: mockMedicalRecords.length + 1 };
    mockMedicalRecords.push(newRecord);
    return newRecord;
  }
};
// --- END MOCK ---


// --- UI COMPONENTS ---
const Card = ({ title, children, className, actions }) => (
  <div className={`bg-white rounded-xl shadow-md ${className || ''}`}>
    {title && <div className="p-6 border-b border-gray-200 flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">{title}</h2><div>{actions}</div></div>}
    <div className="p-6">{children}</div>
  </div>
);

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white rounded-xl shadow-md p-4 flex items-center">
        <div className={`rounded-full p-3 mr-4 ${color}`}>{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const AuthScreen = () => {
    const [user, setUser] = useState(null);

    const LoginComponent = () => {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        const [error, setError] = useState('');

        const handleLogin = async (e) => {
            e.preventDefault();
            const result = await mockApi.login(username, password);
            if (result.success) {
                setUser(result.user);
            } else {
                setError(result.message);
            }
        };

        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                    <div className="text-center mb-8"><h1 className="text-3xl font-bold text-indigo-600">Health Care Cloud System</h1><p className="text-gray-500">Please sign in to continue</p></div>
                    {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 outline-none" required />
                        <button type="submit" className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold">Login</button>
                    </form>
                </div>
            </div>
        );
    };

    if (user) {
        return <AppLayout user={user} onLogout={() => setUser(null)} />;
    }
    return <LoginComponent />;
};

// --- VIEWS ---
const DashboardView = ({ stats }) => (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard label="Total Patients" value={stats.totalPatients} color="bg-blue-100" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
            <StatCard label="Appointments Today" value={stats.appointmentsToday} color="bg-green-100" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
            <StatCard label="Total Staff" value={stats.totalStaff} color="bg-indigo-100" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.781-4.121M12 11c-3.333 0-6 2.686-6 6v1h12v-1c0-3.314-2.667-6-6-6z" /></svg>} />
        </div>
        <Card title="Upcoming Appointments">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-sm font-semibold text-gray-600 border-b">
                            <th className="p-3">Patient</th>
                            <th className="p-3">Doctor</th>
                            <th className="p-3">Time</th>
                            <th className="p-3">Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stats.appointments.map(app => (
                            <tr key={app.id} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{app.patientName}</td>
                                <td className="p-3 text-gray-600">{app.doctorName}</td>
                                <td className="p-3 text-gray-600">{app.date.split(' ')[1]}</td>
                                <td className="p-3 text-gray-600">{app.reason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);

// --- FIXED & RESTORED: Patient Record Views ---
const PatientDetailView = ({ patient, records, onBack, onUpdate, onAddRecord, user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedPatient, setEditedPatient] = useState(patient);
    const [newRecord, setNewRecord] = useState({ diagnosis: '', prescription: '', notes: '' });

    const canEditPatient = user.role === 'Admin' || user.role === 'Doctor';
    const canAddRecord = user.role === 'Doctor';

    const handleSave = async () => {
        await onUpdate(editedPatient);
        setIsEditing(false);
    };

    const handleAddRecord = (e) => {
        e.preventDefault();
        onAddRecord({ ...newRecord, patientId: patient.id, doctorName: user.name, date: new Date().toISOString().split('T')[0] });
        setNewRecord({ diagnosis: '', prescription: '', notes: '' });
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="text-indigo-600 font-semibold hover:underline">&larr; Back to Patient List</button>
            <Card title={isEditing ? 'Edit Patient Information' : `Patient Profile: ${patient.name}`}
                actions={canEditPatient && (
                    !isEditing ? <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-200">Edit Patient</button>
                        : <div className="flex gap-2"><button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600">Save</button><button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300">Cancel</button></div>
                )}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-600">
                    {Object.entries({ Name: 'name', 'Date of Birth': 'dob', Gender: 'gender', Contact: 'contact', Email: 'email', Address: 'address' }).map(([label, key]) => (
                        <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                            <strong>{label}:</strong> {isEditing ? <input type={key === 'dob' ? 'date' : 'text'} value={editedPatient[key]} onChange={(e) => setEditedPatient({ ...editedPatient, [key]: e.target.value })} className="p-1 border rounded-md w-full" /> : patient[key]}
                        </div>
                    ))}
                </div>
            </Card>
            <Card title="Medical History">
                <div className="space-y-4">
                    {records.length > 0 ? records.slice().reverse().map(rec => (
                        <div key={rec.id} className="p-4 bg-gray-50 rounded-lg border">
                            <p className="font-bold text-gray-800">{rec.diagnosis}</p>
                            <p className="text-sm text-gray-500">Recorded by {rec.doctorName} on {rec.date}</p>
                            <p className="mt-2 text-gray-700"><strong>Prescription:</strong> {rec.prescription}</p>
                            <p className="mt-1 text-gray-700"><strong>Notes:</strong> {rec.notes}</p>
                        </div>
                    )) : <p className="text-gray-500">No medical records found for this patient.</p>}
                </div>
            </Card>
            {canAddRecord && (
                <Card title="Add New Medical Record">
                    <form onSubmit={handleAddRecord} className="space-y-4">
                        <input type="text" placeholder="Diagnosis" value={newRecord.diagnosis} onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })} className="w-full p-2 border rounded-md" required />
                        <input type="text" placeholder="Prescription" value={newRecord.prescription} onChange={(e) => setNewRecord({ ...newRecord, prescription: e.target.value })} className="w-full p-2 border rounded-md" required />
                        <textarea placeholder="Notes" value={newRecord.notes} onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })} className="w-full p-2 border rounded-md h-24"></textarea>
                        <div className="text-right"><button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add Record</button></div>
                    </form>
                </Card>
            )}
        </div>
    );
};

const PatientManagementView = ({ patients, setPatients, onSelectPatient, user }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [newPatient, setNewPatient] = useState({ name: '', dob: '', gender: 'Male', contact: '', email: '', address: '' });

    const canRegister = user.role === 'Admin' || user.role === 'Doctor' || user.role === 'Receptionist';

    const filteredPatients = useMemo(() => patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())), [patients, searchTerm]);

    const handleRegister = async (e) => {
        e.preventDefault();
        const addedPatient = await mockApi.addPatient(newPatient);
        setPatients(prev => [...prev, addedPatient]);
        setIsAdding(false);
        setNewPatient({ name: '', dob: '', gender: 'Male', contact: '', email: '', address: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Patient Records</h1>
                {canRegister && <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{isAdding ? 'Cancel' : '+ Register New Patient'}</button>}
            </div>
            {isAdding && (
                <Card title="New Patient Registration">
                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" value={newPatient.name} onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })} className="p-2 border rounded-md" required />
                        <input type="date" placeholder="Date of Birth" value={newPatient.dob} onChange={(e) => setNewPatient({ ...newPatient, dob: e.target.value })} className="p-2 border rounded-md" required />
                        <select value={newPatient.gender} onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value })} className="p-2 border rounded-md bg-white"><option>Male</option><option>Female</option><option>Other</option></select>
                        <input type="text" placeholder="Contact Number" value={newPatient.contact} onChange={(e) => setNewPatient({ ...newPatient, contact: e.target.value })} className="p-2 border rounded-md" required />
                        <input type="email" placeholder="Email Address" value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} className="p-2 border rounded-md md:col-span-2" required />
                        <input type="text" placeholder="Address" value={newPatient.address} onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })} className="p-2 border rounded-md md:col-span-2" required />
                        <div className="md:col-span-2 text-right"><button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Save Patient</button></div>
                    </form>
                </Card>
            )}
            <Card>
                <div className="mb-4">
                    <input type="text" placeholder="Search by patient name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-sm font-semibold text-gray-600 border-b">
                                <th className="p-3">Name</th>
                                <th className="p-3">Date of Birth</th>
                                <th className="p-3">Contact</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map(p => (
                                <tr key={p.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{p.name}</td>
                                    <td className="p-3 text-gray-600">{p.dob}</td>
                                    <td className="p-3 text-gray-600">{p.contact}</td>
                                    <td className="p-3 text-right"><button onClick={() => onSelectPatient(p)} className="text-indigo-600 text-sm font-semibold hover:underline">View Details</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const UserManagementView = ({ users, setUsers }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', username: '', password: '', role: 'Receptionist' });

    const handleRegister = async (e) => {
        e.preventDefault();
        const result = await mockApi.registerUser(newUser.username, newUser.password, newUser.role, newUser.name);
        if (result.success) {
            setUsers(prev => [...prev, result.user]);
            setIsAdding(false);
            setNewUser({ name: '', username: '', password: '', role: 'Receptionist' });
        } else {
            alert(result.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{isAdding ? 'Cancel' : '+ Add New User'}</button>
            </div>

            {isAdding && (
                <Card title="Create New User Account">
                    <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="p-2 border rounded-md" required />
                        <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="p-2 border rounded-md" required />
                        <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="p-2 border rounded-md" required />
                        <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="p-2 border rounded-md bg-white">
                            <option>Receptionist</option>
                            <option>Doctor</option>
                            <option>Admin</option>
                        </select>
                        <div className="md:col-span-2 text-right"><button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Create User</button></div>
                    </form>
                </Card>
            )}

            <Card title="All System Users">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-sm font-semibold text-gray-600 border-b">
                                <th className="p-3">Name</th>
                                <th className="p-3">Username</th>
                                <th className="p-3">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{u.name}</td>
                                    <td className="p-3 text-gray-600">{u.username}</td>
                                    <td className="p-3 text-gray-600">{u.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// --- NEW: Appointment Scheduling View ---
const AppointmentView = ({ appointments, setAppointments, patients, users }) => {
    const [isScheduling, setIsScheduling] = useState(false);
    const [newAppointment, setNewAppointment] = useState({ patientId: '', doctorName: '', date: '', reason: '' });
    const doctors = users.filter(u => u.role === 'Doctor');

    const handleSchedule = async (e) => {
        e.preventDefault();
        const patient = patients.find(p => p.id === parseInt(newAppointment.patientId));
        if (!patient) return;

        const result = await mockApi.addAppointment({
            ...newAppointment,
            patientName: patient.name
        });
        setAppointments(prev => [...prev, result]);
        setIsScheduling(false);
        setNewAppointment({ patientId: '', doctorName: '', date: '', reason: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Appointment Management</h1>
                <button onClick={() => setIsScheduling(!isScheduling)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{isScheduling ? 'Cancel' : '+ Schedule Appointment'}</button>
            </div>

            {isScheduling && (
                <Card title="Schedule New Appointment">
                    <form onSubmit={handleSchedule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select value={newAppointment.patientId} onChange={(e) => setNewAppointment({ ...newAppointment, patientId: e.target.value })} className="p-2 border rounded-md bg-white" required>
                            <option value="">Select Patient</option>
                            {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select value={newAppointment.doctorName} onChange={(e) => setNewAppointment({ ...newAppointment, doctorName: e.target.value })} className="p-2 border rounded-md bg-white" required>
                            <option value="">Select Doctor</option>
                            {doctors.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                        <input type="datetime-local" value={newAppointment.date} onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value.replace('T', ' ') })} className="p-2 border rounded-md" required />
                        <input type="text" placeholder="Reason for visit" value={newAppointment.reason} onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })} className="p-2 border rounded-md" required />
                        <div className="md:col-span-2 text-right"><button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Schedule</button></div>
                    </form>
                </Card>
            )}

            <Card title="All Appointments">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-sm font-semibold text-gray-600 border-b">
                                <th className="p-3">Patient</th>
                                <th className="p-3">Doctor</th>
                                <th className="p-3">Date & Time</th>
                                <th className="p-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map(app => (
                                <tr key={app.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 font-medium">{app.patientName}</td>
                                    <td className="p-3 text-gray-600">{app.doctorName}</td>
                                    <td className="p-3 text-gray-600">{app.date}</td>
                                    <td className="p-3"><span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">{app.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// --- Main App Layout ---
const AppLayout = ({ user, onLogout }) => {
    const [activeView, setActiveView] = useState('dashboard');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    // State for all data
    const [patients, setPatients] = useState([]);
    const [medicalRecords, setMedicalRecords] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [patientsData, recordsData, appointmentsData, usersData] = await Promise.all([mockApi.getPatients(), mockApi.getMedicalRecords(), mockApi.getAppointments(), mockApi.getUsers()]);
            setPatients(patientsData);
            setMedicalRecords(recordsData);
            setAppointments(appointmentsData);
            setUsers(usersData);
            setLoading(false);
        };
        fetchData();
    }, []);

    // --- FIXED: State Handlers ---
    const handleUpdatePatient = async (updatedPatient) => {
        const result = await mockApi.updatePatient(updatedPatient);
        setPatients(patients.map(p => p.id === result.id ? result : p));
        setSelectedPatient(result);
    };
    const handleAddRecord = async (newRecord) => {
        const result = await mockApi.addMedicalRecord(newRecord);
        setMedicalRecords(prev => [...prev, result]);
    };

    const dashboardStats = { totalPatients: patients.length, appointmentsToday: appointments.filter(a => a.date.startsWith(new Date().toISOString().split('T')[0])).length, totalStaff: users.length, appointments: appointments.filter(a => a.status === 'Scheduled'), };

    const NavLink = ({ viewName, children, requiredRoles }) => {
        if (requiredRoles && !requiredRoles.includes(user.role)) return null;
        return <button onClick={() => { setActiveView(viewName); setSelectedPatient(null); }} className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${activeView === viewName ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-indigo-100'}`}>{children}</button>;
    };

    const renderView = () => {
        if (loading) return <div className="text-center text-xl">Loading data...</div>;
        if (selectedPatient) return <PatientDetailView patient={selectedPatient} records={medicalRecords.filter(r => r.patientId === selectedPatient.id)} onBack={() => setSelectedPatient(null)} user={user} onUpdate={handleUpdatePatient} onAddRecord={handleAddRecord} />;
        switch (activeView) {
            case 'patients': return <PatientManagementView patients={patients} setPatients={setPatients} onSelectPatient={setSelectedPatient} user={user} />;
            case 'users': return <UserManagementView users={users} setUsers={setUsers} />;
            case 'appointments': return <AppointmentView appointments={appointments} setAppointments={setAppointments} patients={patients} users={users} />;
            case 'dashboard': default: return <DashboardView stats={dashboardStats} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <div className="flex">
                <aside className="w-64 bg-white shadow-md h-screen sticky top-0 flex flex-col">
                    <div className="p-6 text-center border-b"><h1 className="text-xl font-bold text-indigo-600">Health Care Cloud</h1></div>
                    <div className="p-4 border-b"><p className="text-sm font-semibold text-gray-700">Welcome, {user.name}</p><p className="text-xs text-gray-500 bg-gray-100 inline-block px-2 py-1 rounded-full mt-1">{user.role}</p></div>
                    <nav className="flex-1 p-4 space-y-2">
                        <NavLink viewName="dashboard" requiredRoles={['Admin', 'Doctor', 'Receptionist']}>Dashboard</NavLink>
                        <NavLink viewName="appointments" requiredRoles={['Admin', 'Doctor', 'Receptionist']}>Appointments</NavLink>
                        <NavLink viewName="patients" requiredRoles={['Admin', 'Doctor', 'Receptionist']}>Patient Records</NavLink>
                        <NavLink viewName="users" requiredRoles={['Admin']}>User Management</NavLink>
                    </nav>
                    <div className="p-4 border-t"><button onClick={onLogout} className="w-full text-left px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-100">Logout</button></div>
                </aside>
                <main className="flex-1 p-8">{renderView()}</main>
            </div>
        </div>
    );
}

// The root component that decides whether to show Auth or the App
export default function App() {
    return <AuthScreen />;
}