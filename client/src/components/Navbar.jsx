import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Bell, Upload, ShoppingCart, Settings, Pill, LogOut } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const navItems = user.role === 'Pharmacist' ? [
        { path: '/pharmacist/dashboard', icon: <LayoutDashboard size={20} />, label: 'Terminal' },
    ] : user.role === 'Delivery' ? [
        { path: '/delivery/dashboard', icon: <LayoutDashboard size={20} />, label: 'Delivery Panel' },
    ] : [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/reminders', icon: <Bell size={20} />, label: 'Reminders' },
        { path: '/upload', icon: <Upload size={20} />, label: 'Prescription' },
        { path: '/refills', icon: <ShoppingCart size={20} />, label: 'Refills & Orders' },
    ];

    return (
        <nav className="sidebar glass">
            <div className="sidebar-logo">
                <Pill className="text-primary" size={32} />
                <span className="title-gradient font-bold text-xl">PharmaAssist</span>
            </div>

            <div className="nav-links">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>

            <div className="sidebar-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {user.name?.[0] || 'U'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user.name || 'User'}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="nav-item"
                    style={{ width: '100%', background: 'none', border: 'none', justifyContent: 'flex-start', cursor: 'pointer' }}
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
