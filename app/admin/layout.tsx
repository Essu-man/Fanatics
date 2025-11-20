import AdminProtectedRoute from "../components/AdminProtectedRoute";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminHeader from "../components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminProtectedRoute>
            <div className="flex min-h-screen bg-zinc-50">
                <AdminSidebar />
                <div className="flex-1 ml-64">
                    <AdminHeader />
                    <main className="p-6">{children}</main>
                </div>
            </div>
        </AdminProtectedRoute>
    );
}
