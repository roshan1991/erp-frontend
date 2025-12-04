import { useState } from "react";
import { Card, Table, Form, InputGroup, Badge } from "react-bootstrap";
import { Search, Calendar, DollarSign, User } from "lucide-react";

const initialSales = [
    { id: "ORD-001", date: "2023-11-22 10:30", customer: "Walk-in Customer", items: 3, total: 145.00, payment: "Cash" },
    { id: "ORD-002", date: "2023-11-22 11:15", customer: "John Doe", items: 1, total: 450.00, payment: "Card" },
    { id: "ORD-003", date: "2023-11-22 12:00", customer: "Jane Smith", items: 5, total: 85.50, payment: "Cash" },
];

export function SalesHistory() {
    const [sales] = useState(initialSales);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2 mb-0">Sales History</h1>
            </div>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <InputGroup>
                        <InputGroup.Text className="bg-white border-end-0">
                            <Search size={18} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search orders..."
                            className="border-start-0 shadow-none"
                        />
                    </InputGroup>
                </Card.Body>
            </Card>

            <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                    <Table responsive hover className="mb-0 align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0 ps-4">Order ID</th>
                                <th className="border-0">Date & Time</th>
                                <th className="border-0">Customer</th>
                                <th className="border-0">Items</th>
                                <th className="border-0">Total</th>
                                <th className="border-0 pe-4">Payment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale) => (
                                <tr key={sale.id}>
                                    <td className="ps-4 fw-medium">{sale.id}</td>
                                    <td className="text-muted">
                                        <div className="d-flex align-items-center">
                                            <Calendar size={14} className="me-2" /> {sale.date}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <User size={14} className="me-2 text-muted" /> {sale.customer}
                                        </div>
                                    </td>
                                    <td>{sale.items}</td>
                                    <td className="fw-bold">
                                        <div className="d-flex align-items-center">
                                            <DollarSign size={14} className="me-1 text-muted" />
                                            {sale.total.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="pe-4">
                                        <Badge bg={sale.payment === 'Cash' ? 'success' : 'primary'}>
                                            {sale.payment}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
}
