import type { Product } from "./products";

// Generate products for all teams
export function generateTeamProducts(teamId: string, teamName: string, league: string): Product[] {
    const baseProducts: Product[] = [
        {
            id: `${teamId}-home-jersey`,
            name: `${teamName} Home Jersey`,
            team: teamName,
            price: 89.99,
            images: [
                "https://images.unsplash.com/photo-1637089760728-0707413a1a03?w=500&h=600&fit=crop",
                "https://images.unsplash.com/photo-1616124619460-ff4ed8f4683c?w=500&h=600&fit=crop",
            ],
            colors: [
                { id: "home", name: "Home", hex: "#1a1a1a" },
            ],
        },
        {
            id: `${teamId}-away-jersey`,
            name: `${teamName} Away Jersey`,
            team: teamName,
            price: 89.99,
            images: [
                "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=500&h=600&fit=crop",
                "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=500&h=600&fit=crop",
            ],
            colors: [
                { id: "away", name: "Away", hex: "#ffffff" },
            ],
        },
        {
            id: `${teamId}-hoodie`,
            name: `${teamName} Hoodie`,
            team: teamName,
            price: 69.99,
            images: [
                "https://images.unsplash.com/photo-1556821840-3a63f95609a4?w=500&h=600&fit=crop",
            ],
            colors: [
                { id: "navy", name: "Navy", hex: "#1a1a1a" },
                { id: "gray", name: "Gray", hex: "#6b7280" },
            ],
        },
        {
            id: `${teamId}-t-shirt`,
            name: `${teamName} T-Shirt`,
            team: teamName,
            price: 29.99,
            images: [
                "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop",
            ],
            colors: [
                { id: "white", name: "White", hex: "#ffffff" },
                { id: "black", name: "Black", hex: "#000000" },
            ],
        },
        {
            id: `${teamId}-cap`,
            name: `${teamName} Cap`,
            team: teamName,
            price: 24.99,
            images: [
                "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=600&fit=crop",
            ],
            colors: [
                { id: "navy", name: "Navy", hex: "#1a1a1a" },
            ],
        },
        {
            id: `${teamId}-shorts`,
            name: `${teamName} Shorts`,
            team: teamName,
            price: 39.99,
            images: [
                "https://images.unsplash.com/photo-1595552018060-6b4e069b08d6?w=500&h=600&fit=crop",
            ],
            colors: [
                { id: "navy", name: "Navy", hex: "#1a1a1a" },
                { id: "white", name: "White", hex: "#ffffff" },
            ],
        },
    ];

    return baseProducts;
}

