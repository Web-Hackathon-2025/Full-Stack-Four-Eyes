import { useState } from 'react';
import { doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { REQUEST_STATUS, CANCELLATION_TYPE } from '../config/constants';
import {
    calculateBanDuration,
    calculateBanEndDate,
    checkCancellationThreshold,
    getCancellationOptions,
    getDaysUntilService
} from '../utils/cancellationHelper';
import { FiX, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import './CancellationModal.css';

const CancellationModal = ({ request, onClose, onCancelled, isProvider = false }) => {
    const { user, userData } = useAuth();
    const { sendNotification } = useNotifications();

    const [cancellationType, setCancellationType] = useState(CANCELLATION_TYPE.MUTUAL_AGREEMENT);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = select type, 2 = confirm

    const daysUntil = getDaysUntilService(request.requestedDate);
    const potentialBan = calculateBanDuration(request.requestedDate, CANCELLATION_TYPE.WITHOUT_AGREEMENT);
    const options = getCancellationOptions(isProvider);

    const handleConfirmCancellation = async () => {
        setLoading(true);
        try {
            const cancelledBy = isProvider ? 'provider' : 'customer';
            const otherUserId = isProvider ? request.customerId : request.providerId;
            const otherUserName = isProvider ? request.customerName : request.providerName;

            // Calculate penalty
            const banDays = calculateBanDuration(request.requestedDate, cancellationType);
            const banEndDate = calculateBanEndDate(banDays);

            // Update request
            await updateDoc(doc(db, 'requests', request.id), {
                status: REQUEST_STATUS.CANCELLED,
                cancelledBy,
                cancellationType,
                cancelledAt: serverTimestamp()
            });

            // Update cancelling user's cancel count
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                cancelCount: increment(1),
                activeRequestCount: increment(-1)
            });

            // Apply ban if applicable
            if (banEndDate) {
                await updateDoc(userRef, {
                    bannedUntil: banEndDate
                });
            }

            // Check thresholds for the provider (affects reliability)
            if (isProvider) {
                const providerRef = doc(db, 'providers', user.uid);
                await updateDoc(providerRef, {
                    cancelCount: increment(1)
                });
            }

            // Also decrement the other user's active request count
            await updateDoc(doc(db, 'users', otherUserId), {
                activeRequestCount: increment(-1)
            });

            // Notify the other party
            await sendNotification(otherUserId, {
                type: 'cancellation',
                message: `${userData?.name} cancelled the service request${banDays > 0 ? '' : ' (mutual agreement)'}`,
                requestId: request.id
            });

            onCancelled();
        } catch (error) {
            console.error('Error cancelling request:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content cancellation-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FiX />
                </button>

                {step === 1 ? (
                    <>
                        <FiAlertTriangle className="modal-icon warning" />
                        <h2>Cancel Request</h2>
                        <p className="modal-subtitle">How would you like to cancel this request?</p>

                        <div className="cancellation-options">
                            {options.map(option => (
                                <label
                                    key={option.value}
                                    className={`cancellation-option ${cancellationType === option.value ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="cancellationType"
                                        value={option.value}
                                        checked={cancellationType === option.value}
                                        onChange={(e) => setCancellationType(e.target.value)}
                                    />
                                    <div className="option-content">
                                        <span className="option-icon">{option.icon}</span>
                                        <div>
                                            <strong>{option.label}</strong>
                                            <p>{option.description}</p>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {cancellationType === CANCELLATION_TYPE.WITHOUT_AGREEMENT && (
                            <div className="penalty-warning">
                                <FiAlertTriangle />
                                <div>
                                    <strong>Penalty Notice</strong>
                                    <p>
                                        Service is scheduled in {daysUntil} day(s).
                                        {potentialBan > 0
                                            ? ` You will be banned for ${potentialBan} day(s).`
                                            : ' No penalty will apply.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={onClose}>
                                Keep Request
                            </button>
                            <button className="btn btn-warning" onClick={() => setStep(2)}>
                                Continue
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <FiAlertTriangle className="modal-icon danger" />
                        <h2>Confirm Cancellation</h2>
                        <p className="modal-subtitle">
                            Are you sure you want to cancel your request with{' '}
                            <strong>{isProvider ? request.customerName : request.providerName}</strong>?
                        </p>

                        <div className="cancellation-summary">
                            <div className="summary-item">
                                <span>Type:</span>
                                <strong>
                                    {cancellationType === CANCELLATION_TYPE.MUTUAL_AGREEMENT
                                        ? '🤝 Mutual Agreement'
                                        : '⚠️ Without Agreement'}
                                </strong>
                            </div>
                            <div className="summary-item">
                                <span>Service:</span>
                                <strong>{request.serviceType}</strong>
                            </div>
                            {potentialBan > 0 && cancellationType === CANCELLATION_TYPE.WITHOUT_AGREEMENT && (
                                <div className="summary-item warning">
                                    <span>Penalty:</span>
                                    <strong>{potentialBan} day ban</strong>
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={() => setStep(1)}>
                                Go Back
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleConfirmCancellation}
                                disabled={loading}
                            >
                                {loading ? 'Cancelling...' : 'Yes, Cancel Request'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default CancellationModal;
