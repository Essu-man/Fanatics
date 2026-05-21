import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 flex items-center justify-center p-6">
            <Suspense
                fallback={
                    <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center text-zinc-500">
                        Loading…
                    </div>
                }
            >
                <LoginForm />
            </Suspense>
        </div>
    );
}
