"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Button from "../../components/ui/button";
import { useToast } from "../../components/ui/ToastContainer";
import {
    ArrowLeft,
    Package,
    Truck,
    CreditCard,
    MapPin,
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    Download,
    Printer
} from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    colorId?: string;
    size?: string;
    customization?: {
        playerName?: string;
        playerNumber?: string;
    };
}

interface Order {
    id: string;
    orderDate: string;
    status: OrderStatus;
    items: OrderItem[];
    shipping: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    billing: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    payment: {
        method: string;
        last4?: string;
    };
    subtotal: number;
    shippingCost: number;
    tax: number;
    total: number;
    trackingNumber?: string;
}

export default function OrderDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { showToast } = useToast();
    const orderId = params.orderId as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would fetch from an API
        // For now, we'll simulate loading order data from localStorage or generate mock data
        const loadOrder = () => {
            try {
                // Try to get from localStorage (if stored during checkout)
                const storedOrders = localStorage.getItem("cediman:orders");
                if (storedOrders) {
                    const orders = JSON.parse(storedOrders);
                    const foundOrder = orders.find((o: Order) => o.id === orderId);
                    if (foundOrder) {
                        setOrder(foundOrder);
                        setLoading(false);
                        return;
                    }
                }

                // Generate mock order data for demonstration
                const mockOrder: Order = {
                    id: orderId,
                    orderDate: new Date().toISOString(),
                    status: "processing",
                    items: [
                        {
                            id: "lebron-23",
                            name: "LeBron James Jersey",
                            price: 180.00,
                            quantity: 1,
                            image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=600&fit=crop",
                            colorId: "yellow"
                        },
                        {
                            id: "jordan-23",
                            name: "Michael Jordan Jersey",
                            price: 250.00,
                            quantity: 1,
                            image: "https://images.unsplash.com/photo-1565877302143-786477b33d82?w=500&h=600&fit=crop",
                            colorId: "red"
                        }
                    ],
                    shipping: {
                        firstName: "John",
                        lastName: "Doe",
                        email: "john.doe@example.com",
                        phone: "+233 XX XXX XXXX",
                        address: "123 Main Street",
                        city: "Accra",
                        state: "Greater Accra",
                        zipCode: "00233",
                        country: "Ghana"
                    },
                    billing: {
                        firstName: "John",
                        lastName: "Doe",
                        address: "123 Main Street",
                        city: "Accra",
                        state: "Greater Accra",
                        zipCode: "00233",
                        country: "Ghana"
                    },
                    payment: {
                        method: "card",
                        last4: "4242"
                    },
                    subtotal: 430.00,
                    shippingCost: 20.00,
                    tax: 51.60,
                    total: 501.60,
                    trackingNumber: "TRK" + Math.random().toString(36).substring(2, 11).toUpperCase()
                };

                setOrder(mockOrder);
            } catch (error) {
                console.error("Error loading order:", error);
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId]);

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case "delivered":
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case "shipped":
                return <Truck className="h-5 w-5 text-blue-600" />;
            case "processing":
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case "cancelled":
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <Clock className="h-5 w-5 text-zinc-600" />;
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case "delivered":
                return "bg-green-100 text-green-800 border-green-200";
            case "shipped":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "processing":
                return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-zinc-100 text-zinc-800 border-zinc-200";
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // In a real app, this would generate and download a PDF
        showToast("Invoice download feature coming soon", "info");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50">
                <Header />
                <div className="mx-auto max-w-7xl px-6 py-16">
                    <div className="text-center">
                        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-red)] border-t-transparent"></div>
                        <p className="text-zinc-600">Loading order details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-zinc-50">
                <Header />
                <div className="mx-auto max-w-7xl px-6 py-16 text-center">
                    <h1 className="mb-4 text-3xl font-bold text-zinc-900">Order Not Found</h1>
                    <p className="mb-8 text-zinc-600">The order you're looking for doesn't exist.</p>
                    <Button as={Link} href="/">
                        Return to Home
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50">
            <Header />
            <div className="mx-auto max-w-7xl px-6 py-8">
                <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>

                {/* Order Header */}
                <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="mb-2 text-2xl font-bold text-zinc-900">Order Details</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-600">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Ordered on {formatDate(order.orderDate)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span>Order #{order.id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                className="gap-2"
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleDownload}
                                className="gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Download Invoice
                            </Button>
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="mt-6 flex items-center gap-3">
                        <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="font-semibold capitalize">{order.status}</span>
                        </div>
                        {order.trackingNumber && (
                            <div className="flex items-center gap-2 text-sm text-zinc-600">
                                <Truck className="h-4 w-4" />
                                <span>Tracking: <span className="font-semibold text-zinc-900">{order.trackingNumber}</span></span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-xl font-bold text-zinc-900">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={`${item.id}-${index}`} className="flex gap-4 border-b border-zinc-200 pb-4 last:border-0 last:pb-0">
                                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-zinc-400">
                                                    <Package className="h-8 w-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="mb-1 font-semibold text-zinc-900">{item.name}</h3>
                                            <div className="mb-2 flex gap-2 text-sm text-zinc-500">
                                                {item.size && <span>Size: {item.size}</span>}
                                                {item.size && item.colorId && <span>•</span>}
                                                {item.colorId && <span>Color: {item.colorId}</span>}
                                            </div>
                                            {item.customization && (item.customization.playerName || item.customization.playerNumber) && (
                                                <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-[var(--brand-red)]">
                                                    <span>⚽</span>
                                                    <span>
                                                        Custom: {item.customization.playerName} {item.customization.playerNumber && `#${item.customization.playerNumber}`}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-zinc-600">Quantity: {item.quantity}</p>
                                                <p className="font-semibold text-zinc-900">
                                                    ₵{(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-[var(--brand-red)]" />
                                <h2 className="text-xl font-bold text-zinc-900">Shipping Address</h2>
                            </div>
                            <div className="text-sm text-zinc-700">
                                <p className="font-semibold">{order.shipping.firstName} {order.shipping.lastName}</p>
                                <p>{order.shipping.address}</p>
                                <p>{order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}</p>
                                <p>{order.shipping.country}</p>
                                <p className="mt-2 text-zinc-600">Phone: {order.shipping.phone}</p>
                                <p className="text-zinc-600">Email: {order.shipping.email}</p>
                            </div>
                        </div>

                        {/* Billing Address */}
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-[var(--brand-red)]" />
                                <h2 className="text-xl font-bold text-zinc-900">Billing Address</h2>
                            </div>
                            <div className="text-sm text-zinc-700">
                                <p className="font-semibold">{order.billing.firstName} {order.billing.lastName}</p>
                                <p>{order.billing.address}</p>
                                <p>{order.billing.city}, {order.billing.state} {order.billing.zipCode}</p>
                                <p>{order.billing.country}</p>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-[var(--brand-red)]" />
                                <h2 className="text-xl font-bold text-zinc-900">Payment Information</h2>
                            </div>
                            <div className="text-sm text-zinc-700">
                                <p className="font-semibold capitalize">
                                    {order.payment.method === "card" && "Credit/Debit Card"}
                                    {order.payment.method === "paypal" && "PayPal"}
                                    {order.payment.method === "mobile_money" && "Mobile Money"}
                                </p>
                                {order.payment.last4 && (
                                    <p className="text-zinc-600">Card ending in •••• {order.payment.last4}</p>
                                )}
                                <p className="mt-2 text-zinc-600">Payment Status: <span className="font-semibold text-green-600">Paid</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-xl font-bold text-zinc-900">Order Summary</h2>

                            <div className="space-y-3 border-b border-zinc-200 pb-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-600">Subtotal</span>
                                    <span className="font-semibold text-zinc-900">₵{order.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-600">Shipping</span>
                                    <span className="font-semibold text-zinc-900">
                                        {order.shippingCost === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `₵${order.shippingCost.toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-600">Tax</span>
                                    <span className="font-semibold text-zinc-900">₵{order.tax.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 text-lg font-bold text-zinc-900">
                                <span>Total</span>
                                <span>₵{order.total.toFixed(2)}</span>
                            </div>

                            {order.status === "processing" && (
                                <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                    <p className="text-sm text-yellow-800">
                                        Your order is being processed and will be shipped soon. You'll receive a tracking number via email once it ships.
                                    </p>
                                </div>
                            )}

                            {order.status === "shipped" && order.trackingNumber && (
                                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                                    <p className="mb-2 text-sm font-semibold text-blue-900">Your order has shipped!</p>
                                    <p className="text-sm text-blue-800">
                                        Track your package using: <span className="font-mono font-semibold">{order.trackingNumber}</span>
                                    </p>
                                </div>
                            )}

                            {order.status === "delivered" && (
                                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                                    <p className="mb-2 text-sm font-semibold text-green-900">Order Delivered</p>
                                    <p className="text-sm text-green-800">
                                        Your order has been delivered. Thank you for shopping with us!
                                    </p>
                                </div>
                            )}

                            <div className="mt-6">
                                <Button as={Link} href="/" className="w-full justify-center">
                                    Continue Shopping
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

