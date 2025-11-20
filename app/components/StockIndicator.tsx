interface StockIndicatorProps {
    stock: number;
    threshold?: number;
}

export default function StockIndicator({ stock, threshold = 10 }: StockIndicatorProps) {
    if (stock === 0) {
        return (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                <span className="h-2 w-2 rounded-full bg-red-500"></span>
                Out of Stock
            </div>
        );
    }

    if (stock <= threshold) {
        return (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                <span className="h-2 w-2 animate-pulse rounded-full bg-orange-500"></span>
                Only {stock} left!
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            In Stock
        </div>
    );
}
