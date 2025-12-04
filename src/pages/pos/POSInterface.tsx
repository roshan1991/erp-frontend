import { useState, useMemo, useEffect } from "react";
import { Card, Row, Col, Button, Form, InputGroup, Badge, Modal, Spinner } from "react-bootstrap";
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, User, ShoppingCart, Tag, Gift, Award, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";

import { useProducts } from "../../hooks/useProducts";
import { useCoupons } from "../../hooks/useCoupons";
import { useLoyaltySettings } from "../../hooks/useLoyaltySettings";
import { useCustomers } from "../../hooks/useCustomers";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

export function POSInterface() {
    const navigate = useNavigate();
    const { products: PRODUCTS } = useProducts();
    const { coupons: COUPONS } = useCoupons();
    const { settings: loyaltySettings } = useLoyaltySettings();
    const { customers: CUSTOMERS, loading: customersLoading, addCustomer } = useCustomers();

    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | string>("");
    const [discount, setDiscount] = useState(0);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [taxRate] = useState(0.10); // 10% tax

    // Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
    const [amountTendered, setAmountTendered] = useState("");
    const [processingPayment, setProcessingPayment] = useState(false);

    // New Customer State
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerEmail, setNewCustomerEmail] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");

    // Set default customer
    useEffect(() => {
        if (CUSTOMERS.length > 0 && !selectedCustomerId) {
            setSelectedCustomerId(CUSTOMERS[0].id);
        }
    }, [CUSTOMERS, selectedCustomerId]);

    // Dynamic Categories
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(PRODUCTS.map(p => p.category).filter(Boolean)));
        return ["All", ...uniqueCategories.sort()];
    }, [PRODUCTS]);

    // Filter Products
    const filteredProducts = useMemo(() => {
        return PRODUCTS.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                (p.barcode && p.barcode.includes(searchTerm));
            const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [PRODUCTS, searchTerm, selectedCategory]);

    // Cart Calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotal * taxRate;

    // Coupon Calculation
    let couponDiscount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === "percent") {
            couponDiscount = subtotal * appliedCoupon.discount;
        } else {
            couponDiscount = appliedCoupon.discount;
        }
    }

    // Loyalty Calculation
    const customer = CUSTOMERS.find(c => c.id === Number(selectedCustomerId));
    const loyaltyDiscount = loyaltySettings.isEnabled && customer
        ? customer.points * loyaltySettings.pointsPerDollar
        : 0;

    // Total Calculation
    const totalDiscount = discount + couponDiscount + loyaltyDiscount;
    const total = Math.max(0, subtotal + taxAmount - totalDiscount);
    const change = paymentMethod === "CASH" ? (parseFloat(amountTendered) || 0) - total : 0;

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
        });
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const applyCoupon = () => {
        const coupon = COUPONS.find(c => c.code === couponCode);
        if (coupon) {
            setAppliedCoupon(coupon);
            setCouponCode("");
        } else {
            alert("Invalid or expired coupon code");
        }
    };

    const handleAddCustomer = async () => {
        if (!newCustomerName) return;
        try {
            const newCustomer = await addCustomer({
                name: newCustomerName,
                email: newCustomerEmail,
                phone: newCustomerPhone
            });
            setSelectedCustomerId(newCustomer.id);
            setShowCustomerModal(false);
            setNewCustomerName("");
            setNewCustomerEmail("");
            setNewCustomerPhone("");
        } catch (error) {
            alert("Failed to add customer");
        }
    };

    const handlePayment = async () => {
        setProcessingPayment(true);
        try {
            // 1. Create Session if not exists (handled by backend usually, but here we assume session exists or is auto-created)
            // For now, we'll just create the order directly.

            // We need a session ID. Let's try to get active session first.
            let sessionId;
            try {
                const sessionRes = await api.get("/pos/sessions/active");
                sessionId = sessionRes.data.id;
            } catch (e) {
                // If no active session, create one
                const newSessionRes = await api.post("/pos/sessions", { opening_cash: 0 });
                sessionId = newSessionRes.data.id;
            }

            const orderData = {
                session_id: sessionId,
                customer_id: selectedCustomerId ? Number(selectedCustomerId) : null,
                total_amount: total,
                status: "COMPLETED",
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price
                })),
                payments: [{
                    amount: total,
                    method: paymentMethod
                }]
            };

            const response = await api.post("/pos/orders", orderData);

            // Navigate to receipt page
            navigate(`/pos/receipt/${response.data.id}`);

        } catch (error) {
            console.error("Payment failed:", error);
            alert("Payment failed. Please try again.");
        } finally {
            setProcessingPayment(false);
            setShowPaymentModal(false);
        }
    };

    // Helper to get image URL
    const getImageUrl = (imagePath: string) => {
        if (!imagePath) return "";
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
            return imagePath;
        }
        return `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}${imagePath}`;
    };

    return (
        <div className="h-100 d-flex flex-column">
            <Row className="g-0 h-100">
                {/* Product Catalog Section */}
                <Col md={8} className="p-3 bg-light d-flex flex-column h-100 overflow-hidden">
                    {/* Header & Filters */}
                    <div className="mb-3">
                        <Row className="g-2 align-items-center">
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text className="bg-white border-end-0">
                                        <Search size={18} className="text-muted" />
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search by name, SKU, or barcode..."
                                        className="border-start-0 ps-0"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={6}>
                                <div className="d-flex gap-2 overflow-auto pb-1">
                                    {categories.map(cat => (
                                        <Button
                                            key={cat}
                                            variant={selectedCategory === cat ? "primary" : "outline-secondary"}
                                            size="sm"
                                            className="text-nowrap"
                                            onClick={() => setSelectedCategory(cat)}
                                        >
                                            {cat}
                                        </Button>
                                    ))}
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-grow-1 overflow-auto">
                        <Row className="g-3">
                            {filteredProducts.map(product => (
                                <Col key={product.id} xs={6} lg={4} xl={3}>
                                    <Card
                                        className="h-100 border-0 shadow-sm cursor-pointer product-card"
                                        onClick={() => addToCart(product)}
                                        style={{ transition: 'transform 0.2s' }}
                                    >
                                        <div className="position-relative" style={{ height: '120px', overflow: 'hidden' }}>
                                            {product.image ? (
                                                <img
                                                    src={getImageUrl(product.image)}
                                                    alt={product.name}
                                                    className="w-100 h-100 object-fit-cover"
                                                />
                                            ) : (
                                                <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center text-muted">
                                                    No Image
                                                </div>
                                            )}
                                            <Badge bg="light" text="dark" className="position-absolute top-0 end-0 m-2 border">{product.category}</Badge>
                                        </div>
                                        <Card.Body className="d-flex flex-column p-2">
                                            <h6 className="fw-bold mb-1 text-truncate" title={product.name}>{product.name}</h6>
                                            <small className="text-muted mb-2 d-block">{product.sku || ""}</small>
                                            <div className="mt-auto d-flex justify-content-between align-items-center">
                                                <span className="fw-bold text-primary">${product.price.toFixed(2)}</span>
                                                <Button variant="outline-primary" size="sm" className="rounded-circle p-1">
                                                    <Plus size={16} />
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Col>

                {/* Cart Section */}
                <Col md={4} className="bg-white border-start d-flex flex-column h-100 shadow-lg">
                    {/* Customer Selection */}
                    <div className="p-3 border-bottom bg-light">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <h5 className="mb-0 d-flex align-items-center">
                                <ShoppingCart size={20} className="me-2" />
                                Current Order
                            </h5>
                            <Badge bg="primary" pill>{cart.reduce((acc, item) => acc + item.quantity, 0)} items</Badge>
                        </div>
                        <InputGroup size="sm">
                            <InputGroup.Text><User size={16} /></InputGroup.Text>
                            <Form.Select
                                value={selectedCustomerId}
                                onChange={(e) => setSelectedCustomerId(e.target.value)}
                                className="bg-white"
                                disabled={customersLoading}
                            >
                                <option value="">Select Customer</option>
                                {CUSTOMERS.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.points > 0 && `(${c.points} pts)`}
                                    </option>
                                ))}
                            </Form.Select>
                            <Button variant="outline-primary" onClick={() => setShowCustomerModal(true)}>
                                <UserPlus size={16} />
                            </Button>
                        </InputGroup>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-grow-1 overflow-auto p-3">
                        {cart.length === 0 ? (
                            <div className="text-center text-muted mt-5">
                                <ShoppingCart size={48} className="mb-3 opacity-25" />
                                <p>Cart is empty</p>
                                <small>Select products to start an order</small>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {cart.map(item => (
                                    <div key={item.id} className="d-flex align-items-center justify-content-between p-2 border rounded bg-light">
                                        <div className="flex-grow-1 me-2">
                                            <div className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>{item.name}</div>
                                            <div className="small text-muted">${item.price.toFixed(2)}</div>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <Button variant="outline-secondary" size="sm" className="p-0 px-1" onClick={() => updateQuantity(item.id, -1)}>
                                                <Minus size={12} />
                                            </Button>
                                            <span className="fw-bold" style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                            <Button variant="outline-secondary" size="sm" className="p-0 px-1" onClick={() => updateQuantity(item.id, 1)}>
                                                <Plus size={12} />
                                            </Button>
                                        </div>
                                        <div className="ms-3 text-end" style={{ minWidth: '60px' }}>
                                            <div className="fw-bold">${(item.price * item.quantity).toFixed(2)}</div>
                                            <Trash2
                                                size={14}
                                                className="text-danger cursor-pointer mt-1"
                                                onClick={() => removeFromCart(item.id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Totals & Actions */}
                    <div className="p-3 border-top bg-light">
                        <div className="d-flex justify-content-between mb-1 small">
                            <span className="text-muted">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1 small">
                            <span className="text-muted">Tax (10%)</span>
                            <span>${taxAmount.toFixed(2)}</span>
                        </div>

                        {/* Coupon Section */}
                        <div className="mb-2">
                            <InputGroup size="sm">
                                <InputGroup.Text><Gift size={14} /></InputGroup.Text>
                                <Form.Control
                                    placeholder="Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                />
                                <Button variant="outline-secondary" onClick={applyCoupon}>Apply</Button>
                            </InputGroup>
                            {appliedCoupon && (
                                <div className="d-flex justify-content-between mt-1 small text-success">
                                    <span>Coupon ({appliedCoupon.code})</span>
                                    <span>-${couponDiscount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {/* Loyalty Section */}
                        {loyaltyDiscount > 0 && (
                            <div className="d-flex justify-content-between mb-1 small text-primary">
                                <span className="d-flex align-items-center">
                                    <Award size={14} className="me-1" /> Loyalty Discount
                                </span>
                                <span>-${loyaltyDiscount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="d-flex justify-content-between mb-2 small text-success">
                            <span className="d-flex align-items-center">
                                <Tag size={12} className="me-1" /> Manual Discount
                            </span>
                            <div className="d-flex align-items-center">
                                <span className="me-1">-$</span>
                                <Form.Control
                                    type="number"
                                    size="sm"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                    style={{ width: '60px', height: '20px', fontSize: '0.8rem' }}
                                    className="p-0 px-1 text-end"
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-between mb-3 fw-bold fs-5 border-top pt-2">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>

                        <Row className="g-2">
                            <Col xs={6}>
                                <Button
                                    variant="outline-danger"
                                    className="w-100"
                                    onClick={() => setCart([])}
                                    disabled={cart.length === 0}
                                >
                                    Clear
                                </Button>
                            </Col>
                            <Col xs={6}>
                                <Button
                                    variant="success"
                                    className="w-100"
                                    disabled={cart.length === 0}
                                    onClick={() => {
                                        setPaymentMethod("CASH");
                                        setShowPaymentModal(true);
                                    }}
                                >
                                    Pay Now
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>

            {/* Payment Modal */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold text-success">${total.toFixed(2)}</h2>
                        <p className="text-muted">Total Amount Due</p>
                    </div>

                    <div className="d-flex gap-2 mb-4 justify-content-center">
                        <Button
                            variant={paymentMethod === "CASH" ? "primary" : "outline-secondary"}
                            onClick={() => setPaymentMethod("CASH")}
                            className="d-flex align-items-center gap-2 px-4"
                        >
                            <Banknote size={20} /> Cash
                        </Button>
                        <Button
                            variant={paymentMethod === "CARD" ? "primary" : "outline-secondary"}
                            onClick={() => setPaymentMethod("CARD")}
                            className="d-flex align-items-center gap-2 px-4"
                        >
                            <CreditCard size={20} /> Card
                        </Button>
                    </div>

                    {paymentMethod === "CASH" && (
                        <Form.Group className="mb-3">
                            <Form.Label>Amount Tendered</Form.Label>
                            <InputGroup size="lg">
                                <InputGroup.Text>$</InputGroup.Text>
                                <Form.Control
                                    type="number"
                                    value={amountTendered}
                                    onChange={(e) => setAmountTendered(e.target.value)}
                                    autoFocus
                                />
                            </InputGroup>
                            {parseFloat(amountTendered) >= total && (
                                <div className="mt-3 alert alert-success d-flex justify-content-between align-items-center">
                                    <span className="fw-bold">Change Due:</span>
                                    <span className="fs-4 fw-bold">${change.toFixed(2)}</span>
                                </div>
                            )}
                        </Form.Group>
                    )}

                    {paymentMethod === "CARD" && (
                        <div className="text-center py-4 text-muted">
                            <div className="spinner-border text-primary mb-3" role="status"></div>
                            <p>Waiting for card terminal...</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                    <Button
                        variant="primary"
                        onClick={handlePayment}
                        disabled={processingPayment || (paymentMethod === "CASH" && (parseFloat(amountTendered) || 0) < total)}
                    >
                        {processingPayment ? <Spinner size="sm" animation="border" /> : "Complete Payment"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* New Customer Modal */}
            <Modal show={showCustomerModal} onHide={() => setShowCustomerModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Customer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                value={newCustomerName}
                                onChange={(e) => setNewCustomerName(e.target.value)}
                                placeholder="Enter customer name"
                                autoFocus
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                value={newCustomerEmail}
                                onChange={(e) => setNewCustomerEmail(e.target.value)}
                                placeholder="Enter email (optional)"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Phone</Form.Label>
                            <Form.Control
                                value={newCustomerPhone}
                                onChange={(e) => setNewCustomerPhone(e.target.value)}
                                placeholder="Enter phone (optional)"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCustomerModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddCustomer} disabled={!newCustomerName}>
                        Save Customer
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}
