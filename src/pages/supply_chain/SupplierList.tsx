import { useState } from "react";
import { Card, Table, Badge, Button, Form, InputGroup } from "react-bootstrap";
import { Search, Plus, Mail, Phone } from "lucide-react";
import { GenericModal } from "../../components/common/GenericModal";

const initialSuppliers = [
    { id: 1, name: "TechSupplies Inc.", contact: "John Smith", email: "john@techsupplies.com", phone: "+1 (555) 123-4567", status: "Active" },
    { id: 2, name: "OfficeDepot Wholesale", contact: "Sarah Johnson", email: "sarah@officedepot.com", phone: "+1 (555) 987-6543", status: "Active" },
    { id: 3, name: "Global Furniture Ltd.", contact: "Mike Brown", email: "mike@globalfurn.com", phone: "+1 (555) 456-7890", status: "Inactive" },
];

export function SupplierList() {
    const [suppliers, setSuppliers] = useState(initialSuppliers);
    const [showModal, setShowModal] = useState(false);
    const [newSupplier, setNewSupplier] = useState({
        name: "",
        contact: "",
        email: "",
        phone: "",
        status: "Active"
    });

    const handleAddSupplier = () => {
        const supplier = {
            ...newSupplier,
            id: suppliers.length + 1
        };
        setSuppliers([...suppliers, supplier]);
        setShowModal(false);
        setNewSupplier({ name: "", contact: "", email: "", phone: "", status: "Active" });
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h2 mb-0">Supplier Management</h1>
                <Button variant="primary" className="d-flex align-items-center" onClick={() => setShowModal(true)}>
                    <Plus size={18} className="me-2" />
                    Add Supplier
                </Button>
            </div>

            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <InputGroup>
                        <InputGroup.Text className="bg-white border-end-0">
                            <Search size={18} className="text-muted" />
                        </InputGroup.Text>
                        <Form.Control
                            placeholder="Search suppliers..."
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
                                <th className="border-0 ps-4">Company Name</th>
                                <th className="border-0">Contact Person</th>
                                <th className="border-0">Email</th>
                                <th className="border-0">Phone</th>
                                <th className="border-0 pe-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id}>
                                    <td className="ps-4 fw-medium">{supplier.name}</td>
                                    <td>{supplier.contact}</td>
                                    <td>
                                        <div className="d-flex align-items-center text-muted">
                                            <Mail size={14} className="me-2" /> {supplier.email}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center text-muted">
                                            <Phone size={14} className="me-2" /> {supplier.phone}
                                        </div>
                                    </td>
                                    <td className="pe-4">
                                        <Badge bg={supplier.status === 'Active' ? 'success' : 'secondary'}>
                                            {supplier.status}
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
                title="Add New Supplier"
                onConfirm={handleAddSupplier}
            >
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. TechSupplies Inc."
                            value={newSupplier.name}
                            onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Contact Person</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. John Smith"
                            value={newSupplier.contact}
                            onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="e.g. john@techsupplies.com"
                            value={newSupplier.email}
                            onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="tel"
                            placeholder="e.g. +1 (555) 123-4567"
                            value={newSupplier.phone}
                            onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                            value={newSupplier.status}
                            onChange={(e) => setNewSupplier({ ...newSupplier, status: e.target.value })}
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
