"use client";

import { Settings as SettingsIcon, User, Bell, Shield, CreditCard } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
                <p className="mt-1 text-sm text-zinc-600">
                    Manage your store settings and preferences
                </p>
            </div>

            {/* Settings Sections */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900">Profile Settings</h2>
                    </div>
                    <p className="text-sm text-zinc-600">Update your personal information and preferences</p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-2">
                            <Bell className="h-5 w-5 text-green-600" />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900">Notifications</h2>
                    </div>
                    <p className="text-sm text-zinc-600">Configure email and push notifications</p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900">Security</h2>
                    </div>
                    <p className="text-sm text-zinc-600">Manage password and two-factor authentication</p>
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-3">
                        <div className="rounded-lg bg-orange-100 p-2">
                            <CreditCard className="h-5 w-5 text-orange-600" />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900">Payment Methods</h2>
                    </div>
                    <p className="text-sm text-zinc-600">Configure payment gateways and options</p>
                </div>
            </div>
        </div>
    );
}
