import { Product } from "./products";

const KEY = "cediman:userProducts";

export function getUserProducts(): Product[] {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return [];
        return JSON.parse(raw) as Product[];
    } catch (e) {
        return [];
    }
}

export function saveUserProduct(p: Product) {
    const list = getUserProducts();
    list.unshift(p);
    localStorage.setItem(KEY, JSON.stringify(list));
    // notify listeners
    window.dispatchEvent(new CustomEvent("cediman:products-updated"));
}

export function clearUserProducts() {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent("cediman:products-updated"));
}
