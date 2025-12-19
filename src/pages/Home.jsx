import { Link } from 'react-router-dom';
import { SERVICE_CATEGORIES, REGIONS } from '../config/constants';
import { useState } from 'react';
import { FiSearch, FiMapPin, FiArrowRight } from 'react-icons/fi';
import './Home.css';

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRegion, setSelectedRegion] = useState('');

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">
                        Find Trusted <span className="highlight">Karigar</span> Near You
                    </h1>
                    <p className="hero-subtitle">
                        Connect with skilled service providers in your area. Plumbers, electricians, tutors, and more.
                    </p>

                    {/* Search Box */}
                    <div className="search-box">
                        <div className="search-input-wrapper">
                            <FiSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="What service do you need?"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <div className="search-select-wrapper">
                            <FiMapPin className="search-icon" />
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                                className="search-select"
                            >
                                <option value="">All Regions</option>
                                {REGIONS.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>
                        <Link
                            to={`/browse?q=${searchQuery}&region=${selectedRegion}`}
                            className="btn btn-primary btn-lg"
                        >
                            Search
                        </Link>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <h2 className="section-title">Popular Services</h2>
                    <div className="categories-grid">
                        {SERVICE_CATEGORIES.map(category => (
                            <Link
                                key={category.id}
                                to={`/browse?category=${category.id}`}
                                className="category-card"
                            >
                                <span className="category-icon">{category.icon}</span>
                                <h3 className="category-name">{category.name}</h3>
                                <p className="category-desc">{category.description}</p>
                                <FiArrowRight className="category-arrow" />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <div className="steps-grid">
                        <div className="step">
                            <div className="step-number">1</div>
                            <h3>Search</h3>
                            <p>Find service providers by category and location</p>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <h3>Connect</h3>
                            <p>Chat with providers and discuss your requirements</p>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <h3>Book</h3>
                            <p>Submit a service request and get confirmation</p>
                        </div>
                        <div className="step">
                            <div className="step-number">4</div>
                            <h3>Review</h3>
                            <p>Rate your experience after service completion</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
