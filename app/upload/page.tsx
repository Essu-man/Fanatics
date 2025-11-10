import ProductUploader from "../components/ProductUploader";

export default function UploadPage() {
    return (
        <div className="min-h-screen bg-zinc-50 text-zinc-900">
            <main className="mx-auto max-w-7xl px-6 py-12">
                <ProductUploader />
            </main>
        </div>
    );
}
