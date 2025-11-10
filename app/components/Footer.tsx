export default function Footer() {
    return (
        <footer className="mt-16 border-t border-zinc-200 bg-white py-10">
            <div className="mx-auto max-w-7xl px-6 text-sm text-zinc-700">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-zinc-900">
                        <strong className="text-zinc-900">cediman</strong>
                        <div className="mt-1 text-zinc-700">Authentic jerseys. Fast shipping. Fan-first returns.</div>
                    </div>

                    <div className="flex gap-4">
                        <a href="#" className="hover:text-[var(--brand-orange)]">Privacy</a>
                        <a href="#" className="hover:text-[var(--brand-orange)]">Terms</a>
                        <a href="#" className="hover:text-[var(--brand-orange)]">Help</a>
                    </div>
                </div>

                <div className="mt-6 text-xs text-zinc-500">© {new Date().getFullYear()} cediman — all rights reserved</div>
            </div>
        </footer>
    );
}
