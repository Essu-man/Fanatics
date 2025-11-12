"use client";

import ProductSection from "./ProductSection";
import type { Product } from "../../lib/products";

// Football products
const footballProducts: Product[] = [
    {
        id: "man-utd-7",
        name: "Manchester United Kit",
        team: "Manchester United",
        price: 120.00,
        images: [
            "https://images.unsplash.com/photo-1637089760728-0707413a1a03?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "red", name: "Red", hex: "#DA020E" },
        ],
    },
    {
        id: "messi-10",
        name: "Lionel Messi Jersey",
        team: "Argentina",
        price: 195.00,
        images: [
            "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "blue", name: "Dark Blue", hex: "#6CACE4" },
        ],
    },
    {
        id: "cowboys-93",
        name: "Dallas Cowboys Jersey",
        team: "Dallas Cowboys",
        price: 110.00,
        images: [
            "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "navy", name: "Navy Blue", hex: "#003594" },
        ],
    },
    {
        id: "mahomes-15",
        name: "Patrick Mahomes Jersey",
        team: "Kansas City Chiefs",
        price: 150.00,
        images: [
            "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "green", name: "Green", hex: "#E31837" },
        ],
    },
];

// Basketball products
const basketballProducts: Product[] = [
    {
        id: "lebron-23",
        name: "LeBron James Jersey",
        team: "Los Angeles Lakers",
        price: 180.00,
        images: [
            "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "yellow", name: "Yellow", hex: "#FDB927" },
        ],
    },
    {
        id: "jordan-23",
        name: "Michael Jordan Jersey",
        team: "Chicago Bulls",
        price: 250.00,
        images: [
            "https://images.unsplash.com/photo-1565877302143-786477b33d82?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "red", name: "Red", hex: "#CE1141" },
        ],
    },
    {
        id: "curry-30",
        name: "Stephen Curry Jersey",
        team: "Golden State Warriors",
        price: 175.00,
        images: [
            "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "white", name: "White", hex: "#FFFFFF" },
        ],
    },
    {
        id: "celtics-green",
        name: "Boston Celtics Jersey",
        team: "Boston Celtics",
        price: 115.00,
        images: [
            "https://images.unsplash.com/photo-1434648957308-5e6a859697e8?w=500&h=600&fit=crop",
        ],
        colors: [
            { id: "green", name: "Green", hex: "#007A33" },
        ],
    },
];

export default function HomeProductSections() {
    return (
        <>
            <ProductSection
                title="Gear Up for Game Day: Shop Football"
                category="football"
                products={footballProducts}
            />
            <ProductSection
                title="Rule the Court: Shop Basketball"
                category="basketball"
                products={basketballProducts}
            />
        </>
    );
}

