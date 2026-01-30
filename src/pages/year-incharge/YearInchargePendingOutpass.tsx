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

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
            .list-container {
                padding: 20px;
                margin-top: 20px;
            }

            .outpass-card {
                padding: 0;
                background: transparent;
                box-shadow: none;
                border: none;
            }

            .outpass-table, .outpass-table thead, .outpass-table tbody, .outpass-table th, .outpass-table td, .outpass-table tr {
                display: block;
            }

            .outpass-table thead tr {
                position: absolute;
                top: -9999px;
                left: -9999px;
            }

            .outpass-table tbody tr {
                background: white;
                margin-bottom: 20px;
                border-radius: 16px;
                padding: 20px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                border: 1px solid #e2e8f0;
            }

            .outpass-table td {
                border: none;
                padding: 8px 0;
                position: relative;
                padding-left: 0; /* Changed from typical padding-left 50% for this design */
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
            }

            .outpass-table td:before {
                content: attr(data-label);
                font-size: 0.75rem;
                font-weight: 600;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 2px;
            }

            /* Adjust first cell (Name) to look like a header */
            .outpass-table td:first-child {
                border-bottom: 1px solid #f1f5f9;
                padding-bottom: 12px;
                margin-bottom: 8px;
            }
            
            .outpass-table td:first-child:before {
                display: none; /* Hide label for name card header */
            }

            .outpass-table td:last-child {
                 margin-top: 12px;
                 width: 100%;
            }

            .view-btn {
                width: 100%;
                padding: 12px;
                font-size: 1rem;
            }

            .outpass-table tbody tr:hover {
                transform: none;
                background: white;
            }
        }
      `}</style>
            </div>
        </div>
    );
};

export default YearInchargePendingOutpass;
