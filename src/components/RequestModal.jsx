import { useState } from 'react';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { REQUEST_STATUS, MAX_ACTIVE_REQUESTS, TIME_SLOTS } from '../config/constants';
import { FiX, FiCalendar, FiClock, FiFileText, FiAlertCircle } from 'react-icons/fi';
import './RequestModal.css';

const RequestModal = ({ provider, onClose, onSuccess }) => {
    const { user, userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        serviceType: provider.services?.[0]?.name || provider.services?.[0] || '',
        requestedDate: '',
        timeSlot: provider.availability?.timeSlots?.[0] || '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.requestedDate) {
            setError('Please select a date');
            return false;
        }
        if (!formData.description.trim()) {
            setError('Please describe your service needs');
            return false;
        }

        // Check if date is on an available day
        const date = new Date(formData.requestedDate);
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
        if (!provider.availability?.days?.includes(dayName)) {
            setError(`Provider is not available on ${dayName}. Please choose another day.`);
            return false;
        }

        // Check max active requests
        if (userData?.activeRequestCount >= MAX_ACTIVE_REQUESTS) {
            setError(`You can only have ${MAX_ACTIVE_REQUESTS} active requests at a time.`);
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Create service request
            await addDoc(collection(db, 'requests'), {
                customerId: user.uid,
                customerName: userData?.name || 'Customer',
                providerId: provider.id,
                providerName: provider.name,
                status: REQUEST_STATUS.REQUESTED,
                serviceType: formData.serviceType,
                requestedDate: new Date(formData.requestedDate),
                timeSlot: formData.timeSlot,
                description: formData.description,
                cancelledBy: null,
                cancellationType: null,
                cancelledAt: null,
                createdAt: serverTimestamp()
            });

            // Increment active request count
            await updateDoc(doc(db, 'users', user.uid), {
                activeRequestCount: increment(1)
            });

            onSuccess();
        } catch (error) {
            console.error('Error creating request:', error);
            setError('Failed to submit request. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Get min date (today)
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FiX />
                </button>

                <h2>Request Service</h2>
                <p className="modal-subtitle">from {provider.name}</p>

                {error && (
                    <div className="modal-error">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <FiFileText /> Service Type
                        </label>
                        <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            {provider.services?.map((service, idx) => (
                                <option key={idx} value={service.name || service}>
                                    {service.name || service} {service.price && `- Rs. ${service.price}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                <FiCalendar /> Preferred Date
                            </label>
                            <input
                                type="date"
                                name="requestedDate"
                                value={formData.requestedDate}
                                onChange={handleChange}
                                min={today}
                                className="form-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <FiClock /> Time Slot
                            </label>
                            <select
                                name="timeSlot"
                                value={formData.timeSlot}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                {(provider.availability?.timeSlots || TIME_SLOTS).map((slot, idx) => (
                                    <option key={idx} value={slot}>{slot}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe what you need help with..."
                            className="form-textarea"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="modal-info">
                        <p>📋 After submitting, you can chat with the provider to discuss details.</p>
                        <p>⏰ The provider will confirm or reschedule within 24 hours.</p>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestModal;
