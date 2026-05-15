"use client";

import { useState } from "react";
import Link from "next/link";
import { 
    Store, 
    Rocket, 
    ShieldCheck, 
    Globe, 
    ArrowRight, 
    CheckCircle2,
    Users,
    TrendingUp,
    Zap,
    User,
    Building2,
    CreditCard,
    ChevronLeft
} from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useToast } from "@/app/components/ui/ToastContainer";

export default function VendorApplyPage() {
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
        window.scrollTo({ top: 400, behavior: "smooth" });
    };

    const prevStep = () => {
        setStep(s => s - 1);
        window.scrollTo({ top: 400, behavior: "smooth" });
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
            <div className="min-h-screen bg-white">
                <Header />
                <div className="mx-auto max-w-3xl px-6 py-24 text-center">
                    <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <h1 className="text-4xl font-black text-zinc-900 mb-4">Application Received!</h1>
                    <p className="text-xl text-zinc-600 mb-8">
                        Thank you for applying to be a seller on Cediman. Our team will review your application and get back to you via email within 2-3 business days.
                    </p>
                    <Link 
                        href="/"
                        className="inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all"
                    >
                        Back to Home
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc]">
            <Header />
            
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-zinc-900">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
                <div className="mx-auto max-w-7xl px-6 relative">
                    <div className="max-w-3xl">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                            Cediman Partners
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-8">
                            Sell where the <br/>
                            <span className="text-emerald-400">fans are.</span>
                        </h1>
                        <p className="text-xl text-zinc-400 font-medium max-w-xl">
                            Join the #1 marketplace for jerseys, apparel, and lifestyle in Ghana. Reach thousands of verified customers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="mx-auto max-w-7xl px-6 -mt-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { 
                            icon: Users, 
                            title: "Massive Audience", 
                            desc: "Get your products in front of thousands of active shoppers looking for the best gear." 
                        },
                        { 
                            icon: Zap, 
                            title: "Fast Payments", 
                            desc: "Reliable weekly payouts directly to your bank account or mobile money wallet." 
                        },
                        { 
                            icon: ShieldCheck, 
                            title: "Trusted Platform", 
                            desc: "We handle the security, logistics, and customer support so you can focus on sales." 
                        }
                    ].map((benefit, i) => (
                        <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 border border-zinc-100 group hover:border-emerald-500/30 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <benefit.icon className="h-7 w-7" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 mb-3">{benefit.title}</h3>
                            <p className="text-zinc-500 leading-relaxed">{benefit.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Application Form Section */}
            <section className="mx-auto max-w-7xl px-6 py-32 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                <div>
                    <h2 className="text-4xl font-black text-zinc-900 mb-6">Start your journey today</h2>
                    <p className="text-lg text-zinc-600 mb-10">
                        Tell us about your business. Our onboarding team will review your application and help you set up your store.
                    </p>
                    
                    <div className="space-y-8">
                        {[
                            { step: 1, title: "Submit Application", desc: "Fill out the form with your business details." },
                            { step: 2, title: "Review Process", desc: "Our team verifies your information and business type." },
                            { step: 3, title: "Go Live", desc: "Start uploading products and receiving orders!" }
                        ].map((s, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-900">
                                    {s.step}
                                </div>
                                <div>
                                    <h4 className="font-bold text-zinc-900">{s.title}</h4>
                                    <p className="text-zinc-500 text-sm">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100">
                    <VendorApplyForm />
                </div>
            </section>

            <Footer />
        </div>
    );
}
