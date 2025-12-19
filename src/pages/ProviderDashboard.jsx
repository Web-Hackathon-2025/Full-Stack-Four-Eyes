import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { REQUEST_STATUS } from '../config/constants';
import { getPlaceholderAvatar } from '../utils/uploadHelper';
import { FiCalendar, FiClock, FiMessageCircle, FiCheck, FiX, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
    const { user, userData } = useAuth();
    const { sendNotification } = useNotifications();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [actionModal, setActionModal] = useState(null);

    useEffect(() => {
        if (user?.uid) {
            fetchRequests();
        }
    }, [user?.uid]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'requests'),
                where('providerId', '==', user.uid)
            );
            const snapshot = await getDocs(q);
            const requestsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(requestsList.sort((a, b) =>
                (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0)
            ));
        } catch (error) {
            console.error('Error fetching requests:', error);
            setRequests(getSampleRequests());
        } finally {
            setLoading(false);
        }
    };

    const getSampleRequests = () => [
        {
            id: '1',
            customerId: 'c1',
            customerName: 'Ali Ahmed',
            serviceType: 'Wiring Installation',
            status: REQUEST_STATUS.REQUESTED,
            requestedDate: new Date('2024-12-25'),
            timeSlot: '09:00-12:00',
            description: 'Need electrical wiring for new room extension',
            createdAt: new Date()
        },
        {
            id: '2',
            customerId: 'c2',
            customerName: 'Sara Khan',
            serviceType: 'Fixture Repair',
            status: REQUEST_STATUS.CONFIRMED,
            requestedDate: new Date('2024-12-22'),
            timeSlot: '14:00-16:00',
            description: 'Light fixtures not working in bedroom',
            createdAt: new Date(Date.now() - 86400000)
        },
        {
            id: '3',
            customerId: 'c3',
            customerName: 'Hassan Raza',
            serviceType: 'Panel Upgrade',
            status: REQUEST_STATUS.COMPLETED,
            requestedDate: new Date('2024-12-15'),
            timeSlot: '10:00-12:00',
            description: 'Upgrade main electrical panel',
            createdAt: new Date(Date.now() - 172800000)
        }
    ];

    const handleAcceptRequest = async (requestId) => {
        try {
            await updateDoc(doc(db, 'requests', requestId), {
                status: REQUEST_STATUS.CONFIRMED,
                confirmedAt: serverTimestamp()
            });

            const request = requests.find(r => r.id === requestId);
            if (request?.customerId) {
                await sendNotification(request.customerId, {
                    type: 'request_accepted',
                    message: `${userData?.name} accepted your request!`,
                    requestId
                });
            }

            setActionModal(null);
            fetchRequests();
        } catch (error) {
            console.error('Error accepting request:', error);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await updateDoc(doc(db, 'requests', requestId), {
                status: REQUEST_STATUS.CANCELLED,
                cancelledBy: 'provider',
                cancelledAt: serverTimestamp()
            });

            const request = requests.find(r => r.id === requestId);
            if (request?.customerId) {
                await sendNotification(request.customerId, {
                    type: 'request_rejected',
                    message: `${userData?.name} couldn't accept your request`,
                    requestId
                });

                // Decrement customer's active request count
                await updateDoc(doc(db, 'users', request.customerId), {
                    activeRequestCount: increment(-1)
                });
            }

            setActionModal(null);
            fetchRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
        }
    };

    const handleMarkCompleted = async (requestId) => {
        try {
            await updateDoc(doc(db, 'requests', requestId), {
                status: REQUEST_STATUS.COMPLETED,
                completedAt: serverTimestamp()
            });

            const request = requests.find(r => r.id === requestId);
            if (request?.customerId) {
                await sendNotification(request.customerId, {
                    type: 'request_completed',
                    message: `${userData?.name} marked your service as completed!`,
                    requestId
                });

                await updateDoc(doc(db, 'users', request.customerId), {
                    activeRequestCount: increment(-1)
                });
            }

            fetchRequests();
        } catch (error) {
            console.error('Error completing request:', error);
        }
    };

    const handleMarkPaid = async (requestId) => {
        try {
            await updateDoc(doc(db, 'requests', requestId), {
                status: REQUEST_STATUS.PAID,
                paidAt: serverTimestamp()
            });
            fetchRequests();
        } catch (error) {
            console.error('Error marking as paid:', error);
        }
    };

    // Accept mutual cancellation
    const handleAcceptMutualCancel = async (request) => {
        try {
            await updateDoc(doc(db, 'requests', request.id), {
                status: REQUEST_STATUS.CANCELLED,
                cancelledAt: serverTimestamp(),
                mutualCancelAccepted: true
            });
            await updateDoc(doc(db, 'users', request.customerId), { activeRequestCount: increment(-1) });
            await updateDoc(doc(db, 'users', request.providerId), { activeRequestCount: increment(-1) });
            fetchRequests();
        } catch (error) {
            console.error('Error accepting mutual cancel:', error);
        }
    };

    // Decline mutual cancel
    const handleDeclineMutualCancel = async (request) => {
        try {
            await updateDoc(doc(db, 'requests', request.id), {
                status: REQUEST_STATUS.CONFIRMED,
                mutualCancelRequestedBy: null,
                mutualCancelRequestedAt: null
            });
            fetchRequests();
        } catch (error) {
            console.error('Error declining mutual cancel:', error);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            [REQUEST_STATUS.REQUESTED]: { label: 'New Request', class: 'status-pending' },
            [REQUEST_STATUS.CONFIRMED]: { label: 'Confirmed', class: 'status-confirmed' },
            [REQUEST_STATUS.COMPLETED]: { label: 'Completed', class: 'status-completed' },
            [REQUEST_STATUS.PAID]: { label: 'Paid', class: 'status-paid' },
            [REQUEST_STATUS.CANCELLED]: { label: 'Cancelled', class: 'status-cancelled' },
            [REQUEST_STATUS.EXPIRED]: { label: 'Expired', class: 'status-expired' },
            [REQUEST_STATUS.PENDING_MUTUAL_CANCEL]: { label: 'Cancel Pending', class: 'status-warning' }
        };
        return statusConfig[status] || { label: status, class: '' };
    };

    const filteredRequests = activeTab === 'all'
        ? requests
        : activeTab === 'pending'
            ? requests.filter(r => r.status === REQUEST_STATUS.REQUESTED)
            : activeTab === 'active'
                ? requests.filter(r => r.status === REQUEST_STATUS.CONFIRMED)
                : requests.filter(r => [REQUEST_STATUS.COMPLETED, REQUEST_STATUS.PAID, REQUEST_STATUS.CANCELLED].includes(r.status));

    const tabs = [
        { id: 'pending', label: 'New Requests', count: requests.filter(r => r.status === REQUEST_STATUS.REQUESTED).length },
        { id: 'active', label: 'Active', count: requests.filter(r => r.status === REQUEST_STATUS.CONFIRMED).length },
        { id: 'history', label: 'History', count: requests.filter(r => [REQUEST_STATUS.COMPLETED, REQUEST_STATUS.PAID, REQUEST_STATUS.CANCELLED].includes(r.status)).length },
        { id: 'all', label: 'All', count: requests.length }
    ];

    return (
        <div className="dashboard-page provider-dashboard">
            <div className="container">
                <div className="dashboard-header">
                    <div>
                        <h1>Provider Dashboard</h1>
                        <p>Manage your service requests</p>
                    </div>
                    <Link to="/provider-setup" className="btn btn-primary">
                        Edit Profile
                    </Link>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-value">{requests.filter(r => r.status === REQUEST_STATUS.REQUESTED).length}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{requests.filter(r => r.status === REQUEST_STATUS.CONFIRMED).length}</span>
                        <span className="stat-label">Active</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{requests.filter(r => r.status === REQUEST_STATUS.COMPLETED || r.status === REQUEST_STATUS.PAID).length}</span>
                        <span className="stat-label">Completed</span>
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
                            {tab.label}
                            <span className="tab-count">{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* Requests List */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📋</span>
                        <h3>No requests yet</h3>
                        <p>New requests from customers will appear here</p>
                    </div>
                ) : (
                    <div className="requests-list">
                        {filteredRequests.map(request => {
                            const statusInfo = getStatusBadge(request.status);
                            const requestDate = request.requestedDate?.toDate?.() || new Date(request.requestedDate);

                            return (
                                <div key={request.id} className="request-card">
                                    <div className="request-header">
                                        <div className="provider-info">
                                            <img
                                                src={getPlaceholderAvatar(request.customerName)}
                                                alt={request.customerName}
                                                className="provider-avatar"
                                            />
                                            <div>
                                                <h3>{request.customerName}</h3>
                                                <span className="service-type">{request.serviceType}</span>
                                            </div>
                                        </div>
                                        <span className={`status-badge ${statusInfo.class}`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <p className="request-description">{request.description}</p>

                                    <div className="request-meta">
                                        <span><FiCalendar /> {requestDate.toLocaleDateString()}</span>
                                        <span><FiClock /> {request.timeSlot}</span>
                                    </div>

                                    <div className="request-actions">
                                        {/* New Request Actions */}
                                        {request.status === REQUEST_STATUS.REQUESTED && (
                                            <>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => setActionModal({ type: 'accept', request })}
                                                >
                                                    <FiCheck /> Accept
                                                </button>
                                                <button
                                                    className="btn btn-danger-outline"
                                                    onClick={() => setActionModal({ type: 'reject', request })}
                                                >
                                                    <FiX /> Decline
                                                </button>
                                            </>
                                        )}

                                        {/* Confirmed Actions */}
                                        {request.status === REQUEST_STATUS.CONFIRMED && (
                                            <>
                                                <Link to={`/chat/${request.id}`} className="btn btn-secondary">
                                                    <FiMessageCircle /> Chat
                                                </Link>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => handleMarkCompleted(request.id)}
                                                >
                                                    <FiCheck /> Mark Complete
                                                </button>
                                            </>
                                        )}

                                        {/* Completed - Mark as Paid */}
                                        {request.status === REQUEST_STATUS.COMPLETED && (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleMarkPaid(request.id)}
                                            >
                                                <FiDollarSign /> Mark as Paid
                                            </button>
                                        )}

                                        {/* Mutual Cancel - Accept/Decline */}
                                        {request.status === REQUEST_STATUS.PENDING_MUTUAL_CANCEL &&
                                            request.mutualCancelRequestedBy !== 'provider' && (
                                                <>
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={() => handleAcceptMutualCancel(request)}
                                                    >
                                                        ✓ Accept Cancel
                                                    </button>
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => handleDeclineMutualCancel(request)}
                                                    >
                                                        ✗ Decline
                                                    </button>
                                                </>
                                            )}
                                        {request.status === REQUEST_STATUS.PENDING_MUTUAL_CANCEL &&
                                            request.mutualCancelRequestedBy === 'provider' && (
                                                <span className="status-badge status-warning">Waiting for approval</span>
                                            )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Action Confirmation Modal */}
                {actionModal && (
                    <div className="modal-overlay" onClick={() => setActionModal(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <FiAlertCircle className={`modal-icon ${actionModal.type === 'accept' ? 'success' : 'warning'}`} />
                            <h2>{actionModal.type === 'accept' ? 'Accept Request?' : 'Decline Request?'}</h2>
                            <p>
                                {actionModal.type === 'accept'
                                    ? `Confirm service for ${actionModal.request.customerName}?`
                                    : `Are you sure you want to decline this request from ${actionModal.request.customerName}?`
                                }
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setActionModal(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className={actionModal.type === 'accept' ? 'btn btn-primary' : 'btn btn-danger'}
                                    onClick={() => actionModal.type === 'accept'
                                        ? handleAcceptRequest(actionModal.request.id)
                                        : handleRejectRequest(actionModal.request.id)
                                    }
                                >
                                    {actionModal.type === 'accept' ? 'Yes, Accept' : 'Yes, Decline'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderDashboard;
