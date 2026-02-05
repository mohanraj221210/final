
import type { User } from '../data/sampleData';

export const isProfileComplete = (user: User | null | undefined): boolean => {
    if (!user) return false;

    // Basic fields that are always required
    if (!user.name || !user.registerNumber || !user.department || !user.year ||
        !user.phone || !user.email || !user.parentnumber || !user.residencetype || !user.photo) {
        return false;
    }

    // Conditional fields based on residence type
    if (user.residencetype === 'hostel') {
        if (!user.hostelname || !user.hostelroomno) return false;
    } else if (user.residencetype === 'day scholar') {
        if (!user.busno || !user.boardingpoint) return false;
    }

    return true;
};
