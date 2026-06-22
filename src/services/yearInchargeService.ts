import axios from 'axios';

// 1. Centralized Endpoint Constants
export const API_ENDPOINTS = {
    YEAR_INCHARGE: {
        STATS: '/incharge/outpass/stats',
        OUTPASS_LIST: '/incharge/outpass/list?',
        PENDING_LIST: '/incharge/pending/outpass/list',
        DETAILS: (id: string) => `/incharge/outpass/${id}`,
        APPROVE: (id: string) => `/incharge/outpass/approve/${id}`,
        REJECT: (id: string) => `/incharge/outpass/reject/${id}`,
    }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios client with authentication interceptor
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

// 2. Types & Interfaces
export interface MappedStudent {
    _id: string;
    name: string;
    registerNumber: string;
    department: string;
    year: string;
    residencetype: string;
    boardingpoint?: string;
    busno?: string;
    hostelname?: string;
    hostelroomno?: string;
    phone: string;
    photo: string;
    parentnumber?: string;
    parentPhone?: string;
    semester?: number;
    batch?: string;
    gender?: string;
    email?: string;
}

export interface MappedOutpass {
    _id: string;
    student: MappedStudent[];
    studentid: MappedStudent;
    staff?: {
        _id: string;
        name: string;
        contactNumber?: string;
    };
    yearincharge?: {
        status: string;
        actionAt?: string;
        remarks?: string;
    };
    warden?: {
        _id: string;
        name: string;
        phone: string;
    };
    incharge?: {
        _id: string;
        name: string;
        phone: string;
    };
    outpasstype: string;
    fromDate: string;
    toDate: string;
    reason: string;
    status: string;
    remarks?: string;
    proof?: string;
    document?: string;
    file?: string;
    createdAt: string;
    updatedAt?: string;
    skillrack?: string;
    attendance?: string;
    approvedAt?: string;
    rejectedAt?: string;
    in?: string | null;
    out?: string | null;
    staffid?: {
        _id: string;
        name: string;
        contactNumber?: string;
    };
    staffapprovalstatus?: string;
    staffapprovedAt?: string;
    yearinchargeapprovalstatus?: string;
    yearinchargeapprovedAt?: string;
    yearinchargeremarks?: string;
    wardenapprovalstatus?: string;
    wardenapprovedAt?: string;
}

export interface MappedStats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

export interface PaginatedResult<T> {
    data: T[];
    totalPages: number;
    currentPage: number;
    totalResults: number;
}

export function mapStatsResponse(data: any): MappedStats {
    let statsObj = data?.stats?.[0]?.stats?.[0];

    if (!statsObj) {
        statsObj = data?.stats || data?.data || data || {};
        if (Array.isArray(statsObj)) {
            statsObj = statsObj[0] || {};
        }
    }

    return {
        total: statsObj.total ?? statsObj.totalOutpasses ?? statsObj.totalRequests ?? 0,
        pending: statsObj.pending ?? statsObj.pendingApprovals ?? statsObj.pendingRequests ?? 0,
        approved: statsObj.approved ?? statsObj.approvedOutpasses ?? statsObj.approvedRequests ?? 0,
        rejected: statsObj.rejected ?? statsObj.rejectedOutpasses ?? statsObj.rejectedRequests ?? 0,
    };
}

export function mapOutpassResponse(o: any): MappedOutpass {
    if (!o) return {} as MappedOutpass;

    // Resolve student
    let rawStudent = o.student || o.studentid || {};
    if (Array.isArray(rawStudent)) {
        rawStudent = rawStudent[0] || {};
    }

    const student: MappedStudent = {
        _id: rawStudent._id || rawStudent.id || '',
        name: rawStudent.name || 'Unknown',
        registerNumber: rawStudent.registerNumber || rawStudent.registerNo || 'N/A',
        department: rawStudent.department || 'N/A',
        year: rawStudent.year || 'N/A',
        residencetype: rawStudent.residencetype || rawStudent.residentType || 'day scholar',
        boardingpoint: rawStudent.boardingpoint || rawStudent.boardingPoint || '',
        busno: rawStudent.busno || rawStudent.busNo || '',
        hostelname: rawStudent.hostelname || rawStudent.hostelName || '',
        hostelroomno: rawStudent.hostelroomno || rawStudent.hostelroomNo || rawStudent.roomNo || '',
        phone: rawStudent.phone || rawStudent.mobile || '',
        photo: rawStudent.photo || '',
        parentnumber: rawStudent.parentnumber || rawStudent.parentContact || '',
        parentPhone: rawStudent.parentPhone || rawStudent.parentnumber || '',
        semester: rawStudent.semester,
        batch: rawStudent.batch,
        gender: rawStudent.gender,
        email: rawStudent.email,
    };

    const staffapprovalstatus = o.staffapprovalstatus || (o.staff || o.staffid ? 'approved' : 'pending');
    const staffapprovedAt = o.staffapprovedAt || o.staff?.actionAt || o.createdAt;
    const yearinchargeapprovalstatus = o.yearinchargeapprovalstatus || o.yearincharge?.status || o.status || 'pending';
    const yearinchargeapprovedAt = o.yearinchargeapprovedAt || o.yearincharge?.actionAt || o.approvedAt || o.rejectedAt;
    const yearinchargeremarks = o.yearinchargeremarks || o.yearincharge?.remarks || o.remarks || '';
    const wardenapprovalstatus = o.wardenapprovalstatus || o.warden?.status || o.status || 'pending';
    const wardenapprovedAt = o.wardenapprovedAt || o.warden?.actionAt || o.approvedAt || o.rejectedAt;

    const staffObj = o.staff || o.staffid ? {
        _id: o.staff?._id || o.staffid?._id || o.staffid || '',
        name: o.staff?.name || o.staffid?.name || 'N/A',
        contactNumber: o.staff?.contactNumber || o.staffid?.contactNumber || o.staffid?.phone || 'N/A',
    } : undefined;

    return {
        _id: o._id || o.id || '',
        student: [student],
        studentid: student,
        staff: staffObj,
        staffid: staffObj,
        yearincharge: o.yearincharge || o.yearinchargeapprovalstatus ? {
            status: o.yearincharge?.status || o.yearinchargeapprovalstatus || 'pending',
            actionAt: o.yearincharge?.actionAt || o.yearinchargeapprovedAt || o.updatedAt,
            remarks: o.yearincharge?.remarks || o.yearinchargeremarks || o.remarks || '',
        } : undefined,
        warden: o.warden || o.wardenid ? {
            _id: o.warden?._id || o.wardenid?._id || o.wardenid || '',
            name: o.warden?.name || o.wardenid?.name || 'Pending',
            phone: o.warden?.phone || o.wardenid?.phone || 'N/A',
        } : undefined,
        incharge: o.incharge || o.inchargeid ? {
            _id: o.incharge?._id || o.inchargeid?._id || o.inchargeid || '',
            name: o.incharge?.name || o.inchargeid?.name || 'N/A',
            phone: o.incharge?.phone || o.inchargeid?.phone || 'N/A',
        } : undefined,
        outpasstype: o.outpasstype || o.outpassType || 'General',
        fromDate: o.fromDate || '',
        toDate: o.toDate || '',
        reason: o.reason || '',
        status: o.status || o.outpassStatus || 'pending',
        remarks: o.remarks || o.yearinchargeremarks || '',
        proof: o.proof || o.document || o.file || '',
        document: o.document || o.proof || o.file || '',
        file: o.file || o.proof || o.document || '',
        createdAt: o.createdAt || '',
        updatedAt: o.updatedAt,
        skillrack: o.skillrack,
        attendance: o.attendance,
        approvedAt: o.approvedAt,
        rejectedAt: o.rejectedAt,
        in: o.in,
        out: o.out,
        staffapprovalstatus,
        staffapprovedAt,
        yearinchargeapprovalstatus,
        yearinchargeapprovedAt,
        yearinchargeremarks,
        wardenapprovalstatus,
        wardenapprovedAt,
    };
}

export function mapPaginatedResponse<T>(data: any, mapper: (item: any) => T): PaginatedResult<T> {
    const list = data.outpasses || data.outpasslist || data.filterOutpass || data.data || (Array.isArray(data) ? data : []);
    return {
        data: list.map(mapper),
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || 1,
        totalResults: data.totalResults || data.total || list.length || 0,
    };
}

// 4. Year Incharge Service Methods
export const YearInchargeService = {
    getStats: async (filter?: string) => {
        const url = filter 
            ? `${API_ENDPOINTS.YEAR_INCHARGE.STATS}?filter=${filter}` 
            : API_ENDPOINTS.YEAR_INCHARGE.STATS;
        const response = await api.get(url);
        return mapStatsResponse(response.data);
    },

    getOutpasses: async (page: number) => {
        const response = await api.get(`${API_ENDPOINTS.YEAR_INCHARGE.OUTPASS_LIST}?page=${page}`);
        return mapPaginatedResponse<MappedOutpass>(response.data, mapOutpassResponse);
    },

    getPendingOutpasses: async (page: number, limit: number) => {
        const response = await api.get(`${API_ENDPOINTS.YEAR_INCHARGE.PENDING_LIST}?page=${page}&limit=${limit}`);
        return mapPaginatedResponse<MappedOutpass>(response.data, mapOutpassResponse);
    },

    getOutpassDetails: async (id: string) => {
        const response = await api.get(API_ENDPOINTS.YEAR_INCHARGE.DETAILS(id));
        // Some backends return nested outpass object, some return direct
        const data = response.data.outpass || response.data.filterOutpass?.[0] || response.data;
        return mapOutpassResponse(data);
    },

    approveOutpass: async (id: string) => {
        const response = await api.get(API_ENDPOINTS.YEAR_INCHARGE.APPROVE(id));
        return response.data;
    },

    rejectOutpass: async (id: string, remarks?: string) => {
        const payload = remarks ? { remarks } : {};
        const response = await api.put(API_ENDPOINTS.YEAR_INCHARGE.REJECT(id), payload);
        return response.data;
    }
};
