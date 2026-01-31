import { useState } from "react";
import { LayoutDashboard, DollarSign, Package, Users, ShoppingCart, Factory, CreditCard, Target, ClipboardList, Settings, Lock, Gift, Store, Share2, TrendingUp, MessageCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Globe, Shield } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Nav, Button, Collapse } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

interface NavItem {
    name: string;
    href: string;
    icon: any;
    adminOnly?: boolean;
}

interface NavCategory {
    category: string;
    icon: any;
    items: NavItem[];
}

const navigationCategories: NavCategory[] = [
    {
        category: "Main",
        icon: LayoutDashboard,
        items: [
            { name: "Dashboard", href: "/", icon: LayoutDashboard },
        ]
    },
    {
        category: "Admin",
        icon: Shield,
        items: [
            { name: "User Management", href: "/admin/users", icon: Users, adminOnly: true },
        ]
    },
    {
        category: "Finance",
        icon: DollarSign,
        items: [
            { name: "Overview", href: "/finance", icon: DollarSign },
            { name: "Accounts", href: "/finance/accounts", icon: DollarSign },
            { name: "Ledger", href: "/finance/ledger", icon: DollarSign },
            { name: "Payable", href: "/finance/payable", icon: DollarSign },
            { name: "Receivable", href: "/finance/receivable", icon: DollarSign },
        ]
    },
    {
        category: "Supply Chain",
        icon: Package,
        items: [
            { name: "Overview", href: "/supply-chain", icon: Package },
            { name: "Inventory", href: "/supply-chain/inventory", icon: Package },
            { name: "Suppliers", href: "/supply-chain/suppliers", icon: Package },
        ]
    },
    {
        category: "Human Resources",
        icon: Users,
        items: [
            { name: "Overview", href: "/hr", icon: Users },
            { name: "Employees", href: "/hr/employees", icon: Users },
            { name: "Payroll", href: "/hr/payroll", icon: Users },
        ]
    },
    {
        category: "CRM",
        icon: ShoppingCart,
        items: [
            { name: "Overview", href: "/crm", icon: ShoppingCart },
            { name: "Customers", href: "/crm/customers", icon: Users },
            { name: "Pipeline", href: "/crm/pipeline", icon: Target },
        ]
    },
    {
        category: "Manufacturing",
        icon: Factory,
        items: [
            { name: "Overview", href: "/manufacturing", icon: Factory },
            { name: "Work Orders", href: "/manufacturing/work-orders", icon: ClipboardList },
            { name: "BOMs", href: "/manufacturing/boms", icon: Settings },
        ]
    },
    {
        category: "Point of Sale",
        icon: CreditCard,
        items: [
            { name: "POS", href: "/pos", icon: CreditCard },
            { name: "History", href: "/pos/history", icon: ClipboardList },
            { name: "Session", href: "/pos/session", icon: Lock },
            { name: "Loyalty & Coupons", href: "/pos/loyalty-coupons", icon: Gift },
        ]
    },
    {
        category: "Daraz",
        icon: Store,
        items: [
            { name: "Dashboard", href: "/daraz", icon: Store },
            { name: "Products", href: "/daraz/products", icon: Package },
            { name: "Orders", href: "/daraz/orders", icon: ShoppingCart },
            { name: "Settings", href: "/daraz/settings", icon: Settings },
        ]
    },
    {
        category: "Social Media",
        icon: Share2,
        items: [
            { name: "Dashboard", href: "/social-media", icon: Share2 },
            { name: "Campaigns", href: "/social-media/campaigns", icon: TrendingUp },
            { name: "Messages", href: "/social-media/inbox", icon: MessageCircle },
            { name: "Settings", href: "/social-media/settings", icon: Settings },
        ]
    },
    {
        category: "WooCommerce",
        icon: Globe,
        items: [
            { name: "Dashboard", href: "/woocommerce", icon: Globe },
            { name: "Products", href: "/woocommerce/products", icon: Package },
            { name: "Orders", href: "/woocommerce/orders", icon: ShoppingCart },
            { name: "Customers", href: "/woocommerce/customers", icon: Users },
            { name: "Settings", href: "/woocommerce/settings", icon: Settings },
        ]
    },
];

