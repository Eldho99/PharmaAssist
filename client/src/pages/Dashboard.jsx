import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Pill, Package, Truck, ChevronRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Today\'s Dosages', value: '0/0', icon: <Activity className="text-primary" />, trend: 'Loading...' },
        { label: 'Active Medicines', value: '0', icon: <Pill className="text-secondary" />, trend: 'All on track' },
        { label: 'Refills Needed', value: '0', icon: <Package className="text-accent" />, trend: 'Calculating...' },
        { label: 'Pending Deliveries', value: '0', icon: <Truck className="text-primary" />, trend: 'Synced' },
    ]);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [medsRes, ordersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/medicine', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => ({ data: [] })) // Fallback if orders fail
            ]);

            const meds = medsRes.data;
            const orders = ordersRes.data;
            setMedicines(meds);

            // Calculate today's dosages
            const now = new Date();
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentMinute = now.getMinutes().toString().padStart(2, '0');
            const currentTime = `${currentHour}:${currentMinute}`;

            let totalDosesToday = 0;
            let takenDoses = 0;

            meds.forEach(med => {
                if (med.times && med.times.length > 0) {
                    totalDosesToday += med.times.length;
                    // Count doses that have passed
                    med.times.forEach(time => {
                        if (time <= currentTime) {
                            takenDoses++; // Simplified - in real app, track actual intake
                        }
                    });
                }
            });

            // Calculate stats
            const activeCount = meds.length;
            const refillsNeeded = meds.filter(m => m.stock <= m.refillThreshold).length;
            const pendingDeliveries = orders.filter(o => o.status === 'dispatched' || o.status === 'processed').length;

            setStats([
                {
                    label: 'Today\'s Dosages',
                    value: `${takenDoses}/${totalDosesToday}`,
                    icon: <Activity className="text-primary" />,
                    trend: totalDosesToday > 0 ? `${Math.round((takenDoses / totalDosesToday) * 100)}% complete` : 'No doses scheduled'
                },
                { label: 'Active Medicines', value: activeCount.toString(), icon: <Pill className="text-secondary" />, trend: 'All on track' },
                { label: 'Refills Needed', value: refillsNeeded.toString(), icon: <Package className="text-accent" />, trend: refillsNeeded > 0 ? 'Urgent action' : 'Stock healthy' },
                { label: 'Pending Deliveries', value: pendingDeliveries.toString(), icon: <Truck className="text-primary" />, trend: pendingDeliveries > 0 ? 'In transit' : 'All delivered' },
            ]);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleTakeDose = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/medicine/${id}/take`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData(); // Refresh
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin text-primary" size={48} />
        </div>
    );

    return (
        <div className="dashboard fade-in max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
                <p className="text-text-muted">You have {medicines.length} active medications tracked.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="card"
                    >
                        <div className="flex justify-between items-start mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div className="p-3 rounded-xl bg-slate-50" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: '#f1f5f9' }}>
                                {stat.icon}
                            </div>
                        </div>
                        <h3 className="text-text-muted text-sm font-medium">{stat.label}</h3>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <p className="text-xs text-text-muted mt-2">{stat.trend}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="lg:col-span-2 card">
                    <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="text-xl font-bold">Your Medicines</h2>
                        <button
                            onClick={() => window.location.href = '/reminders'}
                            className="text-primary font-medium text-sm flex items-center gap-1"
                            style={{ background: 'none', color: 'var(--primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                        >
                            View All <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {medicines.map((med) => (
                            <div key={med._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-primary/20 transition-colors" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
                                <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {med.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{med.name}</h4>
                                        <p className="text-sm text-text-muted">{med.dosage} — {med.frequency}</p>
                                    </div>
                                </div>
                                <div className="text-right" style={{ textAlign: 'right' }}>
                                    <p className="font-bold text-sm">Stock: {med.stock}</p>
                                    <button
                                        onClick={() => handleTakeDose(med._id)}
                                        className="btn btn-primary"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', marginTop: '0.25rem' }}
                                    >
                                        Log Dose
                                    </button>
                                </div>
                            </div>
                        ))}
                        {medicines.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                No medicines added yet. Upload a prescription to get started!
                            </div>
                        )}
                    </div>
                </div>

                <div className="card bg-primary text-white" style={{ background: 'var(--primary)', color: 'white' }}>
                    <h2 className="text-xl font-bold mb-4">Stock Alerts</h2>
                    <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {medicines.filter(m => m.stock <= m.refillThreshold).map(med => (
                            <div key={med._id}>
                                <div className="flex justify-between text-sm mb-2" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>{med.name}</span>
                                    <span>{med.stock} left</span>
                                </div>
                                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden" style={{ width: '100%', height: '0.5rem', borderRadius: '1rem', background: 'rgba(255, 255, 255, 0.2)', overflow: 'hidden' }}>
                                    <div className="bg-accent h-full" style={{ width: `${(med.stock / 20) * 100}%`, height: '100%', background: 'var(--accent)' }}></div>
                                </div>
                            </div>
                        ))}
                        {medicines.filter(m => m.stock <= m.refillThreshold).length === 0 && (
                            <p className="text-sm opacity-80">All stocks are healthy.</p>
                        )}
                        <button
                            onClick={() => window.location.href = '/refills'}
                            className="btn btn-secondary w-full"
                            style={{ width: '100%', marginTop: '1rem', background: 'white', color: 'var(--primary)' }}
                        >
                            Order Refills
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
