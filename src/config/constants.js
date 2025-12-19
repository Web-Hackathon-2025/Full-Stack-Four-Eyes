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

// Regions/Cities
export const REGIONS = [
    'Karachi',
    'Lahore',
    'Islamabad',
    'Rawalpindi',
    'Faisalabad',
    'Multan',
    'Peshawar',
    'Quetta',
    'Hyderabad',
    'Sialkot'
];

// Request statuses
export const REQUEST_STATUS = {
    REQUESTED: 'requested',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
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
