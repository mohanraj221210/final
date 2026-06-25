import axios from 'axios';

// 1. Centralized Endpoint Constants
export const API_ENDPOINTS = {
    YEAR_INCHARGE: {
        STATS: '/incharge/outpass/stats',
        OUTPASS_LIST: '/incharge/outpass/list',
        PENDING_LIST: '/incharge/pending/outpass/list',
        DETAILS: (id: string) => `/incharge/outpass/${id}`,
        APPROVE: (id: string) => `/incharge/outpass/approve/${id}`,
        REJECT: (id: string) => `/incharge/outpass/reject/${id}`,
        PROFILE: '/incharge/profile',
        PROFILE_UPDATE: '/incharge/profile/update',
    }
};

const API_URL = import.meta.env.VITE_API_URL || 'https://api.jit.college';

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
    recentpasses?: MappedOutpass[];
}

export interface MappedYearIncharge {
    name: string;
    email: string;
    phone: string;
    gender: string;
    photo: string;
    year: string;
    role: string;
    handlingyears: string[];
    handlingbatches: string[];
    handlingdepartments: string[];
    registerNumber?: string;
    department?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    totalPages: number;
    currentPage: number;
    totalResults: number;
    isLast?: boolean;
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
        isLast: data.isLast,
    };
}

export function mapProfileResponse(data: any): MappedYearIncharge {
    const rawData = data?.yearincharge || data?.user || data || {};
    return {
        name: rawData.name || '',
        email: rawData.email || '',
        phone: rawData.phone || '',
        gender: rawData.gender || 'male',
        photo: rawData.photo || '',
        year: rawData.year || '',
        role: rawData.role || '',
        handlingyears: Array.isArray(rawData.handlingyears) ? rawData.handlingyears : rawData.handlingyears ? [rawData.handlingyears] : [],
        handlingbatches: Array.isArray(rawData.handlingbatches) ? rawData.handlingbatches : rawData.handlingbatches ? [rawData.handlingbatches] : [],
        handlingdepartments: Array.isArray(rawData.handlingdepartments) ? rawData.handlingdepartments : rawData.handlingdepartments ? [rawData.handlingdepartments] : [],
        registerNumber: rawData.registerNumber,
        department: rawData.department,
    };
}

