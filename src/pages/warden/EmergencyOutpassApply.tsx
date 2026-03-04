import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
                                                <img src={`${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${student.photo.replace(/^\//, '')}`} alt={student.name} />
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
                .content-container {
                    padding: 40px;
                    max-width: 1000px;
                    margin: 0 auto;
                    margin-top: 60px;
                }

                .back-btn {
                    background: white;
                    border: 1px solid #cbd5e1;
                    font-size: 16px;
                    color: #1e3a8a;
                    cursor: pointer;
                    margin-bottom: 24px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 24px;
                    border-radius: 50px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .back-btn:hover {
                    background: #f1f5f9;
                    transform: translateX(-5px);
                }

                .emergency-header {
                    margin-bottom: 32px;
                }

                .emergency-header h2 {
                    color: #ef4444; /* Red color for emergency */
                    font-size: 2rem;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .emergency-header p {
                    color: #64748b;
                    font-size: 1.1rem;
                }

                .card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                    border: 1px solid rgba(0,0,0,0.05);
                    margin-bottom: 24px;
                    animation: fadeInUp 0.5s ease;
                }

                .card h3 {
                    color: #1e293b;
                    margin-bottom: 20px;
                    font-size: 1.25rem;
                }

                /* Search Form */
                .search-form {
                    display: flex;
                    gap: 16px;
                }

                .room-input {
                    flex: 1;
                    padding: 14px 20px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    outline: none;
                    transition: all 0.3s;
                }

                .room-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .search-btn {
                    padding: 0 32px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1.1rem;
                }

                /* Student Grid */
                .student-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }

                .student-select-card {
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                }

                .student-select-card:hover {
                    border-color: #cbd5e1;
                    background: #f8fafc;
                }

                .student-select-card.selected {
                    border-color: #ef4444;
                    background: #fef2f2;
                }

                .student-select-avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #e2e8f0;
                    flex-shrink: 0;
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
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #64748b;
                    text-transform: uppercase;
                }

                .student-select-info h4 {
                    margin: 0 0 4px 0;
                    color: #1e293b;
                    font-size: 1.1rem;
                }

                .student-select-info p {
                    margin: 0 0 6px 0;
                    color: #64748b;
                    font-size: 0.9rem;
                }

                .dept-badge {
                    background: #e2e8f0;
                    color: #475569;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .check-icon {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: #ef4444;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 0.9rem;
                }

                /* Apply Form */
                .selected-student-summary {
                    background: #fef2f2;
                    border: 1px dashed #ef4444;
                    padding: 16px;
                    border-radius: 8px;
                    color: #991b1b;
                    margin-bottom: 24px;
                    font-size: 1.1rem;
                }

                .form-group {
                    margin-bottom: 24px;
                }

                .form-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 600;
                    color: #1e293b;
                }

                .form-group textarea {
                    width: 100%;
                    padding: 16px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-family: inherit;
                    resize: vertical;
                    transition: all 0.3s;
                }

                .form-group textarea:focus {
                    border-color: #ef4444;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }

                .summary-alert {
                    background: #fffbeb;
                    border-left: 4px solid #f59e0b;
                    padding: 16px;
                    border-radius: 4px 8px 8px 4px;
                    color: #b45309;
                    margin-bottom: 24px;
                }

                .btn-danger {
                    background: #ef4444;
                    color: white;
                    border: none;
                }
                
                .btn-danger:hover {
                    background: #dc2626;
                }

                .submit-btn {
                    width: 100%;
                    padding: 16px;
                    font-size: 1.1rem;
                    border-radius: 12px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @media (max-width: 768px) {
                    .search-form {
                        flex-direction: column;
                    }
                    .search-btn {
                        padding: 14px;
                    }
                    .content-container {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default EmergencyOutpassApply;
