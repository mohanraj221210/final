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

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading Community...</div>;

    if (!group) return (
        <div className="whatsapp-layout">
            <header className="dashboard-header">
                <div className="header-container">
                    <div className="brand" onClick={() => navigate('/staff-dashboard')} style={{ cursor: 'pointer' }}>
                        <span className="brand-text">Staff Dashboard</span>
                    </div>
                </div>
            </header>
            <div style={{ textAlign: 'center', marginTop: '50px', color: '#54656f' }}>
                <h2>No Community Found</h2>
                <p>You have not been assigned to any community group yet.</p>
            </div>
        </div>
    );

    return (
        <div className="whatsapp-layout">
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
                <div className="chat-area">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="comm-icon small">📢</div>
                            <div className="header-text">
                                <h3>{group.groupname}</h3>
                                <p>Community Chat</p>
                            </div>
                        </div>
                        <div className="chat-actions">
                            <span>🔍</span>
                            <span>⋮</span>
                        </div>
                    </div>

                    <div className="messages-container">
                        <div className="encryption-notice">
                            🔒 Messages are end-to-end encrypted.
                        </div>

                        {messages.map((msg, idx) => {

                            const isMe = false;

                            return (
                                <div key={msg._id || idx} className={`message-row ${isMe ? 'my-message' : 'other-message'}`}>
                                    <div className="message-bubble">
                                        {!isMe && <div className="sender-name">{msg.senderName || msg.from}</div>}
                                        <div className="message-text">{msg.text}</div>
                                        <div className="message-meta">
                                            <span className="timestamp">
                                                {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
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
                </div>
            </div>

            <style>{`
                /* Reuse existing styles */
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
                .brand { display: flex; align-items: center; gap: 10px; font-weight: bold; }
                .brand-icon { display: flex; align-items: center; }
                .app-container {
                    display: flex;
                    flex: 1;
                    max-width: 1600px;
                    margin: 10px auto;
                    width: 98%;
                    background: white;
                    box-shadow: 0 1px 1px 0 rgba(11,20,26,.06), 0 2px 5px 0 rgba(11,20,26,.2);
                    height: calc(100vh - 80px);
                    border-radius: 4px;
                    overflow: hidden;
                }
                .chat-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: #efeae2;
                    background-image: url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png");
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
                .comm-icon.small { width: 40px; height: 40px; border-radius: 50%; background: #dfe5e7; display: flex; justify-content: center; align-items: center; }
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
                }
                .message-row { display: flex; margin-bottom: 2px; }
                .my-message { justify-content: flex-end; }
                .other-message { justify-content: flex-start; }
                .message-bubble {
                    max-width: 65%;
                    padding: 6px 7px 8px 9px;
                    border-radius: 7.5px;
                    box-shadow: 0 1px 0.5px rgba(11,20,26,.13);
                    background: white;
                }
                .my-message .message-bubble { background: #d9fdd3; }
                .sender-name { font-weight: bold; color: #e542a3; font-size: 13px; margin-bottom: 4px; }
                .message-meta { display: flex; justify-content: flex-end; font-size: 11px; color: #667781; }
                .input-area {
                    min-height: 62px;
                    background: #f0f2f5;
                    display: flex;
                    align-items: center;
                    padding: 5px 16px;
                    gap: 10px;
                }
                .input-form { flex: 1; }
                .input-form input { width: 100%; padding: 9px 12px; border-radius: 8px; border: none; outline: none; }
                .voice-note, .input-actions { font-size: 1.5rem; color: #54656f; cursor: pointer; }
            `}</style>
        </div>
    );
};


export default StaffNotices;
