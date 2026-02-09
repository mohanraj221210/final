import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import StaffHeader from '../../components/StaffHeader';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface StudentOutpass {
    id: string;
    studentId: string;
    registerNumber: string;
    studentname: string;
    year: string;
    section: string;
    department: string;
    mobile: string;
    appliedDate: string;
    photo: string;

    // Parents Details
    parentContact: string;

    // Hostel Details
    hostelname: string;
    hostelroomno: string;

    // Last Outpass
    lastOutpassFrom?: string;
    lastOutpassTo?: string;
    lastOutpassReason?: string;
    lastOutpassApprovedBy?: string;
    lastOutpassStatus?: ApprovalStatus;

    // Current Request
    reason: string;
    fromDate: string;
    toDate: string;

    // Approval Status
    staffApproval: ApprovalStatus;
    yearInchargeApproval: ApprovalStatus;
    wardenApproval: ApprovalStatus;
    staffApprovedBy?: string;
    outpasstype: string;
    residencetype?: string;
}

const PassApproval: React.FC = () => {
    const [selectedStudent, setSelectedStudent] = useState<StudentOutpass | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | ApprovalStatus>('all');
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [actionRemarks, setActionRemarks] = useState('');
    const [students, setStudents] = useState<StudentOutpass[]>([]);
    const [roommates, setRoommates] = useState<any[]>([]);
    const [loadingRoommates, setLoadingRoommates] = useState(false);
    const [currentStaffName, setCurrentStaffName] = useState('');

    useEffect(() => {
        const fetchStaffProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/staff/profile`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.status === 200) {
                    setCurrentStaffName(response.data.staff.name);
                }
            } catch (error) {
                console.error("Failed to fetch staff profile", error);
            }
        };
        fetchStaffProfile();
    }, []);

    const fetchOutpassDetails = async (outpassId: string) => {
        try {
            setLoadingRoommates(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/staff/outpass/${outpassId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 200) {
                const data = response.data.outpass;
                const roomMatesData = response.data.roomMates || [];
                const studentDetails = data.studentid || {};

                const mappedStudent: StudentOutpass = {
                    id: data._id,
                    studentId: studentDetails.registerNumber || 'N/A',
                    registerNumber: studentDetails.registerNumber || 'N/A',
                    studentname: studentDetails.name || 'Student',
                    year: studentDetails.year || 'N/A',
                    section: 'N/A',
                    department: studentDetails.department || 'N/A',
                    mobile: studentDetails.phone || 'N/A',
                    appliedDate: data.createdAt,
                    photo: studentDetails.photo || 'Student',
                    parentContact: studentDetails.parentnumber || 'N/A',
                    hostelname: studentDetails.hostelname || 'N/A',
                    hostelroomno: studentDetails.hostelroomno || 'N/A',
                    reason: data.reason,
                    fromDate: data.fromDate,
                    toDate: data.toDate,
                    staffApproval: data.staffapprovalstatus || 'pending',
                    staffApprovedBy: data.staffApprovedBy, // Map from API if available
                    yearInchargeApproval: data.yearinchargeapprovalstatus || 'pending',
                    wardenApproval: data.wardenapprovalstatus || 'pending',
                    lastOutpassFrom: data.lastOutpassFrom,
                    lastOutpassTo: data.lastOutpassTo,
                    lastOutpassReason: data.lastOutpassReason,
                    lastOutpassApprovedBy: data.lastOutpassApprovedBy,
                    lastOutpassStatus: data.lastOutpassStatus,
                    outpasstype: data.outpassType,
                    residencetype: studentDetails.residenceType || 'dayScholar'
                };

                setSelectedStudent(mappedStudent);
                setRoommates(roomMatesData);
            }
        } catch (error) {
            console.error("Failed to fetch outpass details:", error);
            toast.error("Failed to load details");
        } finally {
            setLoadingRoommates(false);
        }
    };

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/staff/outpass/list`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (response.status === 200) {
                    const mappedStudents = (response.data.outpasses || [])
                        .map((item: any) => {
                            const studentDetails = item.studentid || {};
                            return {
                                id: item._id,
                                studentId: studentDetails.registerNumber || 'N/A',
                                registerNumber: studentDetails.registerNumber || 'N/A',
                                studentname: studentDetails.name || 'Student',
                                year: studentDetails.year || 'N/A',
                                section: 'N/A',
                                department: studentDetails.department || 'N/A',
                                mobile: studentDetails.phone || 'N/A',
                                appliedDate: item.createdAt,
                                photo: studentDetails.photo || 'Student',
                                parentContact: studentDetails.parentnumber || 'N/A',
                                hostelName: 'N/A',
                                roomNumber: 'N/A',
                                reason: item.reason,
                                fromDate: item.fromDate,
                                toDate: item.toDate,
                                staffApproval: item.staffapprovalstatus || 'pending',
                                yearInchargeApproval: item.yearinchargeapprovalstatus || 'pending',
                                wardenApproval: item.wardenapprovalstatus || 'pending',
                                outpasstype: item.outpasstype,
                                residencetype: studentDetails.residencetype || 'dayScholar'
                            };
                        });

                    // Sort: Emergency first
                    mappedStudents.sort((a: any, b: any) => {
                        if (a.outpasstype === 'Emergency' && b.outpasstype !== 'Emergency') return -1;
                        if (a.outpasstype !== 'Emergency' && b.outpasstype === 'Emergency') return 1;
                        return 0;
                    });

                    setStudents(mappedStudents);
                }
            } catch (error) {
                console.error("Error fetching pass requests:", error);
                toast.error("Failed to load outpass requests");
            }
        };

        fetchRequests();
    }, []);


    // Filter and search logic
    const filteredStudents = students.filter(student => {
        const matchesSearch =
            student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.studentname.toLowerCase().includes(searchQuery.toLowerCase());

        // FIX: Filter based purely on Staff Approval status for this page
        const overallStatus = student.staffApproval;

        const matchesFilter = filterStatus === 'all' || overallStatus === filterStatus;

        return matchesSearch && matchesFilter;
    }).sort((a, b) => {
        // Priority 1: Emergency First
        const isAEmergency = a.outpasstype?.toLowerCase() === 'emergency';
        const isBEmergency = b.outpasstype?.toLowerCase() === 'emergency';

        if (isAEmergency && !isBEmergency) return -1;
        if (!isAEmergency && isBEmergency) return 1;

        // Priority 2: Pending First
        if (a.staffApproval === 'pending' && b.staffApproval !== 'pending') return -1;
        if (a.staffApproval !== 'pending' && b.staffApproval === 'pending') return 1;

        // Priority 3: Date (Newest first)
        return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: ApprovalStatus) => {
        const config = {
            pending: { dot: '●', label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
            approved: { dot: '●', label: 'Approved', color: '#10b981', bg: '#d1fae5' },
            rejected: { dot: '●', label: 'Rejected', color: '#ef4444', bg: '#fee2e2' },
        };
        const c = config[status];
        return (
            <span className="status-badge" style={{ color: c.color, backgroundColor: c.bg }}>
                <span className="status-dot">{c.dot}</span>
                {c.label}
            </span>
        );
    };

    const handleApprove = () => {
        setActionType('approve');
        setShowActionModal(true);
    };

    const handleReject = () => {
        setActionType('reject');
        setShowActionModal(true);
    };


    const confirmAction = async () => {
        if (!selectedStudent || !actionRemarks.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/staff/outpass/approval`,
                {
                    outpassId: selectedStudent.id,
                    staffapprovalstatus: actionType === 'approve' ? 'approved' : 'rejected',
                    staffremarks: actionRemarks
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                toast.success(response.data.message || `Outpass ${actionType}d successfully`);

                const newStatus = actionType === 'approve' ? 'approved' : 'rejected';

                // Update local state to reflect changes immediately
                setStudents(prev => prev.map(student =>
                    student.id === selectedStudent.id
                        ? {
                            ...student,
                            staffApproval: newStatus
                        }
                        : student
                ));

                // Update selectedStudent to reflect new status immediately without closing
                setSelectedStudent(prev => prev ? ({
                    ...prev,
                    staffApproval: newStatus,
                    staffApprovedBy: actionType === 'approve' ? currentStaffName : undefined
                }) : null);

                setShowActionModal(false);
                setActionRemarks('');
                // Removed setSelectedStudent(null) to keep user on the page
            }
        } catch (error: any) {
            console.error('Error updating outpass status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };



    const canApprove = selectedStudent && selectedStudent.staffApproval === 'pending';

    return (
        <div className="page-container approval-page">
            <StaffHeader activeMenu="dashboard" />
            <ToastContainer position="bottom-right" />

            <div className="content-wrapper">
                {!selectedStudent ? (
                    /* Student List View */
                    <div className="list-view">
                        <div className="page-header">
                            <h1>All Applied Student List</h1>
                        </div>

                        {/* Search and Filter */}
                        <div className="controls-bar">
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by Student ID or Name"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-buttons">
                                <button
                                    className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('all')}
                                >
                                    All
                                </button>
                                <button
                                    className={`filter-btn pending ${filterStatus === 'pending' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('pending')}
                                >
                                    Pending
                                </button>
                                <button
                                    className={`filter-btn approved ${filterStatus === 'approved' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('approved')}
                                >
                                    Approved
                                </button>
                                <button
                                    className={`filter-btn rejected ${filterStatus === 'rejected' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('rejected')}
                                >
                                    Rejected
                                </button>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="student-list">
                            {filteredStudents.map((student) => {
                                // Staff View: Prioritize Staff Approval Status
                                const overallStatus = student.staffApproval;

                                return (
                                    <div
                                        key={student.id}
                                        className="student-card"
                                        onClick={() => fetchOutpassDetails(student.id)}
                                    >
                                        <div className="student-card-main">
                                            <div className="student-id-highlight">
                                                {student.studentId}
                                            </div>
                                            <div className="student-info">
                                                <div className="student-name">
                                                    {student.studentname}
                                                    {student.outpasstype === 'Emergency' && <span className="emergency-badge">EMERGENCY</span>}
                                                </div>
                                                <div className="student-meta">
                                                    Year {student.year} • {student.outpasstype || 'General'} • Applied on {formatDateTime(student.appliedDate)}
                                                </div>
                                                {student.outpasstype?.toLowerCase() === 'emergency' && (
                                                    <div className="emergency-badge">🚨 EMERGENCY</div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="student-card-action">
                                            {getStatusBadge(overallStatus as ApprovalStatus)}
                                            <span className="view-arrow">View →</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Detail View */
                    <div className="detail-view">
                        <button className="back-btn" onClick={() => setSelectedStudent(null)}>
                            ← Back to Student List
                        </button>

                        <div className="page-header">
                            <h1>Outpass Approval</h1>
                        </div>

                        <div className="details-container">
                            {/* Student Personal Details */}
                            <div className="detail-card">
                                <div className="card-header">
                                    <span className="card-icon">👤</span>
                                    <h2>Student Personal Details</h2>
                                </div>
                                <div className="card-body">
                                    <div className="student-profile">
                                        <img src={`${import.meta.env.VITE_CDN_URL}${selectedStudent.photo}`} alt="Student" className="student-avatar" />
                                        <div className="profile-grid">
                                            <div className="profile-field">
                                                <label>STUDENT ID</label>
                                                <div className="field-value">{selectedStudent.id}</div>
                                            </div>
                                            <div className="profile-field">
                                                <label>REGISTER NUMBER</label>
                                                <div className="field-value">{selectedStudent.registerNumber}</div>
                                            </div>
                                            <div className="profile-field">
                                                <label>STUDENT NAME</label>
                                                <div className="field-value">{selectedStudent.studentname}</div>
                                            </div>
                                            <div className="profile-field">
                                                <label>DEPARTMENT</label>
                                                <div className="field-value">{selectedStudent.department}</div>
                                            </div>
                                            <div className="profile-field">
                                                <label>YEAR & SECTION</label>
                                                <div className="field-value">Year {selectedStudent.year} - Section {selectedStudent.section}</div>
                                            </div>
                                            <div className="profile-field">
                                                <label>MOBILE NUMBER</label>
                                                <div className="field-value">{selectedStudent.mobile}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* Parents Details */}
                            <div className="detail-card">
                                <div className="card-header">
                                    <span className="card-icon">👨‍👩‍👦</span>
                                    <h2>Parents Details</h2>
                                </div>
                                <div className="card-body">
                                    <div className="info-grid">
                                        <div className="info-field">
                                            <label>PARENT CONTACT</label>
                                            <div className="field-value">{selectedStudent.parentContact}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-card">
                                <div className="card-header">
                                    <span className="card-icon">🏢</span>
                                    <h2>Hostel Details</h2>
                                </div>
                                <div className="card-body">
                                    <div className="info-grid">
                                        <div className="info-field">
                                            <label>HOSTEL NAME</label>
                                            <div className="field-value">{selectedStudent.hostelname}</div>
                                        </div>
                                        <div className="info-field">
                                            <label>ROOM NUMBER</label>
                                            <div className="field-value">{selectedStudent.hostelroomno}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Last Outpass Details */}
                            {selectedStudent.lastOutpassFrom && (
                                <div className="detail-card">
                                    <div className="card-header">
                                        <span className="card-icon">📋</span>
                                        <h2>Last Outpass Details</h2>
                                    </div>
                                    <div className="card-body">
                                        <div className="info-grid">
                                            <div className="info-field">
                                                <label>DATE RANGE</label>
                                                <div className="field-value">
                                                    {formatDateTime(selectedStudent.lastOutpassFrom!)} → {formatDateTime(selectedStudent.lastOutpassTo!)}
                                                </div>
                                            </div>
                                            <div className="info-field">
                                                <label>REASON</label>
                                                <div className="field-value">{selectedStudent.lastOutpassReason}</div>
                                            </div>
                                            <div className="info-field">
                                                <label>APPROVED BY</label>
                                                <div className="field-value">{selectedStudent.lastOutpassApprovedBy}</div>
                                            </div>
                                            <div className="info-field">
                                                <label>STATUS</label>
                                                {getStatusBadge(selectedStudent.lastOutpassStatus!)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Outpass Request Details */}
                            <div className="detail-card highlight-card">
                                <div className="card-header">
                                    <span className="card-icon">📝</span>
                                    <h2>Outpass Request Details</h2>
                                </div>
                                <div className="card-body">
                                    <div className="info-grid">
                                        <div className="info-field full-width">
                                            <label>REASON FOR OUTPASS</label>
                                            <div className="field-value">{selectedStudent.reason}</div>
                                        </div>
                                        <div className="info-field">
                                            <label>FROM DATE & TIME</label>
                                            <div className="field-value">{formatDateTime(selectedStudent.fromDate)}</div>
                                        </div>
                                        <div className="info-field">
                                            <label>TO DATE & TIME</label>
                                            <div className="field-value">{formatDateTime(selectedStudent.toDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Roommate Details */}
                            {selectedStudent.hostelname && selectedStudent.hostelname !== 'N/A' && (
                                <div className="detail-card">
                                    <div className="card-header">
                                        <span className="card-icon">👥</span>
                                        <h2>Roommate Details</h2>
                                    </div>
                                    <div className="card-body">
                                        {loadingRoommates ? (
                                            <div className="loading-text">Loading roommates...</div>
                                        ) : roommates.length > 0 ? (
                                            <div className="roommates-grid">
                                                {roommates.map((roommate: any) => (
                                                    <div key={roommate._id} className="roommate-card">
                                                        <div className="roommate-avatar">
                                                            <img
                                                                src={roommate.photo || `https://ui-avatars.com/api/?name=${roommate.name}&background=random`}
                                                                alt={roommate.name}
                                                                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div className="roommate-info">
                                                            <h4>{roommate.name}</h4>
                                                            <p style={{ margin: 0 }}>{roommate.registerNumber}</p>
                                                            <span className="dept-badge">{roommate.department}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-data">
                                                <p>No roommates assigned or found.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Approval Workflow */}
                            <div className="detail-card">
                                <div className="card-header">
                                    <span className="card-icon">✅</span>
                                    <h2>Approval Workflow</h2>
                                </div>
                                <div className="card-body">
                                    <div className="status-timeline">
                                        <div className="status-step completed">
                                            <div className="step-dot">✓</div>
                                            <div className="step-content">
                                                <h4>Request Submitted</h4>
                                                <p>{formatDateTime(selectedStudent.appliedDate)}</p>
                                            </div>
                                        </div>

                                        <div className={`status-step ${selectedStudent.staffApproval === 'approved' ? 'completed' : selectedStudent.staffApproval === 'rejected' ? 'rejected' : 'active'}`}>
                                            <div className="step-dot">
                                                {selectedStudent.staffApproval === 'approved' ? '✓' :
                                                    selectedStudent.staffApproval === 'rejected' ? '✕' : '●'}
                                            </div>
                                            <div className="step-content">
                                                <h4>Staff Approval</h4>
                                                <p>
                                                    Status: {selectedStudent.staffApproval}
                                                    {selectedStudent.staffApproval === 'approved' && selectedStudent.staffApprovedBy && (
                                                        <span className="approver-name"> by {selectedStudent.staffApprovedBy}</span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`status-step ${selectedStudent.yearInchargeApproval === 'approved' ? 'completed' : selectedStudent.yearInchargeApproval === 'rejected' ? 'rejected' : (selectedStudent.staffApproval === 'approved' ? 'active' : 'pending')}`}>
                                            <div className="step-dot">
                                                {selectedStudent.yearInchargeApproval === 'approved' ? '✓' :
                                                    selectedStudent.yearInchargeApproval === 'rejected' ? '✕' : '●'}
                                            </div>
                                            <div className="step-content">
                                                <h4>Year Incharge</h4>
                                                <p>{selectedStudent.yearInchargeApproval === 'pending' ? 'Pending Decision' : `Status: ${selectedStudent.yearInchargeApproval}`}</p>
                                            </div>
                                        </div>

                                        {selectedStudent.residencetype === 'hostel' && (
                                            <div className={`status-step ${selectedStudent.wardenApproval === 'approved' ? 'completed' : selectedStudent.wardenApproval === 'rejected' ? 'rejected' : (selectedStudent.yearInchargeApproval === 'approved' ? 'active' : 'pending')}`}>
                                                <div className="step-dot">
                                                    {selectedStudent.wardenApproval === 'approved' ? '✓' :
                                                        selectedStudent.wardenApproval === 'rejected' ? '✕' : '●'}
                                                </div>
                                                <div className="step-content">
                                                    <h4>Warden Approval</h4>
                                                    <p>{selectedStudent.wardenApproval === 'pending' ? 'Pending Decision' : `Status: ${selectedStudent.wardenApproval}`}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sticky Action Buttons */}
                        {canApprove && (
                            <div className="sticky-actions">
                                <button className="action-btn approve-btn" onClick={handleApprove}>
                                    ✓ Approve
                                </button>
                                <button className="action-btn reject-btn" onClick={handleReject}>
                                    ✗ Reject
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Modal (Approve/Reject) */}
            {showActionModal && (
                <div className="modal-overlay" onClick={() => setShowActionModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{actionType === 'approve' ? 'Approve Outpass Request' : 'Reject Outpass Request'}</h3>
                            <button className="modal-close" onClick={() => setShowActionModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <label>Remarks (Required)</label>
                            <textarea
                                value={actionRemarks}
                                onChange={(e) => setActionRemarks(e.target.value)}
                                placeholder={actionType === 'approve' ? 'Please provide approval remarks...' : 'Please provide reason for rejection...'}
                                rows={4}
                            />
                        </div>
                        <div className="modal-footer">
                            <button className="modal-btn cancel-btn" onClick={() => setShowActionModal(false)}>
                                Cancel
                            </button>
                            <button
                                className={`modal-btn ${actionType === 'approve' ? 'approve-confirm-btn' : 'confirm-btn'}`}
                                onClick={confirmAction}
                                disabled={!actionRemarks.trim()}
                            >
                                {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .approver-name {
                    display: block;
                    font-size: 0.8rem;
                    color: #64748b;
                    margin-top: 4px;
                    font-style: italic;
                }

                .page-container {
                    min-height: 100vh;
                    padding-top: 0px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%);
                }

                /* Fixed Header Styles Removed - using StaffHeader component */

                .content-wrapper {
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }

                /* Page Header */
                .page-header {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    padding: 32px 40px;
                    border-radius: 20px;
                    margin-bottom: 32px;
                    box-shadow: 0 10px 30px rgba(0, 71, 171, 0.2);
                }

                .page-header h1 {
                    margin: 0;
                    font-size: 2.2rem;
                    color: white;
                    font-weight: 700;
                }

                /* Controls Bar */
                .controls-bar {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .search-box {
                    flex: 1;
                    min-width: 300px;
                    position: relative;
                }

                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.2rem;
                }

                .search-box input {
                    width: 100%;
                    padding: 14px 16px 14px 48px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: all 0.3s;
                    background: white;
                }

                .search-box input:focus {
                    outline: none;
                    border-color: #0047AB;
                    box-shadow: 0 0 0 3px rgba(0, 71, 171, 0.1);
                }

                .filter-buttons {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .filter-btn {
                    padding: 12px 24px;
                    border: 2px solid #e2e8f0;
                    background: white;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-size: 0.95rem;
                }

                .filter-btn:hover {
                    border-color: #0047AB;
                    background: #f0f9ff;
                }

                .filter-btn.active {
                    background: #0047AB;
                    color: white;
                    border-color: #0047AB;
                }

                .filter-btn.pending.active {
                    background: #f59e0b;
                    border-color: #f59e0b;
                }

                .filter-btn.approved.active {
                    background: #10b981;
                    border-color: #10b981;
                }

                .filter-btn.rejected.active {
                    background: #ef4444;
                    border-color: #ef4444;
                }

                /* Student List */
                .student-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .emergency-badge {
                    background-color: #ef4444;
                    color: white;
                    font-size: 0.7rem;
                    padding: 2px 6px;
                    border-radius: 4px;
                    margin-left: 8px;
                    font-weight: 700;
                    vertical-align: middle;
                }

                .student-card {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 2px solid transparent;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
                }

                .student-card:hover {
                    border-color: #0047AB;
                    transform: translateX(8px);
                    box-shadow: 0 8px 24px rgba(0, 71, 171, 0.15);
                }

                .student-card-main {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .student-id-highlight {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    min-width: 140px;
                    text-align: center;
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.3);
                }

                .student-info {
                    flex: 1;
                }

                .student-name {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 4px;
                }

                .student-meta {
                    color: #64748b;
                    font-size: 0.95rem;
                }

                .student-card-action {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    margin-left: auto; /* Push to the right */
                }

                .view-arrow {
                    color: #0047AB;
                    font-weight: 700;
                    font-size: 1rem;
                }

                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.9rem;
                    border: 2px solid currentColor;
                }

                .status-dot {
                    font-size: 0.8rem;
                }

                /* Detail View */
                .detail-view {
                    animation: slideIn 0.4s ease-out;
                    padding-bottom: 100px;
                }

                .back-btn {
                    background: white;
                    border: 2px solid #0047AB;
                    color: #0047AB;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-bottom: 24px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .back-btn:hover {
                    background: #0047AB;
                    color: white;
                    transform: translateX(-4px);
                }

                .details-container {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .detail-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                    border: 1px solid rgba(0, 0, 0, 0.05);
                }

                .highlight-card {
                    border: 3px solid #fbbf24;
                    box-shadow: 0 4px 20px rgba(251, 191, 36, 0.2);
                }

                .card-header {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    padding: 20px 28px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .card-icon {
                    font-size: 1.8rem;
                }

                .card-header h2 {
                    margin: 0;
                    font-size: 1.3rem;
                    color: white;
                    font-weight: 700;
                }

                .card-body {
                    padding: 28px;
                }

                .student-profile {
                    display: flex;
                    gap: 28px;
                    align-items: flex-start;
                }

                .student-avatar {
                    width: 140px;
                    height: 140px;
                    border-radius: 16px;
                    object-fit: cover;
                    border: 4px solid #0047AB;
                    box-shadow: 0 8px 20px rgba(0, 71, 171, 0.2);
                }

                .profile-grid,
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                    flex: 1;
                }

                .profile-field,
                .info-field {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .info-field.full-width {
                    grid-column: 1 / -1;
                }

                .profile-field label,
                .info-field label {
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .field-value {
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 10px;
                    color: #1e293b;
                    font-size: 1rem;
                    font-weight: 600;
                    border-left: 4px solid #0047AB;
                }

                .emergency-badge {
                    display: inline-block;
                    background-color: #fee2e2;
                    color: #ef4444;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-top: 4px;
                    border: 1px solid #ef4444;
                }

                /* Approval Stepper */
                .status-timeline {
                    margin: 0;
                    padding: 10px 0;
                    display: flex;
                    justify-content: space-between;
                }

                .status-step {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    position: relative;
                    flex: 1;
                }

                .status-step:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    top: 14px;
                    left: 50%;
                    width: 100%;
                    height: 2px;
                    background: #e2e8f0;
                    z-index: 0;
                }

                .status-step.completed:not(:last-child)::after {
                    background: #10b981;
                }

                .step-dot {
                    width: 30px;
                    height: 30px;
                    background: white;
                    border: 2px solid #e2e8f0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    z-index: 1;
                    margin-bottom: 8px;
                    color: #64748b;
                    font-size: 0.8rem;
                }

                .status-step.completed .step-dot {
                    background: #10b981;
                    border-color: #10b981;
                    color: white;
                }

                .status-step.active .step-dot {
                    border-color: #3b82f6;
                    color: #3b82f6;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
                }

                 .status-step.rejected .step-dot {
                    background: #ef4444;
                    border-color: #ef4444;
                    color: white;
                }

                .step-content {
                    width: 100%;
                }

                .step-content h4 {
                    margin: 0 0 4px;
                    font-size: 0.9rem;
                    color: #1e293b;
                    font-weight: 600;
                }

                .step-content p {
                    margin: 0;
                    font-size: 0.8rem;
                    color: #64748b;
                }

                .approver-name {
                    display: block;
                    font-size: 0.75rem;
                    color: #64748b;
                    font-style: italic;
                    margin-top: 2px;
                }

                /* Sticky Actions */
                .sticky-actions {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    padding: 20px;
                    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    z-index: 100;
                }

                .action-btn {
                    padding: 16px 48px;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .approve-btn {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                }

                .approve-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
                }

                .reject-btn {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
                }

                .reject-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
                }

                /* Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }

                .modal-content {
                    background: white;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 500px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                }

                .modal-header {
                    background: linear-gradient(135deg, #0047AB, #2563eb);
                    padding: 24px 28px;
                    border-radius: 20px 20px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .modal-header h3 {
                    margin: 0;
                    color: white;
                    font-size: 1.4rem;
                }

                .modal-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .modal-body {
                    padding: 28px;
                }

                .modal-body label {
                    display: block;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 12px;
                    font-size: 1rem;
                }

                .modal-body textarea {
                    width: 100%;
                    padding: 14px;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-family: inherit;
                    resize: vertical;
                }

                .modal-body textarea:focus {
                    outline: none;
                    border-color: #0047AB;
                }

                .modal-footer {
                    padding: 0 28px 28px 28px;
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                }

                .modal-btn {
                    padding: 12px 28px;
                    border: none;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .cancel-btn {
                    background: #f1f5f9;
                    color: #475569;
                }

                .cancel-btn:hover {
                    background: #e2e8f0;
                }

                .confirm-btn {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: white;
                }

                .confirm-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }

                .confirm-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .approve-confirm-btn {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                }

                .approve-confirm-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
                }

                .approve-confirm-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }


                /* Animations */
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                /* Responsive */
                @media (max-width: 768px) {
                    .content-wrapper {
                        padding: 20px 16px;
                    }

                    .page-header {
                        padding: 24px 20px;
                    }

                    .page-header h1 {
                        font-size: 1.8rem;
                    }

                    .controls-bar {
                        flex-direction: column;
                    }

                    .search-box {
                        min-width: 100%;
                    }

                    .filter-buttons {
                        width: 100%;
                    }

                    .filter-btn {
                        flex: 1;
                    }

                    .student-card {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .student-card-main {
                        flex-direction: column;
                        align-items: flex-start;
                        width: 100%;
                    }

                    .student-id-highlight {
                        width: 100%;
                    }

                    .student-card-action {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .student-profile {
                        flex-direction: column;
                        align-items: center;
                    }

                    .student-avatar {
                        width: 120px;
                        height: 120px;
                    }

                    .profile-grid,
                    .info-grid {
                        grid-template-columns: 1fr;
                    }

                    .sticky-actions {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .action-btn {
                        width: 100%;
                        justify-content: center;
                    }
                }

                /* Roommate Styles */
                .roommates-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                }

                .roommate-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    transition: all 0.2s;
                }

                .roommate-card:hover {
                    background: white;
                    border-color: #0047AB;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                }

                .roommate-avatar {
                    width: 48px;
                    height: 48px;
                    background: #e0f2fe;
                    color: #0369a1;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    font-weight: 700;
                    flex-shrink: 0;
                }

                .roommate-info h4 {
                    margin: 0 0 4px;
                    font-size: 1rem;
                    color: #0f172a;
                }

                .dept-badge {
                    font-size: 0.75rem;
                    background: #f1f5f9;
                    padding: 2px 8px;
                    border-radius: 12px;
                    color: #475569;
                    font-weight: 600;
                    display: inline-block;
                    margin-top: 4px;
                }

                .loading-text, .no-data {
                    text-align: center;
                    color: #94a3b8;
                    font-style: italic;
                    padding: 20px;
                }

                /* Mobile Approval Workflow */
                /* Mobile Approval Workflow */
                @media (max-width: 768px) {
                    .status-timeline {
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                    }
                    .status-step {
                        flex-direction: row;
                        align-items: center;
                        gap: 16px;
                        width: 100%;
                        text-align: left;
                    }
                    .status-step:not(:last-child)::after {
                        width: 2px;
                        height: 100%;
                        top: 14px;
                        left: 15px;
                    }
                     .step-content {
                        width: auto;
                        flex: 1;
                    }
                    .step-content h4 {
                        font-size: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default PassApproval;
