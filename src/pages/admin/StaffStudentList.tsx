
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { adminService } from '../../services/adminService';
import type { Student } from '../../types/admin';
import { toast, ToastContainer } from 'react-toastify';

const StaffStudentList: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // Staff ID
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all students and filter by staff id? 
        // Or if the API supported filtering.
        // The API /admin/student/list returns ALL students.
        // I will fetch all and filter client side for now.
        fetchStudents();
    }, [id]);

    const fetchStudents = async () => {
        try {
            const allStudents = await adminService.getStudents();
            // Filter by staff ID if the student has that staff assigned
            // Note: Api response for student list has `staffid` which is populated object.
            // So we check student.staffid._id
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

    return (
        <AdminLayout title="Assigned Students">
            <ToastContainer position="bottom-right" />
            <div className="page-header-actions">
                <button className="back-btn" onClick={() => navigate(`/admin/staff-details/${id}`)}>← Back to Staff Details</button>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="p-4 text-center">Loading...</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Register No</th>
                                <th>Name</th>
                                <th>Department</th>
                                <th>Year</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => (
                                <tr key={student._id}>
                                    <td><span className="badge-id">{student.registerNumber}</span></td>
                                    <td className="font-medium">
                                        <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {student.photo ? (
                                                <img
                                                    src={student.photo.startsWith('http') || student.photo.startsWith('data:')
                                                        ? student.photo
                                                        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`.replace('/api', '') + (student.photo.startsWith('/') ? '' : '/') + student.photo}
                                                    alt={student.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }}
                                                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.removeAttribute('style'); }}
                                                />
                                            ) : (
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold"
                                                    style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}
                                                >
                                                    {student.name.charAt(0)}
                                                </div>
                                            )}
                                            {/* Fallback avatar if image fails */}
                                            <div
                                                className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold"
                                                style={{ display: 'none', width: '40px', height: '40px', borderRadius: '50%', background: '#e0e7ff', color: '#6366f1', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}
                                            >
                                                {student.name.charAt(0)}
                                            </div>
                                            <span>{student.name}</span>
                                        </div>
                                    </td>
                                    <td>{student.department}</td>
                                    <td>{student.year}</td>
                                    <td>
                                        <button className="btn-view" onClick={() => handleViewStudent(student._id)}>
                                            View
                                        </button>
                                        <button className="btn-delete" onClick={() => handleDelete(student._id)} style={{ marginLeft: '8px' }}>
                                            Delete
                                        </button>
                                        {/* Prompt also said "here also add delete button to delete the student" - Usually in detail view, but prompt says "in that page [Student List] ... edit ... also here also add delete button" - sentence is a bit ambiguous if it means list or detail. 
                                            "while clicking the view button it has to redirect to the page in which the student list in that page the admin also able to edit the student details also here also add delete button"
                                            I think it means on the Detail page, but "here also" might mean list too. I'll add Delete to list for convenience if safe.
                                            Actually, let's stick to View on list, and Edit/Delete on Detail page to avoid clutter and accidental deletes.
                                         */}
                                    </td>
                                </tr>
                            ))}
                            {students.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center py-4">No students assigned to this staff.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <style>{`
                .back-btn {
                    background: none;
                    border: none;
                    color: #6366f1;
                    cursor: pointer;
                    font-weight: 500;
                    margin-bottom: 16px;
                }
                /* Reuse table styles from global or copied */
                .table-container { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
                .admin-table { width: 100%; border-collapse: collapse; }
                .admin-table th, .admin-table td { padding: 16px 24px; text-align: left; border-bottom: 1px solid #f3f4f6; }
                .admin-table th { background: #f9fafb; color: #6b7280; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; }
                .badge-id { background: #eff6ff; color: #3b82f6; padding: 4px 8px; border-radius: 6px; font-size: 13px; font-family: monospace; }
                .btn-view { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
                .btn-view:hover { background: #2563eb; color: white; }
                .btn-delete { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 500; }
                .btn-delete:hover { background: #dc2626; color: white; }
            `}</style>
        </AdminLayout>
    );
};

export default StaffStudentList;
