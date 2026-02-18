import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Building2, Bike, ArrowRight, Pill, ShieldCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialRole = location.state?.role || 'Patient';
    const [role, setRole] = useState(initialRole);

    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/auth/register', { ...formData, role });
            const user = res.data.user;
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'Pharmacist') {
                navigate('/pharmacist/dashboard');
            } else if (user.role === 'Delivery') {
                navigate('/delivery/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { name: 'Patient', icon: <User size={18} /> },
        { name: 'Pharmacist', icon: <Building2 size={18} /> },
        { name: 'Delivery', icon: <Bike size={18} /> }
    ];

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', minHeight: '100vh', padding: '1rem' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card"
                style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                            <ShieldCheck size={32} className="text-secondary" />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>Create Account</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Join PharmaAssist and take control of your health.</p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#f1f5f9', padding: '0.3rem', borderRadius: '12px' }}>
                    {roles.map((r) => (
                        <button
                            key={r.name}
                            onClick={() => setRole(r.name)}
                            style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem',
                                borderRadius: '10px',
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                transition: 'all 0.2s',
                                background: role.includes(r.name) ? 'white' : 'transparent',
                                color: role.includes(r.name) ? 'var(--primary)' : 'var(--text-muted)',
                                boxShadow: role.includes(r.name) ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                                border: 'none'
                            }}
                        >
                            {r.icon} {r.name}
                        </button>
                    ))}
                </div>

                {error && <div style={{ color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center', marginBottom: '1rem', padding: '0.5rem', background: '#fef2f2', borderRadius: '8px' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Full Name</label>
                            <input name="name" onChange={handleChange} type="text" placeholder="John Doe" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Phone</label>
                            <input name="phone" onChange={handleChange} type="tel" placeholder="+1..." required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Email Address</label>
                        <input name="email" onChange={handleChange} type="email" placeholder="john@example.com" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: '600' }}>Password</label>
                        <input name="password" onChange={handleChange} type="password" placeholder="••••••••" required style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        By creating an account, you agree to our <a href="#" style={{ color: 'var(--primary)' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--primary)' }}>Privacy Policy</a>.
                    </p>

                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                        {loading ? <Loader2 className="animate-spin" /> : <>Create {role.split(' ')[0]} Account <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '700' }}>Sign In</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
