import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { ref, push, onValue, serverTimestamp, off } from 'firebase/database';
import { db, realtimeDb } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { getPlaceholderAvatar } from '../utils/uploadHelper';
import { FiSend, FiArrowLeft, FiUser, FiClock } from 'react-icons/fi';
import './Chat.css';

const Chat = () => {
    const { requestId } = useParams();
    const { user, userData } = useAuth();
    const navigate = useNavigate();

    const [request, setRequest] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Load request details
    useEffect(() => {
        const loadRequest = async () => {
            try {
                const requestDoc = await getDoc(doc(db, 'requests', requestId));
                if (requestDoc.exists()) {
                    const requestData = { id: requestDoc.id, ...requestDoc.data() };
                    setRequest(requestData);

                    // Determine the other user
                    const isCustomer = user.uid === requestData.customerId;
                    setOtherUser({
                        id: isCustomer ? requestData.providerId : requestData.customerId,
                        name: isCustomer ? requestData.providerName : requestData.customerName,
                        role: isCustomer ? 'Provider' : 'Customer'
                    });
                } else {
                    // Demo request
                    setRequest({
                        id: requestId,
                        customerId: 'demo-customer',
                        providerId: 'demo-provider',
                        customerName: 'Ali Ahmed',
                        providerName: 'Ahmed Khan',
                        serviceType: 'Electrical Wiring',
                        status: 'confirmed'
                    });
                    setOtherUser({
                        id: 'demo',
                        name: userData?.role === 'customer' ? 'Ahmed Khan' : 'Ali Ahmed',
                        role: userData?.role === 'customer' ? 'Provider' : 'Customer'
                    });
                }
            } catch (error) {
                console.error('Error loading request:', error);
                // Set demo data
                setRequest({ id: requestId, serviceType: 'Service Request' });
                setOtherUser({ name: 'User', role: 'User' });
            } finally {
                setLoading(false);
            }
        };

        loadRequest();
    }, [requestId, user?.uid, userData?.role]);

    // Listen to messages
    useEffect(() => {
        if (!requestId) return;

        const messagesRef = ref(realtimeDb, `chats/${requestId}/messages`);

        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const messageList = Object.entries(data)
                    .map(([id, msg]) => ({ id, ...msg }))
                    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                setMessages(messageList);
            } else {
                setMessages([]);
            }
        });

        return () => off(messagesRef);
    }, [requestId]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const messagesRef = ref(realtimeDb, `chats/${requestId}/messages`);
            await push(messagesRef, {
                senderId: user.uid,
                senderName: userData?.name || 'User',
                text: newMessage.trim(),
                timestamp: Date.now()
            });
            setNewMessage('');
            inputRef.current?.focus();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        }
        return date.toLocaleDateString();
    };

    // Group messages by date
    const groupedMessages = messages.reduce((groups, message) => {
        const dateKey = formatDate(message.timestamp);
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(message);
        return groups;
    }, {});

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading chat...</p>
            </div>
        );
    }

    return (
        <div className="chat-page">
            {/* Header */}
            <div className="chat-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FiArrowLeft />
                </button>

                <div className="chat-user-info">
                    <img
                        src={getPlaceholderAvatar(otherUser?.name)}
                        alt={otherUser?.name}
                        className="chat-avatar"
                    />
                    <div>
                        <h2>{otherUser?.name}</h2>
                        <span className="chat-role">{otherUser?.role} • {request?.serviceType}</span>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <FiUser size={48} />
                        <h3>Start the conversation</h3>
                        <p>Send a message to discuss your service request</p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date} className="message-group">
                            <div className="date-divider">
                                <span>{date}</span>
                            </div>

                            {msgs.map((message) => {
                                const isOwn = message.senderId === user?.uid;
                                return (
                                    <div
                                        key={message.id}
                                        className={`message ${isOwn ? 'own' : 'other'}`}
                                    >
                                        <div className="message-bubble">
                                            {!isOwn && (
                                                <span className="message-sender">{message.senderName}</span>
                                            )}
                                            <p>{message.text}</p>
                                            <span className="message-time">
                                                <FiClock size={10} />
                                                {formatTime(message.timestamp)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form className="chat-input-container" onSubmit={handleSendMessage}>
                <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="chat-input"
                    disabled={sending}
                />
                <button
                    type="submit"
                    className="send-btn"
                    disabled={!newMessage.trim() || sending}
                >
                    <FiSend />
                </button>
            </form>
        </div>
    );
};

export default Chat;