export function Sidebar() {
    const location = useLocation();
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>(['Main']);

    // Filter categories and items based on user permissions
    const filteredCategories = navigationCategories.map(category => ({
        ...category,
        items: category.items.filter(item => {
            // Show admin-only items only to super admins
            if (item.adminOnly) {
                return user?.is_superuser;
            }
            // Show all other items to authenticated users
            return true;
        })
    })).filter(category => category.items.length > 0);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleCategory = (categoryName: string) => {
        if (isCollapsed) {
            // If sidebar is collapsed, expand it first
            setIsCollapsed(false);
        }

        setExpandedCategories(prev =>
            prev.includes(categoryName)
                ? []
                : [categoryName]
        );
    };

    const isCategoryExpanded = (categoryName: string) => {
        return expandedCategories.includes(categoryName);
    };

    return (
        <div
            className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark position-relative"
            style={{
                width: isCollapsed ? "80px" : "280px",
                height: "100vh",
                transition: "width 0.3s ease-in-out"
            }}
        >
            {/* Toggle Button */}
            <Button
                variant="link"
                className="position-absolute text-white p-0"
                style={{
                    top: "10px",
                    right: "10px",
                    zIndex: 1000
                }}
                onClick={toggleSidebar}
            >
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </Button>

            {/* Logo/Title */}
            <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                {isCollapsed ? (
                    <span className="fs-4 fw-bold">ERP</span>
                ) : (
                    <span className="fs-4 fw-bold">ERP System</span>
                )}
            </a>
            <hr />

            {/* Navigation */}
            <Nav className="flex-column mb-auto overflow-auto">
                {filteredCategories.map((category) => {
                    const isExpanded = isCategoryExpanded(category.category);
                    const CategoryIcon = category.icon;

                    return (
                        <div key={category.category} className="mb-2">
                            {/* Category Header - Clickable to expand/collapse */}
                            <div
                                className="d-flex align-items-center justify-content-between text-white p-2 rounded cursor-pointer"
                                style={{
                                    cursor: "pointer",
                                    backgroundColor: isExpanded ? "rgba(255,255,255,0.1)" : "transparent",
                                    transition: "background-color 0.2s"
                                }}
                                onClick={() => toggleCategory(category.category)}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isExpanded ? "rgba(255,255,255,0.1)" : "transparent"}
                            >
                                <div className="d-flex align-items-center gap-2">
                                    <CategoryIcon size={18} />
                                    {!isCollapsed && (
                                        <span className="fw-bold">{category.category}</span>
                                    )}
                                </div>
                                {!isCollapsed && (
                                    isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                                )}
                            </div>

                            {/* Sub-menu Items - Collapsible */}
                            <Collapse in={isExpanded && !isCollapsed}>
                                <div>
                                    {category.items.map((item) => {
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <Nav.Item key={item.name}>
                                                <Link
                                                    to={item.href}
                                                    className={`nav-link d-flex align-items-center gap-2 ${isActive ? "active bg-primary text-white" : "text-white"}`}
                                                    aria-current={isActive ? "page" : undefined}
                                                    style={{
                                                        paddingLeft: "2.5rem",
                                                        fontSize: "0.9rem"
                                                    }}
                                                >
                                                    <item.icon size={14} />
                                                    <span>{item.name}</span>
                                                </Link>
                                            </Nav.Item>
                                        );
                                    })}
                                </div>
                            </Collapse>

                            {/* Show items as icons when collapsed */}
                            {isCollapsed && (
                                <div>
                                    {category.items.map((item) => {
                                        const isActive = location.pathname === item.href;
                                        return (
                                            <Nav.Item key={item.name}>
                                                <Link
                                                    to={item.href}
                                                    className={`nav-link d-flex align-items-center justify-content-center ${isActive ? "active bg-primary text-white" : "text-white"}`}
                                                    aria-current={isActive ? "page" : undefined}
                                                    title={item.name}
                                                    style={{
                                                        padding: "0.5rem"
                                                    }}
                                                >
                                                    <item.icon size={16} />
                                                </Link>
                                            </Nav.Item>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </Nav>
        </div>
    );
}
