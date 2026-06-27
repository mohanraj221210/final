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

const API_URL = "http://localhost:8000";

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
        const response = await api.put(`/admin/student/update/${id}`, data);
        return response.data;
    },
    deleteStudent: async (id: string) => {
        const response = await api.delete(`/admin/student/delete/${id}`);
        return response.data;
    },
    getStudentStats: async (filters?: { department?: string, year?: string, semester?: string }) => {
        const params = new URLSearchParams();
        if (filters?.department) params.append('department', filters.department);
        if (filters?.year) params.append('year', filters.year);
        if (filters?.semester) params.append('semester', filters.semester);

        const response = await api.get(`/admin/students/stats?${params.toString()}`);
        return response.data.stats;
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
    resetStudentPassword: async (id: string, newPassword: string) => {
        const response = await api.put(`/admin/student/forgotpassword/${id}`, { newPassword });
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
    getStaffStats: async (filters?: { department?: string }) => {
        const params = new URLSearchParams();
        if (filters?.department) params.append('department', filters.department);

        const response = await api.get(`/admin/staff/stats?${params.toString()}`);
        return response.data.stats;
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
    getAllOutpasses: async (filters?: {
        page?: number;
        status?: string;
        appliedDate?: string;
        department?: string;
        outpasstype?: string;
        search?: string;
        registerNumber?: string;
    }) => {
        const params = new URLSearchParams();
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.status) params.append('status', filters.status);
        if (filters?.appliedDate) params.append('appliedDate', filters.appliedDate);
        if (filters?.department) params.append('department', filters.department);
        if (filters?.outpasstype) params.append('outpasstype', filters.outpasstype);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.registerNumber) params.append('registerNumber', filters.registerNumber);
        const qs = params.toString();
        const endpoint = qs ? `/admin/outpass/list?${qs}` : '/admin/outpass/list';
        const response = await api.get<{ message: string, outpasses: any[], isLast?: boolean }>(endpoint);
        return response.data;
    },
    getOutpassStats: async (filters?: { status?: string, appliedDate?: string, department?: string, outpasstype?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.appliedDate) params.append('appliedDate', filters.appliedDate);
        if (filters?.department) params.append('department', filters.department);
        if (filters?.outpasstype) params.append('outpasstype', filters.outpasstype);

        const response = await api.get(`/admin/outpass/stats?${params.toString()}`);
        return response.data.stats;
    }
};
