"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "../providers/CartProvider";
import { useToast } from "../components/ui/ToastContainer";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { CreditCard, Lock, Shield, Truck, ArrowLeft } from "lucide-react";

type PaymentMethod = "card" | "paypal" | "mobile_money";

export default function CheckoutPage() {
    const router = useRouter();
    const { items, clear } = useCart();
    const { showToast } = useToast();
    
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [processing, setProcessing] = useState(false);
    
    // Shipping form state
    const [shipping, setShipping] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Ghana",
    });
    
    // Billing form state
    const [billing, setBilling] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "Ghana",
    });
    
    // Payment form state
    const [payment, setPayment] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
    });
    
    const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const estimatedShipping = subtotal > 200 ? 0 : 20;
    const tax = subtotal * 0.12; // 12% tax
    const total = subtotal + estimatedShipping + tax;
    
    const handleShippingChange = (field: string, value: string) => {
        setShipping((prev) => ({ ...prev, [field]: value }));
    };
    
    const handleBillingChange = (field: string, value: string) => {
        setBilling((prev) => ({ ...prev, [field]: value }));
    };
    
    const handlePaymentChange = (field: string, value: string) => {
        setPayment((prev) => ({ ...prev, [field]: value }));
    };
    
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || "";
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(" ");
        } else {
            return v;
        }
    };
    
    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        if (v.length >= 2) {
            return v.substring(0, 2) + "/" + v.substring(2, 4);
        }
        return v;
    };
    
    const validateForm = () => {
        if (!shipping.firstName || !shipping.lastName || !shipping.email || !shipping.phone || 
            !shipping.address || !shipping.city || !shipping.state || !shipping.zipCode) {
            showToast("Please fill in all shipping details", "error");
            return false;
        }
        
        if (!sameAsShipping) {
            if (!billing.firstName || !billing.lastName || !billing.address || 
                !billing.city || !billing.state || !billing.zipCode) {
                showToast("Please fill in all billing details", "error");
                return false;
            }
        }
        
        if (paymentMethod === "card") {
            if (!payment.cardNumber || !payment.cardName || !payment.expiryDate || !payment.cvv) {
                showToast("Please fill in all payment details", "error");
                return false;
            }
            if (payment.cardNumber.replace(/\s/g, "").length < 16) {
                showToast("Please enter a valid card number", "error");
                return false;
            }
        }
        
        return true;
    };
    
    const handlePlaceOrder = async () => {
        if (items.length === 0) {
            showToast("Your cart is empty", "error");
            router.push("/");
            return;
        }
        
        if (!validateForm()) {
            return;
        }
        
        setProcessing(true);
        
        // Simulate payment processing
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        // Create order object
        const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
        const order = {
            id: orderId,
            orderDate: new Date().toISOString(),
            status: "processing" as const,
            items: items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image,
                colorId: item.colorId || undefined
            })),
            shipping: { ...shipping },
            billing: sameAsShipping ? { ...shipping, email: shipping.email, phone: shipping.phone } : { ...billing },
            payment: {
                method: paymentMethod,
                last4: paymentMethod === "card" && payment.cardNumber ? payment.cardNumber.replace(/\s/g, "").slice(-4) : undefined
            },
            subtotal,
            shippingCost: estimatedShipping,
            tax,
            total
        };
        
        // Save order to localStorage
        try {
            const existingOrders = localStorage.getItem("cediman:orders");
            const orders = existingOrders ? JSON.parse(existingOrders) : [];
            orders.push(order);
            localStorage.setItem("cediman:orders", JSON.stringify(orders));
        } catch (error) {
            console.error("Error saving order:", error);
        }
        
        // Clear cart and redirect to success page with order ID
        clear();
        showToast("Order placed successfully!", "success");
        router.push(`/checkout/success?orderId=${orderId}`);
    };
    
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                <Header />
                <div className="mx-auto max-w-7xl px-6 py-24 text-center">
                    <h1 className="mb-4 text-3xl font-bold text-zinc-900">Your cart is empty</h1>
                    <p className="mb-8 text-zinc-600">Add some items to your cart to checkout</p>
                    <Button as={Link} href="/">
                        Continue Shopping
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
                    Continue Shopping
                </Link>
                
                <h1 className="mb-8 text-3xl font-bold text-zinc-900">Checkout</h1>
                
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Address */}
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-2">
                                <Truck className="h-5 w-5 text-[var(--brand-red)]" />
                                <h2 className="text-xl font-bold text-zinc-900">Shipping Address</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        First Name *
                                    </label>
                                    <Input
                                        value={shipping.firstName}
                                        onChange={(e) => handleShippingChange("firstName", e.target.value)}
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Last Name *
                                    </label>
                                    <Input
                                        value={shipping.lastName}
                                        onChange={(e) => handleShippingChange("lastName", e.target.value)}
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Email *
                                    </label>
                                    <Input
                                        type="email"
                                        value={shipping.email}
                                        onChange={(e) => handleShippingChange("email", e.target.value)}
                                        placeholder="john.doe@example.com"
                                        required
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Phone Number *
                                    </label>
                                    <Input
                                        type="tel"
                                        value={shipping.phone}
                                        onChange={(e) => handleShippingChange("phone", e.target.value)}
                                        placeholder="+233 XX XXX XXXX"
                                        required
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Address *
                                    </label>
                                    <Input
                                        value={shipping.address}
                                        onChange={(e) => handleShippingChange("address", e.target.value)}
                                        placeholder="Street address"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        City *
                                    </label>
                                    <Input
                                        value={shipping.city}
                                        onChange={(e) => handleShippingChange("city", e.target.value)}
                                        placeholder="Accra"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        State/Region *
                                    </label>
                                    <Input
                                        value={shipping.state}
                                        onChange={(e) => handleShippingChange("state", e.target.value)}
                                        placeholder="Greater Accra"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        ZIP/Postal Code *
                                    </label>
                                    <Input
                                        value={shipping.zipCode}
                                        onChange={(e) => handleShippingChange("zipCode", e.target.value)}
                                        placeholder="00233"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                        Country *
                                    </label>
                                    <Input
                                        value={shipping.country}
                                        onChange={(e) => handleShippingChange("country", e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* Billing Address */}
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-[var(--brand-red)]" />
                                    <h2 className="text-xl font-bold text-zinc-900">Billing Address</h2>
                                </div>
                                <label className="flex items-center gap-2 text-sm text-zinc-600">
                                    <input
                                        type="checkbox"
                                        checked={sameAsShipping}
                                        onChange={(e) => setSameAsShipping(e.target.checked)}
                                        className="rounded border-zinc-300"
                                    />
                                    Same as shipping address
                                </label>
                            </div>
                            {!sameAsShipping && (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            First Name *
                                        </label>
                                        <Input
                                            value={billing.firstName}
                                            onChange={(e) => handleBillingChange("firstName", e.target.value)}
                                            placeholder="John"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Last Name *
                                        </label>
                                        <Input
                                            value={billing.lastName}
                                            onChange={(e) => handleBillingChange("lastName", e.target.value)}
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Address *
                                        </label>
                                        <Input
                                            value={billing.address}
                                            onChange={(e) => handleBillingChange("address", e.target.value)}
                                            placeholder="Street address"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            City *
                                        </label>
                                        <Input
                                            value={billing.city}
                                            onChange={(e) => handleBillingChange("city", e.target.value)}
                                            placeholder="Accra"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            State/Region *
                                        </label>
                                        <Input
                                            value={billing.state}
                                            onChange={(e) => handleBillingChange("state", e.target.value)}
                                            placeholder="Greater Accra"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            ZIP/Postal Code *
                                        </label>
                                        <Input
                                            value={billing.zipCode}
                                            onChange={(e) => handleBillingChange("zipCode", e.target.value)}
                                            placeholder="00233"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Country *
                                        </label>
                                        <Input
                                            value={billing.country}
                                            onChange={(e) => handleBillingChange("country", e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Payment Method */}
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-2">
                                <Lock className="h-5 w-5 text-[var(--brand-red)]" />
                                <h2 className="text-xl font-bold text-zinc-900">Payment Method</h2>
                            </div>
                            
                            <div className="mb-6 space-y-3">
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-zinc-200 p-4 hover:border-[var(--brand-red)]">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                        checked={paymentMethod === "card"}
                                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                        className="text-[var(--brand-red)]"
                                    />
                                    <CreditCard className="h-5 w-5 text-zinc-600" />
                                    <span className="flex-1 font-medium text-zinc-900">Credit/Debit Card</span>
                                </label>
                                
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-zinc-200 p-4 hover:border-[var(--brand-red)]">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="paypal"
                                        checked={paymentMethod === "paypal"}
                                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                        className="text-[var(--brand-red)]"
                                    />
                                    <div className="h-5 w-5 rounded bg-blue-500"></div>
                                    <span className="flex-1 font-medium text-zinc-900">PayPal</span>
                                </label>
                                
                                <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-zinc-200 p-4 hover:border-[var(--brand-red)]">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="mobile_money"
                                        checked={paymentMethod === "mobile_money"}
                                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                        className="text-[var(--brand-red)]"
                                    />
                                    <div className="h-5 w-5 rounded bg-green-500"></div>
                                    <span className="flex-1 font-medium text-zinc-900">Mobile Money</span>
                                </label>
                            </div>
                            
                            {paymentMethod === "card" && (
                                <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Card Number *
                                        </label>
                                        <Input
                                            value={payment.cardNumber}
                                            onChange={(e) => handlePaymentChange("cardNumber", formatCardNumber(e.target.value))}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength={19}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Cardholder Name *
                                        </label>
                                        <Input
                                            value={payment.cardName}
                                            onChange={(e) => handlePaymentChange("cardName", e.target.value)}
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                                Expiry Date *
                                            </label>
                                            <Input
                                                value={payment.expiryDate}
                                                onChange={(e) => handlePaymentChange("expiryDate", formatExpiryDate(e.target.value))}
                                                placeholder="MM/YY"
                                                maxLength={5}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                                CVV *
                                            </label>
                                            <Input
                                                type="password"
                                                value={payment.cvv}
                                                onChange={(e) => handlePaymentChange("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                                                placeholder="123"
                                                maxLength={4}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {paymentMethod === "paypal" && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
                                    You will be redirected to PayPal to complete your payment.
                                </div>
                            )}
                            
                            {paymentMethod === "mobile_money" && (
                                <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Mobile Money Number *
                                        </label>
                                        <Input
                                            type="tel"
                                            placeholder="+233 XX XXX XXXX"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                                            Network Provider *
                                        </label>
                                        <select className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm">
                                            <option>MTN Mobile Money</option>
                                            <option>Vodafone Cash</option>
                                            <option>AirtelTigo Money</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 rounded-lg bg-white p-6 shadow-sm">
                            <h2 className="mb-6 text-xl font-bold text-zinc-900">Order Summary</h2>
                            
                            <div className="mb-6 space-y-3">
                                {items.map((item) => (
                                    <div key={`${item.id}-${item.colorId}`} className="flex gap-3">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-zinc-900">{item.name}</p>
                                            <p className="text-xs text-zinc-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-semibold text-zinc-900">
                                                ₵{(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-2 border-t border-zinc-200 pt-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-600">Subtotal</span>
                                    <span className="font-semibold text-zinc-900">₵{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-600">Shipping</span>
                                    <span className="font-semibold text-zinc-900">
                                        {estimatedShipping === 0 ? (
                                            <span className="text-green-600">FREE</span>
                                        ) : (
                                            `₵${estimatedShipping.toFixed(2)}`
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-600">Tax</span>
                                    <span className="font-semibold text-zinc-900">₵{tax.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-900">
                                    <span>Total</span>
                                    <span>₵{total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
                                <Shield className="h-4 w-4" />
                                <span>Your payment information is secure and encrypted</span>
                            </div>
                            
                            <Button
                                onClick={handlePlaceOrder}
                                disabled={processing}
                                className="mt-6 w-full justify-center gap-2 py-3 text-base font-bold shadow-lg transition-all hover:shadow-xl"
                            >
                                {processing ? (
                                    <>
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="h-5 w-5" />
                                        Place Order
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

