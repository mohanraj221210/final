import React, { useState, useEffect } from 'react';
import YearInchargeNav from '../../components/YearInchargeNav';
import LoadingSpinner from '../../components/LoadingSpinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

interface StudentDetails {
    _id: string;
    name: string;
    registerNumber: string;
    department: string;
    year: string;
    residencetype: string;
    boardingpoint?: string;
    busno?: string;
    hostelname?: string;
    hostelroomno?: string;
    phone: string;
    photo: string;
}

interface Outpass {
    _id: string;
    studentid: StudentDetails;
    outpasstype: string;
    fromDate: string;
    toDate: string;
    reason: string;
    staffapprovalstatus: string;
    wardenapprovalstatus: string;
    yearinchargeapprovalstatus: string;
    proof?: string;
    document?: string;
    file?: string;
    // Access details from studentid instead of root
}

const YearInchargeOutpassList: React.FC = () => {
    const [outpasses, setOutpasses] = useState<Outpass[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOutpasses = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/year-incharge-login');
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/incharge/outpass/list/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.status === 200) {
                    const list = response.data.outpasslist || [];
                    const sortedList = list.sort((a: any, b: any) => {
                        // Priority 1: Emergency first
                        const isAEmergency = a.outpasstype?.toLowerCase() === 'emergency';
                        const isBEmergency = b.outpasstype?.toLowerCase() === 'emergency';

                        if (isAEmergency && !isBEmergency) return -1;
                        if (!isAEmergency && isBEmergency) return 1;

                        // Priority 2: Date (Newest first)
                        return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
                    });
                    setOutpasses(sortedList);
                }
            } catch (error) {
                console.error("Error fetching outpasses:", error);
                toast.error("Failed to fetch outpass list");
            } finally {
                setLoading(false);
            }
        };

        fetchOutpasses();
    }, [navigate]);

    const handleViewDocument = (url: string | null) => {
        if (!url) return;
        const fullUrl = `${import.meta.env.VITE_CDN_URL?.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
        setDocumentUrl(fullUrl);
        if (url.toLowerCase().endsWith('.pdf')) {
            setDocumentType('pdf');
        } else {
            setDocumentType('image');
        }
        setShowDocumentModal(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const filteredOutpasses = outpasses.filter(outpass => {
        const fromDateObj = outpass.fromDate ? new Date(outpass.fromDate) : null;
        const dateStr1 = fromDateObj ? fromDateObj.toLocaleDateString() : '';
        const dateStr2 = fromDateObj ? fromDateObj.toLocaleString() : '';
        const dateStr3 = fromDateObj ? fromDateObj.toDateString() : '';
        const dateStr4 = outpass.fromDate ? outpass.fromDate.split('T')[0] : '';

        const term = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            (outpass.studentid?.name?.toLowerCase().includes(term) || false) ||
            (outpass.studentid?.registerNumber?.toLowerCase().includes(term) || false) ||
            dateStr1.toLowerCase().includes(term) ||
            dateStr2.toLowerCase().includes(term) ||
            dateStr3.toLowerCase().includes(term) ||
            dateStr4.toLowerCase().includes(term);

        let matchesDate = true;
        if (dateFilter !== 'all') {
            const appliedDate = new Date(outpass.fromDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dateFilter === 'today') {
                matchesDate = appliedDate >= today;
            } else if (dateFilter === 'yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                matchesDate = appliedDate >= yesterday && appliedDate < today;
            } else if (dateFilter === 'this_week') {
                const thisWeek = new Date(today);
                thisWeek.setDate(today.getDate() - today.getDay());
                matchesDate = appliedDate >= thisWeek;
            } else if (dateFilter === 'this_month') {
                const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                matchesDate = appliedDate >= thisMonth;
            }
        }

        return matchesSearch && matchesDate;
    });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="page-container">
            <ToastContainer position="bottom-right" />
            <YearInchargeNav />
            <div className="content-wrapper">
                <button className="back-btn" onClick={() => navigate('/year-incharge-dashboard')}>
                    ← Back to Dashboard
                </button>
                <div className="page-header">
                    <h1>All Outpass Records</h1>
                    <p className="subtitle">View history of all student outpasses</p>
                </div>

                <div className="search-bar" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by Name or Register Number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '14px', pointerEvents: 'none' }}>
                            📅
                        </span>
                        <select
                            className="date-filter-select"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value as any)}
                            style={{
                                padding: '10px 32px 10px 36px',
                                borderRadius: '12px',
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                color: '#1e293b',
                                fontSize: '14px',
                                fontWeight: '600',
                                outline: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                appearance: 'none',
                                minWidth: '150px'
                            }}
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="this_week">This Week</option>
                            <option value="this_month">This Month</option>
                        </select>
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '10px', pointerEvents: 'none' }}>
                            ▼
                        </span>
                    </div>
                </div>

                <div className="table-container">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Student Details</th>
                                <th>Pass Information</th>
                                <th>Duration</th>
                                <th>Residence</th>
                                <th>Approvals</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOutpasses.length > 0 ? (
                                filteredOutpasses.map((outpass) => (
                                    <tr key={outpass._id}>
                                        <td data-label="Student Details">
                                            <div className="student-info">
                                                <span className="font-bold">{typeof outpass.studentid?.name === 'string' ? outpass.studentid.name : 'Unknown'}</span>
                                                <span className="text-sm text-gray-500">{typeof outpass.studentid?.registerNumber === 'string' ? outpass.studentid.registerNumber : 'N/A'}</span>
                                                <span className="text-xs text-gray-400">
                                                    {typeof outpass.studentid?.year === 'string' ? outpass.studentid.year : ''} - {typeof outpass.studentid?.department === 'string' ? outpass.studentid.department : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td data-label="Pass Information">
                                            <div className="pass-info">
                                                <span className="pass-type">{outpass.outpasstype}</span>
                                                {outpass.outpasstype?.toLowerCase() === 'emergency' && (
                                                    <span className="emergency-badge">🚨 CRITICAL</span>
                                                )}
                                            </div>
                                        </td>
                                        <td data-label="Duration">
                                            <div className="date-info">
                                                <span className="date-label">From: {new Date(outpass.fromDate).toLocaleString()}</span>
                                                <span className="date-label">To: {new Date(outpass.toDate).toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td data-label="Residence">
                                            <div className="residence-info">
                                                <span className="residence-type">{outpass.studentid?.residencetype}</span>
                                                {outpass.studentid?.residencetype?.toLowerCase().replace(/\s/g, '') === 'dayscholar' ? (
                                                    <>
                                                        <span className="text-xs">Bus: {outpass.studentid?.busno || 'N/A'}</span>
                                                        <span className="text-xs">Boarding: {outpass.studentid?.boardingpoint || 'N/A'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-xs">Hostel: {outpass.studentid?.hostelname || 'N/A'}</span>
                                                        <span className="text-xs">Room: {outpass.studentid?.hostelroomno || 'N/A'}</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td data-label="Approvals">
                                            <div className="status-stack">
                                                <span className={`status-badge ${getStatusColor(outpass.staffapprovalstatus)}`}>
                                                    Staff: {outpass.staffapprovalstatus}
                                                </span>
                                                <span className={`status-badge ${getStatusColor(outpass.yearinchargeapprovalstatus)}`}>
                                                    Incharge: {outpass.yearinchargeapprovalstatus}
                                                </span>
                                                {outpass.studentid?.residencetype?.toLowerCase().replace(/\s/g, '') !== 'dayscholar' && outpass.yearinchargeapprovalstatus !== 'rejected' && (
                                                    <span className={`status-badge ${getStatusColor(outpass.wardenapprovalstatus)}`}>
                                                        Warden: {outpass.wardenapprovalstatus}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td data-label="Action">
                                            {(outpass.proof || outpass.document || outpass.file) ? (
                                                <button
                                                    className="view-doc-btn-list"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const url = (outpass.proof || outpass.document || outpass.file)!;
                                                        handleViewDocument(url);
                                                    }}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#eff6ff',
                                                        border: '1px solid #3b82f6',
                                                        borderRadius: '6px',
                                                        color: '#3b82f6',
                                                        fontSize: '0.8rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    📄 View Doc
                                                </button>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        No outpass records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredOutpasses.length > 0 && (
                    <div className="mobile-cards-view">
                        {filteredOutpasses.map((outpass) => (
                            <div className="mobile-card" key={outpass._id}>
                                <div className="card-header-mobile">
                                    <div>
                                        <h3 className="card-name">{typeof outpass.studentid?.name === 'string' ? outpass.studentid.name : 'Unknown'}</h3>
                                        <p className="card-reg">{typeof outpass.studentid?.registerNumber === 'string' ? outpass.studentid.registerNumber : 'N/A'}</p>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <span className="pass-type-mobile">{outpass.outpasstype}</span>
                                        {outpass.outpasstype?.toLowerCase() === 'emergency' && (
                                            <span className="emergency-badge mobile">🚨 CRITICAL</span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                        <span className="pass-type-mobile">{outpass.outpasstype}</span>
                                        {outpass.outpasstype?.toLowerCase() === 'emergency' && (
                                            <span className="emergency-badge mobile">🚨 CRITICAL</span>
                                        )}
                                    </div>
                                </div>

                                <div className="card-body-mobile">
                                    <div className="info-row">
                                        <span className="label">Dept/Year:</span>
                                        <span className="value">
                                            {typeof outpass.studentid?.department === 'string' ? outpass.studentid.department : ''} - {typeof outpass.studentid?.year === 'string' ? outpass.studentid.year : ''}
                                        </span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">From:</span>
                                        <span className="value">{new Date(outpass.fromDate).toLocaleString()}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">To:</span>
                                        <span className="value">{new Date(outpass.toDate).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="card-footer-mobile">
                                    <div className="status-grid">
                                        <span className={`status-badge-mobile ${getStatusColor(outpass.staffapprovalstatus)}`}>
                                            Staff: {outpass.staffapprovalstatus}
                                        </span>
                                        <span className={`status-badge-mobile ${getStatusColor(outpass.yearinchargeapprovalstatus)}`}>
                                            Incharge: {outpass.yearinchargeapprovalstatus}
                                        </span>
                                        {outpass.studentid?.residencetype?.toLowerCase().replace(/\s/g, '') !== 'dayscholar' && outpass.yearinchargeapprovalstatus !== 'rejected' && (
                                            <span className={`status-badge-mobile ${getStatusColor(outpass.wardenapprovalstatus)}`}>
                                                Warden: {outpass.wardenapprovalstatus}
                                            </span>
                                        )}
                                    </div>
                                    {(outpass.proof || outpass.document || outpass.file) && (
                                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-start' }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const url = (outpass.proof || outpass.document || outpass.file)!;
                                                    handleViewDocument(url);
                                                }}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: '#eff6ff',
                                                    border: '1px solid #3b82f6',
                                                    borderRadius: '6px',
                                                    color: '#3b82f6',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                📄 View Doc
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Document Modal */}
            {showDocumentModal && documentUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowDocumentModal(false)}>
                    <div className="bg-white rounded-lg p-4 w-full max-w-4xl h-[90vh] flex flex-col" style={{ background: 'white', padding: '20px', borderRadius: '12px', width: '90%', maxWidth: '1000px', height: '90vh', display: 'flex', flexDirection: 'column', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Supporting Document</h3>
                            <button
                                onClick={() => setShowDocumentModal(false)}
                                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
                            >
                                ✕
                            </button>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {documentType === 'pdf' ? (
                                <iframe
                                    src={documentUrl}
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                    title="Document Viewer"
                                />
                            ) : (
                                <img
                                    src={documentUrl}
                                    alt="Proof"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            )}
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                            <a
                                href={documentUrl}
                                download={`proof_document.${documentType === 'pdf' ? 'pdf' : 'jpg'}`}
                                style={{
                                    padding: '8px 16px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: 500
                                }}
                            >
                                Download File
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .back-btn {
                    background: none;
                    border: none;
                    font-size: 16px;
                    color: #64748b;
                    cursor: pointer;
                    margin-top: 80px;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: color 0.3s;
                    padding: 0;
                    font-weight: 500;
                }
                .back-btn:hover {
                    color: #1e3a8a;
                    transform: translateX(-4px);
                }

                .page-header {
                    margin-bottom: 32px;
                }
                .page-header h1 {
                    font-size: 2rem;
                    color: #1e293b;
                    margin-bottom: 8px;
                }
                .subtitle {
                    color: #64748b;
                }
                
                .search-bar {
                    margin-bottom: 24px;
                    position: relative;
                }
                .search-input {
                    width: 100%;
                    padding: 12px 16px 12px 48px;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    font-size: 1rem;
                    transition: all 0.2s;
                }
                .search-input:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    outline: none;
                }
                .search-icon {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 1.2rem;
                    color: #94a3b8;
                }

                .table-container {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    overflow-x: auto;
                }
                .custom-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }
                .custom-table th {
                    background: #f8fafc;
                    padding: 16px;
                    text-align: left;
                    font-weight: 600;
                    color: #475569;
                    border-bottom: 1px solid #e2e8f0;
                }
                .custom-table td {
                    padding: 16px;
                    border-bottom: 1px solid #f1f5f9;
                    vertical-align: top;
                }
                .custom-table tr:last-child td {
                    border-bottom: none;
                }

                .student-info, .pass-info, .date-info, .residence-info, .status-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .pass-type {
                    display: inline-block;
                    background: #eff6ff;
                    color: #3b82f6;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    width: fit-content;
                }

                .date-label {
                    font-size: 0.9rem;
                    color: #475569;
                }

                .status-badge {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: capitalize;
                    border: 1px solid;
                    width: fit-content;
                }
                
                .bg-green-100 { background-color: #dcfce7; }
                .text-green-800 { color: #166534; }
                .border-green-200 { border-color: #bbf7d0; }
                
                .bg-red-100 { background-color: #fee2e2; }
                .text-red-800 { color: #991b1b; }
                .border-red-200 { border-color: #fecaca; }
                
                .bg-yellow-100 { background-color: #fef9c3; }
                .text-yellow-800 { color: #854d0e; }
                .border-yellow-200 { border-color: #fde047; }
                
                .font-bold { font-weight: 600; }
                .text-sm { font-size: 0.875rem; }
                .text-xs { font-size: 0.75rem; }
                .text-gray-500 { color: #64748b; }
                .text-gray-400 { color: #94a3b8; }
                .residence-type { text-transform: capitalize; font-weight: 500; }

                .residence-type { text-transform: capitalize; font-weight: 500; }
                
                 .emergency-badge {
                    display: inline-block;
                    background-color: #fee2e2;
                    color: #ef4444;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    margin-left: 8px;
                    border: 1px solid #ef4444;
                    vertical-align: middle;
                }

                .emergency-badge.mobile {
                    margin-left: 0;
                    font-size: 0.65rem;
                }

                /* Mobile Card Styles */
                .mobile-cards-view {
                    display: none;
                    flex-direction: column;
                    gap: 16px;
                }

                .mobile-card {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                    border: 1px solid #f1f5f9;
                }

                .card-header-mobile {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .card-name {
                    font-size: 1rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }

                .card-reg {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin: 0;
                }

                .pass-type-mobile {
                    background: #eff6ff;
                    color: #3b82f6;
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .card-body-mobile {
                    margin-bottom: 12px;
                }

                .info-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                    font-size: 0.85rem;
                }
                
                .info-row:last-child {
                    margin-bottom: 0;
                }

                .info-row .label {
                    color: #64748b;
                }

                .info-row .value {
                    color: #334155;
                    font-weight: 500;
                    text-align: right;
                }

                .card-footer-mobile {
                    background: #f8fafc;
                    margin: 0 -16px -16px -16px;
                    padding: 12px;
                    border-radius: 0 0 12px 12px;
                }

                .status-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 6px;
                }

                .status-badge-mobile {
                    font-size: 0.65rem;
                    padding: 2px 4px;
                    border-radius: 4px;
                    text-align: center;
                    font-weight: 600;
                    border: 1px solid;
                    text-transform: capitalize;
                }

                @media (max-width: 768px) {
                    .table-container {
                        display: none;
                    }
                    .mobile-cards-view {
                        display: flex;
                    }
                    
                    /* Adjust search bar for mobile */
                    .search-input {
                        font-size: 16px; /* Prevent zoom */
                    }

                    .page-header h1 {
                        font-size: 1.5rem;
                    }

                    .list-container {
                        padding: 16px;
                    }

                    .page-container {
                        padding: 10px;
                    }
                }
            `}</style>
        </div >
    );
};

export default YearInchargeOutpassList;
