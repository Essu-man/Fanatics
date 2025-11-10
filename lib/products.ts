export type Product = {
    id: string;
    name: string;
    team?: string;
    description?: string;
    // prices in Ghana Cedi
    price: number;
    salePrice?: number;
    // primary image + gallery
    images: string[];
    // available color variants
    colors?: Array<{
        id: string;
        name: string;
        hex: string;
        image?: string;
    }>;
};

export const products: Product[] = [
    {
        id: "bcn-home-24",
        name: "FC Barcelona — Home 24/25",
        team: "Barcelona",
        price: 899.99,
        images: [
            "https://images.unsplash.com/photo-1580087433295-ab2600c1030e?w=500&h=400&fit=crop",
            "https://images.unsplash.com/photo-1591017403286-fd8493524e1e?w=500&h=400&fit=crop",
            "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=500&h=400&fit=crop",
        ],
        colors: [
            { id: "rd", name: "Classic Red", hex: "#A41623" },
            { id: "bl", name: "Deep Blue", hex: "#003087" },
        ],
    },
    {
        id: "mnu-away-24",
        name: "Manchester United — Away 24/25",
        team: "Man United",
        price: 849.99,
        images: [
            "https://images.unsplash.com/photo-1637089760728-0707413a1a03?w=500&h=300&fit=crop",
            "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=500&h=300&fit=crop",
        ],
        colors: [
            { id: "blk", name: "Black", hex: "#0f172a" },
            { id: "wht", name: "White", hex: "#ffffff" },
        ],
    },
    {
        id: "rma-3rd-23",
        name: "Real Madrid — Third 23/24",
        team: "Real Madrid",
        price: 799.99,
        images: [
            "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&h=400&fit=crop",
            "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&h=400&fit=crop",
        ],
        colors: [
            { id: "gry", name: "Grey", hex: "#6b7280" },
        ],
    },
    {
        id: "juv-home-24",
        name: "Juventus — Home 24/25",
        team: "Juventus",
        price: 920.0,
        images: [
            "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=500&h=400&fit=crop",
            "https://images.unsplash.com/photo-1617044613958-d89dfb6e0d88?w=500&h=400&fit=crop",
        ],
        colors: [
            { id: "blk-wht", name: "Black & White", hex: "#000000" },
        ],
    },
    {
        id: "psg-home-24",
        name: "Paris Saint-Germain — Home 24/25",
        team: "PSG",
        price: 945.5,
        images: [
            "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&h=400&fit=crop",
            "https://images.unsplash.com/photo-1565877302143-786477b33d82?w=500&h=400&fit=crop",
        ],
        colors: [
            { id: "navy", name: "Navy", hex: "#002664" },
        ],
    },
    {
        id: "lvr-home-24",
        name: "Liverpool — Home 24/25",
        team: "Liverpool",
        price: 860.0,
        images: [
            "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=500&h=400&fit=crop",
            "https://images.unsplash.com/photo-1434648957308-5e6a859697e8?w=500&h=400&fit=crop",
        ],
        colors: [
            { id: "red", name: "Red", hex: "#c8102e" },
        ],
    },
];
