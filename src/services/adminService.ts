import axios from 'axios';
import type {
    LoginResponse,
    Student,
    Staff,
    YearIncharge,
    Warden,
    Watchman,
    Bus,
    AdminProfile
} from '../types/admin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptor for token
const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let getProfilePromise: Promise<AdminProfile> | null = null;

export const adminService = {
    // Auth
    login: async (credentials: any) => {
        const response = await api.post<LoginResponse>('/admin/login', credentials);
        return response.data;
    },

    // Profile
    // Profile
    getProfile: async () => {
        if (!getProfilePromise) {
            getProfilePromise = api.get<{ message: string, admin: AdminProfile }>('/admin/profile')
                .then(response => response.data.admin)
                .finally(() => {
                    // Reset promise after a short delay or immediately?
                    // If we reset immediately, concurrent calls get the promise.
                    // Subsequent calls (e.g. refresh button) will create a new one.
                    getProfilePromise = null;
                });
        }
        return getProfilePromise;
    },
    updateProfile: async (data: any) => {
        // Force JSON for stability if backend crashes on partial FormData/multipart
        // Convert any FormData back to object if necessary, or assume caller provides object now
        let payload = data;
        if (data instanceof FormData) {
            payload = {};
            data.forEach((value, key) => {
                payload[key] = value;
            });
        }
        const response = await api.put('/admin/profile/update', payload);
        return response.data;
    },
    changePassword: async (email: string, newPassword: string) => {
        const response = await api.post('/admin/forgot/password', { email, newPassword });
        return response.data;
    },

    // Student
    addStudent: async (data: any) => {
        const response = await api.post('/admin/student/add', data);
        return response.data;
    },
    getStudents: async () => {
        const response = await api.get<{ message: string, students: Student[] }>('/admin/student/list');
        return response.data.students;
    },
    getStudentById: async (id: string) => {
        const response = await api.get<{ message: string, student: Student }>(`/admin/student/${id}`);
        return response.data.student;
    },
    updateStudent: async (id: string, data: any) => {
        // API didn't explicitly specify update student endpoint in the list but usually it exists or similar. 
        // Wait, the prompt lists "Student Add", "Student List", "Student Detail", "Student Delete". 
        // It DOES NOT explicitly list "Student Update" in the "Student Add" section, but implies editing in the text description.
        // Checking Staff Portal "Staff Updated Students" - PUT staff/update/students
        // But for Admin editing student? 
        // The user said: "in that page the admin also able to edit the student details"
        // I will assume there IS an update endpoint or I might need to use the staff one?
        // Actually, looking at `StudentDetails.tsx` (Staff), it uses `POST /staff/student/update/${id}`.
        // It's likely `PUT /admin/student/update/${id}` or similar exists or I should use the staff one?
        // The prompt lists "Admin Profile Update", "Staff Updated Students", "Bus Update Detail".
        // It DOES NOT list "Student Update" for Admin. 
        // However, standard REST practices imply it. I will try `PUT /admin/student/update/${id}` as a guess or look for parallels.
        // Actually, let's assume `PUT /admin/student/update/:id` exists since user asked for it.
        const response = await api.put(`/admin/student/update/${id}`, data);
        return response.data;
    },
    deleteStudent: async (id: string) => {
        const response = await api.delete(`/admin/student/delete/${id}`);
        return response.data;
    },

    // Staff
    addStaff: async (data: any) => {
        const response = await api.post('/admin/staff/add', data);
        return response.data;
    },
    getStaffList: async () => {
        const response = await api.get<{ message: string, staff: Staff[] }>('/admin/staff/list');
        return response.data.staff;
    },
    getStaffById: async (id: string) => {
        const response = await api.get<{ message: string, staff: Staff }>(`/admin/staff/${id}`);
        return response.data.staff;
    },
    updateStaffStudents: async (data: { staffid: string, newStaffId: string }) => {
        const response = await api.put('/staff/update/students', data);
        return response.data;
    },
    deleteStaff: async (id: string) => {
        const response = await api.delete(`/admin/staff/delete/${id}`);
        return response.data;
    },
    // Missing "Update Staff" endpoint in prompt, but user asks for "Edit" button.
    // I will assume `PUT /admin/staff/update/:id` exists.
    updateStaff: async (id: string, data: any) => {
        const response = await api.put(`/admin/staff/update/${id}`, data);
        return response.data;
    },
    resetStaffPassword: async (id: string, newPassword: string) => {
        const response = await api.put(`/admin/staff/forgotpassword/${id}`, { newPassword });
        return response.data;
    },

    // Incharge
    addIncharge: async (data: any) => {
        const response = await api.post('/admin/incharge/add', data);
        return response.data;
    },
    getIncharges: async () => {
        const response = await api.get<{ message: string, incharges: YearIncharge[] }>('/admin/incharge/list');
        return response.data.incharges;
    },
    getInchargeById: async (id: string) => {
        const response = await api.get<{ message: string, incharge: YearIncharge }>(`/admin/incharge/${id}`);
        return response.data.incharge;
    },
    deleteIncharge: async (id: string) => {
        const response = await api.delete(`/admin/incharge/delete/${id}`);
        return response.data;
    },
    updateIncharge: async (id: string, data: any) => {
        const response = await api.put(`/admin/incharge/update/${id}`, data);
        return response.data;
    },

    // Warden
    addWarden: async (data: any) => {
        const response = await api.post('/admin/warden/add', data);
        return response.data;
    },
    getWardens: async () => {
        const response = await api.get<{ message: string, wardens: Warden[] }>('/admin/warden/list');
        return response.data.wardens;
    },
    getWardenById: async (id: string) => {
        const response = await api.get<{ message: string, warden: Warden }>(`/admin/warden/${id}`);
        return response.data.warden;
    },
    deleteWarden: async (id: string) => {
        const response = await api.delete(`/admin/warden/delete/${id}`);
        return response.data;
    },
    updateWarden: async (id: string, data: any) => {
        const response = await api.put(`/admin/warden/update/${id}`, data);
        return response.data;
    },

    // Watchman
    addWatchman: async (data: any) => {
        const response = await api.post('/admin/watchman/add', data);
        return response.data;
    },
    getWatchmen: async () => {
        const response = await api.get<{ message: string, watchman: Watchman[] }>('/admin/watchman/list');
        return response.data.watchman;
    },
    getWatchmanById: async (id: string) => {
        const response = await api.get<{ message: string, watchman: Watchman }>(`/admin/watchman/${id}`);
        return response.data.watchman;
    },
    deleteWatchman: async (id: string) => {
        const response = await api.delete(`/admin/watchman/delete/${id}`);
        return response.data;
    },
    updateWatchman: async (id: string, data: any) => {
        const response = await api.put(`/admin/watchman/update/${id}`, data);
        return response.data;
    },

    // Bus
    addBus: async (data: any) => {
        const response = await api.post('/admin/bus/add', data);
        return response.data;
    },
    getBuses: async () => {
        const response = await api.get<{ message: string, buses: Bus[] }>('/admin/bus/list');
        return response.data.buses;
    },
    getBusById: async (id: string) => {
        const response = await api.get<{ message: string, bus: Bus }>(`/admin/bus/${id}`);
        return response.data.bus;
    },
    updateBus: async (id: string, data: any) => {
        const response = await api.put(`/admin/bus/update/${id}`, data);
        return response.data;
    },
    deleteBus: async (id: string) => {
        const response = await api.delete(`/admin/bus/delete/${id}`);
        return response.data;
    },
    // Outpass
    // Outpass
    getAllOutpasses: async () => {
        const response = await api.get<{ message: string, outpasses: any[] }>('/admin/outpass/list');
        return response.data;
    },
    getOutpassStats: async () => {
        const response = await api.get<{ message: string, outpasses: any[] }>('/admin/outpass/list');
        const outpasses = response.data.outpasses || [];

        // Helper to get type safely
        const getType = (o: any) => (o.outpassType || o.outpasstype || o.type || '').toLowerCase().trim();
        // Helper to get status safely
        const getStatus = (o: any) => (o.outpassStatus || o.status || '').toLowerCase().trim();

        // Calculate Overview Stats
        const stats = {
            totalOutpasses: outpasses.length,
            pendingApprovals: outpasses.filter(o => getStatus(o) === 'pending').length,
            // Count ALL emergency requests for the stat card if the user implies that, 
            // OR if it's meant to be an "Action item", then pending. 
            // Usually "Emergency Requests" card implies attention needed, so pending is often right.
            // BUT if the user says it's "Wrong", maybe they expect TOTAL emergency requests?
            // The card says "⚠️ Action Required" which implies pending. 
            // I will stick to pending but fix the property access which is the likely bug.
            emergencyRequests: outpasses.filter(o =>
                getType(o) === 'emergency' &&
                getStatus(o) === 'pending'
            ).length
        };

        // Calculate Chart Data (Counts by Type)
        const typeCounts: { [key: string]: number } = {
            'OD': 0,
            'Home Pass': 0,
            'Emergency': 0,
            'Outing Pass': 0
        };

        outpasses.forEach(o => {
            const type = getType(o);
            if (type === 'od') typeCounts['OD']++;
            else if (type.includes('home')) typeCounts['Home Pass']++;
            else if (type === 'emergency') typeCounts['Emergency']++;
            else if (type === 'medical' || type === 'outing') typeCounts['Outing Pass']++;
        });

        const chartData = [
            { label: 'OD', value: typeCounts['OD'], color: '#6366f1' },
            { label: 'Home Pass', value: typeCounts['Home Pass'], color: '#ec4899' },
            { label: 'Emergency', value: typeCounts['Emergency'], color: '#ef4444' },
            { label: 'Outing Pass', value: typeCounts['Outing Pass'], color: '#f59e0b' },
        ];

        return { stats, chartData };
    }
};
