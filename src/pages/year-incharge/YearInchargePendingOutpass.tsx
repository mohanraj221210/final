import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import YearInchargeNav from "../../components/YearInchargeNav";

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
                                    <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>
                                        Loading...
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
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ fontWeight: '600', color: '#0f172a' }}>{item.studentid?.name}</span>
                                                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.studentid?.registerNumber}</span>
                                            </div>
                                        </td>
                                        <td>{item.studentid?.department}</td>
                                        <td>{item.studentid?.year}</td>
                                        <td>{item.outpassType}</td>
                                        <td>{new Date(item.fromDate).toLocaleDateString()}</td>
                                        <td>
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
      `}</style>
            </div>
        </div>
    );
};

export default YearInchargePendingOutpass;
