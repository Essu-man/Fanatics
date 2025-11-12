export function ProductCardSkeleton() {
    return (
        <div className="flex w-72 flex-col overflow-hidden rounded-lg bg-white shadow-sm animate-pulse">
            <div className="h-[200px] w-full bg-zinc-200" />
            <div className="flex flex-col bg-white px-3 py-2">
                <div className="h-4 w-3/4 bg-zinc-200 rounded mb-2" />
                <div className="h-3 w-1/2 bg-zinc-200 rounded mb-3" />
                <div className="h-5 w-1/3 bg-zinc-200 rounded" />
            </div>
        </div>
    );
}

export function TeamPageSkeleton() {
    return (
        <div className="animate-pulse">
            <div className="mb-6 flex items-center gap-2">
                <div className="h-4 w-16 bg-zinc-200 rounded" />
                <div className="h-4 w-24 bg-zinc-200 rounded" />
                <div className="h-4 w-32 bg-zinc-200 rounded" />
            </div>
            <div className="mb-8">
                <div className="h-10 w-64 bg-zinc-200 rounded mb-2" />
                <div className="h-5 w-96 bg-zinc-200 rounded" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

