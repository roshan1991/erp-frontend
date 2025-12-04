import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token added to request:', config.url);
        console.log('Authorization header:', config.headers.Authorization);
    } else {
        console.warn('No access token found in localStorage');
    }
    return config;
});

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    full_name?: string;
    is_active: boolean;
    is_superuser: boolean;
}

export interface UserCreate {
    username: string;
    email: string;
    password: string;
    full_name?: string;
    is_superuser?: boolean;
}

export interface UserUpdate {
    username?: string;
    email?: string;
    password?: string;
    full_name?: string;
    is_active?: boolean;
    is_superuser?: boolean;
}

// Authentication
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await api.post<LoginResponse>('/login/access-token', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
};

// User Management
export const getUsers = async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
};

export const createUser = async (user: UserCreate): Promise<User> => {
    const response = await api.post<User>('/users', user);
    return response.data;
};

export const updateUser = async (userId: number, user: UserUpdate): Promise<User> => {
    const response = await api.put<User>(`/users/${userId}`, user);
    return response.data;
};

export const deleteUser = async (userId: number): Promise<User> => {
    const response = await api.delete<User>(`/users/${userId}`);
    return response.data;
};

export default api;

// Finance Interfaces
export interface Account {
    id: number;
    code: string;
    name: string;
    type: string;
    description?: string;
    balance: number;
}

export interface JournalEntryLine {
    id?: number;
    account_id: number;
    debit: number;
    credit: number;
    description?: string;
}

// Finance API Methods
export const getAccounts = async (): Promise<Account[]> => {
    const response = await api.get<Account[]>('/finance/accounts');
    return response.data;
};

export interface JournalEntry {
    id: number;
    date: string;
    description: string;
    reference?: string;
    status: string;
    lines: JournalEntryLine[];
}

export interface JournalEntryCreate {
    date: string;
    description: string;
    reference?: string;
    status?: string;
    lines: JournalEntryLine[];
}

export interface APInvoice {
    id: number;
    invoice_number: string;
    supplier_id: number;
    date: string;
    due_date?: string;
    total_amount: number;
    status: string;
}

export interface APInvoiceCreate {
    invoice_number: string;
    supplier_id: number;
    date: string;
    due_date?: string;
    total_amount: number;
    status?: string;
}

export interface ARInvoice {
    id: number;
    invoice_number: string;
    customer_id: number;
    date: string;
    due_date?: string;
    total_amount: number;
    status: string;
}

export interface ARInvoiceCreate {
    invoice_number: string;
    customer_id: number;
    date: string;
    due_date?: string;
    total_amount: number;
    status?: string;
}

// Finance API Methods
export const getJournalEntries = async (): Promise<JournalEntry[]> => {
    const response = await api.get<JournalEntry[]>('/finance/journal-entries');
    return response.data;
};

export const createJournalEntry = async (entry: JournalEntryCreate): Promise<JournalEntry> => {
    const response = await api.post<JournalEntry>('/finance/journal-entries', entry);
    return response.data;
};

export const getAPInvoices = async (): Promise<APInvoice[]> => {
    const response = await api.get<APInvoice[]>('/finance/ap-invoices');
    return response.data;
};

export const createAPInvoice = async (invoice: APInvoiceCreate): Promise<APInvoice> => {
    const response = await api.post<APInvoice>('/finance/ap-invoices', invoice);
    return response.data;
};

export const getARInvoices = async (): Promise<ARInvoice[]> => {
    const response = await api.get<ARInvoice[]>('/finance/ar-invoices');
    return response.data;
};

export const createARInvoice = async (invoice: ARInvoiceCreate): Promise<ARInvoice> => {
    const response = await api.post<ARInvoice>('/finance/ar-invoices', invoice);
    return response.data;
};

// Supply Chain Interfaces
export interface Supplier {
    id: number;
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
}

// CRM Interfaces
export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    status?: string;
}

// Supply Chain API Methods
export const getSuppliers = async (): Promise<Supplier[]> => {
    const response = await api.get<Supplier[]>('/supply-chain/suppliers');
    return response.data;
};

// CRM API Methods
export const getCustomers = async (): Promise<Customer[]> => {
    const response = await api.get<Customer[]>('/crm/customers');
    return response.data;
};
