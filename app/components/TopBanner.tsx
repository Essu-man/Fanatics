"use client";

export default function TopBanner() {
    return (
        <div className="bg-[var(--brand-gray-50)] px-4 py-2 text-zinc-900">
            <div className="mx-auto flex max-w-7xl items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-sm">
                    <span>Free Shipping on Orders Over ₵200</span>
                    <span className="h-4 w-px bg-zinc-300" />
                    <span>Easy 30-Day Returns</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                    <a href="#" className="hover:text-[var(--brand-orange)]">Track Order</a>
                    <span className="h-4 w-px bg-zinc-300" />
                    <a href="#" className="hover:text-[var(--brand-orange)]">Help</a>
                </div>
            </div>
        </div>
    );
}