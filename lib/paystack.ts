// Paystack payment helper functions
export interface PaystackConfig {
    publicKey: string;
    email: string;
    amount: number; // in kobo (multiply cedis by 100)
    currency?: string;
    ref?: string;
    metadata?: any;
    onSuccess: (response: any) => void;
    onClose: () => void;
}

export interface PaystackResponse {
    reference: string;
    status: string;
    trans: string;
    transaction: string;
    message: string;
    trxref: string;
}

// Initialize Paystack payment
export const initializePaystack = (config: PaystackConfig) => {
    // Check if Paystack is loaded
    if (typeof window === "undefined" || !(window as any).PaystackPop) {
        console.error("Paystack SDK not loaded");
        return null;
    }

    const handler = (window as any).PaystackPop.setup({
        key: config.publicKey,
        email: config.email,
        amount: config.amount,
        currency: config.currency || "GHS",
        ref: config.ref || `${Date.now()}`,
        metadata: config.metadata,
        callback: (response: PaystackResponse) => {
            config.onSuccess(response);
        },
        onClose: () => {
            config.onClose();
        },
    });

    return handler;
};

// Generate unique payment reference
export const generatePaymentReference = (): string => {
    return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
};

// Convert cedis to kobo (Paystack uses kobo)
export const cedisToKobo = (cedis: number): number => {
    return Math.round(cedis * 100);
};

// Convert kobo to cedis
export const koboToCedis = (kobo: number): number => {
    return kobo / 100;
};

// Format amount for display
export const formatAmount = (amount: number, currency: string = "GHS"): string => {
    return new Intl.NumberFormat("en-GH", {
        style: "currency",
        currency: currency,
    }).format(amount);
};

// Verify payment (to be called from API route)
export const verifyPayment = async (reference: string, secretKey: string) => {
    try {
        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                },
            }
        );

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error verifying payment:", error);
        return { status: false, message: "Verification failed" };
    }
};
