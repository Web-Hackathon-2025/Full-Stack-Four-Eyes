import { Link } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../config/constants';
import { FiMapPin, FiStar, FiClock, FiCheck, FiAlertTriangle, FiShield } from 'react-icons/fi';
import './ProviderCard.css';

const ProviderCard = ({ provider }) => {
    const getCategoryIcon = (categoryId) => {
        const cat = SERVICE_CATEGORIES.find(c => c.id === categoryId);
        return cat ? cat.icon : '🛠️';
    };

    const getCategoryName = (categoryId) => {
        const cat = SERVICE_CATEGORIES.find(c => c.id === categoryId);
        return cat ? cat.name : 'Service Provider';
    };

    // Compute reliability badge
    const getReliabilityBadge = () => {
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

    const reliabilityBadge = getReliabilityBadge();
    const isVerified = provider.verificationStatus === 'approved';

    const formatAvailability = () => {
        if (!provider.availability?.days?.length) return 'Contact for availability';
        const days = provider.availability.days.join(', ');
        return days;
    };

    return (
        <Link to={`/provider/${provider.id}`} className="provider-card">
            <div className="provider-header">
                <div className="provider-avatar">
                    {provider.photoURL ? (
                        <img src={provider.photoURL} alt={provider.name} />
                    ) : (
                        <span className="avatar-placeholder">
                            {provider.name?.charAt(0) || 'P'}
                        </span>
                    )}
                </div>
                <div className="provider-info">
                    <h3 className="provider-name">
                        {provider.name}
                        {isVerified && (
                            <span className="verified-badge" title="ID Verified">
                                <FiShield />
                            </span>
                        )}
                    </h3>
                    <span className="provider-category">
                        {getCategoryIcon(provider.category)} {getCategoryName(provider.category)}
                    </span>
                </div>
            </div>

            {reliabilityBadge && (
                <div className={`reliability-badge ${reliabilityBadge.class}`}>
                    {reliabilityBadge.icon}
                    <span>{reliabilityBadge.label}</span>
                </div>
            )}

            <p className="provider-description">{provider.description}</p>

            <div className="provider-services">
                {provider.services?.slice(0, 3).map((service, idx) => (
                    <span key={idx} className="service-tag">{service}</span>
                ))}
                {provider.services?.length > 3 && (
                    <span className="service-tag more">+{provider.services.length - 3}</span>
                )}
            </div>

            <div className="provider-meta">
                <div className="meta-item">
                    <FiMapPin />
                    <span>{provider.region}</span>
                </div>
                <div className="meta-item">
                    <FiClock />
                    <span>{formatAvailability()}</span>
                </div>
            </div>

            <div className="provider-footer">
                <div className="rating">
                    <FiStar className="star-icon" />
                    <span className="rating-value">{provider.avgRating?.toFixed(1) || 'New'}</span>
                    <span className="rating-count">({provider.totalReviews || 0} reviews)</span>
                </div>
                <span className="view-profile">View Profile →</span>
            </div>
        </Link>
    );
};

export default ProviderCard;
