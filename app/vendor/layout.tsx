import VendorProtectedRoute from "../components/VendorProtectedRoute";
import VendorSidebar from "../components/vendor/VendorSidebar";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    return (
        <VendorProtectedRoute>
            <div className="flex min-h-screen bg-zinc-50">
                <VendorSidebar />
                <div className="flex-1 ml-64">
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </VendorProtectedRoute>
    );
}
