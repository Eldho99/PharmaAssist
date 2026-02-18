import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Truck, Clock, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Refills = () => {
    const navigate = useNavigate();
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ordering, setOrdering] = useState(false);
    const [orderDone, setOrderDone] = useState(false);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchStock();
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStock = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/medicine', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStock(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleRefill = async () => {
        // Calculate amount based on low stock items (e.g. $10 per item)
        const lowMeds = stock.filter(m => m.stock <= m.refillThreshold);
        const amount = lowMeds.length * 10 || 10; // Default $10 if no low meds found but button clicked

        navigate('/payment', { state: { amount } });
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={48} /></div>;

    return (
        <div className="fade-in max-w-7xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Inventory & Refills</h1>
                <p className="text-text-muted">Manage your medicine stock and track home deliveries.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <div className="lg:col-span-2 space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Package className="text-primary" /> Stock Inventory
                        </h2>
                        <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {stock.map((item) => {
                                const status = item.stock <= 2 ? 'critical' : item.stock <= item.refillThreshold ? 'low' : 'ok';
                                return (
                                    <div key={item._id} className="p-4 rounded-xl border border-slate-100" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                                        <div className="flex justify-between items-center mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                            <div>
                                                <h4 className="font-bold">{item.name}</h4>
                                                <p className="text-xs text-text-muted">{item.stock} units left</p>
                                            </div>
                                            {status === 'critical' ? (
                                                <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', background: '#fee2e2', color: '#dc2626', fontSize: '0.6rem', fontWeight: '700' }}>CRITICAL</span>
                                            ) : status === 'low' ? (
                                                <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', background: '#fef3c7', color: '#d97706', fontSize: '0.6rem', fontWeight: '700' }}>LOW STOCK</span>
                                            ) : null}
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden" style={{ width: '100%', height: '0.5rem', background: '#f1f5f9', borderRadius: '1rem', overflow: 'hidden' }}>
                                            <div
                                                className="h-full"
                                                style={{
                                                    width: `${(item.stock / 30) * 100}%`,
                                                    height: '100%',
                                                    background: status === 'critical' ? '#ef4444' : status === 'low' ? '#f59e0b' : 'var(--primary)'
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={handleRefill}
                            disabled={ordering || orderDone}
                            className="btn btn-primary w-full mt-6"
                            style={{ width: '100%', marginTop: '1.5rem', gap: '0.5rem' }}
                        >
                            {orderDone ? <CheckCircle /> : <ShoppingCart size={18} />}
                            {orderDone ? 'Refill Request Sent' : 'Pay & Request Refills'}
                        </button>
                    </div>
                </div>

                <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="card border-l-4 border-primary" style={{ borderLeft: '4px solid var(--primary)' }}>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Truck size={20} className="text-primary" /> Active Deliveries
                        </h2>
                        {orders.filter(o => o.status !== 'delivered').length > 0 ? (
                            <div className="space-y-3">
                                {orders.filter(o => o.status !== 'delivered').slice(0, 3).map(order => (
                                    <div key={order._id} className="p-3 bg-slate-50 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-primary text-sm">
                                                {order.status === 'pending' && 'Order Processing'}
                                                {order.status === 'processed' && 'Ready for Dispatch'}
                                                {order.status === 'dispatched' && 'Out for Delivery'}
                                            </span>
                                            <span className="text-xs text-text-muted">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-muted">
                                            {order.medicines.length} item(s) • {order.medicines.map(m => m.name).join(', ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-text-muted">No active deliveries at the moment.</p>
                        )}
                    </div>

                    <div className="card bg-slate-900 text-white" style={{ background: '#0f172a', color: 'white' }}>
                        <div className="flex items-start gap-3" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                            <AlertTriangle className="text-amber-400" />
                            <div>
                                <h3 className="font-bold mb-1">Smart Refill Enabled</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">We will automatically place refill orders when your stock reaches 15% to ensure you never miss a dose.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Refills;
