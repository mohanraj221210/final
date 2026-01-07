import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: number;
    text: string;
    sender: string;
    timestamp: string;
    isMe: boolean;
    readBy?: number;
}

interface Community {
    id: number;
    name: string;
    icon: string;
    lastMessage: string;
    time: string;
    unread: number;
}

const StaffNotices: React.FC = () => {
    const navigate = useNavigate();
    const [activeCommunity, setActiveCommunity] = useState<number>(1);
    const [newMessage, setNewMessage] = useState('');

    // Dummy Data
    const communities: Community[] = [
        { id: 1, name: "📢 Official Announcements", icon: "🏢", lastMessage: "Holiday declared tomorrow", time: "10:30 AM", unread: 0 },
        { id: 2, name: "🎓 Final Year Students", icon: "🎓", lastMessage: "Project submission deadline extended", time: "Yesterday", unread: 2 },
        { id: 3, name: "💻 IT Department", icon: "💻", lastMessage: "Meeting at 3 PM", time: "Yesterday", unread: 0 },
        { id: 4, name: "🧪 Lab Assistants", icon: "🔬", lastMessage: "Equipment check completed", time: "Tue", unread: 0 },
    ];

    const [messages, setMessages] = useState<Record<number, Message[]>>({
        1: [
            { id: 1, text: "Welcome to the Official Announcements channel.", sender: "Admin", timestamp: "09:00 AM", isMe: false, readBy: 120 },
            { id: 2, text: "Tomorrow is a holiday due to heavy rain forecast.", sender: "Principal", timestamp: "10:30 AM", isMe: false, readBy: 115 },
        ],
        2: [
            { id: 1, text: "Submit your project abstracts by Friday.", sender: "HOD", timestamp: "Yesterday", isMe: false, readBy: 45 },
            { id: 2, text: "Can we get an extension?", sender: "Student Rep", timestamp: "Yesterday", isMe: false },
            { id: 3, text: "Project submission deadline extended to Monday.", sender: "You", timestamp: "Yesterday", isMe: true, readBy: 50 },
        ],
        3: [], 4: []
    });

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const newMsg: Message = {
            id: Date.now(),
            text: newMessage,
            sender: "You",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
            readBy: 0
        };

        setMessages(prev => ({
            ...prev,
            [activeCommunity]: [...(prev[activeCommunity] || []), newMsg]
        }));
        setNewMessage('');

        // Scroll to bottom logic would go here
    };

    const activeCommDetails = communities.find(c => c.id === activeCommunity);

    return (
        <div className="whatsapp-layout">
            {/* Header (reused/adapted from Dashboard) */}
            <header className="dashboard-header">
                <div className="header-container">
                    <div className="header-left">
                        <div className="brand" onClick={() => navigate('/staff-dashboard')} style={{ cursor: 'pointer' }}>
                            <span className="brand-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5" />
                                    <path d="M12 19l-7-7 7-7" />
                                </svg>
                            </span>
                            <span className="brand-text">Staff Dashboard</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="app-container">
                {/* Sidebar
                <div className="sidebar">
                    <div className="sidebar-header">
                        <div className="profile-pic">👨‍🏫</div>
                        <div className="sidebar-actions">
                            <span title="New Community">➕</span>
                            <span title="Menu">⋮</span>
                        </div>
                    </div>
                    <div className="search-bar">
                        <div className="search-wrapper">
                            <span>🔍</span>
                            <input type="text" placeholder="Search or start new chat" />
                        </div>
                    </div>
                    <div className="community-list">
                        {communities.map(comm => (
                            <div
                                key={comm.id}
                                className={`community-item ${activeCommunity === comm.id ? 'active' : ''}`}
                                onClick={() => setActiveCommunity(comm.id)}
                            >
                                <div className="comm-icon">{comm.icon}</div>
                                <div className="comm-info">
                                    <div className="comm-top">
                                        <span className="comm-name">{comm.name}</span>
                                        <span className="comm-time">{comm.time}</span>
                                    </div>
                                    <div className="comm-bottom">
                                        <span className="comm-preview">{comm.lastMessage}</span>
                                        {comm.unread > 0 && <span className="unread-badge">{comm.unread}</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}

                {/* Chat Area */}
                <div className="chat-area">
                    {activeCommDetails ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-header-info">
                                    <div className="comm-icon small">{activeCommDetails.icon}</div>
                                    <div className="header-text">
                                        <h3>{activeCommDetails.name}</h3>
                                        <p>click here for community info</p>
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <span>🔍</span>
                                    <span>⋮</span>
                                </div>
                            </div>

                            <div className="messages-container">
                                <div className="encryption-notice">
                                    🔒 Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
                                </div>

                                {messages[activeCommunity]?.map((msg) => (
                                    <div key={msg.id} className={`message-row ${msg.isMe ? 'my-message' : 'other-message'}`}>
                                        <div className="message-bubble">
                                            {!msg.isMe && <div className="sender-name">{msg.sender}</div>}
                                            <div className="message-text">{msg.text}</div>
                                            <div className="message-meta">
                                                <span className="timestamp">{msg.timestamp}</span>
                                                {msg.isMe && <span className="ticks">✓✓</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="input-area">
                                <div className="input-actions">😊 📎</div>
                                <form onSubmit={handleSendMessage} className="input-form">
                                    <input
                                        type="text"
                                        placeholder="Type a message"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                    />
                                </form>
                                <div className="voice-note" onClick={(e) => newMessage.trim() && handleSendMessage(e as any)}>
                                    {newMessage.trim() ? '➤' : '🎤'}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-chat-selected">
                            <div className="placeholder-content">
                                <h2>WhatsApp Web</h2>
                                <p>Send and receive messages without keeping your phone online.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                /* Reset & Base */
                .whatsapp-layout {
                    height: 100vh;
                    background-color: #d1d7db;
                    display: flex;
                    flex-direction: column;
                    font-family: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;
                }

                /* Reuse Header styles minimally to match dashboard but fit layout */
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
                    max-width: 1600px;
                    margin: 10px auto;
                    width: 98%;
                    background: white;
                    box-shadow: 0 1px 1px 0 rgba(11,20,26,.06), 0 2px 5px 0 rgba(11,20,26,.2);
                    height: calc(100vh - 80px);
                    overflow: hidden;
                    border-radius: 4px;
                }

                /* Sidebar */
                .sidebar {
                    flex: 0 0 30%;
                    min-width: 320px;
                    max-width: 420px;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid #e9edef;
                    background: white;
                }

                .sidebar-header {
                    height: 60px;
                    background: #f0f2f5;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 16px;
                    border-right: 1px solid rgba(11,20,26,.08);
                }

                .profile-pic {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: #dfe5e7;
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    font-size: 1.2rem;
                    cursor: pointer;
                }

                .sidebar-actions {
                    display: flex;
                    gap: 20px;
                    color: #54656f;
                    font-size: 1.2rem;
                    cursor: pointer;
                }

                .search-bar {
                    background: white;
                    padding: 8px 12px;
                    border-bottom: 1px solid #e9edef;
                }

                .search-wrapper {
                    background: #f0f2f5;
                    border-radius: 8px;
                    padding: 6px 12px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .search-wrapper input {
                    border: none;
                    background: transparent;
                    width: 100%;
                    outline: none;
                }

                .community-list {
                    flex: 1;
                    overflow-y: auto;
                    background: white;
                }

                .community-item {
                    height: 72px;
                    display: flex;
                    align-items: center;
                    padding: 0 15px;
                    cursor: pointer;
                    border-bottom: 1px solid #f0f2f5;
                }
                .community-item:hover { background: #f5f6f6; }
                .community-item.active { background: #f0f2f5; }

                .comm-icon {
                    width: 49px;
                    height: 49px;
                    border-radius: 50%;
                    background: #dfe5e7;
                    display: flex; justify-content: center; align-items: center;
                    font-size: 1.5rem;
                    margin-right: 15px;
                    flex-shrink: 0;
                }

                .comm-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    height: 100%;
                }

                .comm-top {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 3px;
                }
                .comm-name {
                    font-size: 17px;
                    color: #111b21;
                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                }
                .comm-time {
                    font-size: 12px;
                    color: #667781;
                }

                .comm-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .comm-preview {
                    font-size: 14px;
                    color: #667781;
                    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                    max-width: 200px;
                }
                .unread-badge {
                    background: #25d366;
                    color: white;
                    font-size: 12px;
                    font-weight: bold;
                    border-radius: 12px;
                    padding: 0 6px;
                    min-width: 20px;
                    text-align: center;
                }


                /* Chat Area */
                .chat-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #efeae2; /* WhatsApp Classic Wallpaper color */
                    background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png");
                    opacity: 0.95;
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

                .chat-header-info { display: flex; align-items: center; gap: 15px; cursor: pointer; }
                .comm-icon.small { width: 40px; height: 40px; font-size: 1.2rem; margin: 0; }
                .header-text h3 { font-size: 16px; margin: 0; color: #111b21; }
                .header-text p { font-size: 13px; margin: 0; color: #667781; }
                
                .chat-actions { display: flex; gap: 20px; color: #54656f; font-size: 1.2rem; cursor: pointer; }

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
                    max-width: 65%;
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
                    color: #e542a3; /* Just a random color for name */
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
                .ticks {
                    color: #53bdeb; /* Blue ticks */
                    font-size: 11px;
                }

                /* Input Area */
                .input-area {
                    min-height: 62px;
                    background: #f0f2f5;
                    display: flex;
                    align-items: center;
                    padding: 5px 16px;
                    gap: 10px;
                }

                .input-actions { font-size: 1.5rem; color: #54656f; cursor: pointer; display: flex; gap: 16px; }

                .input-form { flex: 1; }
                .input-form input {
                    width: 100%;
                    padding: 9px 12px 11px;
                    border-radius: 8px;
                    border: none;
                    outline: none;
                    font-size: 15px;
                }

                .voice-note {
                    font-size: 1.5rem;
                    color: #54656f;
                    cursor: pointer;
                }

                @media (max-width: 900px) {
                    .sidebar { flex: 0 0 40%; min-width: 280px; }
                    .chat-area { flex: 1; }
                }

                @media (max-width: 700px) {
                    .app-container { width: 100%; height: 100vh; margin: 0; border-radius: 0; box-shadow: none; }
                    .sidebar { flex: 0 0 100%; width: 100%; display: ${activeCommunity ? 'none' : 'flex'}; }
                    .chat-area { flex: 0 0 100%; width: 100%; display: ${activeCommunity ? 'flex' : 'none'}; }
                    .whatsapp-layout { background: white; }
                    .dashboard-header { display: none; }
                }
            `}</style>
        </div>
    );
};

export default StaffNotices;
