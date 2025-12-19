import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { SERVICE_CATEGORIES, CITIES, getZones, getAreas, DAYS_OF_WEEK, TIME_SLOTS } from '../config/constants';
import { uploadProfileImage, getPlaceholderAvatar } from '../utils/uploadHelper';
import { FiUser, FiPhone, FiMapPin, FiCamera, FiPlus, FiX, FiCheck, FiShield, FiAlertCircle } from 'react-icons/fi';
import './ProviderSetup.css';

const ProviderSetup = () => {
    const { user, userData, fetchUserData } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        category: '',
        city: '',
        zone: '',
        area: '',
        description: '',
        services: [{ name: '', price: '' }],
        availability: { days: [], timeSlots: [] },
        photoURL: '',
        cnicFront: null,
        cnicBack: null,
        cnicFrontURL: '',
        cnicBackURL: ''
    });

    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingCnic, setUploadingCnic] = useState(false);

    useEffect(() => {
        loadProviderProfile();
    }, [user?.uid]);

    const loadProviderProfile = async () => {
        if (!user?.uid) return;
        setLoading(true);
        try {
            const providerDoc = await getDoc(doc(db, 'providers', user.uid));
            if (providerDoc.exists()) {
                const data = providerDoc.data();
                const regionParts = (data.region || '').split(', ');
                setFormData({
                    name: data.name || userData?.name || '',
                    phone: data.phone || '',
                    category: data.category || '',
                    city: regionParts[0] || '',
                    zone: regionParts[1] || '',
                    area: regionParts[2] || '',
                    description: data.description || '',
                    services: data.services?.length ? data.services : [{ name: '', price: '' }],
                    availability: data.availability || { days: [], timeSlots: [] },
                    photoURL: data.photoURL || '',
                    cnicFront: null,
                    cnicBack: null,
                    cnicFrontURL: data.cnicFrontURL || '',
                    cnicBackURL: data.cnicBackURL || ''
                });
            } else {
                // Pre-fill from user data
                setFormData(prev => ({
                    ...prev,
                    name: userData?.name || ''
                }));
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'city') {
            const zones = getZones(value);
            const firstZone = zones[0] || '';
            const areas = getAreas(value, firstZone);
            setFormData({
                ...formData,
                city: value,
                zone: firstZone,
                area: areas[0] || ''
            });
        } else if (name === 'zone') {
            const areas = getAreas(formData.city, value);
            setFormData({
                ...formData,
                zone: value,
                area: areas[0] || ''
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleServiceChange = (index, field, value) => {
        const newServices = [...formData.services];
        newServices[index] = { ...newServices[index], [field]: value };
        setFormData({ ...formData, services: newServices });
    };

    const addService = () => {
        setFormData({
            ...formData,
            services: [...formData.services, { name: '', price: '' }]
        });
    };

    const removeService = (index) => {
        const newServices = formData.services.filter((_, i) => i !== index);
        setFormData({ ...formData, services: newServices.length ? newServices : [{ name: '', price: '' }] });
    };

    const toggleDay = (day) => {
        const days = formData.availability.days.includes(day)
            ? formData.availability.days.filter(d => d !== day)
            : [...formData.availability.days, day];
        setFormData({
            ...formData,
            availability: { ...formData.availability, days }
        });
    };

    const toggleTimeSlot = (slot) => {
        const timeSlots = formData.availability.timeSlots.includes(slot)
            ? formData.availability.timeSlots.filter(s => s !== slot)
            : [...formData.availability.timeSlots, slot];
        setFormData({
            ...formData,
            availability: { ...formData.availability, timeSlots }
        });
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingPhoto(true);
        try {
            const url = await uploadProfileImage(file, user.uid);
            setFormData({ ...formData, photoURL: url });
        } catch (error) {
            setError(error.message);
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleCnicUpload = async (side, e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingCnic(true);
        try {
            const url = await uploadProfileImage(file, `${user.uid}/cnic_${side}`);
            if (side === 'front') {
                setFormData({ ...formData, cnicFrontURL: url });
            } else {
                setFormData({ ...formData, cnicBackURL: url });
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setUploadingCnic(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validation
        if (!formData.category) {
            setError('Please select a service category');
            return;
        }
        if (!formData.city || !formData.zone) {
            setError('Please select your location');
            return;
        }
        if (formData.availability.days.length === 0) {
            setError('Please select at least one available day');
            return;
        }
        if (formData.availability.timeSlots.length === 0) {
            setError('Please select at least one time slot');
            return;
        }

        setSaving(true);
        try {
            const region = formData.area
                ? `${formData.city}, ${formData.zone}, ${formData.area}`
                : `${formData.city}, ${formData.zone}`;
            const validServices = formData.services.filter(s => s.name.trim());

            const providerData = {
                userId: user.uid,
                name: formData.name,
                email: user.email,
                phone: formData.phone,
                category: formData.category,
                region,
                description: formData.description,
                services: validServices,
                availability: formData.availability,
                photoURL: formData.photoURL,
                cnicFrontURL: formData.cnicFrontURL,
                cnicBackURL: formData.cnicBackURL,
                isApproved: false, // Admin needs to approve
                isVerified: !!(formData.cnicFrontURL && formData.cnicBackURL), // Has CNIC uploaded
                verificationStatus: (formData.cnicFrontURL && formData.cnicBackURL) ? 'pending' : 'not_submitted',
                avgRating: 0,
                totalReviews: 0,
                cancelCount: 0,
                updatedAt: serverTimestamp()
            };

            // Check if exists
            const providerRef = doc(db, 'providers', user.uid);
            const existing = await getDoc(providerRef);

            if (existing.exists()) {
                await updateDoc(providerRef, providerData);
            } else {
                await setDoc(providerRef, {
                    ...providerData,
                    createdAt: serverTimestamp()
                });
            }

            setSuccess('Profile saved successfully!');
            await fetchUserData(user.uid);

            setTimeout(() => {
                navigate('/provider-dashboard');
            }, 1500);
        } catch (error) {
            console.error('Error saving profile:', error);
            setError('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const zones = formData.city ? getZones(formData.city) : [];
    const areas = (formData.city && formData.zone) ? getAreas(formData.city, formData.zone) : [];
    const categoryInfo = SERVICE_CATEGORIES.find(c => c.id === formData.category);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="provider-setup-page">
            <div className="container">
                <div className="setup-header">
                    <h1>Provider Profile Setup</h1>
                    <p>Complete your profile to start receiving service requests</p>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <FiCheck />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="setup-form">
                    {/* Profile Photo */}
                    <div className="form-section">
                        <h2>Profile Photo</h2>
                        <div className="photo-upload">
                            <div className="photo-preview">
                                <img
                                    src={formData.photoURL || getPlaceholderAvatar(formData.name)}
                                    alt="Profile"
                                />
                                {uploadingPhoto && <div className="upload-overlay">Uploading...</div>}
                            </div>
                            <label className="btn btn-secondary">
                                <FiCamera /> Upload Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    hidden
                                />
                            </label>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="form-section">
                        <h2>Basic Information</h2>

                        <div className="form-group">
                            <label className="form-label"><FiUser /> Full Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label"><FiPhone /> Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                className="form-input"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+92 300 1234567"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Service Category</label>
                            <div className="category-grid">
                                {SERVICE_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        className={`category-btn ${formData.category === cat.id ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, category: cat.id })}
                                    >
                                        <span className="cat-icon">{cat.icon}</span>
                                        <span>{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label"><FiMapPin /> City</label>
                                <select
                                    name="city"
                                    className="form-input"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select city</option>
                                    {CITIES.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Zone</label>
                                <select
                                    name="zone"
                                    className="form-input"
                                    value={formData.zone}
                                    onChange={handleChange}
                                    required
                                    disabled={!formData.city}
                                >
                                    <option value="">Select zone</option>
                                    {zones.map(zone => (
                                        <option key={zone} value={zone}>{zone}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {areas.length > 0 && (
                            <div className="form-group">
                                <label className="form-label">Area</label>
                                <select
                                    name="area"
                                    className="form-input"
                                    value={formData.area}
                                    onChange={handleChange}
                                >
                                    <option value="">Select area</option>
                                    {areas.map(area => (
                                        <option key={area} value={area}>{area}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">About You</label>
                            <textarea
                                name="description"
                                className="form-textarea"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your experience and services..."
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Services & Pricing */}
                    <div className="form-section">
                        <h2>Services & Pricing</h2>
                        <p className="section-desc">List the services you offer with their price ranges</p>

                        {formData.services.map((service, index) => (
                            <div key={index} className="service-row">
                                <input
                                    type="text"
                                    className="form-input"
                                    value={service.name}
                                    onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                                    placeholder="Service name (e.g., Pipe Repair)"
                                />
                                <input
                                    type="text"
                                    className="form-input price-input"
                                    value={service.price}
                                    onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                                    placeholder="Price range (e.g., 1000-3000)"
                                />
                                {formData.services.length > 1 && (
                                    <button
                                        type="button"
                                        className="btn-icon-danger"
                                        onClick={() => removeService(index)}
                                    >
                                        <FiX />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button type="button" className="btn btn-secondary" onClick={addService}>
                            <FiPlus /> Add Service
                        </button>
                    </div>

                    {/* Availability */}
                    <div className="form-section">
                        <h2>Availability</h2>

                        <div className="form-group">
                            <label className="form-label">Available Days</label>
                            <div className="days-selector">
                                {DAYS_OF_WEEK.map(day => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`day-btn ${formData.availability.days.includes(day) ? 'active' : ''}`}
                                        onClick={() => toggleDay(day)}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Time Slots</label>
                            <div className="time-slots-selector">
                                {TIME_SLOTS.map(slot => (
                                    <button
                                        key={slot}
                                        type="button"
                                        className={`slot-btn ${formData.availability.timeSlots.includes(slot) ? 'active' : ''}`}
                                        onClick={() => toggleTimeSlot(slot)}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CNIC Verification */}
                    <div className="form-section verification-section">
                        <h2><FiShield /> Identity Verification</h2>
                        <p className="section-desc">
                            Upload your CNIC (National ID) to get verified. Verified providers get more requests.
                            <br />
                            <span className="privacy-note">🔒 Your CNIC is only visible to admins for verification purposes.</span>
                        </p>

                        <div className="cnic-upload-grid">
                            <div className="cnic-upload-box">
                                <label className={`cnic-dropzone ${formData.cnicFrontURL ? 'uploaded' : ''}`}>
                                    {formData.cnicFrontURL ? (
                                        <>
                                            <FiCheck className="upload-success-icon" />
                                            <span>Front Side Uploaded</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiCamera />
                                            <span>CNIC Front</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleCnicUpload('front', e)}
                                        hidden
                                    />
                                </label>
                            </div>

                            <div className="cnic-upload-box">
                                <label className={`cnic-dropzone ${formData.cnicBackURL ? 'uploaded' : ''}`}>
                                    {formData.cnicBackURL ? (
                                        <>
                                            <FiCheck className="upload-success-icon" />
                                            <span>Back Side Uploaded</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiCamera />
                                            <span>CNIC Back</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleCnicUpload('back', e)}
                                        hidden
                                    />
                                </label>
                            </div>
                        </div>

                        {uploadingCnic && <p className="upload-status">Uploading...</p>}
                    </div>

                    {/* Submit */}
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProviderSetup;
