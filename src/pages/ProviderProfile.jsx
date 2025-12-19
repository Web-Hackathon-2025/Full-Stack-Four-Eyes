import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { SERVICE_CATEGORIES, DAYS_OF_WEEK } from '../config/constants';
import RequestModal from '../components/RequestModal';
import { FiMapPin, FiStar, FiClock, FiCheck, FiAlertTriangle, FiMessageCircle, FiCalendar } from 'react-icons/fi';
import './ProviderProfile.css';

const ProviderProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, userData, isBanned } = useAuth();

    const [provider, setProvider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchProvider();
    }, [id]);

    const fetchProvider = async () => {
        setLoading(true);
        try {
            const providerDoc = await getDoc(doc(db, 'providers', id));
            if (providerDoc.exists()) {
                setProvider({ id: providerDoc.id, ...providerDoc.data() });
            } else {
                // Demo data fallback
                setProvider(getSampleProvider());
            }
            // Fetch reviews would go here
            setReviews(getSampleReviews());
        } catch (error) {
            console.error('Error fetching provider:', error);
            setProvider(getSampleProvider());
            setReviews(getSampleReviews());
        } finally {
            setLoading(false);
        }
    };

    // Sample data for demo
    const getSampleProvider = () => ({
        id: id,
        name: 'Ahmed Khan',
        category: 'electrician',
        region: 'Karachi',
        phone: '+92 300 1234567',
        description: 'Professional electrician with over 10 years of experience. Specialized in residential and commercial electrical work, including wiring, fixture installation, and electrical repairs. Available for emergency services.',
        services: [
            { name: 'Wiring Installation', price: '5000-15000' },
            { name: 'Fixture Repair', price: '1000-3000' },
            { name: 'Panel Upgrade', price: '10000-25000' },
            { name: 'Emergency Repair', price: '2000-5000' }
        ],
        availability: {
            days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
            timeSlots: ['09:00-12:00', '14:00-18:00']
        },
        avgRating: 4.8,
        totalReviews: 24,
        cancelCount: 0,
        isApproved: true
    });

    const getSampleReviews = () => [
        { id: '1', customerName: 'Ali Ahmed', rating: 5, comment: 'Excellent work! Fixed all electrical issues quickly.', createdAt: new Date('2024-12-01') },
        { id: '2', customerName: 'Sara Khan', rating: 4, comment: 'Good service, arrived on time.', createdAt: new Date('2024-11-15') },
        { id: '3', customerName: 'Hassan Raza', rating: 5, comment: 'Very professional and knowledgeable.', createdAt: new Date('2024-11-01') }
    ];

    const getCategoryInfo = (categoryId) => {
        const cat = SERVICE_CATEGORIES.find(c => c.id === categoryId);
        return cat || { name: 'Service Provider', icon: '🛠️' };
    };

    const getReliabilityBadge = () => {
        if (!provider) return null;
        const { cancelCount = 0, avgRating = 0 } = provider;

        if (cancelCount === 0 && avgRating >= 4.5) {
            return { label: 'Highly Reliable', class: 'reliable-high', icon: <FiCheck /> };
        } else if (cancelCount <= 2 && avgRating >= 3.5) {
            return { label: 'Reliable', class: 'reliable-good', icon: <FiCheck /> };
        } else if (cancelCount >= 3 || avgRating < 3) {
            return { label: 'Review History', class: 'reliable-warning', icon: <FiAlertTriangle /> };
        }
        return null;
    };

    const handleRequestService = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (isBanned()) {
            alert('You are currently banned from making requests. Please try again later.');
            return;
        }
        setShowRequestModal(true);
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FiStar key={i} className={i < rating ? 'star filled' : 'star'} />
        ));
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading provider...</p>
            </div>
        );
    }

    if (!provider) {
        return (
            <div className="container">
                <div className="empty-state">
                    <h2>Provider not found</h2>
                    <button onClick={() => navigate('/browse')} className="btn btn-primary">
                        Browse Providers
                    </button>
                </div>
            </div>
        );
    }

    const categoryInfo = getCategoryInfo(provider.category);
    const reliabilityBadge = getReliabilityBadge();

    return (
        <div className="provider-profile-page">
            <div className="container">
                <div className="profile-grid">
                    {/* Main Content */}
                    <div className="profile-main">
                        {/* Header */}
                        <div className="profile-header card">
                            <div className="profile-avatar">
                                {provider.photoURL ? (
                                    <img src={provider.photoURL} alt={provider.name} />
                                ) : (
                                    <span className="avatar-placeholder">
                                        {provider.name?.charAt(0) || 'P'}
                                    </span>
                                )}
                            </div>
                            <div className="profile-info">
                                <h1>{provider.name}</h1>
                                <p className="profile-category">
                                    {categoryInfo.icon} {categoryInfo.name}
                                </p>
                                <div className="profile-meta">
                                    <span><FiMapPin /> {provider.region}</span>
                                    <span><FiStar className="star filled" /> {provider.avgRating?.toFixed(1)} ({provider.totalReviews} reviews)</span>
                                </div>
                                {reliabilityBadge && (
                                    <div className={`reliability-badge ${reliabilityBadge.class}`}>
                                        {reliabilityBadge.icon}
                                        <span>{reliabilityBadge.label}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* About */}
                        <div className="profile-section card">
                            <h2>About</h2>
                            <p>{provider.description}</p>
                        </div>

                        {/* Services */}
                        <div className="profile-section card">
                            <h2>Services & Pricing</h2>
                            <div className="services-list">
                                {provider.services?.map((service, idx) => (
                                    <div key={idx} className="service-item">
                                        <span className="service-name">{service.name || service}</span>
                                        {service.price && <span className="service-price">Rs. {service.price}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reviews */}
                        <div className="profile-section card">
                            <h2>Reviews ({reviews.length})</h2>
                            <div className="reviews-list">
                                {reviews.map(review => (
                                    <div key={review.id} className="review-item">
                                        <div className="review-header">
                                            <span className="reviewer-name">{review.customerName}</span>
                                            <div className="review-rating">{renderStars(review.rating)}</div>
                                        </div>
                                        <p className="review-comment">{review.comment}</p>
                                        <span className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <div className="booking-card card">
                            <h3>Request Service</h3>

                            <div className="availability-section">
                                <h4><FiCalendar /> Availability</h4>
                                <div className="days-grid">
                                    {DAYS_OF_WEEK.map(day => (
                                        <span
                                            key={day}
                                            className={`day-badge ${provider.availability?.days?.includes(day) ? 'available' : ''}`}
                                        >
                                            {day}
                                        </span>
                                    ))}
                                </div>
                                {provider.availability?.timeSlots && (
                                    <div className="time-slots">
                                        {provider.availability.timeSlots.map((slot, idx) => (
                                            <span key={idx} className="time-slot"><FiClock /> {slot}</span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleRequestService}
                                className="btn btn-primary btn-lg w-full"
                            >
                                Request Service
                            </button>

                            <p className="booking-note">
                                <FiMessageCircle /> You can chat with the provider after submitting a request
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            {showRequestModal && (
                <RequestModal
                    provider={provider}
                    onClose={() => setShowRequestModal(false)}
                    onSuccess={() => {
                        setShowRequestModal(false);
                        navigate('/dashboard');
                    }}
                />
            )}
        </div>
    );
};

export default ProviderProfile;
