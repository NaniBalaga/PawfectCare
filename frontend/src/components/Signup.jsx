import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaUserShield, FaKey, FaPaw, FaCut, FaCalendarCheck } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import API from '../api';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [adminCode, setAdminCode] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        
        // Start loading toast
        const toastId = toast.loading('Creating your account...');
        
        try {
            await API.post('/auth/signup', { username, email, password, role, adminCode });
            
            // Show Success Message
            toast.success('Registration successful! Redirecting to login...', { id: toastId });
            
            // Short delay to let the user see the success message
            setTimeout(() => {
                navigate('/login');
            }, 1500);
            
        } catch (error) { 
            // Show Error Message
            toast.error(error.response?.data?.error || 'Registration failed. Username or email may exist.', { id: toastId }); 
        }
    };

    return (
        <div className="auth-wrapper">
            {/* Initialize Toaster for beautiful popups */}
            <Toaster position="top-center" reverseOrder={false} />

            <style>{`
                /* Global Wrapper */
                .auth-wrapper { 
                    display: flex; 
                    width: 100vw; 
                    min-height: 100vh; 
                    background: #ffffff; 
                    font-family: 'Inter', sans-serif;
                }

                /* Left Side: Emerald Green Gradient Panel */
                .auth-gradient-panel { 
                    flex: 1.2; 
                    background: linear-gradient(135deg, #064e3b 0%, #10b981 100%); 
                    color: white; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    padding: 60px; 
                }
                .auth-gradient-panel h1 { 
                    font-size: 3rem; 
                    margin-bottom: 20px; 
                    font-weight: 700; 
                    line-height: 1.2; 
                }
                .auth-gradient-panel p { 
                    font-size: 1.1rem; 
                    color: #d1fae5; 
                    margin-bottom: 40px; 
                    line-height: 1.6; 
                }
                .feature-list { list-style: none; padding: 0; }
                .feature-list li { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; font-size: 1.05rem; color: #ecfdf5; }
                .feature-icon { background: rgba(255, 255, 255, 0.2); padding: 10px; border-radius: 8px; display: flex; align-items: center; }
                
                /* Right Side: Form Container */
                .auth-form-container { 
                    flex: 1; 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: center; 
                    align-items: center; 
                    padding: 40px; 
                    background: #ffffff; 
                    overflow-y: auto; 
                }
                .auth-box { width: 100%; max-width: 400px; }
                .auth-box h2 { font-size: 2rem; color: #064e3b; margin-bottom: 10px; }
                .auth-box > p { color: #6b7280; margin-bottom: 25px; }
                
                /* Inputs */
                .input-group { margin-bottom: 15px; }
                .input-group label { display: block; font-size: 0.9rem; font-weight: 600; color: #374151; margin-bottom: 8px; }
                .input-wrapper { position: relative; display: flex; align-items: center; }
                .input-icon { position: absolute; left: 14px; color: #9ca3af; font-size: 1.1rem; }
                .input-wrapper input, .input-wrapper select { 
                    width: 100%; 
                    padding: 12px 14px 12px 42px; 
                    border: 1px solid #d1d5db; 
                    border-radius: 8px; 
                    font-size: 1rem; 
                    outline: none; 
                    background: #f9fafb; 
                    transition: 0.3s; 
                    appearance: none;
                }
                .input-wrapper input:focus, .input-wrapper select:focus { 
                    border-color: #10b981; 
                    background: #ffffff; 
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); 
                }
                
                /* Buttons & Links */
                .btn-submit { 
                    width: 100%; 
                    padding: 14px; 
                    background: #10b981; 
                    color: white; 
                    font-size: 1rem; 
                    font-weight: 600; 
                    border: none; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    transition: 0.3s; 
                    margin-top: 10px;
                }
                .btn-submit:hover { background: #059669; }
                
                .auth-footer { margin-top: 25px; text-align: center; color: #6b7280; font-size: 0.95rem;}
                .auth-footer a { color: #10b981; text-decoration: none; font-weight: 600; transition: 0.3s; }
                .auth-footer a:hover { color: #064e3b; }
                
                /* Mobile Responsiveness */
                @media (max-width: 900px) { 
                    .auth-wrapper { flex-direction: column; } 
                    .auth-gradient-panel { padding: 40px 20px; text-align: center; } 
                    .feature-list { display: none; } 
                }
            `}</style>
            
            <div className="auth-gradient-panel">
                <h1>Join PawfectCare</h1>
                <p>Register today to effortlessly manage your pet's grooming appointments and health services.</p>
                <ul className="feature-list">
                    <li><div className="feature-icon"><FaPaw /></div>Manage Your Pets Profile</li>
                    <li><div className="feature-icon"><FaCut /></div>Browse Premium Grooming Services</li>
                    <li><div className="feature-icon"><FaCalendarCheck /></div>Book & Track Appointments</li>
                </ul>
            </div>
            
            <div className="auth-form-container">
                <div className="auth-box">
                    <h2>Sign Up</h2>
                    <p>Create your account in seconds.</p>
                    
                    <form onSubmit={handleSignup}>
                        <div className="input-group">
                            <label>Username</label>
                            <div className="input-wrapper">
                                <FaUser className="input-icon" />
                                <input 
                                    type="text" 
                                    placeholder="username" 
                                    onChange={e => setUsername(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="input-group">
                            <label>Email Address</label>
                            <div className="input-wrapper">
                                <FaEnvelope className="input-icon" />
                                <input 
                                    type="email" 
                                    placeholder="email@example.com" 
                                    onChange={e => setEmail(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="input-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <FaLock className="input-icon" />
                                <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    onChange={e => setPassword(e.target.value)} 
                                    required 
                                />
                            </div>
                        </div>
                        
                        <div className="input-group">
                            <label>Account Role</label>
                            <div className="input-wrapper">
                                <FaUserShield className="input-icon" />
                                <select value={role} onChange={e => setRole(e.target.value)}>
                                    <option value="user">Pet Owner (User)</option>
                                    <option value="admin">Service Provider (Admin)</option>
                                </select>
                            </div>
                        </div>
                        
                        {role === 'admin' && (
                            <div className="input-group">
                                <label>Admin Secret Code</label>
                                <div className="input-wrapper">
                                    <FaKey className="input-icon" />
                                    <input 
                                        type="password" 
                                        placeholder="Enter admin code..." 
                                        onChange={e => setAdminCode(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>
                        )}
                        
                        <button type="submit" className="btn-submit">Create Account</button>
                    </form>
                    
                    <div className="auth-footer">
                        Already have an account? <Link to="/login">Sign in here</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;