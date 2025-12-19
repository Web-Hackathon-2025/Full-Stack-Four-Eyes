// Cancellation utilities for penalty calculation
import { CANCELLATION_TYPE, REQUEST_STATUS } from '../config/constants';

/**
 * Calculate days until the scheduled service date
 * @param {Date} scheduledDate - The scheduled service date
 * @returns {number} - Days until service (negative if passed)
 */
export const getDaysUntilService = (scheduledDate) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const serviceDate = new Date(scheduledDate);
    serviceDate.setHours(0, 0, 0, 0);

    const diffTime = serviceDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Calculate ban duration based on cancellation timing
 * @param {Date} scheduledDate - The scheduled service date
 * @param {string} cancellationType - 'mutual_agreement' or 'without_agreement'
 * @returns {number} - Ban duration in days (0 = no ban)
 */
export const calculateBanDuration = (scheduledDate, cancellationType) => {
    // No penalty for mutual agreement
    if (cancellationType === CANCELLATION_TYPE.MUTUAL_AGREEMENT) {
        return 0;
    }

    const daysUntil = getDaysUntilService(scheduledDate);

    // Penalty rules for unilateral cancellation
    if (daysUntil >= 2) {
        return 0; // 2+ days before: No penalty
    } else if (daysUntil === 1) {
        return 1; // 1 day before: 1 day ban
    } else {
        return 2; // Same day or past: 2 day ban
    }
};

/**
 * Calculate the ban end date
 * @param {number} banDays - Number of days to ban
 * @returns {Date|null} - Ban end date or null if no ban
 */
export const calculateBanEndDate = (banDays) => {
    if (banDays <= 0) return null;

    const banEnd = new Date();
    banEnd.setDate(banEnd.getDate() + banDays);
    banEnd.setHours(23, 59, 59, 999);

    return banEnd;
};

/**
 * Determine reliability badge change based on cancel count
 * @param {number} currentCancelCount - Current cancellation count
 * @returns {object} - { shouldWarn: boolean, shouldBan: boolean, message: string }
 */
export const checkCancellationThreshold = (currentCancelCount) => {
    const newCount = currentCancelCount + 1;

    if (newCount >= 5) {
        return {
            shouldWarn: true,
            shouldBan: true,
            message: 'You have been temporarily banned due to too many cancellations (5+).'
        };
    } else if (newCount >= 3) {
        return {
            shouldWarn: true,
            shouldBan: false,
            message: 'Warning: You have 3+ cancellations. Your reliability badge has been affected.'
        };
    }

    return {
        shouldWarn: false,
        shouldBan: false,
        message: null
    };
};

/**
 * Format ban end date for display
 * @param {Date} banEndDate - The ban end date
 * @returns {string} - Formatted date string
 */
export const formatBanEndDate = (banEndDate) => {
    if (!banEndDate) return '';

    const date = new Date(banEndDate);
    return date.toLocaleDateString('en-PK', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Check if user is currently banned
 * @param {Date|null} bannedUntil - Ban end date from user data
 * @returns {boolean}
 */
export const isUserBanned = (bannedUntil) => {
    if (!bannedUntil) return false;

    const banEnd = bannedUntil.toDate ? bannedUntil.toDate() : new Date(bannedUntil);
    return banEnd > new Date();
};

/**
 * Get cancellation type options for UI
 * @param {boolean} isProvider - Is the cancelling party a provider
 * @returns {Array} - Options for cancellation type selection
 */
export const getCancellationOptions = (isProvider) => {
    return [
        {
            value: CANCELLATION_TYPE.MUTUAL_AGREEMENT,
            label: 'Mutual Agreement',
            description: 'Both parties agree to cancel. No penalties apply.',
            icon: '🤝'
        },
        {
            value: CANCELLATION_TYPE.WITHOUT_AGREEMENT,
            label: isProvider ? 'I cannot complete this request' : 'I no longer need this service',
            description: 'One-sided cancellation. Penalties may apply based on timing.',
            icon: '⚠️'
        }
    ];
};
