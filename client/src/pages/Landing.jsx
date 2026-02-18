import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Pill, Shield, Clock, Truck, ChevronRight, User, Building2, Bike } from 'lucide-react';
import heroImage from '../assets/pharma_assist_hero.png';

const Landing = () => {
    const navigate = useNavigate();

    const features = [
        { icon: <Clock className="text-primary" />, title: 'Smart Reminders', desc: 'Never miss a dose with intelligent, time-based alerts.' },
        { icon: <Shield className="text-secondary" />, title: 'Prescription AI', desc: 'Just upload a photo; our AI extracts medicine details instantly.' },
        { icon: <Truck className="text-accent" />, title: 'Home Delivery', desc: 'Automated refills delivered to your doorstep.' },
    ];

    const roles = [
        { title: 'For Patients', icon: <User size={40} />, color: 'var(--primary)', desc: 'Manage medications and track health.' },
        { title: 'For Pharmacies', icon: <Building2 size={40} />, color: 'var(--secondary)', desc: 'Process orders and verify prescriptions.' },
        { title: 'For Delivery', icon: <Bike size={40} />, color: 'var(--accent)', desc: 'Manage dispatches and real-time tracking.' },
    ];

    return (
        <div className="landing-page" style={{ background: 'white', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Navbar */}
            <nav className="glass" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 5%', border: 'none', background: 'rgba(255,255,255,0.7)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Pill className="text-primary" size={28} />
                    <span className="title-gradient font-bold text-2xl">PharmaAssist</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <button onClick={() => navigate('/login')} style={{ background: 'none', fontWeight: '600', color: 'var(--text)' }}>Log In</button>
                    <button onClick={() => navigate('/register')} className="btn btn-primary">Join Now</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container" style={{ paddingTop: '120px', paddingBottom: '80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '100px', fontSize: '0.875rem', fontWeight: '700', marginBottom: '1.5rem', display: 'inline-block' }}>
                        Next-Gen Medicine Management
                    </span>
                    <h1 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', color: '#0f172a' }}>
                        Health <span className="title-gradient text-white" style={{ WebkitTextFillColor: 'initial', color: 'var(--primary)' }}>Simplifed</span>, <br />Care Amplified.
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '2.5rem', maxWidth: '500px' }}>
                        Manage your prescriptions, set smart reminders, and get medicines delivered home—all in one intuitive platform.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => navigate('/register')} className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>Get Started Free</button>
                        <button className="btn" style={{ background: '#f1f5f9', color: '#475569', padding: '1rem 2.5rem', fontSize: '1.1rem' }}>How it Works</button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    style={{ position: 'relative' }}
                >
                    <img src={heroImage} alt="PharmaAssist Hero" style={{ width: '100%', borderRadius: '40px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.2)' }} />
                    <div className="glass" style={{ position: 'absolute', bottom: '-30px', left: '-30px', padding: '1.5rem', borderRadius: '24px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ background: 'var(--secondary)', color: 'white', padding: '0.75rem', borderRadius: '12px' }}><Clock /></div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>UPCOMING DOSE</p>
                            <p style={{ fontWeight: '700' }}>In 45 minutes</p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Roles Section */}
            <section style={{ background: '#f8fafc', padding: '100px 0' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Designed for Everyone</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Whether you're a patient, a pharmacist, or a delivery partner, PharmaAssist has specialized tools for you.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                        {roles.map((role, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="card"
                                style={{ textAlign: 'center', padding: '3rem 2rem' }}
                            >
                                <div style={{ color: role.color, marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>{role.icon}</div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{role.title}</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{role.desc}</p>
                                <button
                                    onClick={() => navigate('/register', { state: { role: role.title } })}
                                    style={{ background: 'none', color: role.color, fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', margin: '0 auto', gap: '0.5rem' }}
                                >
                                    Join as {role.title.split(' ')[1]} <ChevronRight size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="container" style={{ padding: '100px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '2rem' }}>Precision meets <br />Care.</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {features.map((f, i) => (
                                <div key={i} style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div style={{ minWidth: '48px', height: '48px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{f.icon}</div>
                                    <div>
                                        <h4 style={{ fontWeight: '700', marginBottom: '0.25rem' }}>{f.title}</h4>
                                        <p style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #10b981 100%)', borderRadius: '40px', padding: '3rem', color: 'white' }}>
                        <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '2rem' }}>"PharmaAssist saved me from the stress of managing multiple prescriptions for my parents."</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></div>
                            <div>
                                <p style={{ fontWeight: '700' }}>Sarah Johnson</p>
                                <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Patient Caretaker</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid #e2e8f0', padding: '4rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Pill className="text-primary" />
                        <span className="font-bold">PharmaAssist</span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 PharmaAssist. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Contact</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
