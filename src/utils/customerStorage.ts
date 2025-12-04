import { Customer, CustomerFormData } from '@/types/customer';

const STORAGE_KEY = 'gym_customers';

/**
 * Generate a unique customer ID in format: GYM-<timestamp>-<4randomDigits>
 * Example: GYM-1733328123-4829
 */
export const generateCustomerId = (): string => {
    const timestamp = Math.floor(Date.now() / 1000);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `GYM-${timestamp}-${randomDigits}`;
};

/**
 * Save a new customer to localStorage
 * TODO: Replace with backend API call when ready
 * Example: await fetch('/api/customers', { method: 'POST', body: JSON.stringify(customer) })
 */
export const saveCustomer = (formData: CustomerFormData): Customer => {
    const customer: Customer = {
        customerId: generateCustomerId(),
        ...formData,
        createdAt: new Date().toISOString(),
    };

    const customers = getAllCustomers();
    customers.push(customer);

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));

    // TODO: Also save to backend when available
    // await fetch('/api/customers', { method: 'POST', body: JSON.stringify(customer) });

    return customer;
};

/**
 * Get all customers from localStorage
 * TODO: Replace with backend API call when ready
 * Example: const response = await fetch('/api/customers'); return response.json();
 */
export const getAllCustomers = (): Customer[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const customers = JSON.parse(stored) as Customer[];
        // Sort by newest first
        return customers.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    } catch (error) {
        console.error('Error reading customers from localStorage:', error);
        return [];
    }
};

/**
 * Get a single customer by ID
 * TODO: Replace with backend API call when ready
 */
export const getCustomerById = (customerId: string): Customer | null => {
    const customers = getAllCustomers();
    return customers.find(c => c.customerId === customerId) || null;
};

/**
 * Clear all customers (for testing purposes)
 */
export const clearAllCustomers = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};

/**
 * Export customers as CSV string
 */
export const exportCustomersAsCSV = (): string => {
    const customers = getAllCustomers();
    if (customers.length === 0) return '';

    const headers = [
        'Customer ID',
        'Full Name',
        'Phone',
        'Age',
        'Gender',
        'Address',
        'Emergency Contact',
        'Membership Type',
        'Start Date',
        'Created At',
    ];

    const rows = customers.map(c => [
        c.customerId,
        c.fullName,
        c.phone,
        c.age,
        c.gender,
        c.address,
        c.emergencyContact,
        c.membershipType,
        c.startDate,
        c.createdAt,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
};
