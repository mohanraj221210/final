import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface Message {
    _id: string;
    text: string;
    from: string;
    to: string;
    createdAt: string;
    senderName?: string;
    isMe?: boolean;
}

interface Group {
    _id: string;
    groupname: string;
    members: string[];
    admin: string;
}

const StudentNotices: React.FC = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [group, setGroup] = useState<Group | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchCommunityAndMessages();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchCommunityAndMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("Authentication token missing");
                navigate('/login');
                return;
            }

            const groupRes = await axios.get(`${API_URL}/api/community/my-group`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const myGroup = groupRes.data.group;
            setGroup(myGroup);

            if (myGroup) {
                const messagesRes = await axios.get(`${API_URL}/api/messages/${myGroup._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessages(messagesRes.data.messages);

                initSocket(token, myGroup._id);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const initSocket = (token: string, groupId: string) => {
        socketRef.current = io(API_URL, {
            query: { token }
        });

        socketRef.current.on('connect', () => {
            console.log("Socket connected");
        });

        socketRef.current.on('group-message', (data: any) => {
            console.log("New message received:", data);
            const incomingMsg: Message = {
                _id: Date.now().toString(),
                text: data.message,
                from: data.from,
                to: groupId,
                createdAt: new Date().toISOString(),
                senderName: data.from,
                isMe: false
            };
            setMessages(prev => [...prev, incomingMsg]);
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading Community...</div>;

    if (!group) return (
        <div className="whatsapp-layout">
            <header className="dashboard-header-custom">
                <div className="header-container-custom">
                    <div className="header-left-custom">
                        <div className="brand-custom">
                            <span className="brand-icon-custom">🎓</span>
                            <span className="brand-text-custom">JIT Student Portal</span>
                        </div>
                    </div>
                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>
                    <nav className={`header-nav-custom ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        <button className="logout-btn-custom" onClick={handleLogout}>Logout</button>
                    </nav>
                </div>
            </header>
            <div className="app-container">
                <div style={{ textAlign: 'center', marginTop: '50px', color: '#54656f' }}>
                    <h2>No Community Found</h2>
                    <p>You are not part of any class group yet.</p>
                </div>
            </div>
            <style>{`/* Styles reused below */`}</style>
        </div>
    );

    return (
        <div className="whatsapp-layout">
            <header className="dashboard-header-custom">
                <div className="header-container-custom">
                    <div className="header-left-custom">
                        <div className="brand-custom">
                            <span className="brand-icon-custom">🎓</span>
                            <span className="brand-text-custom">JIT Student Portal</span>
                        </div>
                    </div>

                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? '✕' : '☰'}
                    </button>

                    <nav className={`header-nav-custom ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                        <button className="nav-item-custom" onClick={() => navigate('/dashboard')}>Dashboard</button>
                        <button className="nav-item-custom" onClick={() => navigate('/staffs')}>Staffs</button>
                        {/* <button className="nav-item-custom" onClick={() => navigate('/student-notice')}>Notices</button> */}
                        <button className="nav-item-custom" onClick={() => navigate('/outpass')}>Outpass</button>
                        <button className="nav-item-custom" onClick={() => navigate('/subjects')}>Subjects</button>
                        <button className="nav-item-custom" onClick={() => navigate('/profile')}>Profile</button>
                        <button className="logout-btn-custom" onClick={handleLogout}>Logout</button>
                    </nav>
                </div>
            </header>

            <div className="app-container">
                <div className="chat-area">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="comm-icon small">📢</div>
                            <div className="header-text">
                                <h3>{group.groupname}</h3>
                                <p>Official Notices</p>
                            </div>
                        </div>
                    </div>

                    <div className="messages-container">
                        <div className="encryption-notice">
                            🔒 Messages are end-to-end encrypted.
                        </div>

                        {messages.map((msg, idx) => (
                            <div key={msg._id || idx} className={`message-row ${msg.isMe ? 'my-message' : 'other-message'}`}>
                                <div className="message-bubble">
                                    {!msg.isMe && <div className="sender-name">{msg.senderName || msg.from}</div>}
                                    <div className="message-text">{msg.text}</div>
                                    <div className="message-meta">
                                        <span className="timestamp">
                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />

                        <div className="read-only-banner">
                            Only admins can send messages in this group.
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
            /* Custom Dashboard Header */
                .dashboard-header-custom {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 70px;
                    background: white;
                    border-bottom: 1px solid #e2e8f0;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    z-index: 1000;
                }

                .mobile-menu-btn {
                    display: none;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #1e293b;
                    padding: 8px;
                    z-index: 1001;
                }

                .header-container-custom {
                    max-width: 1400px;
                    margin: 0 auto;
                    height: 100%;
                    padding: 0 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-left-custom {
                    display: flex;
                    align-items: center;
                }

                .brand-custom {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .brand-icon-custom {
                    font-size: 28px;
                }

                .brand-text-custom {
                    font-size: 1.3rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .header-nav-custom {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-item-custom {
                    padding: 10px 20px;
                    border: none;
                    background: transparent;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                }

                .nav-item-custom:hover {
                    background: #f1f5f9;
                    color: #0047AB;
                }

                .logout-btn-custom {
                    padding: 10px 24px;
                    border: 2px solid #ef4444;
                    background: white;
                    color: #ef4444;
                    font-weight: 600;
                    font-size: 0.95rem;
                    cursor: pointer;
                    border-radius: 10px;
                    transition: all 0.3s;
                    margin-left: 12px;
                }

                .logout-btn-custom:hover {
                    background: #ef4444;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .content-wrapper-custom {
                    margin-top: 70px;
                    padding: 0;
                }

                 @media (max-width: 768px) {
                    .mobile-menu-btn {
                        display: block;
                    }

                    .header-nav-custom {
                        position: absolute;
                        top: 70px;
                        left: 0;
                        right: 0;
                        background: white;
                        flex-direction: column;
                        padding: 0;
                        border-bottom: 1px solid #e2e8f0;
                        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        max-height: 0;
                        transition: max-height 0.3s ease-in-out, padding 0.3s ease-in-out;
                        gap: 0;
                    }

                    .header-nav-custom.mobile-open {
                        max-height: 500px;
                        padding: 16px 0;
                    }

                    .nav-item-custom, .logout-btn-custom {
                        width: 100%;
                        text-align: left;
                        padding: 12px 24px;
                        border-radius: 0;
                        margin: 0;
                    }

                    .logout-btn-custom {
                        border: none;
                        border-top: 1px solid #fee2e2;
                        color: #ef4444;
                        margin-top: 8px;
                    }

                    .content-wrapper-custom {
                        margin-top: 70px;
                    }
                }
                    
                /* Reset & Base */
                .whatsapp-layout {
                    height: 100vh;
                    background-color: #d1d7db;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                }

                .dashboard-header {
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                    height: 64px;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    padding: 0 24px;
                    color: white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
                    z-index: 10;
                }
                .brand { display: flex; align-items: center; gap: 10px; font-weight: bold; transition: opacity 0.2s; }
                .brand:hover { opacity: 0.9; }
                .brand-icon { display: flex; align-items: center; }
                .brand-text { font-size: 1.1rem; }

                /* Main Container */
                .app-container {
                    display: flex;
                    flex: 1;
                    max-width: 1200px; /* Reduced max-width since it's single column */
                    margin: 75px auto;
                    width: 98%;
                    height: calc(150vh - 80px);
                    background: white;
                    box-shadow: 0 1px 1px 0 rgba(11,20,26,.06), 0 2px 5px 0 rgba(11,20,26,.2);
                    overflow: hidden;
                    border-radius: 4px;
                }

                /* Chat Area */
                .chat-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #f8f9fa;
                    background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png");
                    opacity: 1;
                }

                .chat-header {
                    height: 64px;
                    background: white;
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                    display: flex;
                    align-items: center;
                    padding: 10px 16px;
                    justify-content: space-between;
                }

                .chat-header-info { display: flex; align-items: center; gap: 15px; }
                .comm-icon.small { 
                    width: 40px; height: 40px; 
                    font-size: 1.2rem; margin: 0;
                    display: flex; align-items: center; justify-content: center;
                    background: #dfe5e7;
                    border-radius: 50%;
                }
                .header-text h3 { font-size: 16px; margin: 0; color: #111b21; }
                .header-text p { font-size: 13px; margin: 0; color: #667781; }
                
                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 5%;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .encryption-notice {
                    background: #ffecb5;
                    padding: 5px 12px;
                    border-radius: 8px;
                    font-size: 12.5px;
                    color: #54656f;
                    text-align: center;
                    margin: 0 auto 16px;
                    width: fit-content;
                    box-shadow: 0 1px 0.5px rgba(0,0,0,0.13);
                }

                .message-row {
                    display: flex;
                    margin-bottom: 2px;
                }
                .message-row.my-message { justify-content: flex-end; }
                .message-row.other-message { justify-content: flex-start; }

                .message-bubble {
                    max-width: 85%; /* Wider bubbles for full scren */
                    padding: 6px 7px 8px 9px;
                    border-radius: 7.5px;
                    box-shadow: 0 1px 0.5px rgba(11,20,26,.13);
                    position: relative;
                    font-size: 14.2px;
                    line-height: 19px;
                }
                
                .my-message .message-bubble {
                    background: #d9fdd3;
                    border-top-right-radius: 0;
                }

                .other-message .message-bubble {
                    background: white;
                    border-top-left-radius: 0;
                }

                .sender-name {
                    font-weight: bold;
                    color: #e542a3;
                    font-size: 13px;
                    margin-bottom: 4px;
                }

                .message-text {
                    color: #111b21;
                    margin-bottom: 4px;
                }

                .message-meta {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    gap: 4px;
                }
                .timestamp {
                    font-size: 11px;
                    color: #667781;
                }

                .read-only-banner {
                    text-align: center;
                    padding: 10px;
                    background: rgba(255,255,255,0.6);
                    font-size: 0.9rem;
                    color: #54656f;
                    margin: 10px auto;
                    border-radius: 8px;
                    width: fit-content;
                }

                @media (max-width: 700px) {
                    .app-container { width: 100%; height: 100vh; margin: 0; box-shadow: none; border-radius: 0; }
                    .whatsapp-layout { background: white; }
                    .dashboard-header { display: none; }
                }
            `}</style>
        </div >
    );
};

export default StudentNotices;

