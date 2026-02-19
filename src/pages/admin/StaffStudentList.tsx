
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Student } from '../../types/admin';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StaffStudentList: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Staff ID
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newStudent, setNewStudent] = useState({
        name: '',
        email: '',
        password: '',
        staffid: '',
        residencetype: '',
        hostelname: '',
        hostelroomno: '',
        busno: '',
        boardingpoint: ''
    });

    useEffect(() => {
        fetchStudents();
    }, [id]);

    const fetchStudents = async () => {
        try {
            const allStudents = await adminService.getStudents();
            // Filter by staff ID if the student has that staff assigned
            const staffStudents = allStudents.filter(s => {
                if (typeof s.staffid === 'string') return s.staffid === id;
                return s.staffid?._id === id;
            });
            setStudents(staffStudents);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch students");
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        const search = searchTerm.toLowerCase();
        return (
            (student.name?.toLowerCase() || '').includes(search) ||
            (student.registerNumber?.toLowerCase() || '').includes(search) ||
            (student.department?.toLowerCase() || '').includes(search) ||
            (typeof student.year === 'string' && student.year.toLowerCase().includes(search))
        );
    });

    const handleViewStudent = (studentId: string) => {
        navigate(`/admin/student-details/${studentId}`);
    };

    const handleDelete = async (studentId: string) => {
        if (confirm("Are you sure you want to remove this student? This action cannot be undone.")) {
            try {
                await adminService.deleteStudent(studentId);
                toast.success("Student deleted successfully");
                setStudents(students.filter(s => s._id !== studentId));
            } catch (error) {
                toast.error("Failed to delete student");
            }
        }
    };

    const handleAddStudent = () => {
        setNewStudent({
            name: '', email: '', password: '', staffid: id || '',
            residencetype: '', hostelname: '', hostelroomno: '', busno: '', boardingpoint: ''
        });
        setIsAddModalOpen(true);
    };

    const handleSaveStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStudent.name || !newStudent.email || !newStudent.password) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            await adminService.addStudent({ ...newStudent, staffid: id });
            toast.success("Student added successfully");
            setIsAddModalOpen(false);
            fetchStudents(); // Refresh list
            setNewStudent({
                name: '', email: '', password: '', staffid: '',
                residencetype: '', hostelname: '', hostelroomno: '', busno: '', boardingpoint: ''
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add student");
        }
    };

    const getImageUrl = (photo: string) => {
        if (!photo) return '';
        if (photo.startsWith('http') || photo.startsWith('data:')) return photo;
        const baseUrl = import.meta.env.VITE_CDN_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const cleanPhoto = photo.startsWith('/') ? photo : `/${photo}`;
        return `${cleanBase}${cleanPhoto}`;
    };

    return (
        <AdminLayout title="Assigned Students">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-content">
                <div className="page-header">
                    <button className="back-dashboard-btn" onClick={() => navigate(`/admin/staff-details/${id}`)}>
                        ← Back to Staff Details
                    </button>
                    <div className="flex-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                            <h1 className="page-title">Assigned Students</h1>
                            <p className="page-subtitle">List of students mentored by this staff member</p>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <div className="search-bar">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search by name, reg no..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button className="btn-primary" onClick={handleAddStudent}>
                                <span className="icon">+</span> Add Student
                            </button>
                        </div>
                    </div>
                </div>

                <div className="content-card">
                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <span>Loading students...</span>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="modern-table">
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Register No</th>
                                        <th>Department</th>
                                        <th>Year</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => (
                                        <tr key={student._id}>
                                            <td>
                                                <div className="user-info">
                                                    <div className="avatar-wrapper">
                                                        {student.photo ? (
                                                            <img
                                                                src={getImageUrl(student.photo)}
                                                                alt={student.name}
                                                                className="user-avatar"
                                                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                                                            />
                                                        ) : (
                                                            <div className="user-avatar-placeholder">{student.name.charAt(0)}</div>
                                                        )}
                                                        <div className="user-avatar-placeholder hidden">{student.name.charAt(0)}</div>
                                                    </div>
                                                    <span className="user-name">{student.name}</span>
                                                </div>
                                            </td>
                                            <td><span className="badge badge-reg">{student.registerNumber}</span></td>
                                            <td>{student.department}</td>
                                            <td><span className="badge badge-year"> {student.year}</span></td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn-view" onClick={() => handleViewStudent(student._id)}>
                                                        View Details
                                                    </button>
                                                    <button className="btn-icon delete" onClick={() => handleDelete(student._id)} title="Remove Student">
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="empty-state">
                                                {searchTerm ? "No students found matching your search." : "No students assigned to this staff member yet."}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
            {/* Add Student Modal */}
            {
                isAddModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3>Add New Student</h3>
                                <button className="close-btn" onClick={() => setIsAddModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleSaveStudent}>
                                <div className="modal-body">
                                    <div className="form-group">
                                        <label>Student Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter full name"
                                            className="form-input"
                                            value={newStudent.name}
                                            onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="Enter email address"
                                            className="form-input"
                                            value={newStudent.email}
                                            onChange={e => setNewStudent({ ...newStudent, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password</label>
                                        <input
                                            type="password"
                                            required
                                            placeholder="Create password"
                                            className="form-input"
                                            value={newStudent.password}
                                            onChange={e => setNewStudent({ ...newStudent, password: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Residence Type</label>
                                        <select
                                            required
                                            className="form-input"
                                            value={newStudent.residencetype}
                                            onChange={e => setNewStudent({ ...newStudent, residencetype: e.target.value })}
                                        >
                                            <option value="">Select Residence Type</option>
                                            <option value="day scholar">Day Scholar</option>
                                            <option value="hostel">Hostel</option>
                                        </select>
                                    </div>

                                    {newStudent.residencetype === 'hostel' && (
                                        <>
                                            <div className="form-group">
                                                <label>Hostel Name</label>
                                                <select
                                                    required
                                                    className="form-input"
                                                    value={newStudent.hostelname}
                                                    onChange={e => setNewStudent({ ...newStudent, hostelname: e.target.value })}
                                                >
                                                    <option value="">Select Hostel</option>
                                                    <option value="M.G.R">M.G.R illam</option>
                                                    <option value="Janaki ammal">Janaki ammal illam</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Room Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter room number"
                                                    className="form-input"
                                                    value={newStudent.hostelroomno}
                                                    onChange={e => setNewStudent({ ...newStudent, hostelroomno: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {newStudent.residencetype === 'day scholar' && (
                                        <>
                                            <div className="form-group">
                                                <label>Bus Number</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter bus number"
                                                    className="form-input"
                                                    value={newStudent.busno}
                                                    onChange={e => setNewStudent({ ...newStudent, busno: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Boarding Point</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter boarding point"
                                                    className="form-input"
                                                    value={newStudent.boardingpoint}
                                                    onChange={e => setNewStudent({ ...newStudent, boardingpoint: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Register Student</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            <style>{`
                .admin-page-content {
                    font-family: 'Inter', system-ui, sans-serif;
                    padding: 2px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    margin-bottom: 32px;
                }

                .back-dashboard-btn {
                    align-self: flex-start;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: white;
                    border: 1px solid #e2e8f0;
                    color: #64748b;
                    font-size: 0.95rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-bottom: 0px;
                    padding: 10px 20px;
                    border-radius: 10px;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
                .back-dashboard-btn:hover {
                    color: #0047AB;
                    border-color: #0047AB;
                    transform: translateX(-4px);
                    box-shadow: 0 4px 12px rgba(0, 71, 171, 0.1);
                }

                .page-title {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 4px;
                    letter-spacing: -0.025em;
                }

                .page-subtitle {
                    color: #6b7280;
                    font-size: 0.95rem;
                    margin-top: 20px;
                }

                .content-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                }

                .search-bar {
                    display: flex;
                    align-items: center;
                    background: white;
                    border: 1px solid #d1d5db;
                    padding: 10px 16px;
                    border-radius: 12px;
                    width: 250px;
                    gap: 10px;
                    transition: all 0.2s;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }

                .search-bar:focus-within {
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
                }

                .search-icon { color: #9ca3af; }
                .search-bar input {
                    border: none; background: transparent; outline: none; width: 100%;
                    font-size: 0.9rem; color: #111827;
                }

                .table-responsive { overflow-x: auto; }
                .modern-table { width: 100%; border-collapse: collapse; }
                .modern-table th { background: #f9fafb; padding: 16px 24px; text-align: left; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
                .modern-table td { padding: 16px 24px; border-bottom: 1px solid #f3f4f6; color: #374151; font-size: 0.95rem; vertical-align: middle; }
                .modern-table tr:hover { background-color: #f9fafb; }

                .user-info { display: flex; align-items: center; gap: 12px; }
                .avatar-wrapper { width: 40px; height: 40px; flex-shrink: 0; }
                .user-avatar, .user-avatar-placeholder { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
                .user-avatar-placeholder { background: #e0e7ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-weight: 700; border: 2px solid #c7d2fe; }
                .user-name { font-weight: 600; color: #111827; }

                .badge { padding: 4px 10px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; font-family: monospace; }
                .badge-reg { background: #f3f4f6; color: #374151; border: 1px solid #e5e7eb; }
                .badge-year { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; font-family: inherit; }

                .action-buttons { display: flex; gap: 8px; }
                .btn-icon { background: transparent; border: none; cursor: pointer; font-size: 1.1rem; padding: 8px; border-radius: 8px; transition: background 0.2s; }
                .btn-icon:hover { background: #f3f4f6; }
                .btn-icon.delete:hover { background: #fee2e2; color: #ef4444; }

                .loading-state, .empty-state { padding: 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: #6b7280; text-align: center; }
                .spinner { width: 32px; height: 32px; border: 3px solid #e5e7eb; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; }
                
                .hidden { display: none; }

                @keyframes spin { to { transform: rotate(360deg); } }

                .btn-primary {
                    background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
                }
                .btn-primary:hover { box-shadow: 0 6px 8px -1px rgba(79, 70, 229, 0.3); transform: translateY(-1px); }

                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center; justify-content: center;
                    z-index: 1000;
                    backdrop-filter: blur(4px);
                }
                .modal-content {
                    background: white;
                    border-radius: 16px;
                    width: 90%; max-width: 450px;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                    animation: modalSlideIn 0.3s ease-out;
                    overflow: hidden;
                }
                .modal-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex; justify-content: space-between; align-items: center;
                }
                .modal-header h3 { margin: 0; font-size: 1.25rem; font-weight: 600; color: #111827; }
                .close-btn { background: none; border: none; font-size: 1.5rem; color: #6b7280; cursor: pointer; }
                .modal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
                .form-group { display: flex; flex-direction: column; gap: 6px; }
                .form-group label { font-size: 0.9rem; font-weight: 500; color: #374151; }
                .form-input {
                    padding: 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 1rem;
                    color: #111827;
                }
                .form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
                .modal-footer {
                    padding: 20px 24px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    display: flex; justify-content: flex-end; gap: 12px;
                }
                .btn-secondary { background: white; color: #374151; border: 1px solid #e5e7eb; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
                .btn-secondary:hover { background: #f9fafb; border-color: #d1d5db; }

                @keyframes modalSlideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </AdminLayout>
    );
};

export default StaffStudentList;
