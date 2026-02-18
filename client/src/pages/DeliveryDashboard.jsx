import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Package, Phone, CheckCircle, Clock, DollarSign, Star, ChevronRight, Loader2, Play } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Modern Markers
const createCustomIcon = (color) => L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(0,0,0,0.1);"></div>`,
    className: 'custom-marker-icon',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
});

const icons = {
    pharmacy: createCustomIcon('#4f46e5'),
    customer: createCustomIcon('#10b981'),
    agent: createCustomIcon('#f59e0b')
};

// -- Map Controller to handle bounds --
const MapController = ({ points }) => {
    const map = useMap();
    useEffect(() => {
        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
};

const MapComponent = ({ activeTask }) => {
    const [route, setRoute] = useState([]);
    const [agentPos, setAgentPos] = useState(null);

    const pharmacyLoc = [activeTask?.pharmacyLocation?.lat || 9.9816, activeTask?.pharmacyLocation?.lng || 76.2999];
    const customerLoc = [activeTask?.customerLocation?.lat || 9.9312, activeTask?.customerLocation?.lng || 76.2673];

    useEffect(() => {
        if (activeTask) {
            // Fetch OSRM route
            const fetchRoute = async () => {
                try {
                    const url = `https://router.project-osrm.org/route/v1/driving/${pharmacyLoc[1]},${pharmacyLoc[0]};${customerLoc[1]},${customerLoc[0]}?overview=full&geometries=geojson`;
                    const res = await axios.get(url);
                    const coords = res.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                    setRoute(coords);

                    // Set agent position based on status
                    if (activeTask.status === 'assigned') setAgentPos([pharmacyLoc[0] + 0.005, pharmacyLoc[1] + 0.005]);
                    else if (activeTask.status === 'picked_up') setAgentPos(pharmacyLoc);
                    else if (activeTask.status === 'out_for_delivery') setAgentPos(coords[Math.floor(coords.length / 2)]);
                    else if (activeTask.status === 'delivered') setAgentPos(customerLoc);
                } catch (err) {
                    console.error('OSRM Fetch Error:', err);
                }
            };
            fetchRoute();
        }
    }, [activeTask]);

    if (!activeTask) return null;

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '24px', overflow: 'hidden', position: 'relative', border: '1px solid #e2e8f0' }}>
            <MapContainer center={pharmacyLoc} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                {/* Modern "Positron" Light Map Skin */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <Marker position={pharmacyLoc} icon={icons.pharmacy}>
                    <Popup><b>Pharmacy</b><br />Pickup Point</Popup>
                </Marker>

                <Marker position={customerLoc} icon={icons.customer}>
                    <Popup><b>Customer</b><br />Delivery Point</Popup>
                </Marker>

                {agentPos && (
                    <Marker position={agentPos} icon={icons.agent}>
                        <Popup><b>You</b><br />Current Location</Popup>
                    </Marker>
                )}

                {route.length > 0 && (
                    <Polyline
                        positions={route}
                        pathOptions={{ color: 'var(--primary)', weight: 4, opacity: 0.6, dashArray: '10, 10' }}
                    />
                )}

                <MapController points={[pharmacyLoc, customerLoc]} />
            </MapContainer>

            <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', zIndex: 1000, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>CURRENT STATUS</p>
                <p style={{ fontSize: '0.875rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)' }}>{activeTask.status.replace('_', ' ')}</p>
            </div>
        </div>
    );
};

const DeliveryDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTask, setActiveTask] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/delivery/seed', {}, { headers: { Authorization: `Bearer ${token}` } });

            const res = await axios.get('/api/delivery/my-tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(res.data);
            if (res.data.length > 0 && !activeTask) setActiveTask(res.data[0]);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch(`/api/delivery/${id}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTasks();
            if (activeTask?._id === id) {
                setActiveTask({ ...activeTask, status: newStatus });
            }
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
        <div className="fade-in">
            <header className="mb-8 flex justify-between items-end" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-3xl font-bold mb-2">Delivery Partner Panel</h1>
                    <p className="text-text-muted">Dynamic routing enabled via OSRM Engine.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--primary)', color: 'white' }}>
                        <DollarSign size={20} />
                        <div>
                            <p style={{ fontSize: '0.7rem', opacity: 0.8 }}>Today's Earnings</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>₹842.00</p>
                        </div>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <MapComponent activeTask={activeTask} />

                    <div className="grid grid-cols-3 gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <Clock className="text-primary mb-2" style={{ margin: '0 auto 0.5rem' }} size={24} />
                            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Est. Arrival</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>{activeTask?.estimatedTime || '--'}</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <Navigation className="text-secondary mb-2" style={{ margin: '0 auto 0.5rem' }} size={24} />
                            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Distance</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>{activeTask?.distance || '--'}</p>
                        </div>
                        <div className="card" style={{ textAlign: 'center' }}>
                            <Star className="text-accent mb-2" style={{ margin: '0 auto 0.5rem' }} size={24} />
                            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Score</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '800' }}>4.92</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Active Tasks</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {tasks.map(task => (
                            <motion.div
                                key={task._id}
                                onClick={() => setActiveTask(task)}
                                whileHover={{ scale: 1.02 }}
                                className="card"
                                style={{
                                    padding: '1.25rem',
                                    cursor: 'pointer',
                                    border: activeTask?._id === task._id ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                                    background: activeTask?._id === task._id ? 'rgba(79, 70, 229, 0.02)' : 'white'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--primary)' }}>#{task._id.slice(-6).toUpperCase()}</p>
                                        <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{task.orderId?.userId?.name || 'Patient'}</h3>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', fontWeight: '800', padding: '0.2rem 0.5rem', borderRadius: '4px', background: '#f1f5f9' }}>
                                        {task.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    <MapPin size={14} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.customerLocation.address}</span>
                                </div>

                                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                    {task.status === 'assigned' && <button onClick={() => updateStatus(task._id, 'picked_up')} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}>Mark Picked Up</button>}
                                    {task.status === 'picked_up' && <button onClick={() => updateStatus(task._id, 'out_for_delivery')} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem' }}>Out for Delivery</button>}
                                    {task.status === 'out_for_delivery' && <button onClick={() => updateStatus(task._id, 'delivered')} className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.75rem', background: '#10b981', color: 'white' }}>Complete</button>}
                                    {task.status === 'delivered' && <div style={{ flex: 1, textAlign: 'center', color: '#10b981', fontWeight: '700', fontSize: '0.875rem' }}>DELIVERED ✅</div>}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryDashboard;
