import React, { useEffect, useState, useMemo } from 'react';
import { FaHome, FaUserAlt, FaPlus, FaSignOutAlt, FaChartBar, FaUsers, FaClipboardList, FaPaw, FaCalendarCheck, FaCut, FaTrash, FaHourglassHalf, FaClipboardCheck, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import API from '../api';

// Date Helper Functions
const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};
const isYesterday = (date) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
};
const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth() && date.getFullYear() === tomorrow.getFullYear();
};

const Dashboard = () => {
    // Data States
    const [services, setServices] = useState([]);
    const [pets, setPets] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [usersList, setUsersList] = useState([]); 
    const [stats, setStats] = useState({ totalUsers: 0, totalAppointments: 0, pendingAppointments: 0 });
    
    // Form States (Services)
    const [serviceName, setServiceName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');

    // Form States (Pets)
    const [petName, setPetName] = useState('');
    const [petType, setPetType] = useState('Dog');
    const [breed, setBreed] = useState('');
    const [age, setAge] = useState('');
    const [editingPetId, setEditingPetId] = useState(null); // NEW: Track pet being edited

    // Form States (Appointments)
    const [selectedPet, setSelectedPet] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');

    // User Context
    const userRole = localStorage.getItem('role') || 'user';
    const username = localStorage.getItem('username') || 'Guest';
    const email = localStorage.getItem('email') || 'N/A';
    const userId = localStorage.getItem('userId');
    const createdAt = localStorage.getItem('createdAt') || new Date().toISOString();

    // Views
    const [currentView, setCurrentView] = useState(userRole === 'admin' ? 'admin-home' : 'user-home');

    const fetchData = async () => {
        try {
            const servRes = await API.get('/services');
            setServices(servRes.data);

            const aptRes = await API.get('/appointments');
            setAppointments(aptRes.data);

            if (userRole === 'user') {
                const petRes = await API.get('/pets');
                setPets(petRes.data);
            }

            if (userRole === 'admin') {
                const statRes = await API.get('/stats');
                setStats(statRes.data);
                const usersRes = await API.get('/users');
                setUsersList(usersRes.data);
            }
        } catch (error) { toast.error("Error fetching data."); }
    };

    useEffect(() => { fetchData(); }, []);

    // Handlers
    const addService = async (e) => {
        e.preventDefault();
        try {
            await API.post('/services', { serviceName, description, price, duration });
            toast.success("Service added!");
            setServiceName(''); setDescription(''); setPrice(''); setDuration('');
            fetchData();
        } catch(e) { toast.error("Failed to add service"); }
    };

    // NEW: Handle Pet Submit (Add or Update)
    const handlePetSubmit = async (e) => {
        e.preventDefault();
        if (editingPetId) {
            try {
                await API.put(`/pets/${editingPetId}`, { petName, petType, breed, age });
                toast.success("Pet details updated!");
                cancelPetEdit();
                fetchData();
            } catch(e) { toast.error("Failed to update pet"); }
        } else {
            try {
                await API.post('/pets', { petName, petType, breed, age });
                toast.success("Pet added!");
                setPetName(''); setBreed(''); setAge('');
                fetchData();
            } catch(e) { toast.error("Failed to add pet"); }
        }
    };

    // NEW: Prepare form for editing pet
    const startPetEdit = (pet) => {
        setEditingPetId(pet._id);
        setPetName(pet.petName);
        setPetType(pet.petType);
        setBreed(pet.breed || '');
        setAge(pet.age || '');
    };

    // NEW: Cancel pet edit
    const cancelPetEdit = () => {
        setEditingPetId(null);
        setPetName('');
        setPetType('Dog');
        setBreed('');
        setAge('');
    };

    // NEW: Remove Pet
    const removePet = async (id) => {
        if(!window.confirm("Are you sure you want to remove this pet? All associated appointments will also be deleted.")) return;
        try {
            await API.delete(`/pets/${id}`);
            toast.success("Pet removed!");
            fetchData();
        } catch(e) { toast.error("Failed to remove pet."); }
    };

    const bookAppointment = async (e) => {
        e.preventDefault();
        try {
            await API.post('/appointments', { petId: selectedPet, serviceId: selectedService, appointmentDate });
            toast.success("Appointment booked!");
            setSelectedPet(''); setSelectedService(''); setAppointmentDate('');
            fetchData();
            setCurrentView('user-appointments');
        } catch(e) { toast.error("Booking failed"); }
    };

    const updateAptStatus = async (id, status) => {
        try {
            await API.put(`/appointments/${id}/status`, { status });
            toast.success("Status updated!");
            fetchData();
        } catch(e) { toast.error("Status update failed"); }
    };

    // NEW: Admin Delete Appointment
    const deleteAppointment = async (id) => {
        if(!window.confirm("Delete this appointment request permanently?")) return;
        try {
            await API.delete(`/appointments/${id}`);
            toast.success("Appointment removed!");
            fetchData();
        } catch(e) { toast.error("Failed to delete appointment."); }
    };

    const deleteService = async(id) => {
        if(!window.confirm("Delete this service?")) return;
        try {
            await API.delete(`/services/${id}`);
            toast.success("Deleted!");
            fetchData();
        } catch(e) { toast.error("Failed to delete."); }
    }

    const deleteUser = async (id) => {
        if(!window.confirm("Remove this user permanently?")) return;
        try {
            await API.delete(`/users/${id}`);
            toast.success("User removed!");
            fetchData();
        } catch(e) { toast.error("Failed to remove user."); }
    }

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    // Calculate Counts Dynamically
    const todaysAppointmentsCount = useMemo(() => {
        return appointments.filter(a => isToday(new Date(a.appointmentDate))).length;
    }, [appointments]);

    const userStats = useMemo(() => {
        return {
            totalPets: pets.length,
            totalAppointments: appointments.length,
            pendingAppointments: appointments.filter(a => a.status === 'Pending').length,
            completedAppointments: appointments.filter(a => a.status === 'Completed' || a.status === 'Confirmed').length
        };
    }, [appointments, pets]);

    // Group Appointments by Date Header
    const groupedAppointments = useMemo(() => {
        const groups = {};
        appointments.forEach(a => {
            const d = new Date(a.appointmentDate);
            let key = d.toLocaleDateString();
            if (isToday(d)) key = 'Today';
            else if (isYesterday(d)) key = 'Yesterday';
            else if (isTomorrow(d)) key = 'Tomorrow';

            if (!groups[key]) groups[key] = [];
            groups[key].push(a);
        });
        return groups;
    }, [appointments]);

    return (
        <div className="dashboard-layout">
            <Toaster position="top-center" />
            <style>{`
                /* GREEN THEME CSS */
                .dashboard-layout { display: flex; height: 100vh; width: 100vw; background: #f8fafc; font-family: 'Inter', sans-serif; color: #334155; overflow: hidden; }
                
                /* Desktop Sidebar */
                .sidebar { width: 250px; background: #ffffff; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; justify-content: space-between; flex-shrink: 0; z-index: 10;}
                .sidebar-top { padding: 20px 16px; }
                .sidebar-brand { font-size: 1.2rem; font-weight: 700; margin-bottom: 30px; display: flex; align-items: center; gap: 8px; color: #064e3b; padding-left: 8px;}
                .sidebar-nav { display: flex; flex-direction: column; gap: 4px; }
                
                .nav-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s; color: #64748b; font-weight: 600; border: none; background: transparent; width: 100%; text-align: left; font-size: 0.9rem;}
                .nav-item-content { display: flex; align-items: center; gap: 12px; }
                .nav-item:hover { background: #f1f5f9; color: #064e3b; }
                .nav-item.active { background: #ecfdf5; color: #10b981; position: relative; }
                .nav-item.active::before { content: ''; position: absolute; left: 0; top: 10%; height: 80%; width: 3px; background: #10b981; border-radius: 0 4px 4px 0; }
                
                .count-badge { background: #ef4444; color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; font-weight: 700; }

                .sidebar-bottom { padding: 16px; border-top: 1px solid #e2e8f0; background: #fafafa; }
                .user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
                .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: #d1fae5; color: #064e3b; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;}
                .user-details h4 { font-size: 0.85rem; margin: 0; color: #1e293b; font-weight: 600;}
                .user-details span { font-size: 0.65rem; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                
                .btn-logout { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; background: white; color: #64748b; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: 0.2s; }
                .btn-logout:hover { background: #fee2e2; color: #991b1b; border-color: #f87171; }
                
                .main-content { flex: 1; padding: 30px 40px; overflow-y: auto; position: relative; }
                .header { margin-bottom: 24px; }
                .header h2 { font-size: 1.6rem; color: #0f172a; margin-bottom: 4px; font-weight: 700;}
                .header p { font-size: 0.9rem; color: #64748b; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 30px; }
                .stat-card { background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px; border-left: 4px solid #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.02);}
                .stat-icon { font-size: 2rem; color: #34d399; }
                .stat-info h3 { font-size: 0.8rem; color: #64748b; margin-bottom: 4px; font-weight: 600; text-transform: uppercase;}
                .stat-info p { font-size: 1.8rem; color: #064e3b; font-weight: 700; margin: 0;}
                
                .submit-form { background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 700px; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);}
                .input-group { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
                .input-field { flex: 1; min-width: 200px; padding: 12px; border: 1px solid #cbd5e1; border-radius: 6px; outline: none; font-size: 0.9rem; background: #f8fafc; transition: 0.3s;}
                .input-field:focus { border-color: #10b981; background: #ffffff; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);}
                .btn-primary { background: #10b981; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 0.9rem; cursor: pointer; transition: 0.2s;}
                .btn-primary:hover { background: #059669; }
                
                /* Tables & Groups */
                .group-header { font-size: 1.1rem; color: #064e3b; margin: 25px 0 10px 0; font-weight: 700; padding-bottom: 5px; border-bottom: 2px solid #ecfdf5; }
                .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; margin-bottom: 15px;}
                .data-table th { background: #f8fafc; padding: 14px 16px; font-size: 0.8rem; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; text-align: left;}
                .data-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #334155; }
                .data-table tr:hover { background: #f8fafc; }
                
                .status-badge { font-size: 0.7rem; padding: 5px 12px; border-radius: 20px; font-weight: 700; text-transform: uppercase; border: 1px solid transparent; outline: none;}
                .status-Pending { background: #fef3c7; color: #d97706; } 
                .status-Confirmed { background: #e0e7ff; color: #4f46e5; } 
                .status-Completed { background: #d1fae5; color: #059669; } 
                .status-Cancelled { background: #fee2e2; color: #b91c1c; }

                /* Profile Box */
                .profile-box { background: white; padding: 30px; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 500px;}
                .info-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px dashed #e2e8f0;}
                .info-row:last-child { border-bottom: none; }
                .info-label { color: #64748b; font-weight: 600; font-size: 0.9rem; }
                .info-value { color: #0f172a; font-weight: 700; font-size: 0.9rem;}

                /* Mobile Bottom Nav */
                .bottom-nav { display: none; }

                /* MOBILE RESPONSIVENESS */
                @media (max-width: 768px) {
                    .sidebar { display: none; }
                    .main-content { padding: 20px 15px 90px 15px; } 
                    .stats-grid { grid-template-columns: 1fr; }
                    .input-group { flex-direction: column; }
                    .data-table { display: block; overflow-x: auto; white-space: nowrap; }
                    
                    /* Frosted Glass Bottom Nav */
                    .bottom-nav { 
                        display: flex; justify-content: space-around; align-items: center; 
                        position: fixed; bottom: 0; left: 0; width: 100%; 
                        background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                        border-top: 1px solid #e2e8f0; 
                        padding: 10px 0 calc(10px + env(safe-area-inset-bottom)) 0; 
                        z-index: 50; box-shadow: 0 -4px 15px rgba(0,0,0,0.05);
                    }
                    .bottom-nav-item { 
                        display: flex; flex-direction: column; align-items: center; gap: 5px; 
                        background: transparent; border: none; color: #64748b; font-size: 0.7rem; 
                        font-weight: 600; cursor: pointer; transition: 0.2s; position: relative;
                    }
                    .bottom-nav-item svg { font-size: 1.4rem; }
                    .bottom-nav-item.active { color: #10b981; }
                    
                    /* Mobile Badge */
                    .mobile-badge { position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; font-size: 0.6rem; padding: 2px 5px; border-radius: 10px; font-weight: bold; border: 2px solid white;}
                }
            `}</style>

            {/* --- DESKTOP SIDEBAR --- */}
            <div className="sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-brand"><FaPaw style={{color: '#10b981', fontSize: '1.4rem'}}/> PawfectCare</div>
                    <div className="sidebar-nav">
                        {userRole === 'admin' ? (
                            <>
                                <button className={`nav-item ${currentView === 'admin-home' ? 'active' : ''}`} onClick={() => setCurrentView('admin-home')}>
                                    <div className="nav-item-content"><FaChartBar /> Dashboard</div>
                                </button>
                                <button className={`nav-item ${currentView === 'admin-users' ? 'active' : ''}`} onClick={() => setCurrentView('admin-users')}>
                                    <div className="nav-item-content"><FaUsers /> Manage Users</div>
                                </button>
                                <button className={`nav-item ${currentView === 'admin-services' ? 'active' : ''}`} onClick={() => setCurrentView('admin-services')}>
                                    <div className="nav-item-content"><FaCut /> Manage Services</div>
                                </button>
                                <button className={`nav-item ${currentView === 'admin-appointments' ? 'active' : ''}`} onClick={() => setCurrentView('admin-appointments')}>
                                    <div className="nav-item-content"><FaCalendarCheck /> Appointments</div>
                                    {todaysAppointmentsCount > 0 && <span className="count-badge">{todaysAppointmentsCount}</span>}
                                </button>
                                <button className={`nav-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => setCurrentView('profile')}>
                                    <div className="nav-item-content"><FaUserAlt /> My Profile</div>
                                </button>
                            </>
                        ) : (
                            <>
                                <button className={`nav-item ${currentView === 'user-home' ? 'active' : ''}`} onClick={() => setCurrentView('user-home')}>
                                    <div className="nav-item-content"><FaHome /> Dashboard</div>
                                </button>
                                <button className={`nav-item ${currentView === 'user-pets' ? 'active' : ''}`} onClick={() => setCurrentView('user-pets')}>
                                    <div className="nav-item-content"><FaPaw /> My Pets</div>
                                </button>
                                <button className={`nav-item ${currentView === 'user-book' ? 'active' : ''}`} onClick={() => setCurrentView('user-book')}>
                                    <div className="nav-item-content"><FaPlus /> Book Service</div>
                                </button>
                                <button className={`nav-item ${currentView === 'user-appointments' ? 'active' : ''}`} onClick={() => setCurrentView('user-appointments')}>
                                    <div className="nav-item-content"><FaCalendarCheck /> My Appointments</div>
                                    {todaysAppointmentsCount > 0 && <span className="count-badge">{todaysAppointmentsCount}</span>}
                                </button>
                                <button className={`nav-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => setCurrentView('profile')}>
                                    <div className="nav-item-content"><FaUserAlt /> My Profile</div>
                                </button>
                            </>
                        )}
                    </div>
                </div>
                <div className="sidebar-bottom">
                    <div className="user-info">
                        <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
                        <div className="user-details"><h4>{username}</h4><span>{userRole}</span></div>
                    </div>
                    <button onClick={handleLogout} className="btn-logout"><FaSignOutAlt /> Sign Out</button>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="main-content">
                
                {/* ADMIN: HOME */}
                {currentView === 'admin-home' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="header"><h2>Admin Overview</h2><p>Real-time platform statistics</p></div>
                        <div className="stats-grid">
                            <div className="stat-card"><FaUsers className="stat-icon" /><div className="stat-info"><h3>Total Users</h3><p>{stats.totalUsers}</p></div></div>
                            <div className="stat-card"><FaClipboardList className="stat-icon" /><div className="stat-info"><h3>Total Appointments</h3><p>{stats.totalAppointments}</p></div></div>
                            <div className="stat-card"><FaCalendarCheck className="stat-icon" style={{color: '#f59e0b'}} /><div className="stat-info"><h3>Pending Requests</h3><p>{stats.pendingAppointments}</p></div></div>
                        </div>
                    </motion.div>
                )}

                {/* ADMIN: MANAGE USERS */}
                {currentView === 'admin-users' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="header"><h2>Manage Users</h2><p>View and remove registered portal members.</p></div>
                        <table className="data-table">
                            <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
                            <tbody>
                                {usersList.map(u => (
                                    <tr key={u._id}>
                                        <td><strong>{u.username}</strong></td>
                                        <td>{u.email}</td>
                                        <td><span className={`status-badge ${u.role === 'admin' ? 'status-Cancelled' : 'status-Confirmed'}`}>{u.role}</span></td>
                                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <button onClick={() => deleteUser(u._id)} disabled={u._id === userId} style={{color: u._id === userId ? '#ccc' : '#ef4444', cursor: u._id === userId ? 'not-allowed' : 'pointer', border:'none', background:'none', fontSize: '1.1rem'}}><FaTrash/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {/* ADMIN: MANAGE SERVICES */}
                {currentView === 'admin-services' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="header"><h2>Manage Services</h2><p>Add or remove grooming packages</p></div>
                        <div className="submit-form">
                            <form onSubmit={addService}>
                                <div className="input-group">
                                    <input type="text" value={serviceName} onChange={e=>setServiceName(e.target.value)} placeholder="Service Name (e.g. Haircut)" className="input-field" required/>
                                    <input type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price ($)" className="input-field" required/>
                                    <input type="text" value={duration} onChange={e=>setDuration(e.target.value)} placeholder="Duration (e.g. 60 mins)" className="input-field" required/>
                                </div>
                                <div className="input-group">
                                    <input type="text" value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description..." className="input-field" required/>
                                </div>
                                <button type="submit" className="btn-primary">Add Service</button>
                            </form>
                        </div>
                        <table className="data-table">
                            <thead><tr><th>Service</th><th>Description</th><th>Price</th><th>Duration</th><th>Action</th></tr></thead>
                            <tbody>
                                {services.map(s => (
                                    <tr key={s._id}>
                                        <td><strong>{s.serviceName}</strong></td><td>{s.description}</td><td>${s.price}</td><td>{s.duration}</td>
                                        <td><button onClick={()=>deleteService(s._id)} style={{color:'#ef4444', cursor:'pointer', border:'none', background:'none', fontSize:'1.1rem'}}><FaTrash/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {/* USER: HOME */}
                {currentView === 'user-home' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="header"><h2>Welcome, {username}!</h2><p>Manage your pet's grooming needs.</p></div>
                        <div className="stats-grid">
                            <div className="stat-card"><FaPaw className="stat-icon" /><div className="stat-info"><h3>Registered Pets</h3><p>{userStats.totalPets}</p></div></div>
                            <div className="stat-card"><FaCalendarCheck className="stat-icon" /><div className="stat-info"><h3>Total Appointments</h3><p>{userStats.totalAppointments}</p></div></div>
                            <div className="stat-card"><FaHourglassHalf className="stat-icon" style={{color: '#f59e0b'}} /><div className="stat-info"><h3>Pending Approval</h3><p>{userStats.pendingAppointments}</p></div></div>
                        </div>
                    </motion.div>
                )}

                {/* USER: MANAGE PETS */}
                {currentView === 'user-pets' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="header"><h2>My Pets</h2><p>Manage and update your pets.</p></div>
                        <div className="submit-form">
                            <form onSubmit={handlePetSubmit}>
                                <div className="input-group">
                                    <input type="text" value={petName} onChange={e=>setPetName(e.target.value)} placeholder="Pet Name" className="input-field" required/>
                                    <select value={petType} onChange={e=>setPetType(e.target.value)} className="input-field">
                                        <option value="Dog">Dog</option><option value="Cat">Cat</option><option value="Bird">Bird</option><option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="input-group">
                                    <input type="text" value={breed} onChange={e=>setBreed(e.target.value)} placeholder="Breed (Optional)" className="input-field"/>
                                    <input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="Age" className="input-field"/>
                                </div>
                                <div>
                                    <button type="submit" className="btn-primary">{editingPetId ? "Update Pet" : "Add Pet"}</button>
                                    {editingPetId && (
                                        <button type="button" onClick={cancelPetEdit} className="btn-logout" style={{display: 'inline-flex', width: 'auto', marginLeft: '10px', padding: '12px 24px'}}>Cancel</button>
                                    )}
                                </div>
                            </form>
                        </div>
                        <table className="data-table">
                            <thead><tr><th>Name</th><th>Type</th><th>Breed</th><th>Age</th><th>Action</th></tr></thead>
                            <tbody>
                                {pets.map(p => (
                                    <tr key={p._id}>
                                        <td><strong>{p.petName}</strong></td>
                                        <td>{p.petType}</td>
                                        <td>{p.breed || '-'}</td>
                                        <td>{p.age ? `${p.age} yrs` : '-'}</td>
                                        <td>
                                            <button onClick={() => startPetEdit(p)} style={{color: '#3b82f6', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.1rem', marginRight: '10px'}}><FaEdit/></button>
                                            <button onClick={() => removePet(p._id)} style={{color: '#ef4444', cursor: 'pointer', border: 'none', background: 'none', fontSize: '1.1rem'}}><FaTrash/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {/* USER: BOOK APPOINTMENT */}
                {currentView === 'user-book' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="header"><h2>Book Appointment</h2><p>Select your pet and choose a service.</p></div>
                        {pets.length === 0 ? (
                            <div style={{background: '#fef3c7', padding: '20px', borderRadius: '8px', color: '#b45309'}}>
                                <strong>Notice:</strong> Please add a pet first in the "My Pets" tab before booking.
                            </div>
                        ) : (
                            <div className="submit-form">
                                <form onSubmit={bookAppointment}>
                                    <div className="input-group">
                                        <select value={selectedPet} onChange={e=>setSelectedPet(e.target.value)} className="input-field" required>
                                            <option value="" disabled>1. Select Pet</option>
                                            {pets.map(p => <option key={p._id} value={p._id}>{p.petName} ({p.petType})</option>)}
                                        </select>
                                        <select value={selectedService} onChange={e=>setSelectedService(e.target.value)} className="input-field" required>
                                            <option value="" disabled>2. Select Service</option>
                                            {services.map(s => <option key={s._id} value={s._id}>{s.serviceName} - ${s.price} ({s.duration})</option>)}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <input type="datetime-local" value={appointmentDate} onChange={e=>setAppointmentDate(e.target.value)} className="input-field" required/>
                                    </div>
                                    <button type="submit" className="btn-primary">Confirm Booking</button>
                                </form>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* SHARED: APPOINTMENTS (GROUPED BY DATE) */}
                {(currentView === 'user-appointments' || currentView === 'admin-appointments') && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="header">
                            <h2>{currentView === 'admin-appointments' ? 'All Appointments' : 'My Appointments'}</h2>
                            <p>Track scheduling and status.</p>
                        </div>
                        
                        {Object.keys(groupedAppointments).length === 0 ? (
                            <p>No appointments found.</p>
                        ) : (
                            Object.keys(groupedAppointments).map(dateKey => (
                                <div key={dateKey}>
                                    <h3 className="group-header">
                                        {dateKey === 'Today' && '📅 '}
                                        {dateKey === 'Tomorrow' && '🔜 '}
                                        {dateKey === 'Yesterday' && '⏪ '}
                                        {dateKey}
                                    </h3>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                {userRole === 'admin' && <th>Customer</th>}
                                                <th>Pet</th>
                                                <th>Service</th>
                                                <th>Time</th>
                                                <th>Price</th>
                                                <th>Status/Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedAppointments[dateKey].map(a => (
                                                <tr key={a._id}>
                                                    {userRole === 'admin' && <td><strong>{a.userId?.username}</strong></td>}
                                                    <td>{a.petId?.petName}</td>
                                                    <td>{a.serviceId?.serviceName}</td>
                                                    <td>{new Date(a.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                                                    <td>${a.serviceId?.price}</td>
                                                    <td>
                                                        {userRole === 'admin' ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                <select className={`status-badge status-${a.status}`} value={a.status} onChange={(e) => updateAptStatus(a._id, e.target.value)} style={{cursor: 'pointer'}}>
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="Confirmed">Confirmed</option>
                                                                    <option value="Completed">Completed</option>
                                                                    <option value="Cancelled">Cancelled</option>
                                                                </select>
                                                                <button onClick={() => deleteAppointment(a._id)} style={{color:'#ef4444', cursor:'pointer', border:'none', background:'none', fontSize:'1.1rem'}} title="Delete Request"><FaTrash/></button>
                                                            </div>
                                                        ) : (
                                                            <span className={`status-badge status-${a.status}`}>{a.status}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))
                        )}
                    </motion.div>
                )}

                {/* SHARED: PROFILE VIEW */}
                {currentView === 'profile' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="header"><h2>My Profile</h2><p>Your account details.</p></div>
                        <div className="profile-box">
                            <div className="info-row"><span className="info-label">Username</span><span className="info-value">{username}</span></div>
                            <div className="info-row"><span className="info-label">Email Address</span><span className="info-value">{email}</span></div>
                            <div className="info-row"><span className="info-label">Account Role</span><span className="info-value" style={{color: '#10b981', textTransform: 'uppercase'}}>{userRole}</span></div>
                            
                            <div className="info-row" style={{border: 'none', marginTop: '20px', display: 'flex', justifyContent: 'center'}}>
                                <button onClick={handleLogout} className="btn-logout" style={{width: 'auto', padding: '10px 20px', background: '#fee2e2', color: '#991b1b', border: 'none'}}>
                                    <FaSignOutAlt /> Log Out Safely
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

            </div>

            {/* --- MOBILE FROSTED GLASS BOTTOM NAV --- */}
            <div className="bottom-nav">
                {userRole === 'admin' ? (
                    <>
                        <button className={`bottom-nav-item ${currentView === 'admin-home' ? 'active' : ''}`} onClick={() => setCurrentView('admin-home')}>
                            <FaChartBar /> <span>Dash</span>
                        </button>
                        <button className={`bottom-nav-item ${currentView === 'admin-appointments' ? 'active' : ''}`} onClick={() => setCurrentView('admin-appointments')}>
                            <FaCalendarCheck /> <span>Appts</span>
                            {todaysAppointmentsCount > 0 && <span className="mobile-badge">{todaysAppointmentsCount}</span>}
                        </button>
                        <button className={`bottom-nav-item ${currentView === 'admin-services' ? 'active' : ''}`} onClick={() => setCurrentView('admin-services')}>
                            <FaCut /> <span>Services</span>
                        </button>
                        <button className={`bottom-nav-item ${currentView === 'admin-users' ? 'active' : ''}`} onClick={() => setCurrentView('admin-users')}>
                            <FaUsers /> <span>Users</span>
                        </button>
                        <button className={`bottom-nav-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => setCurrentView('profile')}>
                            <FaUserAlt /> <span>Profile</span>
                        </button>
                    </>
                ) : (
                    <>
                        <button className={`bottom-nav-item ${currentView === 'user-home' ? 'active' : ''}`} onClick={() => setCurrentView('user-home')}>
                            <FaHome /> <span>Home</span>
                        </button>
                        <button className={`bottom-nav-item ${currentView === 'user-pets' ? 'active' : ''}`} onClick={() => setCurrentView('user-pets')}>
                            <FaPaw /> <span>Pets</span>
                        </button>
                        <button className={`bottom-nav-item ${currentView === 'user-book' ? 'active' : ''}`} onClick={() => setCurrentView('user-book')}>
                            <FaPlus /> <span>Book</span>
                        </button>
                        <button className={`bottom-nav-item ${currentView === 'user-appointments' ? 'active' : ''}`} onClick={() => setCurrentView('user-appointments')}>
                            <FaCalendarCheck /> <span>Appts</span>
                            {todaysAppointmentsCount > 0 && <span className="mobile-badge">{todaysAppointmentsCount}</span>}
                        </button>
                        <button className={`bottom-nav-item ${currentView === 'profile' ? 'active' : ''}`} onClick={() => setCurrentView('profile')}>
                            <FaUserAlt /> <span>Profile</span>
                        </button>
                    </>
                )}
            </div>

        </div>
    );
};

export default Dashboard;