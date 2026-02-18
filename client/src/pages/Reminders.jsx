import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import axios from 'axios';

const Reminders = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/medicine', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMedicines(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleTake = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/medicine/${id}/take`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchMedicines();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={48} /></div>;

    // Process medicines into a flat list of reminders sorted by time
    const reminders = medicines.flatMap(med => {
        // If times array exists, use it. Otherwise fallback to empty or default.
        const times = med.times && med.times.length > 0 ? med.times : [];
        return times.map(time => ({
            ...med,
            reminderTime: time
        }));
    }).sort((a, b) => a.reminderTime.localeCompare(b.reminderTime));

    return (
        <div className="fade-in max-w-7xl mx-auto">
            <header className="mb-8 flex justify-between items-end" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-3xl font-bold mb-2">My Reminders</h1>
                    <p className="text-text-muted">Stay on top of your medication schedule.</p>
                </div>
                <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary flex items-center gap-2" style={{ background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)' }}>
                        <Calendar size={18} /> Today
                    </button>
                </div>
            </header>

            <div className="card">
                <div className="space-y-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {reminders.map((reminder, index) => (
                        <div key={`${reminder._id}-${index}`} className="flex items-center gap-6" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div className="text-sm font-bold text-text-muted min-w-[80px]" style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-muted)', minWidth: '5rem' }}>
                                {reminder.reminderTime}
                            </div>
                            <div className="relative flex-1" style={{ flex: '1', position: 'relative' }}>
                                <div className="p-4 rounded-xl flex items-center justify-between bg-white border border-slate-100 shadow-sm"
                                    style={{ padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #f1f5f9', boxShadow: 'var(--shadow-sm)' }}>
                                    <div className="flex items-center gap-4" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div className="w-6 h-6 rounded-full border-2 border-slate-200" style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%', border: '2px solid #e2e8f0' }}></div>
                                        <div>
                                            <span className="font-semibold block">{reminder.name}</span>
                                            <span className="text-xs text-text-muted">{reminder.dosage}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleTake(reminder._id)}
                                        className="btn btn-primary btn-sm"
                                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                    >
                                        Log Taken
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {reminders.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            No reminders set for today.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reminders;
