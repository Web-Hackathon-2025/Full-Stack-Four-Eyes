import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { SERVICE_CATEGORIES, REGIONS } from '../config/constants';
import ProviderCard from '../components/ProviderCard';
import { FiSearch, FiMapPin, FiFilter } from 'react-icons/fi';
import './Browse.css';

const Browse = () => {
    const [searchParams] = useSearchParams();
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        region: searchParams.get('region') || '',
        search: searchParams.get('q') || ''
    });

    useEffect(() => {
        fetchProviders();
    }, [filters]);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            let q = query(
                collection(db, 'providers'),
                where('isApproved', '==', true)
            );

            // Add category filter
            if (filters.category) {
                q = query(q, where('category', '==', filters.category));
            }

            // Add region filter
            if (filters.region) {
                q = query(q, where('region', '==', filters.region));
            }

            const snapshot = await getDocs(q);
            const providersList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Client-side search filter
            let filtered = providersList;
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filtered = providersList.filter(p =>
                    p.name?.toLowerCase().includes(searchLower) ||
                    p.description?.toLowerCase().includes(searchLower) ||
                    p.services?.some(s => s.toLowerCase().includes(searchLower))
                );
            }

            setProviders(filtered);
        } catch (error) {
            console.error('Error fetching providers:', error);
            // For demo, show some sample data if no real data
            setProviders(getSampleProviders());
        } finally {
            setLoading(false);
        }
    };

    // Sample data for demo purposes
    const getSampleProviders = () => [
        {
            id: '1',
            name: 'Ahmed Khan',
            category: 'electrician',
            region: 'Karachi',
            description: 'Professional electrician with 10+ years experience',
            services: ['Wiring', 'Fixtures', 'Repairs'],
            avgRating: 4.8,
            totalReviews: 24,
            cancelCount: 0,
            availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], timeSlots: ['09:00-12:00', '14:00-18:00'] }
        },
        {
            id: '2',
            name: 'Ali Hassan',
            category: 'plumber',
            region: 'Karachi',
            description: 'Expert plumber for all your needs',
            services: ['Pipe Repair', 'Installation', 'Leaks'],
            avgRating: 4.5,
            totalReviews: 18,
            cancelCount: 1,
            availability: { days: ['Mon', 'Wed', 'Fri'], timeSlots: ['10:00-12:00', '14:00-16:00'] }
        },
        {
            id: '3',
            name: 'Sara Ahmed',
            category: 'tutor',
            region: 'Lahore',
            description: 'Mathematics and Science tutor',
            services: ['Math', 'Physics', 'Chemistry'],
            avgRating: 4.9,
            totalReviews: 42,
            cancelCount: 0,
            availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], timeSlots: ['14:00-18:00'] }
        },
        {
            id: '4',
            name: 'Fatima Malik',
            category: 'cleaner',
            region: 'Islamabad',
            description: 'Professional home cleaning services',
            services: ['Deep Clean', 'Regular Clean', 'Office Clean'],
            avgRating: 4.7,
            totalReviews: 31,
            cancelCount: 0,
            availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], timeSlots: ['08:00-12:00'] }
        }
    ];

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const getCategoryName = (id) => {
        const cat = SERVICE_CATEGORIES.find(c => c.id === id);
        return cat ? cat.name : 'All Services';
    };

    return (
        <div className="browse-page">
            <div className="container">
                {/* Header */}
                <div className="browse-header">
                    <h1>
                        {filters.category ? getCategoryName(filters.category) : 'All Service Providers'}
                        {filters.region && ` in ${filters.region}`}
                    </h1>
                    <p>{providers.length} providers found</p>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="filter-group">
                        <FiSearch className="filter-icon" />
                        <input
                            type="text"
                            placeholder="Search providers..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-group">
                        <FiFilter className="filter-icon" />
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Categories</option>
                            {SERVICE_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <FiMapPin className="filter-icon" />
                        <select
                            value={filters.region}
                            onChange={(e) => handleFilterChange('region', e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All Regions</option>
                            {REGIONS.map(region => (
                                <option key={region} value={region}>{region}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading providers...</p>
                    </div>
                ) : providers.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">🔍</span>
                        <h3>No providers found</h3>
                        <p>Try adjusting your filters or search in a different area</p>
                    </div>
                ) : (
                    <div className="providers-grid">
                        {providers.map(provider => (
                            <ProviderCard key={provider.id} provider={provider} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Browse;
