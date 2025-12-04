import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Spinner, Alert, Table } from "react-bootstrap";
import { Printer, ArrowLeft } from "lucide-react";
import api from "../../lib/api";

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
}

interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    customer?: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    items: OrderItem[];
    payments: { method: string; amount: number }[];
}

export function ReceiptPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const response = await api.get(`/pos/orders/${id}`);
            setOrder(response.data);
        } catch (err: any) {
            setError("Failed to load receipt details.");
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;
    if (!order) return <Alert variant="warning" className="m-4">Order not found</Alert>;

    return (
        <div className="p-4 bg-light min-vh-100">
            {/* Action Bar - Hidden when printing */}
            <div className="d-flex justify-content-between align-items-center mb-4 d-print-none container" style={{ maxWidth: '800px' }}>
                <Button variant="outline-secondary" onClick={() => navigate("/pos")}>
                    <ArrowLeft size={18} className="me-2" /> Back to POS
                </Button>
                <div className="d-flex gap-2">
                    <Button variant="primary" onClick={handlePrint}>
                        <Printer size={18} className="me-2" /> Print Receipt
                    </Button>
                </div>
            </div>

            {/* Receipt Content */}
            <Card className="shadow-sm border-0 mx-auto" style={{ maxWidth: '800px', minHeight: '800px' }}>
                <Card.Body className="p-5">
                    {/* Header */}
                    <div className="text-center mb-5">
                        <h1 className="fw-bold text-primary mb-2">INVOICE</h1>
                        <p className="text-muted">Thank you for your business</p>
                    </div>

                    <div className="d-flex justify-content-between mb-5">
                        <div>
                            <h5 className="fw-bold">Billed To:</h5>
                            <p className="mb-1 fw-medium">{order.customer?.name || "Walk-in Customer"}</p>
                            {order.customer?.email && <p className="mb-1 text-muted">{order.customer.email}</p>}
                            {order.customer?.phone && <p className="mb-1 text-muted">{order.customer.phone}</p>}
                        </div>
                        <div className="text-end">
                            <h5 className="fw-bold">Invoice Details:</h5>
                            <p className="mb-1">Invoice #: <span className="fw-medium">INV-{order.id.toString().padStart(6, '0')}</span></p>
                            <p className="mb-1">Date: <span className="fw-medium">{new Date(order.created_at).toLocaleDateString()}</span></p>
                            <p className="mb-1">Time: <span className="fw-medium">{new Date(order.created_at).toLocaleTimeString()}</span></p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <Table className="mb-4">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0">Item Description</th>
                                <th className="text-center border-0">Qty</th>
                                <th className="text-end border-0">Price</th>
                                <th className="text-end border-0">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="border-bottom-0">{item.product_name}</td>
                                    <td className="text-center border-bottom-0">{item.quantity}</td>
                                    <td className="text-end border-bottom-0">${item.unit_price.toFixed(2)}</td>
                                    <td className="text-end border-bottom-0 fw-medium">${item.subtotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {/* Totals */}
                    <div className="d-flex justify-content-end mb-5">
                        <div style={{ width: '250px' }}>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Subtotal:</span>
                                <span className="fw-medium">${order.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Tax (0%):</span>
                                <span>$0.00</span>
                            </div>
                            <div className="d-flex justify-content-between border-top pt-2 mt-2">
                                <span className="fw-bold fs-5">Total:</span>
                                <span className="fw-bold fs-5 text-primary">${order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="border-top pt-4">
                        <h6 className="fw-bold mb-3">Payment Information</h6>
                        {order.payments.map((payment, idx) => (
                            <div key={idx} className="d-flex justify-content-between" style={{ maxWidth: '300px' }}>
                                <span className="text-muted">Method: {payment.method}</span>
                                <span className="fw-medium">${payment.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-5 pt-5 text-muted small">
                        <p>If you have any questions about this invoice, please contact us.</p>
                        <p className="mb-0">ERP System Inc. | 123 Business Rd, Tech City | contact@erp.com</p>
                    </div>
                </Card.Body>
            </Card>

            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .card, .card * {
                            visibility: visible;
                        }
                        .card {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            margin: 0 !important;
                            padding: 0 !important;
                            box-shadow: none !important;
                            border: none !important;
                        }
                        .d-print-none {
                            display: none !important;
                        }
                    }
                `}
            </style>
        </div>
    );
}
