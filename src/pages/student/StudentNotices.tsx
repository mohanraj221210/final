import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import StudentHeader from '../../components/StudentHeader';
import StudentBottomNav from '../../components/StudentBottomNav';

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

    if (loading) {
        return (
            <div className="student-page loading-screen-notice animate-page-enter">
                <div className="lux-desktop-view">
                    <div className="content-wrapper" style={{ paddingTop: '100px' }}>
                        <div className="community-board-grid">
                            <div className="community-sidebar-col">
                                <div className="card lux-skeleton" style={{ height: '300px' }}></div>
                            </div>
                            <div className="community-chat-col">
                                <div className="card lux-skeleton" style={{ height: '600px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lux-mobile-view">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px', paddingTop: '100px' }}>
                        {[1,2,3,4].map(i => (
                            <div key={i} className="lux-skeleton" style={{ height: '100px', borderRadius: '16px' }}></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="student-page student-notices-board-view animate-page-enter">

            {/* ── DESKTOP VIEW ── */}
            <div className="lux-desktop-view">
            <StudentHeader />

            <div className="content-wrapper">
                {/* Back link */}
                <div className="back-link-wrapper" style={{ marginBottom: '24px' }}>
                    <button className="btn-back" onClick={() => navigate('/dashboard')}>
                        <span className="icon">←</span> Back to Dashboard
                    </button>
                </div>

                {!group ? (
                    <div className="empty-state-card card" style={{ marginTop: '40px' }}>
                        <span className="empty-state-icon">📢</span>
                        <h3>No Active Notice Board</h3>
                        <p>You have not been assigned to a class community channel yet. Contact your advisor if this is an error.</p>
                    </div>
                ) : (
                    <div className="community-board-grid">
                        
                        {/* Sidebar: Group Details */}
                        <div className="community-sidebar-col animate-stagger-1">
                            <div className="card channel-details-card">
                                <h3 className="section-title">📢 Notice Channels</h3>
                                <div className="channel-item active">
                                    <span className="ch-hashtag">#</span>
                                    <div className="ch-info">
                                        <span className="ch-name">{group.groupname}</span>
                                        <span className="ch-desc">Official Announcements</span>
                                    </div>
                                </div>
                                
                                <div className="channel-rules-box">
                                    <h4>Channel Rules</h4>
                                    <p>• Only tutors and admins can broadcast notices.</p>
                                    <p>• Stay updated on college announcements daily.</p>
                                </div>
                            </div>
                        </div>

                        {/* Main Chat Screen */}
                        <div className="community-chat-col animate-stagger-2">
                            <div className="card chat-window-card">
                                {/* Header */}
                                <div className="chat-window-header">
                                    <div className="header-badge-group">
                                        <span className="bullet-active">●</span>
                                        <span className="channel-name-title">{group.groupname}</span>
                                    </div>
                                    <span className="badge badge-blue">Official Board</span>
                                </div>

                                {/* Messages Area */}
                                <div className="chat-messages-container">
                                    <div className="enc-shield-card">
                                        🔒 Official notice history. Read-only channel.
                                    </div>

                                    {messages.length === 0 ? (
                                        <div className="empty-chat-state">
                                            <span>📭</span>
                                            <p>No announcements posted yet.</p>
                                        </div>
                                    ) : (
                                        <div className="messages-list-flow">
                                            {messages.map((msg, idx) => {
                                                const senderInitial = msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'A';
                                                return (
                                                    <div key={msg._id || idx} className={`message-feed-row ${msg.isMe ? 'is-self' : ''}`}>
                                                        {!msg.isMe && (
                                                            <div className="msg-sender-avatar" title={msg.senderName || msg.from}>
                                                                {senderInitial}
                                                            </div>
                                                        )}
                                                        <div className="msg-bubble-wrap">
                                                            {!msg.isMe && <span className="msg-sender-name">{msg.senderName || msg.from}</span>}
                                                            <div className="msg-bubble-bubble">
                                                                <p className="msg-bubble-text">{msg.text}</p>
                                                                <span className="msg-timestamp">
                                                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Read only warning bar */}
                                <div className="chat-input-placeholder-bar">
                                    <span className="lock-icon">🔒</span>
                                    <p>Only verified administrators and class tutors can broadcast messages to this board.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
            </div>{/* end desktop */}

            {/* ── MOBILE VIEW ── */}
            <div className="lux-mobile-view cred-page-bg">
                {/* Channel Header */}
                <div className="cred-header animate-cred-enter cred-stagger-1">
                    <button className="cred-back-btn" onClick={() => navigate('/dashboard')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div className="cred-header-text">
                        <div className="mob-notices-title-row">
                            <div className="mob-live-dot" />
                            <h1 className="cred-h2" style={{margin: 0, fontSize: '18px'}}>{group ? group.groupname : 'Notice Board'}</h1>
                        </div>
                        <p className="cred-subtitle" style={{margin: '2px 0 0'}}>Official announcements • Read-only</p>
                    </div>
                    <div style={{width: 40}} />
                </div>

                {/* Messages Feed */}
                <div className="mob-notices-feed">
                    {!group ? (
                        <div className="cred-card mob-empty-card" style={{padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center'}}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cred-text-secondary)" strokeWidth="1.5"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"/></svg>
                            <span style={{fontSize: '16px', fontWeight: '800', color: 'var(--cred-text)'}}>No notice board assigned</span>
                            <p style={{fontSize: '14px', color: 'var(--cred-text-secondary)', margin: 0}}>Contact your advisor to be added to a class community.</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="cred-card mob-empty-card" style={{padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center'}}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--cred-text-secondary)" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            <span style={{fontSize: '16px', fontWeight: '800', color: 'var(--cred-text)'}}>No announcements yet</span>
                        </div>
                    ) : (
                        messages.map((msg, idx) => {
                            const initial = msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'A';
                            const timeStr = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
                            const dateStr = msg.createdAt ? new Date(msg.createdAt).toLocaleDateString([], {month:'short', day:'numeric'}) : '';
                            const staggerIndex = (idx % 6) + 1;
                            return (
                                <div key={msg._id || idx} className={`mob-notice-bubble-row animate-cred-enter cred-stagger-${staggerIndex}`}>
                                    <div className="mob-notice-avatar">{initial}</div>
                                    <div className="mob-notice-content">
                                        <div className="mob-notice-sender">{msg.senderName || msg.from}</div>
                                        <div className="mob-notice-bubble">
                                            <p className="mob-notice-text">{msg.text}</p>
                                            <span className="mob-notice-time">{dateStr} · {timeStr}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Read-only bar */}
                <div className="mob-readonly-bar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span>Read-only channel — only tutors can post</span>
                </div>

                {/* Bottom Nav */}
                <StudentBottomNav />
            </div>{/* end mobile */}

            <style>{`
                .student-notices-board-view {
                    background: var(--bg);
                }
                .loading-screen-notice {
                    background: var(--bg);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .btn-back {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    transition: var(--transition-fast);
                }
                .btn-back:hover {
                    background: var(--primary-light);
                    color: var(--primary-dark);
                }

                /* Community Layout */
                .community-board-grid {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 24px;
                    height: calc(100vh - 180px);
                    min-height: 500px;
                    align-items: stretch;
                }
                
                .channel-details-card {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    height: 100%;
                }
                .channel-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: var(--transition-fast);
                }
                .channel-item:hover, .channel-item.active {
                    background: var(--primary-light);
                    color: var(--primary-dark);
                }
                .ch-hashtag {
                    font-size: 1.2rem;
                    font-weight: 700;
                }
                .ch-info {
                    display: flex;
                    flex-direction: column;
                }
                .ch-name {
                    font-size: 0.88rem;
                    font-weight: 700;
                }
                .ch-desc {
                    font-size: 0.72rem;
                    color: var(--text-4);
                }

                .channel-rules-box {
                    background: var(--bg);
                    padding: 12px;
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border);
                }
                .channel-rules-box h4 {
                    font-size: 0.8rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: var(--text-1);
                }
                .channel-rules-box p {
                    font-size: 0.72rem;
                    color: var(--text-3);
                    margin: 0 0 4px 0;
                }

                /* Chat screen card */
                .chat-window-card {
                    display: flex;
                    flex-direction: column;
                    padding: 0 !important;
                    height: 100%;
                    overflow: hidden;
                }
                .chat-window-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border);
                    background: var(--surface);
                }
                .header-badge-group {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .bullet-active {
                    color: var(--success);
                    font-size: 0.75rem;
                }
                .channel-name-title {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: var(--text-1);
                }

                /* Messages space */
                .chat-messages-container {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    background: var(--bg);
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .enc-shield-card {
                    background: var(--warning-light);
                    border: 1px solid var(--warning-mid);
                    color: #92400E;
                    font-size: 0.75rem;
                    padding: 6px 12px;
                    border-radius: var(--radius-sm);
                    width: fit-content;
                    margin: 0 auto;
                }

                .messages-list-flow {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .message-feed-row {
                    display: flex;
                    gap: 12px;
                    align-items: flex-start;
                    max-width: 80%;
                }
                .message-feed-row.is-self {
                    margin-left: auto;
                    flex-direction: row-reverse;
                }
                
                .msg-sender-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 700;
                    flex-shrink: 0;
                }
                .msg-bubble-wrap {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                .msg-sender-name {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: var(--text-3);
                }
                
                .msg-bubble-bubble {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius-md);
                    border-top-left-radius: 2px;
                    padding: 10px 14px;
                    position: relative;
                    box-shadow: var(--shadow-xs);
                }
                .is-self .msg-bubble-bubble {
                    background: var(--primary-light);
                    border-color: var(--primary-mid);
                    border-radius: var(--radius-md);
                    border-top-right-radius: 2px;
                }
                .msg-bubble-text {
                    font-size: 0.85rem;
                    color: var(--text-1);
                    margin: 0;
                    line-height: 1.45;
                }
                .msg-timestamp {
                    display: block;
                    text-align: right;
                    font-size: 0.65rem;
                    color: var(--text-4);
                    margin-top: 4px;
                }

                .empty-chat-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: var(--text-4);
                    flex: 1;
                }
                .empty-chat-state span {
                    font-size: 2.5rem;
                }

                /* Read only bar */
                .chat-input-placeholder-bar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: var(--bg-elevated);
                    padding: var(--space-4) var(--space-5);
                    border-top: 1px solid var(--border);
                }
                .chat-input-placeholder-bar .lock-icon {
                    font-size: 1.1rem;
                    color: var(--text-3);
                }
                .chat-input-placeholder-bar p {
                    font-size: 0.78rem;
                    color: var(--text-3);
                    margin: 0;
                    line-height: 1.4;
                }

                /* Empty state design */
                .empty-state-card {
                    text-align: center;
                    padding: var(--space-12) var(--space-6) !important;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    max-width: 480px;
                    margin: 40px auto;
                }
                .empty-state-icon {
                    font-size: 3rem;
                }

                /* ── DESKTOP / MOBILE SPLIT ── */
                .lux-desktop-view { display: block; }
                .lux-mobile-view  { display: none; }
                @media (max-width: 768px) {
                    .lux-desktop-view { display: none !important; }
                    .lux-mobile-view  { display: flex !important; flex-direction: column; height: 100vh; background: linear-gradient(135deg, #F7F3E6 0%, #E8EEF5 45%, #C8D9F2 100%); font-family: 'Inter', -apple-system, sans-serif; overflow: hidden; }
                }

                /* ==========================================
                   CRED PREMIUM MOBILE STYLES (NOTICES)
                   ========================================== */

                /* Channel header */
                .cred-header { display:flex; align-items:center; gap:12px; padding:16px 16px 12px; background:rgba(255,255,255,0.85); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px); position:sticky; top:0; z-index:50; border-bottom: 1px solid rgba(226,232,240,0.6); flex-shrink:0; }
                .cred-back-btn { width:36px; height:36px; border-radius:10px; background:#FFFFFF; border:1px solid #E2E8F0; color:#1E293B; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:transform 0.2s; }
                .cred-back-btn:active { transform:scale(0.9); }
                .cred-header-text { flex:1; display:flex; flex-direction:column; }
                .cred-subtitle { font-size:12px; color:#64748B; font-weight:500; }

                .mob-notices-title-row { display:flex; align-items:center; gap:10px; }
                .mob-live-dot { width:8px; height:8px; border-radius:50%; background:#10B981; box-shadow:0 0 0 2px rgba(16,185,129,0.3); animation:mobPulse 2s infinite; }
                @keyframes mobPulse { 0%,100%{box-shadow:0 0 0 2px rgba(16,185,129,0.3)} 50%{box-shadow:0 0 0 5px rgba(16,185,129,0.1)} }

                .mob-notices-feed { flex:1; overflow-y:auto; padding:24px 16px 8px; display:flex; flex-direction:column; gap:20px; }

                .mob-notice-bubble-row { display:flex; gap:12px; align-items:flex-start; }
                .mob-notice-avatar { width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg, #1E3A8A, #0F172A); color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:800; flex-shrink:0; box-shadow: 0 4px 12px rgba(15,23,42,0.2); }
                .mob-notice-content { flex:1; display:flex; flex-direction:column; gap:6px; }
                .mob-notice-sender { font-size:13px; font-weight:700; color:#0F172A; margin-left: 4px; }
                .mob-notice-bubble { background:rgba(255,255,255,0.88); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); border-radius:4px 16px 16px 16px; padding:16px; border:1px solid rgba(255,255,255,0.55); box-shadow: 0 8px 24px rgba(15,23,42,0.10); }
                .mob-notice-text { font-size:15px; color:#0F172A; line-height:1.6; margin:0 0 8px; }
                .mob-notice-time { font-size:12px; color:#64748B; font-weight: 600; }

                .mob-readonly-bar { display:flex; align-items:center; justify-content:center; gap:10px; padding:16px; background:rgba(255,255,255,0.75); border-top:1px solid rgba(226,232,240,0.6); font-size:13px; font-weight:600; color:#64748B; flex-shrink:0; margin-bottom: calc(64px + env(safe-area-inset-bottom, 16px)); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }
            `}</style>
        </div>
    );
};

export default StudentNotices;
