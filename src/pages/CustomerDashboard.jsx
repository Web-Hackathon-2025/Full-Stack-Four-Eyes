import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { REQUEST_STATUS, SERVICE_CATEGORIES } from '../config/constants';
import { getPlaceholderAvatar } from '../utils/uploadHelper';
import CancellationModal from '../components/CancellationModal';
import ReviewModal from '../components/ReviewModal';
import { FiCalendar, FiClock, FiMessageCircle, FiX, FiStar } from 'react-icons/fi';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
    const { user, userData } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [cancelModal, setCancelModal] = useState(null);
    const [reviewModal, setReviewModal] = useState(null);

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
                where('customerId', '==', user.uid)
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
            // Demo data
            setRequests(getSampleRequests());
        } finally {
            setLoading(false);
        }
    };

    const getSampleRequests = () => [
        {
            id: '1',
            providerId: '1',
            providerName: 'Ahmed Khan',
            serviceType: 'Wiring Installation',
            status: REQUEST_STATUS.REQUESTED,
            requestedDate: new Date('2024-12-25'),
            timeSlot: '09:00-12:00',
            description: 'Need electrical wiring for new room',
            createdAt: new Date()
        },
        {
            id: '2',
            providerId: '2',
            providerName: 'Ali Hassan',
            serviceType: 'Pipe Repair',
            status: REQUEST_STATUS.CONFIRMED,
            requestedDate: new Date('2024-12-22'),
            timeSlot: '14:00-16:00',
            description: 'Kitchen sink leaking',
            createdAt: new Date(Date.now() - 86400000)
        },
        {
            id: '3',
            providerId: '3',
            providerName: 'Sara Ahmed',
            serviceType: 'Math Tutoring',
            status: REQUEST_STATUS.COMPLETED,
            requestedDate: new Date('2024-12-15'),
            timeSlot: '16:00-18:00',
            description: 'O-Level math prep',
            createdAt: new Date(Date.now() - 172800000)
        }
    ];

    const handleCancelled = () => {
        setCancelModal(null);
        fetchRequests();
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            [REQUEST_STATUS.REQUESTED]: { label: 'Pending', class: 'status-pending' },
            [REQUEST_STATUS.CONFIRMED]: { label: 'Confirmed', class: 'status-confirmed' },
            [REQUEST_STATUS.COMPLETED]: { label: 'Completed', class: 'status-completed' },
            [REQUEST_STATUS.PAID]: { label: 'Paid', class: 'status-paid' },
            [REQUEST_STATUS.CANCELLED]: { label: 'Cancelled', class: 'status-cancelled' },
            [REQUEST_STATUS.EXPIRED]: { label: 'Expired', class: 'status-expired' }
        };
        return statusConfig[status] || { label: status, class: '' };
    };

    const getCategoryIcon = (serviceType) => {
        const category = SERVICE_CATEGORIES.find(c =>
            serviceType?.toLowerCase().includes(c.id) ||
            serviceType?.toLowerCase().includes(c.name.toLowerCase())
        );
        return category?.icon || '🛠️';
    };

    const filteredRequests = activeTab === 'all'
        ? requests
        : requests.filter(r => r.status === activeTab);

    const tabs = [
        { id: 'all', label: 'All' },
        { id: REQUEST_STATUS.REQUESTED, label: 'Pending' },
        { id: REQUEST_STATUS.CONFIRMED, label: 'Confirmed' },
        { id: REQUEST_STATUS.COMPLETED, label: 'Completed' },
        { id: REQUEST_STATUS.CANCELLED, label: 'Cancelled' }
    ];

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header">
                    <h1>My Requests</h1>
                    <p>Track and manage your service requests</p>
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
                            <span className="tab-count">
                                {tab.id === 'all'
                                    ? requests.length
                                    : requests.filter(r => r.status === tab.id).length}
                            </span>
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
                        <h3>No requests found</h3>
                        <p>You haven't made any service requests yet</p>
                        <Link to="/browse" className="btn btn-primary">Browse Providers</Link>
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
                                                src={getPlaceholderAvatar(request.providerName)}
                                                alt={request.providerName}
                                                className="provider-avatar"
                                            />
                                            <div>
                                                <h3>{request.providerName}</h3>
                                                <span className="service-type">
                                                    {getCategoryIcon(request.serviceType)} {request.serviceType}
                                                </span>
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
                                        {/* Chat button - only for active requests */}
                                        {[REQUEST_STATUS.REQUESTED, REQUEST_STATUS.CONFIRMED].includes(request.status) && (
                                            <Link to={`/chat/${request.id}`} className="btn btn-secondary">
                                                <FiMessageCircle /> Chat
                                            </Link>
                                        )}

                                        {/* Cancel button - only for pending/confirmed */}
                                        {[REQUEST_STATUS.REQUESTED, REQUEST_STATUS.CONFIRMED].includes(request.status) && (
                                            <button
                                                className="btn btn-danger-outline"
                                                onClick={() => setCancelModal(request)}
                                            >
                                                <FiX /> Cancel
                                            </button>
                                        )}

                                        {/* Review button - only for completed without review */}
                                        {(request.status === REQUEST_STATUS.COMPLETED || request.status === REQUEST_STATUS.PAID) && !request.hasReview && (
                                            <button
                                                className="btn btn-primary-outline"
                                                onClick={() => setReviewModal(request)}
                                            >
                                                <FiStar /> Leave Review
                                            </button>
                                        )}

                                        {/* Already reviewed */}
                                        {request.hasReview && (
                                            <span className="reviewed-badge">✓ Reviewed</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Cancel Confirmation Modal */}
                {cancelModal && (
                    <CancellationModal
                        request={cancelModal}
                        onClose={() => setCancelModal(null)}
                        onCancelled={handleCancelled}
                        isProvider={false}
                    />
                )}

                {/* Review Modal */}
                {reviewModal && (
                    <ReviewModal
                        request={reviewModal}
                        onClose={() => setReviewModal(null)}
                        onReviewed={() => {
                            setReviewModal(null);
                            fetchRequests();
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
