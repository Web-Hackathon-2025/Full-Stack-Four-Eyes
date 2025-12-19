import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { getPlaceholderAvatar } from '../utils/uploadHelper';
import { FiUsers, FiShield, FiCheck, FiX, FiAlertTriangle, FiBan, FiUnlock, FiEye } from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const { userData } = useAuth();
    const { sendNotification } = useNotifications();

    const [activeTab, setActiveTab] = useState('verification');
    const [providers, setProviders] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cnicModal, setCnicModal] = useState(null);

    useEffect(() => {
        if (userData?.role === 'admin') {
            loadData();
        }
    }, [userData?.role]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load pending verification providers
            const providersSnapshot = await getDocs(collection(db, 'providers'));
            setProviders(providersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Load all users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyProvider = async (providerId, approved) => {
        try {
            await updateDoc(doc(db, 'providers', providerId), {
                verificationStatus: approved ? 'approved' : 'rejected',
                isVerified: approved
            });

            await sendNotification(providerId, {
                type: 'verification',
                message: approved
                    ? '✅ Your CNIC has been verified! You are now a verified provider.'
                    : '❌ Your CNIC verification was rejected. Please contact support.'
            });

            setCnicModal(null);
            loadData();
        } catch (error) {
            console.error('Error updating verification:', error);
        }
    };

    const handleBanUser = async (userId, ban) => {
        try {
            const banEnd = ban ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null;

            await updateDoc(doc(db, 'users', userId), {
                bannedUntil: banEnd,
                isBanned: ban
            });

            await sendNotification(userId, {
                type: 'account',
                message: ban
                    ? '⚠️ Your account has been temporarily suspended.'
                    : '✅ Your account suspension has been lifted.'
            });

            loadData();
        } catch (error) {
            console.error('Error banning user:', error);
        }
    };

    const pendingVerifications = providers.filter(p => p.verificationStatus === 'pending');
    const verifiedProviders = providers.filter(p => p.verificationStatus === 'approved');

    const tabs = [
        { id: 'verification', label: 'CNIC Verification', icon: <FiShield />, count: pendingVerifications.length },
        { id: 'users', label: 'User Management', icon: <FiUsers />, count: users.length },
        { id: 'providers', label: 'Providers', icon: <FiCheck />, count: providers.length }
    ];

    if (userData?.role !== 'admin') {
        return (
            <div className="admin-denied">
                <FiAlertTriangle size={48} />
                <h2>Access Denied</h2>
                <p>You don't have permission to view this page.</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="container">
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <p>Manage users, providers, and verifications</p>
                </div>

                {/* Stats */}
                <div className="admin-stats">
                    <div className="stat-card">
                        <span className="stat-value">{pendingVerifications.length}</span>
                        <span className="stat-label">Pending Verification</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{verifiedProviders.length}</span>
                        <span className="stat-label">Verified Providers</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{users.length}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                            {tab.label}
                            <span className="tab-count">{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <>
                        {/* CNIC Verification Tab */}
                        {activeTab === 'verification' && (
                            <div className="admin-section">
                                <h2>Pending CNIC Verification</h2>
                                {pendingVerifications.length === 0 ? (
                                    <div className="empty-state">
                                        <span className="empty-icon">✓</span>
                                        <h3>All caught up!</h3>
                                        <p>No pending verifications</p>
                                    </div>
                                ) : (
                                    <div className="admin-list">
                                        {pendingVerifications.map(provider => (
                                            <div key={provider.id} className="admin-card">
                                                <div className="card-header">
                                                    <img
                                                        src={provider.photoURL || getPlaceholderAvatar(provider.name)}
                                                        alt={provider.name}
                                                        className="user-avatar"
                                                    />
                                                    <div>
                                                        <h3>{provider.name}</h3>
                                                        <span className="user-email">{provider.email}</span>
                                                    </div>
                                                    <span className="badge badge-warning">Pending</span>
                                                </div>
                                                <div className="card-details">
                                                    <span>Category: {provider.category}</span>
                                                    <span>Region: {provider.region}</span>
                                                </div>
                                                <div className="card-actions">
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => setCnicModal(provider)}
                                                    >
                                                        <FiEye /> View CNIC
                                                    </button>
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={() => handleVerifyProvider(provider.id, true)}
                                                    >
                                                        <FiCheck /> Approve
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => handleVerifyProvider(provider.id, false)}
                                                    >
                                                        <FiX /> Reject
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="admin-section">
                                <h2>User Management</h2>
                                <div className="admin-list">
                                    {users.map(user => (
                                        <div key={user.id} className="admin-card">
                                            <div className="card-header">
                                                <img
                                                    src={getPlaceholderAvatar(user.name)}
                                                    alt={user.name}
                                                    className="user-avatar"
                                                />
                                                <div>
                                                    <h3>{user.name}</h3>
                                                    <span className="user-email">{user.email}</span>
                                                </div>
                                                <span className={`badge ${user.role === 'admin' ? 'badge-primary' : user.role === 'provider' ? 'badge-info' : ''}`}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <div className="card-details">
                                                <span>Cancellations: {user.cancelCount || 0}</span>
                                                <span>Region: {user.region}</span>
                                                {user.isBanned && <span className="text-danger">🚫 Banned</span>}
                                            </div>
                                            {user.role !== 'admin' && (
                                                <div className="card-actions">
                                                    {user.isBanned ? (
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={() => handleBanUser(user.id, false)}
                                                        >
                                                            <FiUnlock /> Unban User
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="btn btn-danger-outline"
                                                            onClick={() => handleBanUser(user.id, true)}
                                                        >
                                                            <FiBan /> Ban User
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Providers Tab */}
                        {activeTab === 'providers' && (
                            <div className="admin-section">
                                <h2>All Providers</h2>
                                <div className="admin-list">
                                    {providers.map(provider => (
                                        <div key={provider.id} className="admin-card">
                                            <div className="card-header">
                                                <img
                                                    src={provider.photoURL || getPlaceholderAvatar(provider.name)}
                                                    alt={provider.name}
                                                    className="user-avatar"
                                                />
                                                <div>
                                                    <h3>{provider.name}</h3>
                                                    <span className="user-email">{provider.category}</span>
                                                </div>
                                                <span className={`badge ${provider.verificationStatus === 'approved' ? 'badge-success' :
                                                        provider.verificationStatus === 'pending' ? 'badge-warning' :
                                                            'badge-danger'
                                                    }`}>
                                                    {provider.verificationStatus || 'Not Submitted'}
                                                </span>
                                            </div>
                                            <div className="card-details">
                                                <span>Rating: ⭐ {provider.avgRating?.toFixed(1) || 'New'}</span>
                                                <span>Reviews: {provider.totalReviews || 0}</span>
                                                <span>Cancels: {provider.cancelCount || 0}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* CNIC View Modal */}
                {cnicModal && (
                    <div className="modal-overlay" onClick={() => setCnicModal(null)}>
                        <div className="modal-content cnic-modal" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setCnicModal(null)}>
                                <FiX />
                            </button>
                            <h2>CNIC Verification - {cnicModal.name}</h2>
                            <div className="cnic-images">
                                <div className="cnic-image">
                                    <h4>Front Side</h4>
                                    {cnicModal.cnicFrontURL ? (
                                        <img src={cnicModal.cnicFrontURL} alt="CNIC Front" />
                                    ) : (
                                        <div className="no-image">Not uploaded</div>
                                    )}
                                </div>
                                <div className="cnic-image">
                                    <h4>Back Side</h4>
                                    {cnicModal.cnicBackURL ? (
                                        <img src={cnicModal.cnicBackURL} alt="CNIC Back" />
                                    ) : (
                                        <div className="no-image">Not uploaded</div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleVerifyProvider(cnicModal.id, false)}
                                >
                                    <FiX /> Reject
                                </button>
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleVerifyProvider(cnicModal.id, true)}
                                >
                                    <FiCheck /> Approve
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
