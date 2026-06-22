import PremiumStaffLoader from '../../components/PremiumStaffLoader';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import StaffHeader from '../../components/StaffHeader';

interface Message {
    _id: string;
    text: string;
    from: string;
    to: string;
    createdAt: string;
    senderName?: string; // Optional for mapped display
    isMe?: boolean;
}

interface Group {
    _id: string;
    groupname: string;
    members: string[];
    admin: string;
}

const StaffNotices: React.FC = () => {
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [appReady, setAppReady] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
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
                alert("Authentication token missing inside notices");
                return;
            }

            const groupRes = await axios.get(`${API_URL}/staff/community/my-group`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const myGroup = groupRes.data.group;
            setGroup(myGroup);

            if (myGroup) {
                const messagesRes = await axios.get(`${API_URL}/staff/messages/${myGroup._id}`, {
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

        socketRef.current.on('connect_error', (err) => {
            console.error("Socket connect error:", err);
        });
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !group || !socketRef.current) return;

        const msgText = newMessage;
        setNewMessage('');

        socketRef.current.emit('group-message', {
            groupId: group._id,
            message: msgText
        });
    };

    if (!appReady) return <PremiumStaffLoader isDataReady={!loading} onComplete={() => setAppReady(true)} />;

    if (!group) return (
        <div className="notices-page mobile-page-content">
            <StaffHeader activeMenu="notices" />
            <div className="no-community-screen">
                <div className="no-community-card">
                    <span className="notice-empty-icon">📢</span>
                    <h2>No Community Assigned</h2>
                    <p>You have not been assigned to any faculty community group yet.</p>
                    <button className="btn-back-dashboard" onClick={() => navigate('/staff-dashboard')}>
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="notices-page mobile-page-content">
            <StaffHeader activeMenu="notices" />

            <div className="workspace-container">
                <aside className="workspace-sidebar">
                    <div className="sidebar-group-header">
                        <span className="group-avatar">🏫</span>
                        <div className="group-details">
                            <h3>{group.groupname}</h3>
                            <span className="group-status-pill">Faculty Hub</span>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h4 className="section-title">Academic Channels</h4>
                        <div className="channel-list">
                            <button className="channel-item active">
                                <span className="hash">#</span> announcement-board
                            </button>
                            <button className="channel-item">
                                <span className="hash">#</span> exam-circulars
                            </button>
                            <button className="channel-item">
                                <span className="hash">#</span> general-discussions
                            </button>
                            <button className="channel-item">
                                <span className="hash">#</span> leave-requests
                            </button>
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <h4 className="section-title">Members ({group.members?.length || 0})</h4>
                        <div className="member-list">
                            {group.members?.map((_memberId, i) => (
                                <div key={i} className="member-item">
                                    <span className="member-status-dot"></span>
                                    <span className="member-name-text">Faculty Member</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <main className="chat-pane">
                    <div className="chat-pane-header">
                        <div className="channel-info">
                            <h3><span className="hash">#</span> announcement-board</h3>
                            <p className="channel-desc">Official community notices and campus announcements for {group.groupname}</p>
                        </div>
                    </div>

                    <div className="chat-messages-container">
                        <div className="workspace-encryption-notice">
                            🔒 Channel security active. All notices posted here are distributed to assigned community staff.
                        </div>

                        <div className="message-list">
                            {messages.map((msg, idx) => {
                                return (
                                    <div key={msg._id || idx} className="workspace-message-row">
                                        <div className="message-sender-avatar">
                                            {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : msg.from.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="message-content-block">
                                            <div className="message-meta-line">
                                                <span className="message-sender-name">{msg.senderName || msg.from}</span>
                                                <span className="message-timestamp">
                                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </span>
                                            </div>
                                            <div className="message-text-content">{msg.text}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    <div className="chat-input-area">
                        <form onSubmit={handleSendMessage} className="chat-input-form">
                            <input
                                type="text"
                                placeholder={`Send a message to #announcement-board...`}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                                Send
                            </button>
                        </form>
                    </div>
                </main>
            </div>

            <style>{`
                .notices-page {
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    background: var(--bg);
                    overflow: hidden;
                }

                .workspace-container {
                    display: flex;
                    flex: 1;
                    height: calc(100vh - 76px);
                    overflow: hidden;
                }

                .workspace-sidebar {
                    width: 260px;
                    background: #0f172a;
                    color: #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid #1e293b;
                    flex-shrink: 0;
                }

                .sidebar-group-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #1e293b;
                }

                .group-avatar {
                    width: 40px;
                    height: 40px;
                    background: #1e293b;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.25rem;
                }

                .group-details h3 {
                    margin: 0 0 2px 0;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #ffffff;
                }

                .group-status-pill {
                    font-size: 0.7rem;
                    color: #94a3b8;
                    font-weight: 600;
                }

                .sidebar-section {
                    padding: 20px;
                    border-bottom: 1px solid #1e293b;
                }

                .section-title {
                    font-size: 0.725rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin: 0 0 12px 0;
                }

                .channel-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .channel-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                    text-align: left;
                    width: 100%;
                    transition: all 0.15s ease;
                }

                .channel-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #f1f5f9;
                }

                .channel-item.active {
                    background: var(--primary);
                    color: #ffffff;
                }

                .hash {
                    font-weight: 400;
                    opacity: 0.6;
                }

                .member-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-height: 200px;
                    overflow-y: auto;
                }

                .member-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.85rem;
                    color: #94a3b8;
                }

                .member-status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--success);
                    box-shadow: 0 0 6px var(--success);
                }

                .member-name-text {
                    font-weight: 500;
                }

                .chat-pane {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #ffffff;
                    overflow: hidden;
                }

                .chat-pane-header {
                    padding: 16px 24px;
                    border-bottom: 1px solid #e2e8f0;
                    background: #ffffff;
                }

                .channel-info h3 {
                    margin: 0 0 2px 0;
                    font-size: 1.1rem;
                    font-weight: 800;
                    color: var(--text);
                }

                .channel-desc {
                    margin: 0;
                    font-size: 0.8rem;
                    color: var(--text-muted);
                }

                .chat-messages-container {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
                    background: #f8fafc;
                }

                .workspace-encryption-notice {
                    background: #eff6ff;
                    border: 1px solid #dbeafe;
                    color: var(--primary);
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 600;
                    max-width: 500px;
                    margin: 0 auto 24px auto;
                    text-align: center;
                }

                .message-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .workspace-message-row {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    padding: 4px 8px;
                    border-radius: 8px;
                    transition: background 0.15s;
                }

                .workspace-message-row:hover {
                    background: #f1f5f9;
                }

                .message-sender-avatar {
                    width: 36px;
                    height: 36px;
                    background: var(--primary);
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .message-content-block {
                    display: flex;
                    flex-direction: column;
                }

                .message-meta-line {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    margin-bottom: 2px;
                }

                .message-sender-name {
                    font-weight: 700;
                    font-size: 0.875rem;
                    color: var(--text);
                }

                .message-timestamp {
                    font-size: 0.725rem;
                    color: var(--text-muted);
                }

                .message-text-content {
                    font-size: 0.9rem;
                    color: var(--text);
                    line-height: 1.5;
                }

                .chat-input-area {
                    padding: 16px 24px 24px 24px;
                    background: #ffffff;
                }

                .chat-input-form {
                    display: flex;
                    gap: 12px;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    padding: 4px;
                    background: #ffffff;
                    transition: border-color 0.15s;
                }

                .chat-input-form:focus-within {
                    border-color: var(--primary);
                }

                .chat-input-form input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 0.9rem;
                    padding: 8px 12px;
                    background: transparent;
                }

                .chat-send-btn {
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 16px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: opacity 0.15s;
                }

                .chat-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .no-community-screen {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: calc(100vh - 76px);
                }

                .no-community-card {
                    background: var(--surface);
                    border: 1px solid #cbd5e1;
                    border-radius: 16px;
                    padding: 32px;
                    text-align: center;
                    max-width: 400px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
                }

                .notice-empty-icon {
                    font-size: 44px;
                    display: block;
                    margin-bottom: 16px;
                }

                .no-community-card h2 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text);
                    margin: 0 0 8px 0;
                }

                .no-community-card p {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    margin: 0 0 20px 0;
                }

                .btn-back-dashboard {
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 20px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    cursor: pointer;
                }

                @media (max-width: 768px) {
                    .notices-page {
                        min-height: 100vh !important;
                        height: auto !important;
                        overflow: auto !important;
                        overflow-y: auto !important;
                    }
                    .workspace-container {
                        height: auto !important;
                        min-height: calc(100vh - 76px) !important;
                        overflow: visible !important;
                    }
                    .chat-pane {
                        overflow: visible !important;
                        height: auto !important;
                    }
                    .workspace-sidebar {
                        display: none;
                    }
                    .chat-pane-header {
                        padding: 12px 16px;
                    }
                    .chat-messages-container {
                        padding: 16px;
                        overflow-y: visible !important;
                    }
                    .chat-input-area {
                        padding: 12px 12px 120px 12px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default StaffNotices;
