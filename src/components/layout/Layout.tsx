import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Container } from "react-bootstrap";

export function Layout() {
    return (
        <div className="d-flex vh-100 overflow-hidden">
            <Sidebar />
            <div className="d-flex flex-column flex-grow-1 overflow-hidden">
                <Navbar />
                <main className="flex-grow-1 overflow-auto bg-light">
                    <Container fluid className="py-4">
                        <Outlet />
                    </Container>
                </main>
            </div>
        </div>
    );
}
