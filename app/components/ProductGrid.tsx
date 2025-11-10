"use client";

import { useEffect, useState } from "react";
import { products as seedProducts, Product as P } from "../../lib/products";
import { getUserProducts } from "../../lib/productStore";
import ProductCard from "./ProductCard";

export default function ProductGrid() {
    const [items, setItems] = useState<P[]>([]);

    useEffect(() => {
        function load() {
            const user = getUserProducts();
            setItems([...user, ...seedProducts]);
        }

        load();
        window.addEventListener("cediman:products-updated", load);
        return () => window.removeEventListener("cediman:products-updated", load);
    }, []);

    return (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
                <ProductCard key={p.id} product={p} />
            ))}
        </div>
    );
}
