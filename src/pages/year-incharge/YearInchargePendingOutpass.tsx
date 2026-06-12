import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import YearInchargeNav from "../../components/YearInchargeNav";
import LoadingSpinner from "../../components/LoadingSpinner";

interface StudentDetails {
    _id: string;
    name: string;
    department: string;
    year: string;
    registerNumber: string;
}

interface Outpass {
    _id: string;
    studentid: StudentDetails;
    outpasstype: string;
    fromDate: string;
    toDate: string;
    staffapprovalstatus: string;
    wardenapprovalstatus: string;
    yearinchargeapprovalstatus: string;
    proof?: string;
    document?: string;
    file?: string;
}

const YearInchargePendingOutpass: React.FC = () => {
    const [pendingOutpasses, setPendingOutpasses] = useState<Outpass[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'this_week' | 'this_month'>('all');
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [documentUrl, setDocumentUrl] = useState<string | null>(null);
    const [documentType, setDocumentType] = useState<'image' | 'pdf'>('image');
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchPendingOutpasses();
    }, []);

    const fetchPendingOutpasses = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/year-incharge-login');
            return;
        }

        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/incharge/outpass/list`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.status === 200) {
                // Filter: staff approved AND incharge pending (Warden approval not required as per user response)
                console.log("Full Outpass List Response:", res.data); // Debugging
                const list = res.data.outpasses || res.data.outpasslist || res.data.filterOutpass || [];
                const filtered = list.filter((o: any) =>
                    String(o.staffapprovalstatus || '').toLowerCase() === 'approved' &&
                    String(o.yearinchargeapprovalstatus || '').toLowerCase() === 'pending'
                );

                // Sort Emergency first
                filtered.sort((a: any, b: any) => {
                    const aType = String(a.outpasstype || '').toLowerCase();
                    const bType = String(b.outpasstype || '').toLowerCase();
                    if (aType === 'emergency' && bType !== 'emergency') return -1;
                    if (aType !== 'emergency' && bType === 'emergency') return 1;
                    return new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime();
                });

                setPendingOutpasses(filtered);
            }
        } catch (error) {
            console.error("Error fetching pending outpasses:", error);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) {
        return <LoadingSpinner />;
    }

    const filteredPending = pendingOutpasses.filter(item => {
        const fromDateObj = item.fromDate ? new Date(item.fromDate) : null;
        const dateStr1 = fromDateObj ? fromDateObj.toLocaleDateString() : '';
        const dateStr2 = fromDateObj ? fromDateObj.toLocaleString() : '';
        const dateStr3 = fromDateObj ? fromDateObj.toDateString() : '';
        const dateStr4 = item.fromDate ? item.fromDate.split('T')[0] : '';

        const term = searchTerm.toLowerCase();
        const matchesSearch = searchTerm === '' ||
            (item.studentid?.name?.toLowerCase().includes(term) || false) ||
            (item.studentid?.registerNumber?.toLowerCase().includes(term) || false) ||
            dateStr1.toLowerCase().includes(term) ||
            dateStr2.toLowerCase().includes(term) ||
            dateStr3.toLowerCase().includes(term) ||
            dateStr4.toLowerCase().includes(term);

        let matchesDate = true;
        if (dateFilter !== 'all') {
            const appliedDate = new Date(item.fromDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (dateFilter === 'today') matchesDate = appliedDate >= today;
            else if (dateFilter === 'yesterday') {
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                matchesDate = appliedDate >= yesterday && appliedDate < today;
            }
            else if (dateFilter === 'this_week') {
                const thisWeek = new Date(today);
                thisWeek.setDate(today.getDate() - today.getDay());
                matchesDate = appliedDate >= thisWeek;
            }
            else if (dateFilter === 'this_month') {
                const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                matchesDate = appliedDate >= thisMonth;
            }
        }
        return matchesSearch && matchesDate;
    });

    return (
        <div className="page-container">
            <YearInchargeNav />
            <div className="list-container">
                <button className="back-btn" onClick={() => navigate('/year-incharge-dashboard')}>
                    ← Back to Dashboard
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                    <h1 style={{ margin: 0 }}>Pending Approvals</h1>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                            <span className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>🔍</span>
                            <input
                                type="text"
                                placeholder="Search by name, reg no, date..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 16px 10px 40px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}
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
                </div>

                <div className="student-list">
                    {filteredPending.length === 0 ? (
                        <div className="no-data-message" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                            No pending approvals found
                        </div>
                    ) : (
                        filteredPending.map((item) => (
                            <div
                                key={item._id}
                                className="student-card"
                                onClick={() => navigate(`/year-incharge/student/${item._id}`)}
                            >
                                <div className="student-card-main">
                                    <div className="student-id-highlight">
                                        {typeof item.studentid?.registerNumber === 'string' ? item.studentid.registerNumber : 'N/A'}
                                    </div>
                                    <div className="student-info">
                                        <div className="student-name">
                                            {typeof item.studentid?.name === 'string' ? item.studentid.name : 'Unknown Name'}
                                            {typeof item.outpasstype === 'string' && item.outpasstype?.toLowerCase() === 'emergency' && <span className="emergency-badge">EMERGENCY</span>}
                                        </div>
                                        <div className="student-meta">
                                            Year {typeof item.studentid?.year === 'string' ? item.studentid.year : 'N/A'} • {typeof item.outpasstype === 'string' ? item.outpasstype : 'General'} • Applied on {new Date(item.fromDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="student-card-action">
                                    <span className="status-badge" style={{ color: '#f59e0b', backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }}>
                                        <span className="status-dot">●</span>
                                        Pending
                                    </span>
                                    {(item.proof || item.document || item.file) && (
                                        <button
                                            className="view-doc-btn-list"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const url = (item.proof || item.document || item.file)!;
                                                handleViewDocument(url);
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#eff6ff',
                                                border: '1px solid #3b82f6',
                                                borderRadius: '8px',
                                                color: '#3b82f6',
                                                fontSize: '0.85rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            📄 View Doc
                                        </button>
                                    )}
                                    <span className="view-arrow">View →</span>
                                </div>
                            </div>
                        ))
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
        /* Page Container */
        .list-container {
          padding: 40px;
          animation: fadeInUp 0.6s ease;
          margin-top: 60px;
        }

        .back-btn {
          background: none;
          border: none;
          font-size: 16px;
          color: #64748b;
          cursor: pointer;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.3s;
          padding: 0;
        }

        .back-btn:hover {
          color: #1e3a8a;
          transform: translateX(-4px);
        }

        .list-container h1 {
          font-size: 28px;
          margin-bottom: 24px;
          color: #1e3a8a;
        }

        /* Table Card */
        .outpass-card {
          background: white;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.05);
          overflow: hidden;
        }

        /* Table */
        /* Reuse standard student-card styles */
        .student-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
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
            margin-left: auto;
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
        }

        .status-dot {
            font-size: 0.8rem;
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

        @media (max-width: 768px) {
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
                margin-left: 0;
            }
        }
      `}</style>
            </div>
        </div >
    );
};

export default YearInchargePendingOutpass;
