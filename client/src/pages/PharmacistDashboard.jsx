import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, XCircle, Search, Eye, Filter, Loader2, Package, FileText } from 'lucide-react';
import axios from 'axios';

const PharmacistDashboard = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [items, setItems] = useState([]); // Combined list of Prescriptions and Orders
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [prescRes, orderRes] = await Promise.all([
                axios.get('http://localhost:5000/api/prescriptions/all', { headers }),
                axios.get('http://localhost:5000/api/orders/all', { headers })
            ]);

            // Transform data to a unified format
            const prescriptions = prescRes.data.map(p => ({
                id: p._id,
                patient: p.userId?.name || 'Unknown',
                date: p.uploadedAt,
                status: p.status,
                type: 'Prescription',
                itemCount: p.medicines?.length || 0,
                fullData: p
            }));

            const orders = orderRes.data.map(o => ({
                id: o._id,
                patient: o.userId?.name || 'Unknown',
                date: o.createdAt,
                status: o.status,
                type: 'Refill Order',
                itemCount: o.medicines?.length || 0,
                fullData: o
            }));

            setItems([...prescriptions, ...orders].sort((a, b) => new Date(b.date) - new Date(a.date)));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status, type) => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = type === 'Prescription' ? 'prescriptions' : 'orders';
            await axios.patch(`http://localhost:5000/api/${endpoint}/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (status === 'dispatched') {
                // Trigger delivery task creation
                try {
                    await axios.post('http://localhost:5000/api/delivery/create', { orderId: id, type }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (err) {
                    console.error('Failed to create delivery task:', err);
                }
            }

            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={48} /></div>;

    const filteredItems = items.filter(item => item.status === activeTab);

    return (
        <div className="fade-in">
            <header className="mb-8 flex justify-between items-center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-3xl font-bold mb-2">Pharmacist Terminal</h1>
                    <p className="text-text-muted">Process new prescriptions and verify refill orders.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
                        <input
                            type="text"
                            placeholder="Patient or ID..."
                            style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', width: '250px' }}
                        />
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                {['pending', 'processed', 'dispatched'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '100px',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            border: 'none',
                            background: activeTab === tab ? 'var(--primary)' : '#f1f5f9',
                            color: activeTab === tab ? 'white' : 'var(--text-muted)',
                            cursor: 'pointer'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: '700' }}>ID</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: '700' }}>Type</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: '700' }}>Patient</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: '700' }}>Items</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: '700' }}>Date</th>
                            <th style={{ padding: '1rem 1.5rem', fontWeight: '700' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1.25rem 1.5rem', fontWeight: '600' }}>{item.id.slice(-6).toUpperCase()}</td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        color: item.type === 'Prescription' ? 'var(--primary)' : 'var(--secondary)'
                                    }}>
                                        {item.type === 'Prescription' ? <FileText size={14} /> : <Package size={14} />}
                                        {item.type}
                                    </span>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>{item.patient}</td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>{item.itemCount} meds</td>
                                <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString()}</td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {activeTab === 'pending' && (
                                            <button
                                                onClick={() => handleUpdateStatus(item.id, 'processed', item.type)}
                                                className="btn btn-primary btn-sm"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        {activeTab === 'processed' && (
                                            <button
                                                onClick={() => handleUpdateStatus(item.id, 'dispatched', item.type)}
                                                className="btn btn-secondary btn-sm"
                                                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', background: 'var(--accent)', color: 'white' }}
                                            >
                                                Dispatch
                                            </button>
                                        )}
                                        <button className="btn" style={{ background: '#f1f5f9', padding: '0.4rem', borderRadius: '8px' }}><Eye size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredItems.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>No {activeTab} requests found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacistDashboard;
