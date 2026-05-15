"use client";

import { useState } from "react";
import { 
    Rocket, 
    ArrowRight, 
    CheckCircle2,
    User,
    Building2,
    CreditCard,
    ChevronLeft
} from "lucide-react";
import { useToast } from "@/app/components/ui/ToastContainer";
import Link from "next/link";

export default function VendorApplyForm() {
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        // Step 1: Basic Info
        contactPerson: "",
        email: "",
        phone: "",
        
        // Step 2: Store/Company
        businessName: "",
        category: "Jersey",
        description: "",
        website: "",
        instagram: "",
        
        // Step 3: Payment
        payoutMethod: "Bank Transfer", // or Mobile Money
        bankName: "",
        accountNumber: "",
        accountName: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.contactPerson || !formData.email || !formData.phone) {
                showToast("Please fill in all basic information", "error");
                return;
            }
        }
        if (step === 2) {
            if (!formData.businessName || !formData.description) {
                showToast("Please fill in business details", "error");
                return;
            }
        }
        setStep(s => s + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const prevStep = () => {
        setStep(s => s - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/vendor/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                showToast("Application submitted successfully!", "success");
            } else {
                showToast(data.error || "Submission failed", "error");
            }
        } catch (err) {
            showToast("An error occurred", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-12 px-6">
                <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-black text-zinc-900 mb-4">Application Received!</h2>
                <p className="text-lg text-zinc-600 mb-8 max-w-md mx-auto">
                    Thank you for applying. Our team will review your application and get back to you within 2-3 business days.
                </p>
                <Link 
                    href="/"
                    className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all"
                >
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Progress Tracker */}
            <div className="mb-12">
                <div className="flex items-center justify-between relative px-2">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 -translate-y-1/2 z-0" />
                    <div 
                        className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500" 
                        style={{ width: `${((step - 1) / 2) * 100}%` }}
                    />
                    
                    {[
                        { s: 1, icon: User, label: "Basic Info" },
                        { s: 2, icon: Building2, label: "Store Details" },
                        { s: 3, icon: CreditCard, label: "Payment" }
                    ].map((item) => (
                        <div key={item.s} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                                step >= item.s 
                                    ? "bg-emerald-500 border-emerald-100 text-white" 
                                    : "bg-white border-zinc-100 text-zinc-300"
                            }`}>
                                <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest mt-3 transition-colors duration-500 ${
                                step >= item.s ? "text-emerald-600" : "text-zinc-400"
                            }`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Contact Person Name</label>
                            <input 
                                name="contactPerson"
                                required
                                value={formData.contactPerson}
                                onChange={handleChange}
                                className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Business Email</label>
                                <input 
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                    placeholder="hello@yourbusiness.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Phone Number</label>
                                <input 
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                    placeholder="+233..."
                                />
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={nextStep}
                            className="w-full h-16 bg-zinc-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                        >
                            Continue to Store Details
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Business Name</label>
                                <input 
                                    name="businessName"
                                    required
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                    placeholder="e.g. Kicks & Kits"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Primary Category</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none appearance-none"
                                >
                                    <option>Jersey</option>
                                    <option>Trainers</option>
                                    <option>Cosmetics</option>
                                    <option>Gadgets</option>
                                    <option>Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Store Description</label>
                            <textarea 
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleChange}
                                rows={4}
                                className="w-full p-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                placeholder="What do you sell? How long have you been in business?"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Website (Optional)</label>
                                <input 
                                    name="website"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Instagram Handle</label>
                                <input 
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                    placeholder="@..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={prevStep}
                                className="w-20 h-16 bg-zinc-100 text-zinc-900 rounded-2xl font-black flex items-center justify-center hover:bg-zinc-200 transition-all"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button 
                                type="button"
                                onClick={nextStep}
                                className="flex-1 h-16 bg-zinc-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-[0.98]"
                            >
                                Payment Details
                                <ArrowRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">Preferred Payout Method</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payoutMethod: "Bank Transfer" })}
                                    className={`h-14 rounded-2xl border-2 transition-all font-bold ${
                                        formData.payoutMethod === "Bank Transfer" 
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                                            : "border-zinc-50 bg-zinc-50 text-zinc-500"
                                    }`}
                                >
                                    Bank Transfer
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, payoutMethod: "Mobile Money" })}
                                    className={`h-14 rounded-2xl border-2 transition-all font-bold ${
                                        formData.payoutMethod === "Mobile Money" 
                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                                            : "border-zinc-50 bg-zinc-50 text-zinc-500"
                                    }`}
                                >
                                    Mobile Money
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-zinc-700">
                                {formData.payoutMethod === "Bank Transfer" ? "Bank Name" : "Provider (MTN, Telecel, AT)"}
                            </label>
                            <input 
                                name="bankName"
                                required
                                value={formData.bankName}
                                onChange={handleChange}
                                className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                placeholder={formData.payoutMethod === "Bank Transfer" ? "e.g. GCB Bank" : "e.g. MTN"}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Account Number</label>
                                <input 
                                    name="accountNumber"
                                    required
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                    placeholder="XXXX XXXX XXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-700">Account Name</label>
                                <input 
                                    name="accountName"
                                    required
                                    value={formData.accountName}
                                    onChange={handleChange}
                                    className="w-full h-14 px-5 rounded-2xl bg-zinc-50 border-2 border-zinc-50 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                                    placeholder="e.g. John Doe"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                type="button"
                                onClick={prevStep}
                                className="w-20 h-16 bg-zinc-100 text-zinc-900 rounded-2xl font-black flex items-center justify-center hover:bg-zinc-200 transition-all"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="flex-1 h-16 bg-zinc-900 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit Application"}
                                <Rocket className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
