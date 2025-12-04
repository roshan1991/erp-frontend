import { Card, Row, Col } from "react-bootstrap";
import { DollarSign, Package, Users, ShoppingCart } from "lucide-react";
import { DashboardCharts } from "../components/dashboard/DashboardCharts";

const stats = [
    { name: "Total Revenue", value: "$45,231.89", icon: DollarSign, color: "text-primary", bg: "bg-primary-subtle" },
    { name: "Active Orders", value: "23", icon: ShoppingCart, color: "text-success", bg: "bg-success-subtle" },
    { name: "Products in Stock", value: "1,203", icon: Package, color: "text-warning", bg: "bg-warning-subtle" },
    { name: "Total Employees", value: "48", icon: Users, color: "text-info", bg: "bg-info-subtle" },
];

export function Dashboard() {
    return (
        <div>
            <h1 className="h2 mb-4">Dashboard Overview</h1>
            <Row className="g-4 mb-4">
                {stats.map((stat) => (
                    <Col key={stat.name} sm={6} lg={3}>
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body className="d-flex align-items-center">
                                <div className={`rounded-circle p-3 me-3 ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <Card.Text className="text-muted mb-0 small">{stat.name}</Card.Text>
                                    <Card.Title className="h4 mb-0">{stat.value}</Card.Title>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            <DashboardCharts />
        </div>
    );
}
