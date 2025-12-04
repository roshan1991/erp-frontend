import { useState } from 'react';
import { Container, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

export function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
            <Container style={{ maxWidth: '400px' }}>
                <Card className="border-0 shadow-lg">
                    <Card.Body className="p-5">
                        <div className="text-center mb-4">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                                <Lock size={32} className="text-primary" />
                            </div>
                            <h1 className="h3 mb-1">Welcome Back</h1>
                            <p className="text-muted">Sign in to your ERP account</p>
                        </div>

                        {error && (
                            <Alert variant="danger" className="mb-4">
                                {error}
                            </Alert>
                        )}

                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={loading}
                                    autoFocus
                                />
                            </Form.Group>

                            <Form.Group className="mb-4">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </Form.Group>

                            <Button
                                variant="primary"
                                type="submit"
                                size="lg"
                                className="w-100"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="me-2"
                                        />
                                        Signing In...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </Form>

                        <div className="text-center mt-3 text-muted small">
                            <p className="mb-0">Default credentials: admin / admin</p>
                        </div>
                    </Card.Body>
                    <Card.Footer className="bg-white border-0 text-center py-3 text-muted small">
                        &copy; 2023 ERP System
                    </Card.Footer>
                </Card>
            </Container>
        </div>
    );
}
