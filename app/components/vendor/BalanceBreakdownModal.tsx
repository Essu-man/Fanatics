"use client";

import { X, DollarSign, Clock, ArrowRight } from "lucide-react";

interface BalanceBreakdownModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        grossSales: number;
        commissionRate: number;
        platformFeeAmount: number;
        netPayableRevenue: number;
        totalPaidOut: number;
        balanceAvailable: number;
        balancePending: number;
    };
    onWithdrawClick?: () => void;
}

export default function BalanceBreakdownModal({
    isOpen,
    onClose,
    data,
    onWithdrawClick,
}: BalanceBreakdownModalProps) {
    if (!isOpen) return null;

    const {
        grossSales,
        commissionRate,
        platformFeeAmount,
        netPayableRevenue,
        totalPaidOut,
        balanceAvailable,
        balancePending,
    } = data;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-zinc-100 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-600">
                            <DollarSign className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-zinc-900">Payable Balance Breakdown</h2>
                            <p className="text-xs text-zinc-500 font-medium">Calculation of your actual net earnings</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        aria-label="Close popup"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Formula Banner */}
                <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 text-xs text-purple-950 space-y-1 font-medium">
                    <strong>Calculation Formula:</strong>
                    <p className="font-mono text-[11px] text-purple-800">
                        [Gross Product Sales (₵{grossSales.toFixed(2)})] - [Cediman Fee ({commissionRate}% = ₵{platformFeeAmount.toFixed(2)})] = Net Revenue (₵{netPayableRevenue.toFixed(2)})
                    </p>
                </div>

                {/* Calculation Steps Breakdown */}
                <div className="space-y-3 text-sm">
                    {/* Gross Sales */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100">
                        <div>
                            <p className="font-bold text-zinc-900">Gross Product Sales</p>
                            <p className="text-xs text-zinc-500">Total value of sold items from your store</p>
                        </div>
                        <span className="font-mono font-bold text-zinc-900 text-base">
                            GH₵ {grossSales.toFixed(2)}
                        </span>
                    </div>

                    {/* Platform Fee Deduction */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                        <div>
                            <div className="flex items-center gap-1.5">
                                <p className="font-bold text-amber-900">Cediman Platform Fee ({commissionRate}%)</p>
                            </div>
                            <p className="text-xs text-amber-700">Deduction rate applied to marketplace orders</p>
                        </div>
                        <span className="font-mono font-bold text-amber-800 text-base">
                            - GH₵ {platformFeeAmount.toFixed(2)}
                        </span>
                    </div>

                    {/* Subtotal Net Revenue */}
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                        <div>
                            <p className="font-bold text-emerald-950">Net Revenue Earned</p>
                            <p className="text-xs text-emerald-700">Gross sales minus Cediman commission</p>
                        </div>
                        <span className="font-mono font-black text-emerald-900 text-base">
                            GH₵ {netPayableRevenue.toFixed(2)}
                        </span>
                    </div>

                    {/* Previous Withdrawals */}
                    {totalPaidOut > 0 && (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                            <div>
                                <p className="font-bold text-blue-900">Processed Withdrawals / Payouts</p>
                                <p className="text-xs text-blue-700">Total funds already paid out to your account</p>
                            </div>
                            <span className="font-mono font-bold text-blue-800 text-base">
                                - GH₵ {totalPaidOut.toFixed(2)}
                            </span>
                        </div>
                    )}

                    {/* Pending in Escrow */}
                    {balancePending > 0 && (
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-bold text-purple-900">Pending in Escrow</p>
                                    <p className="text-xs text-purple-700">Held until customers confirm order delivery</p>
                                </div>
                            </div>
                            <span className="font-mono font-bold text-purple-800 text-base">
                                GH₵ {balancePending.toFixed(2)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Final Highlight: Available Withdrawable Balance */}
                <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-500/5 p-4 flex items-center justify-between">
                    <div>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-800">Actual Available Balance</span>
                        <p className="text-xs text-emerald-700 font-medium">Cleared funds ready for immediate withdrawal</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-emerald-950 font-mono">
                            GH₵ {balanceAvailable.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-zinc-200 text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition-colors"
                    >
                        Close
                    </button>
                    {onWithdrawClick && (
                        <button
                            onClick={() => {
                                onClose();
                                onWithdrawClick();
                            }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-md"
                        >
                            Withdraw Funds
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
