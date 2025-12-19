import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data from Firestore
    const fetchUserData = async (uid) => {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            setUserData({ id: uid, ...userDoc.data() });
        }
        return userDoc.data();
    };

    // Listen to auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await fetchUserData(firebaseUser.uid);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Sign up with email
    const signup = async (email, password, name, role = 'customer', region = '') => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Create user document
        await setDoc(doc(db, 'users', uid), {
            email,
            name,
            role,
            region,
            phone: '',
            cancelCount: 0,
            bannedUntil: null,
            activeRequestCount: 0,
            createdAt: serverTimestamp()
        });

        await fetchUserData(uid);
        return userCredential.user;
    };

    // Sign in with email
    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await fetchUserData(userCredential.user.uid);
        return userCredential.user;
    };

    // Google sign in
    const signInWithGoogle = async (role = 'customer') => {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        const uid = userCredential.user.uid;

        // Check if user exists
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', uid), {
                email: userCredential.user.email,
                name: userCredential.user.displayName || 'User',
                role,
                region: '',
                phone: '',
                cancelCount: 0,
                bannedUntil: null,
                activeRequestCount: 0,
                createdAt: serverTimestamp()
            });
        }

        await fetchUserData(uid);
        return userCredential.user;
    };

    // Logout
    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setUserData(null);
    };

    // Check if user is banned
    const isBanned = () => {
        if (!userData?.bannedUntil) return false;
        return new Date(userData.bannedUntil.toDate()) > new Date();
    };

    // Check user role
    const isProvider = () => userData?.role === 'provider';
    const isAdmin = () => userData?.role === 'admin';
    const isCustomer = () => userData?.role === 'customer';

    const value = {
        user,
        userData,
        loading,
        signup,
        login,
        signInWithGoogle,
        logout,
        fetchUserData,
        isBanned,
        isProvider,
        isAdmin,
        isCustomer
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
