import React, { useState, useEffect } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";

import WardenNav from "../../components/WardenNav";

const OutpassList: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 8;

  useEffect(() => {
    fetchOutpasses();
  }, []);

  const fetchOutpasses = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/warden/outpass/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Full API Response:", res);
      console.log("API Data:", res.data);

      // ⚠️ Adjust this based on your backend response structure
      const outpassData = res.data.outpasses || res.data.data || res.data || [];
      console.log("Extracted Outpass Data:", outpassData);

      setOutpasses(Array.isArray(outpassData) ? outpassData : []);
    } catch (err: any) {
      console.error("Failed to fetch outpasses", err);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
      } else if (err.response?.status === 400) {
        alert("Warden authentication required.");
      } else {
        alert("Failed to load outpass list.");
      }
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(outpasses.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = outpasses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="page-container">
      <WardenNav />
      <div className="list-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1>Outpass List</h1>

        <div className="outpass-card">
          {loading ? (
            <p>Loading outpasses...</p>
          ) : (
            <table className="outpass-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Register No</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                      No outpasses found
                    </td>
                  </tr>
                ) : (
                  currentData.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{startIndex + index + 1}</td>
                      <td>{item.studentid.name || item.studentName}</td>
                      <td>{item.studentid.registerNumber || item.register_number}</td>
                      <td>
                        {new Date(item.createdAt || item.outDate).toLocaleDateString()}
                      </td>
                      <td>{item.reason}</td>
                      <td>
                        <span className="status approved">
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => {
                            console.log("Navigating with item:", item);
                            // Try all possible ID fields. 
                            // The console log showed 'item' might have 'studentID' or similar if it's a join.
                            const studentId = item.studentID || item.studentId || item.id || item._id;
                            navigate(`/warden/student/${studentId}`);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && outpasses.length > 0 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}

        {/* ✅ INTERNAL CSS (UNCHANGED) */}
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

/* Status */
.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status.approved {
  background: #dcfce7;
  color: #166534;
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

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Mobile */
@media (max-width: 768px) {
  .list-container {
    padding: 20px;
  }

  .outpass-card {
    padding: 16px;
  }

  .outpass-table th,
  .outpass-table td {
    padding: 10px;
    font-size: 14px;
  }
}
      `}</style>
      </div>
    </div>
  );
};

export default OutpassList;
