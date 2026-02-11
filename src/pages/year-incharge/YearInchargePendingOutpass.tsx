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
}

const YearInchargePendingOutpass: React.FC = () => {
    const [pendingOutpasses, setPendingOutpasses] = useState<Outpass[]>([]);
    const [loading, setLoading] = useState(true);
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
                const list = res.data.outpasses || res.data.outpasslist || [];
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

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="page-container">
            <YearInchargeNav />
            <div className="list-container">
                <button className="back-btn" onClick={() => navigate('/year-incharge-dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Pending Approvals</h1>

                <div className="student-list">
                    {pendingOutpasses.length === 0 ? (
                        <div className="no-data-message" style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                            No pending approvals found
                        </div>
                    ) : (
                        pendingOutpasses.map((item) => (
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
                                    <span className="view-arrow">View →</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>


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
