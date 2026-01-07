import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import WardenNav from "../../components/WardenNav";

interface Student {
  _id: string;
  name: string;
  department: string;
  year: string;
}

const PendingOutpass: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [page]);

  const fetchStudents = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/warden/outpass/list`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setStudents(res.data.students || []);
  };

  return (
    <div className="page-container">
      <WardenNav />
      <div className="list-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Pending Outpass Students</h1>

        <div className="outpass-card">
          <table className="outpass-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Year</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "20px" }}>
                    No pending outpasses
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.department}</td>
                    <td>{s.year}</td>
                    <td>
                      <button className="view-btn" onClick={() => navigate(`/warden/student/${s._id}`)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>
            <span>Page {page}</span>
            <button onClick={() => setPage(page + 1)}>Next</button>
          </div>
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

        /* Pagination */
        .pagination {
          margin-top: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
        }

        .pagination button {
          padding: 8px 18px;
          border-radius: 10px;
          border: none;
          background: #1e3a8a;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }

        .pagination button:hover {
          background: #2563eb;
        }

        .pagination button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
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

export default PendingOutpass;
