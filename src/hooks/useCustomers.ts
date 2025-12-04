import { useState, useEffect } from "react";
import api from "../lib/api";

export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    points: number;
}

export function useCustomers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCustomers = async () => {
        try {
            const response = await api.get("/crm/customers");
            setCustomers(response.data);
        } catch (err: any) {
            setError("Failed to fetch customers");
        } finally {
            setLoading(false);
        }
    };

    const addCustomer = async (customer: Omit<Customer, "id" | "points">) => {
        try {
            const response = await api.post("/crm/customers", customer);
            setCustomers([...customers, response.data]);
            return response.data;
        } catch (err: any) {
            throw err;
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    return { customers, loading, error, addCustomer, refreshCustomers: fetchCustomers };
}
