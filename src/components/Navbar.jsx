import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiSearch, FiUser, FiLogOut, FiGrid, FiSettings } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
    const { user, userData, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getDashboardLink = () => {
        if (!userData) return '/dashboard';
        switch (userData.role) {
            case 'admin': return '/admin';
            case 'provider': return '/provider-dashboard';
            default: return '/dashboard';
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🛠️</span>
                    <span className="logo-text">Karigar</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className="nav-link">
                        <FiHome />
                        <span>Home</span>
                    </Link>
                    <Link to="/browse" className="nav-link">
                        <FiSearch />
                        <span>Browse</span>
                    </Link>
                </div>

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <Link to={getDashboardLink()} className="nav-link">
                                <FiGrid />
                                <span>Dashboard</span>
                            </Link>
                            {userData?.role === 'provider' && (
                                <Link to="/provider-setup" className="nav-link">
                                    <FiSettings />
                                    <span>Profile</span>
                                </Link>
                            )}
                            <div className="user-menu">
                                <span className="user-name">{userData?.name || 'User'}</span>
                                <span className="user-role badge">{userData?.role}</span>
                                <button onClick={handleLogout} className="btn-icon" title="Logout">
                                    <FiLogOut />
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-secondary">
                                Login
                            </Link>
                            <Link to="/signup" className="btn btn-primary">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
