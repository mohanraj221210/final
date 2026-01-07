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

const StudentNotices: React.FC = () => {
    const navigate = useNavigate();

    // Notices Data (Only relevant ones kept)
    const [messages] = useState<Message[]>([
        { id: 1, text: "Welcome to the Official Announcements channel.", sender: "Admin", timestamp: "09:00 AM", isMe: false },
        { id: 2, text: "Tomorrow is a holiday due to heavy rain forecast.", sender: "Principal", timestamp: "10:30 AM", isMe: false },
        { id: 3, text: "Project submission deadline extended to Monday.", sender: "HOD", timestamp: "Yesterday", isMe: false },
        { id: 4, text: "Meeting at 3 PM for IT Department.", sender: "IT Dept", timestamp: "Yesterday", isMe: false },
    ]);

    return (
        <div className="whatsapp-layout">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-container">
                    <div className="header-left">
                        <div className="brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
                            <span className="brand-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5" />
                                    <path d="M12 19l-7-7 7-7" />
                                </svg>
                            </span>
                            <span className="brand-text">Student Dashboard</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="app-container">
                {/* Chat Area (Full Width) */}
                <div className="chat-area">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="comm-icon small">📢</div>
                            <div className="header-text">
                                <h3>Official Notices</h3>
                                <p>College Announcements</p>
                            </div>
                        </div>
                    </div>

                    <div className="messages-container">
                        <div className="encryption-notice">
                            🔒 Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
                        </div>

                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-row ${msg.isMe ? 'my-message' : 'other-message'}`}>
                                <div className="message-bubble">
                                    {!msg.isMe && <div className="sender-name">{msg.sender}</div>}
                                    <div className="message-text">{msg.text}</div>
                                    <div className="message-meta">
                                        <span className="timestamp">{msg.timestamp}</span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="read-only-banner">
                            Only admins can send messages in this group.
                        </div>
                    </div>
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
                    margin: 10px auto;
                    width: 98%;
                    height: calc(100vh - 80px);
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
