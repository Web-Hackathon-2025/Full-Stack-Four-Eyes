import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CITIES, getZones, getAreas } from '../config/constants';
import { FiMail, FiLock, FiUser, FiMapPin, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import './Auth.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        city: '',
        zone: '',
        area: '',
        role: 'customer'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signup, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (formData.password.length < 6) {
            return setError('Password must be at least 6 characters');
        }

        setLoading(true);

        // Combine location: "City, Zone, Area"
        const region = formData.area
            ? `${formData.city}, ${formData.zone}, ${formData.area}`
            : `${formData.city}, ${formData.zone}`;

        try {
            await signup(formData.email, formData.password, formData.name, formData.role, region);
            if (formData.role === 'provider') {
                navigate('/provider-setup');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            await signInWithGoogle(formData.role);
            if (formData.role === 'provider') {
                navigate('/provider-setup');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Failed to sign in with Google');
        } finally {
            setLoading(false);
        }
    };

    const zones = formData.city ? getZones(formData.city) : [];
    const areas = (formData.city && formData.zone) ? getAreas(formData.city, formData.zone) : [];

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1>Create Account</h1>
                    <p>Join Karigar to find or offer services</p>
                </div>

                {error && (
                    <div className="auth-error">
                        <FiAlertCircle />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="role-selector">
                        <button
                            type="button"
                            className={`role-btn ${formData.role === 'customer' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'customer' })}
                        >
                            🔍 I'm looking for services
                        </button>
                        <button
                            type="button"
                            className={`role-btn ${formData.role === 'provider' ? 'active' : ''}`}
                            onClick={() => setFormData({ ...formData, role: 'provider' })}
                        >
                            🛠️ I'm a service provider
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-with-icon">
                            <FiUser className="input-icon" />
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-with-icon">
                            <FiMail className="input-icon" />
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    {/* Location: City → Zone → Area */}
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

                    {formData.city && (
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Zone</label>
                                <select
                                    name="zone"
                                    className="form-input"
                                    value={formData.zone}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select zone</option>
                                    {zones.map(zone => (
                                        <option key={zone} value={zone}>{zone}</option>
                                    ))}
                                </select>
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
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="input-with-icon">
                                <FiLock className="input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <div className="input-with-icon">
                                <FiLock className="input-icon" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    className="form-input"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or continue with</span>
                </div>

                <button onClick={handleGoogleSignIn} className="btn btn-secondary btn-lg w-full google-btn" disabled={loading}>
                    <FcGoogle size={20} />
                    <span>Google</span>
                </button>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
