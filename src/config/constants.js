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

// Detailed Locations: City → Zone → Areas
export const LOCATIONS = {
    'Lahore': {
        'DHA Lahore (Defence)': ['Phase 1-4', 'Phase 5', 'Phase 6', 'Phase 8 (Ex-Park View)'],
        'Gulberg Zone': ['Gulberg I-III', 'Model Town', 'Garden Town', 'Faisal Town'],
        'Iqbal Zone': ['Johar Town', 'Wapda Town', 'Township', 'Allama Iqbal Town'],
        'Bahria Town': ['Bahria Town Proper', 'Bahria Orchard']
    },
    'Islamabad': {
        'F-Series Sectors': ['F-6 (Super Market)', 'F-7 (Jinnah Super)', 'F-8', 'F-10', 'F-11'],
        'G-Series Sectors': ['G-6 (Aabpara)', 'G-10', 'G-11', 'G-13'],
        'Societies': ['Bahria Town ISB', 'DHA Islamabad', 'Gulberg Greens']
    },
    'Karachi': {
        'South District': ['DHA Karachi', 'Clifton', 'Saddar'],
        'East District': ['Gulshan-e-Iqbal', 'Gulistan-e-Johar', 'PECHS'],
        'Central District': ['North Nazimabad', 'Gulberg (F.B Area)', 'Nazimabad']
    },
    'Rawalpindi': {
        'City Center': ['City Center']
    },
    'Faisalabad': {
        'City Center': ['City Center']
    },
    'Multan': {
        'City Center': ['City Center']
    },
    'Peshawar': {
        'City Center': ['City Center']
    },
    'Quetta': {
        'City Center': ['City Center']
    },
    'Hyderabad': {
        'City Center': ['City Center']
    },
    'Sialkot': {
        'City Center': ['City Center']
    }
};

// Get all cities
export const CITIES = Object.keys(LOCATIONS);

// Get zones for a city
export const getZones = (city) => {
    if (!city || !LOCATIONS[city]) return [];
    return Object.keys(LOCATIONS[city]);
};

// Get areas for a city and zone
export const getAreas = (city, zone) => {
    if (!city || !zone || !LOCATIONS[city] || !LOCATIONS[city][zone]) return [];
    return LOCATIONS[city][zone];
};

// Legacy support - flat districts (for backwards compat)
export const getDistricts = (city) => getZones(city);
export const REGIONS = CITIES;

// Request statuses
export const REQUEST_STATUS = {
    REQUESTED: 'requested',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    PAID: 'paid',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired',
    PENDING_MUTUAL_CANCEL: 'pending_mutual_cancel'  // Waiting for other party to accept
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
