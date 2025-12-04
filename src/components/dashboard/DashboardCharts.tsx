import { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { getARInvoices, getAPInvoices, type ARInvoice, type APInvoice } from '../../lib/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export function DashboardCharts() {
    const [timeRange, setTimeRange] = useState('30'); // days
    const [arData, setArData] = useState<ARInvoice[]>([]);
    const [apData, setApData] = useState<APInvoice[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ar, ap] = await Promise.all([getARInvoices(), getAPInvoices()]);
                setArData(ar);
                setApData(ap);
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            }
        };
        fetchData();
    }, []);

    // Process data for charts
    const processRevenueData = () => {
        // Group by date
        const revenueByDate: Record<string, number> = {};
        const expensesByDate: Record<string, number> = {};

        // Helper to filter by date range
        const filterDate = (dateStr: string) => {
            const date = new Date(dateStr);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - parseInt(timeRange));
            return date >= cutoff;
        };

        arData.filter(i => filterDate(i.date)).forEach(inv => {
            const date = new Date(inv.date).toLocaleDateString();
            revenueByDate[date] = (revenueByDate[date] || 0) + inv.total_amount;
        });

        apData.filter(i => filterDate(i.date)).forEach(inv => {
            const date = new Date(inv.date).toLocaleDateString();
            expensesByDate[date] = (expensesByDate[date] || 0) + inv.total_amount;
        });

        const labels = Array.from(new Set([...Object.keys(revenueByDate), ...Object.keys(expensesByDate)])).sort();

        return {
            labels,
            datasets: [
                {
                    label: 'Revenue',
                    data: labels.map(date => revenueByDate[date] || 0),
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                    tension: 0.3
                },
                {
                    label: 'Expenses',
                    data: labels.map(date => expensesByDate[date] || 0),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.3
                }
            ]
        };
    };

    const processInvoiceStatus = () => {
        const paid = arData.filter(i => i.status === 'PAID').length;
        const pending = arData.filter(i => i.status !== 'PAID').length;
        const overdue = arData.filter(i => i.status === 'OVERDUE').length; // Assuming OVERDUE status exists

        return {
            labels: ['Paid', 'Pending', 'Overdue'],
            datasets: [
                {
                    data: [paid, pending, overdue],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };

    return (
        <div>
            <div className="d-flex justify-content-end mb-3">
                <Form.Select
                    style={{ width: '200px' }}
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 3 Months</option>
                    <option value="365">Last Year</option>
                </Form.Select>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <Card.Title>Revenue vs Expenses</Card.Title>
                            <Line options={{ responsive: true }} data={processRevenueData()} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Body>
                            <Card.Title>Invoice Status</Card.Title>
                            <div className="d-flex justify-content-center">
                                <div style={{ width: '80%' }}>
                                    <Doughnut data={processInvoiceStatus()} />
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
