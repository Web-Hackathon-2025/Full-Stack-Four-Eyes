// Service categories for Karigar
export const SERVICE_CATEGORIES = [
    { id: 'plumber', name: 'Plumber', icon: '🔧', description: 'Pipe repair, installation, leaks' },
    { id: 'electrician', name: 'Electrician', icon: '⚡', description: 'Wiring, fixtures, repairs' },
    { id: 'tutor', name: 'Tutor', icon: '📚', description: 'Academic, skills training' },
    { id: 'cleaner', name: 'Cleaner', icon: '🧹', description: 'Home, office cleaning' },
    { id: 'technician', name: 'Technician', icon: '💻', description: 'Computer, appliance repair' },
    { id: 'carpenter', name: 'Carpenter', icon: '🪚', description: 'Furniture, fixtures' },
    { id: 'painter', name: 'Painter', icon: '🎨', description: 'Home, office painting' },
    { id: 'mechanic', name: 'Mechanic', icon: '🔩', description: 'Vehicle repair, maintenance' }
];

// Locations: City → Districts
// 'City Square' is the default district for all cities
// You can add more districts per city as needed
export const LOCATIONS = {
    'Karachi': ['City Square'],
    'Lahore': ['City Square'],
    'Islamabad': ['City Square'],
    'Rawalpindi': ['City Square'],
    'Faisalabad': ['City Square'],
    'Multan': ['City Square'],
    'Peshawar': ['City Square'],
    'Quetta': ['City Square'],
    'Hyderabad': ['City Square'],
    'Sialkot': ['City Square']
};

// Get all cities
export const CITIES = Object.keys(LOCATIONS);

// Get districts for a city
export const getDistricts = (city) => LOCATIONS[city] || [];

// Legacy support - flat list of regions (city names)
export const REGIONS = CITIES;

// Request statuses
export const REQUEST_STATUS = {
    REQUESTED: 'requested',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    PAID: 'paid',           // Cash payment confirmed
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'      // No response within 24 hours
};

// Cancellation types
export const CANCELLATION_TYPE = {
    MUTUAL_AGREEMENT: 'mutual_agreement',
    WITHOUT_AGREEMENT: 'without_agreement'
};

// Penalty rules (in days)
export const PENALTY_RULES = {
    TWO_DAYS_BEFORE: 0,    // No penalty
    ONE_DAY_BEFORE: 1,     // 1 day ban
    SAME_DAY: 2            // 2 day ban
};

// Max active requests per customer
export const MAX_ACTIVE_REQUESTS = 3;

// Availability days
export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Time slots
export const TIME_SLOTS = [
    '08:00-10:00',
    '10:00-12:00',
    '12:00-14:00',
    '14:00-16:00',
    '16:00-18:00',
    '18:00-20:00'
];
