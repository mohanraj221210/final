
export interface Student {
    _id: string;
    name: string;
    email: string;
    staffid: string | { _id: string; name: string }; // API shows it can be populated
    registerNumber: string;
    department: string;
    semester: number;
    year: string;
    phone: string;
    batch: string;
    gender: 'male' | 'female';
    parentnumber: string;
    residencetype: 'hostel' | 'day scholar';
    hostelname?: string;
    hostelroomno?: string;
    busno?: string;
    boardingpoint?: string;
    cgpa?: number;
    arrears?: number;
    isblocked?: boolean;
    photo?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Staff {
    _id: string;
    name: string;
    email: string;
    subjects: string[];
    skills: string[];
    achievements: string[];
    contactNumber: string;
    department: string;
    designation: string;
    qualification: string;
    experience: string;
    photo?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface YearIncharge {
    _id: string;
    name: string;
    email: string;
    role: string;
    gender?: string;
    photo?: string;
    year: string; // "main block" in example?
    phone?: string;
}

export interface Warden {
    _id: string;
    name: string;
    email: string;
    hostelname: string;
    photo?: string;
    gender?: string;
    phone?: string;
}

export interface Watchman {
    _id: string;
    name: string;
    email: string;
    phone?: string | number; // API example shows number
    photo?: string;
}

export interface Bus {
    _id: string;
    routenumber: string;
    busnumber: string;
    drivername: string;
    driverphone: string;
    route: string;
    boardingpoints: string[];
}

export interface AdminProfile {
    _id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    message: string;
    token: string;
}

