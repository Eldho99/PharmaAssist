import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Plus, Clock, Pill } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UploadPrescription = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [extractedData, setExtractedData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('scan'); // 'scan' | 'manual'
    const [manualForm, setManualForm] = useState({
        name: '',
        dosage: '',
        frequency: '',
        stock: 30,
        refillThreshold: 5,
        time: '08:00'
    });

    const handleManualChange = (e) => {
        setManualForm({ ...manualForm, [e.target.name]: e.target.value });
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/medicine', {
                ...manualForm,
                times: [manualForm.time] // Simple single time support for now
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');
        const formData = new FormData();
        formData.append('prescription', file);
        try {
            const res = await axios.post('/api/ocr/upload', formData);
            setExtractedData(res.data);
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const handleConfirm = async () => {
        if (!extractedData) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            for (const med of extractedData.medicines) {
                await axios.post('/api/medicine', {
                    name: med.name,
                    dosage: med.dosage,
                    frequency: med.frequency,
                    stock: 30, // Default stock
                    refillThreshold: 5
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto fade-in">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Add Medicine</h1>
                <p className="text-text-muted">Upload a prescription or enter details manually to track your medicines.</p>
            </header>

            <div className="flex gap-4 mb-8 border-b border-slate-200">
                <button
                    onClick={() => setMode('scan')}
                    className={`pb-4 px-2 font-medium transition-colors border-b-2 ${mode === 'scan' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}
                >
                    Scan Prescription
                </button>
                <button
                    onClick={() => setMode('manual')}
                    className={`pb-4 px-2 font-medium transition-colors border-b-2 ${mode === 'manual' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'}`}
                >
                    Manual Entry
                </button>
            </div>

            {mode === 'manual' ? (
                <div className="max-w-2xl mx-auto card">
                    <form onSubmit={handleManualSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-text mb-2">Medicine Name</label>
                            <div className="relative">
                                <Pill className="absolute left-3 top-3 text-text-muted" size={20} />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="e.g. Paracetamol"
                                    value={manualForm.name}
                                    onChange={handleManualChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Dosage</label>
                                <input
                                    type="text"
                                    name="dosage"
                                    placeholder="e.g. 500mg"
                                    value={manualForm.dosage}
                                    onChange={handleManualChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Frequency</label>
                                <input
                                    type="text"
                                    name="frequency"
                                    placeholder="e.g. Daily"
                                    value={manualForm.frequency}
                                    onChange={handleManualChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-text mb-2">Reminder Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3 text-text-muted" size={20} />
                                <input
                                    type="time"
                                    name="time"
                                    value={manualForm.time}
                                    onChange={handleManualChange}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Current Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    min="0"
                                    value={manualForm.stock}
                                    onChange={handleManualChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text mb-2">Refill Threshold</label>
                                <input
                                    type="number"
                                    name="refillThreshold"
                                    min="0"
                                    value={manualForm.refillThreshold}
                                    onChange={handleManualChange}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Add Medicine'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="card">
                        <div
                            className="upload-area"
                            style={{
                                border: '2px dashed var(--glass-border)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                background: 'rgba(79, 70, 229, 0.02)',
                                cursor: 'pointer'
                            }}
                            onClick={() => document.getElementById('file-input').click()}
                        >
                            <input
                                type="file"
                                id="file-input"
                                hidden
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                            />
                            {preview ? (
                                <img src={preview} alt="Preview" style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }} />
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary" style={{ width: '4rem', height: '4rem', borderRadius: '50%', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Upload size={32} />
                                    </div>
                                    <p className="font-semibold">Click to upload or drag and drop</p>
                                    <p className="text-sm text-text-muted">PNG, JPG, PDF (max 10MB)</p>
                                </div>
                            )}
                        </div>

                        <button
                            className="btn btn-primary w-full mt-6"
                            disabled={!file || status === 'uploading'}
                            onClick={handleUpload}
                            style={{ width: '100%', opacity: (!file || status === 'uploading') ? 0.6 : 1 }}
                        >
                            {status === 'uploading' ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Processing with AI...
                                </>
                            ) : 'Analyze Prescription'}
                        </button>
                    </div>

                    <div className="card">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FileText className="text-primary" />
                            Extraction Results
                        </h2>

                        {status === 'idle' && (
                            <div className="text-center py-10 text-text-muted">
                                <p>Upload a prescription to see extracted details here.</p>
                            </div>
                        )}

                        {status === 'uploading' && (
                            <div className="flex flex-col items-center justify-center py-10 gap-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 0', gap: '1rem' }}>
                                <Loader2 className="animate-spin text-primary" size={48} />
                                <p className="text-primary font-medium">Scanning text and medicines...</p>
                            </div>
                        )}

                        {status === 'success' && extractedData && (
                            <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center gap-3" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: '#f0fdf4', border: '1px solid #dcfce7', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <CheckCircle size={20} />
                                    <span className="text-sm font-medium">Successfully extracted {extractedData.medicines.length} medicines</span>
                                </div>

                                {extractedData.medicines.map((med, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-slate-100" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #f1f5f9' }}>
                                        <h4 className="font-bold text-primary">{med.name}</h4>
                                        <p className="text-sm text-text-muted">{med.dosage} — {med.frequency}</p>
                                    </div>
                                ))}

                                <button onClick={handleConfirm} className="btn btn-primary w-full mt-4" disabled={loading} style={{ width: '100%' }}>
                                    {loading ? <Loader2 className="animate-spin" /> : 'Confirm & Add to Reminders'}
                                </button>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="text-center py-10 text-error">
                                <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
                                <p className="font-medium">Failed to process prescription. Please try again or enter details manually.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadPrescription;
