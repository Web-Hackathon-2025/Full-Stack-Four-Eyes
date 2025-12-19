import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { FiX, FiStar } from 'react-icons/fi';
import './ReviewModal.css';

const ReviewModal = ({ request, onClose, onReviewed }) => {
    const { user, userData } = useAuth();
    const { sendNotification } = useNotifications();

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmitReview = async () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Add review to reviews collection
            await addDoc(collection(db, 'reviews'), {
                providerId: request.providerId,
                customerId: user.uid,
                customerName: userData?.name || 'Customer',
                requestId: request.id,
                serviceType: request.serviceType,
                rating,
                comment: comment.trim(),
                createdAt: serverTimestamp()
            });

            // Update provider's rating stats
            const providerRef = doc(db, 'providers', request.providerId);
            await updateDoc(providerRef, {
                totalReviews: increment(1),
                totalRatingSum: increment(rating)
            });

            // Mark request as reviewed
            await updateDoc(doc(db, 'requests', request.id), {
                hasReview: true
            });

            // Notify provider
            await sendNotification(request.providerId, {
                type: 'review',
                message: `${userData?.name} left you a ${rating}-star review!`,
                requestId: request.id
            });

            onReviewed();
        } catch (error) {
            console.error('Error submitting review:', error);
            setError('Failed to submit review. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content review-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FiX />
                </button>

                <div className="review-header">
                    <h2>Rate Your Experience</h2>
                    <p>How was your service with <strong>{request.providerName}</strong>?</p>
                </div>

                {/* Star Rating */}
                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            <FiStar />
                        </button>
                    ))}
                </div>

                <p className="rating-label">
                    {rating === 0 && 'Tap a star to rate'}
                    {rating === 1 && '⭐ Poor'}
                    {rating === 2 && '⭐⭐ Fair'}
                    {rating === 3 && '⭐⭐⭐ Good'}
                    {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                    {rating === 5 && '⭐⭐⭐⭐⭐ Excellent!'}
                </p>

                {/* Comment */}
                <div className="form-group">
                    <label className="form-label">Your Review (Optional)</label>
                    <textarea
                        className="form-textarea"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share details of your experience..."
                        rows={4}
                    />
                </div>

                {error && <p className="error-text">{error}</p>}

                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmitReview}
                        disabled={loading || rating === 0}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