// 4. Year Incharge Service Methods
export const YearInchargeService = {
    getStats: async (filter?: string) => {
        const url = filter && filter !== 'total'
            ? `${API_ENDPOINTS.YEAR_INCHARGE.STATS}?filter=${filter}`
            : API_ENDPOINTS.YEAR_INCHARGE.STATS;
        console.log(`[YearInchargeService.getStats] Request: Method: GET, URL: ${url}, Token: ${localStorage.getItem('token') ? 'Bearer present' : 'Missing'}`);
        try {
            const response = await api.get(url);
            console.log(`[YearInchargeService.getStats] Response: Status: ${response.status}, Raw Data:`, response.data);
            const mapped = mapStatsResponse(response.data);
            
            // Extract recentpasses if available
            const statsObj = response.data?.stats?.[0] || response.data?.data?.[0] || {};
            const recentpasses = statsObj?.recentpasses || response.data?.recentpasses || [];
            
            return {
                ...mapped,
                recentpasses: Array.isArray(recentpasses) ? recentpasses.map(mapOutpassResponse) : []
            };
        } catch (error: any) {
            console.error(`[YearInchargeService.getStats] Error: Status: ${error.response?.status}, Data:`, error.response?.data || error.message);
            throw error;
        }
    },

    getOutpasses: async (page: number, appliedDate?: string, status?: string, search?: string, filter?: string) => {
        const appliedDateParam = appliedDate && appliedDate !== 'total' && appliedDate !== 'all' ? `&appliedDate=${appliedDate}` : '';
        const statusParam = status && status !== 'all' ? `&status=${status}` : '';
        const searchParam = search ? `&search=${search}` : '';
        const filterParam = filter && filter !== 'all' && filter !== 'total' ? `&filter=${filter}` : '';
        const url = `${API_ENDPOINTS.YEAR_INCHARGE.OUTPASS_LIST}?page=${page}&limit=10${appliedDateParam}${statusParam}${searchParam}${filterParam}`;
        console.log('API Request:', url);
        try {
            const response = await api.get(url);
            console.log('API Response:', response.data);
            return mapPaginatedResponse<MappedOutpass>(response.data, mapOutpassResponse);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                return {
                    data: [],
                    totalPages: 1,
                    currentPage: page,
                    totalResults: 0,
                    isLast: true
                };
            }
            console.error(`[YearInchargeService.getOutpasses] Error: Status: ${error?.response?.status}, Data:`, error?.response?.data || error?.message);
            throw error;
        }
    },

    getPendingOutpasses: async (page: number, limit: number, appliedDate?: string, search?: string, filter?: string): Promise<PaginatedResult<MappedOutpass>> => {
        const appliedDateParam = appliedDate && appliedDate !== 'total' && appliedDate !== 'all' ? `&appliedDate=${appliedDate}` : '';
        const searchParam = search ? `&search=${search}` : '';
        const filterParam = filter && filter !== 'all' && filter !== 'total' ? `&filter=${filter}` : '';
        const url = `${API_ENDPOINTS.YEAR_INCHARGE.PENDING_LIST}?page=${page}&limit=${limit}${appliedDateParam}${searchParam}${filterParam}`;
        console.log('API Request:', url);
        try {
            const response = await api.get(url);
            console.log('API Response:', response.data);
            return mapPaginatedResponse<MappedOutpass>(response.data, mapOutpassResponse);
        } catch (error: any) {
            if (error.response?.status === 404) {
                // TEMPORARY FALLBACK
                console.warn(
                    "Using fallback pending-outpass implementation because backend endpoint returned 404"
                );

                try {
                    const fallbackUrl = `${API_ENDPOINTS.YEAR_INCHARGE.OUTPASS_LIST}?page=1&limit=200${appliedDateParam}${searchParam}${filterParam}`;
                    console.log('API Request (Fallback):', fallbackUrl);

                    const fallbackResponse = await api.get(fallbackUrl);
                    console.log('API Response (Fallback):', fallbackResponse.data);

                    const rawList = fallbackResponse.data.outpasses ||
                        fallbackResponse.data.outpasslist ||
                        fallbackResponse.data.filterOutpass ||
                        fallbackResponse.data.data ||
                        (Array.isArray(fallbackResponse.data) ? fallbackResponse.data : []);

                    const totalOutpasses = rawList.length;

                    // Inspect actual status field
                    let actualStatusField = 'none';
                    if (totalOutpasses > 0) {
                        const firstItem = rawList[0];
                        if (firstItem.yearinchargeapprovalstatus !== undefined) {
                            actualStatusField = 'yearinchargeapprovalstatus';
                        } else if (firstItem.yearincharge?.status !== undefined) {
                            actualStatusField = 'yearincharge.status';
                        } else if (firstItem.status !== undefined) {
                            actualStatusField = 'status';
                        }
                    }

                    // Filter for pending status locally
                    const pendingRawList = rawList.filter((o: any) => {
                        const statusVal = o.yearinchargeapprovalstatus || o.yearincharge?.status || o.status;
                        return typeof statusVal === 'string' && statusVal.toLowerCase() === 'pending';
                    });

                    const pendingCount = pendingRawList.length;

                    console.log(`[YearInchargeService.getPendingOutpasses] Fallback Analysis:`, {
                        totalOutpasses,
                        pendingCountDerived: pendingCount,
                        actualStatusFieldUsed: actualStatusField,
                        failedEndpoint: url
                    });

                    const mappedPending = pendingRawList.map(mapOutpassResponse);
                    const startIndex = (page - 1) * limit;
                    const paginatedData = mappedPending.slice(startIndex, startIndex + limit);
                    const totalPages = Math.max(1, Math.ceil(pendingCount / limit));

                    return {
                        data: paginatedData,
                        totalPages,
                        currentPage: page,
                        totalResults: pendingCount,
                        isLast: page >= totalPages
                    };
                } catch (fallbackError: any) {
                    if (fallbackError.response?.status === 404) {
                        return {
                            data: [],
                            totalPages: 1,
                            currentPage: page,
                            totalResults: 0,
                            isLast: true
                        };
                    }
                    throw fallbackError;
                }
            }
            console.error(`[YearInchargeService.getPendingOutpasses] Error: Status: ${error.response?.status}, Data:`, error.response?.data || error.message);
            throw error;
        }
    },

    getOutpassDetails: async (id: string) => {
        const url = API_ENDPOINTS.YEAR_INCHARGE.DETAILS(id);
        console.log(`[YearInchargeService.getOutpassDetails] Request: Method: GET, URL: ${url}, Token: ${localStorage.getItem('token') ? 'Bearer present' : 'Missing'}`);
        try {
            const response = await api.get(url);
            console.log(`[YearInchargeService.getOutpassDetails] Response: Status: ${response.status}, Raw Data:`, response.data);
            const data = response.data.outpass || response.data.filterOutpass?.[0] || response.data;
            return mapOutpassResponse(data);
        } catch (error: any) {
            console.error(`[YearInchargeService.getOutpassDetails] Error: Status: ${error.response?.status}, Data:`, error.response?.data || error.message);
            throw error;
        }
    },

    approveOutpass: async (id: string) => {
        const url = API_ENDPOINTS.YEAR_INCHARGE.APPROVE(id);
        console.log(`[YearInchargeService.approveOutpass] Request: Method: GET, URL: ${url}, Token: ${localStorage.getItem('token') ? 'Bearer present' : 'Missing'}`);
        try {
            const response = await api.get(url);
            console.log(`[YearInchargeService.approveOutpass] Response: Status: ${response.status}, Raw Data:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`[YearInchargeService.approveOutpass] Error: Status: ${error.response?.status}, Data:`, error.response?.data || error.message);
            throw error;
        }
    },

    rejectOutpass: async (id: string, remarks?: string) => {
        const url = API_ENDPOINTS.YEAR_INCHARGE.REJECT(id);
        const payload = remarks ? { remarks } : {};
        console.log(`[YearInchargeService.rejectOutpass] Request: Method: PUT, URL: ${url}, Payload:`, payload, `, Token: ${localStorage.getItem('token') ? 'Bearer present' : 'Missing'}`);
        try {
            const response = await api.put(url, payload);
            console.log(`[YearInchargeService.rejectOutpass] Response: Status: ${response.status}, Raw Data:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`[YearInchargeService.rejectOutpass] Error: Status: ${error.response?.status}, Data:`, error.response?.data || error.message);
            throw error;
        }
    },

    getProfile: async () => {
        const url = API_ENDPOINTS.YEAR_INCHARGE.PROFILE;
        console.log(`[YearInchargeService.getProfile] Request: Method: GET, URL: ${url}, Token: ${localStorage.getItem('token') ? 'Bearer present' : 'Missing'}`);
        try {
            const response = await api.get(url);
            console.log(`[YearInchargeService.getProfile] Response: Status: ${response.status}, Raw Data:`, response.data);
            return mapProfileResponse(response.data);
        } catch (error: any) {
            console.error(`[YearInchargeService.getProfile] Error: Status: ${error.response?.status}, Data:`, error.response?.data || error.message);
            throw error;
        }
    },

    updateProfile: async (formData: FormData) => {
        const url = API_ENDPOINTS.YEAR_INCHARGE.PROFILE_UPDATE;
        console.log(`[YearInchargeService.updateProfile] Request: Method: PUT, URL: ${url}, Token: ${localStorage.getItem('token') ? 'Bearer present' : 'Missing'}`);
        try {
            const response = await api.put(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(`[YearInchargeService.updateProfile] Response: Status: ${response.status}, Raw Data:`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`[YearInchargeService.updateProfile] Error: Status: ${error.response?.status}, Data:`, error.response?.data || error.message);
            throw error;
        }
    }
};
