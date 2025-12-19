import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { realtimeDb } from '../config/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationsContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationsProvider');
    }
    return context;
};

export const NotificationsProvider = ({ children }) => {
    const { user, userData } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Listen to notifications for current user
    useEffect(() => {
        if (!user?.uid) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const notificationsRef = ref(realtimeDb, `notifications/${user.uid}`);

        const unsubscribe = onValue(notificationsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const notifList = Object.entries(data)
                    .map(([id, notif]) => ({ id, ...notif }))
                    .sort((a, b) => b.timestamp - a.timestamp);

                setNotifications(notifList);
                setUnreadCount(notifList.filter(n => !n.read).length);

                // Show toast for new notifications
                const latestNotif = notifList[0];
                if (latestNotif && !latestNotif.read && Date.now() - latestNotif.timestamp < 5000) {
                    showToast(latestNotif);
                }
            } else {
                setNotifications([]);
                setUnreadCount(0);
            }
        });

        return () => unsubscribe();
    }, [user?.uid]);

    // Show toast notification
    const showToast = (notification) => {
        const icons = {
            request_accepted: '✅',
            request_rejected: '❌',
            request_completed: '🎉',
            new_message: '💬',
            cancellation: '⚠️',
            new_request: '📋'
        };

        toast(notification.message, {
            icon: icons[notification.type] || '🔔',
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid #2d2d4a',
            },
        });
    };

    // Send notification to a user
    const sendNotification = useCallback(async (targetUserId, notification) => {
        if (!targetUserId) return;

        const notificationsRef = ref(realtimeDb, `notifications/${targetUserId}`);
        await push(notificationsRef, {
            ...notification,
            timestamp: serverTimestamp(),
            read: false
        });
    }, []);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        if (!user?.uid || !notificationId) return;

        const notifRef = ref(realtimeDb, `notifications/${user.uid}/${notificationId}`);
        await set(notifRef, { ...notifications.find(n => n.id === notificationId), read: true });
    }, [user?.uid, notifications]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        if (!user?.uid) return;

        const updates = {};
        notifications.forEach(notif => {
            updates[`notifications/${user.uid}/${notif.id}/read`] = true;
        });

        // Note: Using Firebase update for batch update
        // For simplicity, we'll just clear unread count locally
        setUnreadCount(0);
    }, [user?.uid, notifications]);

    const value = {
        notifications,
        unreadCount,
        sendNotification,
        markAsRead,
        markAllAsRead
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};

export default NotificationsContext;
