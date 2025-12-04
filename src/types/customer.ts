// Customer types for QR-based intake system
export interface Customer {
    customerId: string;
    fullName: string;
    phone: string;
    age: string;
    gender: 'male' | 'female' | 'other';
    address: string;
    emergencyContact: string;
    membershipType: '1-month-trial' | '3-month-basic' | '6-month-standard' | '12-month-premium';
    startDate: string;
    createdAt: string;
}

export interface CustomerFormData {
    fullName: string;
    phone: string;
    age: string;
    gender: 'male' | 'female' | 'other';
    address: string;
    emergencyContact: string;
    membershipType: '1-month-trial' | '3-month-basic' | '6-month-standard' | '12-month-premium';
    startDate: string;
}

export const MEMBERSHIP_TYPES = {
    '1-month-trial': '1 Month Trial',
    '3-month-basic': '3 Month Basic',
    '6-month-standard': '6 Month Standard',
    '12-month-premium': '12 Month Premium',
} as const;
