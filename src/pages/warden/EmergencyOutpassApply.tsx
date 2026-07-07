import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import WardenNav from '../../components/WardenNav';
const EmergencyOutpassApply: React.FC = () => {
    const navigate = useNavigate();
    const [searchRoom, setSearchRoom] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Search students by room number
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchRoom.trim()) {
            toast.warn('Please enter a room number to search');
            return;
        }

        setIsSearching(true);
        setSelectedStudent(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/warden/students/roomno/${searchRoom.trim()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const roomStudents = response.data.students || [];

            setStudents(roomStudents);

            if (roomStudents.length === 0) {
                toast.info(`No students found in room ${searchRoom}`);
            }
        } catch (error: any) {
            console.error("Failed to fetch students by room", error);
            const errorMessage = error.response?.data?.message || "Failed to fetch students. Please check the room number or connection.";
            toast.error(errorMessage);
            setStudents([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleApplyEmergencyOutpass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) {
            toast.warn('Please select a student first');
            return;
        }
        if (!reason.trim()) {
            toast.warn('Please provide a reason for the emergency');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                reason: reason
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/warden/outpass/apply/${selectedStudent._id || selectedStudent.id}`,
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201 || response.status === 200) {
                toast.success('Emergency Outpass Created and Approved Successfully!');
                navigate('/warden/emergency-outpass-list');
            }
        } catch (error: any) {
            console.error("Error creating emergency outpass", error);
            toast.error(error.response?.data?.message || 'Failed to create emergency outpass.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page-container">
            <WardenNav />
            <ToastContainer position="top-center" />
            <div className="content-container">
                <button className="back-btn" onClick={() => navigate("/warden-dashboard")}>
                    ← Back to Dashboard
                </button>

                <div className="emergency-form-wrapper">
                    <div className="emergency-header">
                        <h2>🚨 Apply Emergency Outpass</h2>
                        <p>For critical health issues. Outpass will be instantly approved.</p>
                    </div>

                    <div className="search-section card">
                        <h3>1. Search Student Room</h3>
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                placeholder="Enter Room Number (e.g., 101)"
                                value={searchRoom}
                                onChange={(e) => setSearchRoom(e.target.value)}
                                className="room-input"
                            />
                            <button type="submit" className="btn btn-primary search-btn" disabled={isSearching}>
                                {isSearching ? 'Searching...' : 'Search Room'}
                            </button>
                        </form>
                    </div>

                    {students.length > 0 && (
                        <div className="students-results card">
                            <h3>2. Select Student from Room {searchRoom}</h3>
                            <div className="student-grid">
                                {students.map((student) => (
                                    <div
                                        key={student._id || student.id}
                                        className={`student-select-card ${selectedStudent?._id === student._id ? 'selected' : ''}`}
                                        onClick={() => setSelectedStudent(student)}
                                    >
                                        <div className="student-select-avatar">
                                            {student.photo ? (
                                                <img src={student.photo} alt={student.name} />
                                            ) : (
                                                <div className="avatar-placeholder">{student.name.charAt(0)}</div>
                                            )}
                                        </div>
                                        <div className="student-select-info">
                                            <h4>{student.name}</h4>
                                            <p>{student.registerNumber || student.register_number}</p>
                                            <span className="dept-badge">{student.department} - Year {student.year}</span>
                                        </div>
                                        {selectedStudent?._id === student._id && (
                                            <div className="check-icon">✓</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedStudent && (
                        <div className="apply-section card">
                            <h3>3. Emergency Details</h3>
                            <div className="selected-student-summary">
                                <strong>Selected:</strong> {selectedStudent.name} ({selectedStudent.registerNumber})
                            </div>

                            <form onSubmit={handleApplyEmergencyOutpass}>
                                <div className="form-group">
                                    <label>Reason for Emergency *</label>
                                    <textarea
                                        placeholder="Describe the medical emergency or critical situation..."
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="summary-alert">
                                    <strong>Note:</strong> This will create an outpass of type <code>HostelEmergency</code> and automatically set the status to <strong>Approved</strong> across all levels.
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-danger submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Applying...' : 'Create & Approve Emergency Outpass'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                /* Background & Layout */
                .page-container {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #f0f4f8 0%, #e0e8f0 100%);
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    padding-top: var(--nav-height, 80px);
                    padding-bottom: calc(100px + env(safe-area-inset-bottom));
                }

                .content-container {
                    padding: 24px 20px;
                    max-width: 900px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    animation: fadeInUp 0.4s ease-out forwards;
                }

                .back-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    color: #1e293b;
                    font-size: 0.9rem;
                    font-weight: 600;
                    padding: 10px 20px;
                    border-radius: 12px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                    transition: all 0.3s ease;
                    width: fit-content;
                }

                .back-btn:hover {
                    background: rgba(255, 255, 255, 0.9);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.05);
                }

                .emergency-header {
                    margin-bottom: 8px;
                }

                .emergency-header h2 {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0;
                    letter-spacing: -0.03em;
                    background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .emergency-header p {
                    font-size: 1rem;
                    color: #475569;
                    margin: 8px 0 0 0;
                    font-weight: 500;
                }

                .card {
                    background: rgba(255, 255, 255, 0.65);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    border-radius: 24px;
                    padding: 32px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,1);
                    margin-bottom: 24px;
                }

                .card h3 {
                    font-size: 1.3rem;
                    font-weight: 800;
                    color: #0f172a;
                    margin: 0 0 24px 0;
                    letter-spacing: -0.02em;
                }

                /* Search Form */
                .search-form {
                    display: flex;
                    gap: 12px;
                }

                .room-input {
                    flex: 1;
                    padding: 14px 20px;
                    border-radius: 16px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    background: rgba(255, 255, 255, 0.9);
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                }

                .room-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                    background: white;
                }

                .search-btn {
                    padding: 0 28px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #2563eb, #1d4ed8);
                    color: white;
                    font-weight: 600;
                    font-size: 1.1rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
                }

                .search-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
                }

                /* Student Grid */
                .student-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 16px;
                }

                .student-select-card {
                    background: white;
                    border: 2px solid transparent;
                    padding: 16px;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                    position: relative;
                }

                .student-select-card:hover {
                    border-color: #bfdbfe;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0,0,0,0.06);
                }

                .student-select-card.selected {
                    border-color: #ef4444;
                    background: #fef2f2;
                    box-shadow: 0 8px 20px rgba(239, 68, 68, 0.1);
                }

                .student-select-avatar {
                    width: 52px;
                    height: 52px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #e2e8f0;
                    flex-shrink: 0;
                    border: 2px solid white;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
                }

                .student-select-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.3rem;
                    font-weight: 800;
                    color: white;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    text-transform: uppercase;
                }

                .student-select-info h4 {
                    margin: 0 0 4px 0;
                    color: #0f172a;
                    font-size: 1.05rem;
                    font-weight: 800;
                }

                .student-select-info p {
                    margin: 0 0 6px 0;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                }

                .dept-badge {
                    background: #e2e8f0;
                    color: #475569;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 0.72rem;
                    font-weight: 700;
                    display: inline-block;
                }

                .check-icon {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: #ef4444;
                    color: white;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 0.8rem;
                    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
                }

                /* Apply Form */
                .selected-student-summary {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 16px 20px;
                    margin-bottom: 24px;
                    font-size: 1rem;
                    color: #334155;
                    font-weight: 600;
                }

                .selected-student-summary strong {
                    color: #0f172a;
                    font-weight: 800;
                }

                .form-group {
                    margin-bottom: 24px;
                }

                .form-group label {
                    display: block;
                    font-size: 0.95rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 8px;
                }

                .form-group textarea {
                    width: 100%;
                    padding: 14px 16px;
                    border-radius: 16px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    background: rgba(255, 255, 255, 0.9);
                    font-size: 1rem;
                    outline: none;
                    transition: all 0.3s;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                    font-family: inherit;
                    resize: vertical;
                    min-height: 120px;
                    color: #1e293b;
                }

                .form-group textarea:focus {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
                    background: white;
                }

                .summary-alert {
                    background: #fffbeb;
                    border-left: 4px solid #f59e0b;
                    padding: 16px;
                    border-radius: 4px 12px 12px 4px;
                    color: #b45309;
                    margin-bottom: 24px;
                    font-size: 0.92rem;
                    line-height: 1.5;
                }

                .summary-alert code {
                    background: #fef3c7;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-weight: 700;
                }

                .submit-btn {
                    width: 100%;
                    padding: 16px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
                    color: white;
                    font-weight: 800;
                    font-size: 1.1rem;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s;
                    box-shadow: 0 10px 20px rgba(239, 68, 68, 0.3);
                }

                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 25px rgba(239, 68, 68, 0.4);
                }

                .submit-btn:disabled {
                    background: #cbd5e1;
                    box-shadow: none;
                    cursor: not-allowed;
                    transform: none;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .content-container {
                        padding: 16px;
                    }
                    .card {
                        padding: 20px;
                        border-radius: 20px;
                    }
                    .search-form {
                        flex-direction: column;
                    }
                    .search-btn {
                        padding: 14px;
                    }
                    .student-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default EmergencyOutpassApply;
