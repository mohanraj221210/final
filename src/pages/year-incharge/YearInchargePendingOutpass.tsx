import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import YearInchargeNav from "../../components/YearInchargeNav";
import Loader from "../../components/Loader";

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
    outpassType: string;
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
                const list = res.data.outpasslist || [];
                const filtered = list.filter((o: any) =>
                    o.staffapprovalstatus === 'approved' &&
                    o.yearinchargeapprovalstatus === 'pending'
                );
                setPendingOutpasses(filtered);
            }
        } catch (error) {
            console.error("Error fetching pending outpasses:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <YearInchargeNav />
            <div className="list-container">
                <button className="back-btn" onClick={() => navigate('/year-incharge-dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Pending Approvals</h1>

                <div className="outpass-card">
                    <table className="outpass-table">
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Department</th>
                                <th>Year</th>
                                <th>Outpass Type</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} style={{ padding: "40px" }}>
                                        <Loader />
                                    </td>
                                </tr>
                            ) : pendingOutpasses.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                                        No pending approvals found
                                    </td>
                                </tr>
                            ) : (
                                pendingOutpasses.map((item) => (
                                    <tr key={item._id}>
                                        <td data-label="Student Name">
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontWeight: '600', color: '#0f172a' }}>{item.studentid?.name}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.studentid?.registerNumber}</span>
                                            </div>
                                        </td>
                                        <td data-label="Department">{item.studentid?.department}</td>
                                        <td data-label="Year">{item.studentid?.year}</td>
                                        <td data-label="Outpass Type">{item.outpassType}</td>
                                        <td data-label="Date">{new Date(item.fromDate).toLocaleDateString()}</td>
                                        <td data-label="Action">
                                            <button className="view-btn" onClick={() => navigate(`/year-incharge/student/${item._id}`)}>
                                                Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && pendingOutpasses.length > 0 && (
                    <div className="mobile-cards-view">
                        {pendingOutpasses.map((item) => (
                            <div className="mobile-card" key={item._id}>
                                <div className="card-header-mobile">
                                    <div>
                                        <h3 className="card-name">{item.studentid?.name}</h3>
                                        <p className="card-reg">{item.studentid?.registerNumber}</p>
                                    </div>
                                    <span className="pass-type-mobile">{item.outpassType}</span>
                                </div>

                                <div className="card-body-mobile">
                                    <div className="info-row">
                                        <span className="label">Dept/Year:</span>
                                        <span className="value">{item.studentid?.department} - {item.studentid?.year}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Date:</span>
                                        <span className="value">{new Date(item.fromDate).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="card-footer-mobile">
                                    <button className="view-btn-mobile" onClick={() => navigate(`/year-incharge/student/${item._id}`)}>
                                        Review Application
                                    </button>
                                </div>
                            </div>
                        ))}
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
        .outpass-table {
          width: 100%;
          border-collapse: collapse;
        }

        .outpass-table thead {
          background: linear-gradient(135deg, #1e3a8a, #0f172a);
          color: white;
        }

        .outpass-table th {
          padding: 14px;
          text-align: left;
          font-weight: 600;
        }

        .outpass-table td {
          padding: 14px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }

        .outpass-table tbody tr {
          transition: all 0.3s ease;
        }

        .outpass-table tbody tr:hover {
          background: #eff6ff;
          transform: translateX(4px);
        }

        /* View Button */
        .view-btn {
          padding: 6px 14px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #2563eb, #1e3a8a);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: 0.3s;
        }

        .view-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(37,99,235,0.4);
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
            padding: 4px 8px;
            font-size: 0.75rem;
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

        .view-btn-mobile {
            width: 100%;
            padding: 10px;
            background: #1e3a8a;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }

        @media (max-width: 768px) {
            .outpass-card {
                display: none; /* Hide table card */
            }
            .mobile-cards-view {
                display: flex;
            }
            .list-container {
                padding: 16px;
                margin-top: 20px;
            }
            .list-container h1 {
                font-size: 24px;
            }
        }
      `}</style>
            </div>
        </div>
    );
};

export default YearInchargePendingOutpass;
