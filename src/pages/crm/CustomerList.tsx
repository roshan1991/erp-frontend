import { useState } from "react";
import { Card, Table, Badge, Button, Form, InputGroup } from "react-bootstrap";
import { Search, Plus, Mail, Phone, MapPin } from "lucide-react";
import { GenericModal } from "../../components/common/GenericModal";

const initialCustomers = [
    { id: 1, name: "Acme Corp", contact: "John Doe", email: "john@acme.com", phone: "+1 (555) 123-4567", location: "New York, USA", status: "Active" },
    { id: 2, name: "Stark Industries", contact: "Tony Stark", email: "tony@stark.com", phone: "+1 (555) 987-6543", location: "California, USA", status: "Active" },
    { id: 3, name: "Wayne Enterprises", contact: "Bruce Wayne", email: "bruce@wayne.com", phone: "+1 (555) 456-7890", location: "Gotham, USA", status: "Inactive" },
];

export function CustomerList() {
    const [customers, setCustomers] = useState(initialCustomers);
    const [showModal, setShowModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        contact: "",
        email: "",
        phone: "",
        location: "",
        status: "Active"
    });

    const handleAddCustomer = () => {
        const customer = {
            ...newCustomer,
            id: customers.length + 1
        };
        setCustomers([...customers, customer]);
        setShowModal(false);
        setNewCustomer({ name: "", contact: "", email: "", phone: "", location: "", status: "Active" });
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2 mb-0">Customer Management</h1>
                <Button variant="primary" className="d-flex align-items-center" onClick={() => setShowModal(true)}>
                    <Plus size={18} className="me-2" />
                    Add Customer
                </Button>
            </div>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <InputGroup>
                        <InputGroup.Text className="bg-white border-end-0">
                            <Search size={18} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search customers..."
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
                                <th className="border-0 ps-4">Company</th>
                                <th className="border-0">Contact Person</th>
                                <th className="border-0">Contact Info</th>
                                <th className="border-0">Location</th>
                                <th className="border-0 pe-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td className="ps-4 fw-medium">{customer.name}</td>
                                    <td>{customer.contact}</td>
                                    <td>
                                        <div className="d-flex flex-column small text-muted">
                                            <div className="d-flex align-items-center mb-1">
                                                <Mail size={12} className="me-2" /> {customer.email}
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <Phone size={12} className="me-2" /> {customer.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center text-muted">
                                            <MapPin size={14} className="me-2" /> {customer.location}
                                        </div>
                                    </td>
                                    <td className="pe-4">
                                        <Badge bg={customer.status === 'Active' ? 'success' : 'secondary'}>
                                            {customer.status}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <GenericModal
                show={showModal}
                onHide={() => setShowModal(false)}
                title="Add New Customer"
                onConfirm={handleAddCustomer}
            >
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. Acme Corp"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Contact Person</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. John Doe"
                            value={newCustomer.contact}
                            onChange={(e) => setNewCustomer({ ...newCustomer, contact: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="e.g. john@acme.com"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="tel"
                            placeholder="e.g. +1 (555) 123-4567"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. New York, USA"
                            value={newCustomer.location}
                            onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            value={newCustomer.status}
                            onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </Form.Select>
                    </Form.Group>
                </Form>
            </GenericModal>
        </div>
    );
}
