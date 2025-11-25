"use client";

import React, { useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { saveUserProduct } from "../../lib/productStore";
import Button from "./ui/button";

export default function ProductUploader() {
    const { isAdmin } = useAuth();
    const [name, setName] = useState("");
    const [team, setTeam] = useState("");
    const [price, setPrice] = useState(0);
    const [images, setImages] = useState("");
    const [colors, setColors] = useState("");
    const [message, setMessage] = useState("");

    if (!isAdmin) {
        return <div className="p-6">You need to be an admin to upload products.</div>;
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        const imgs = images
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        const cols = colors
            .split(",")
            .map((c) => {
                const [name, hex] = c.split("|").map((s) => s.trim());
                return { id: name.toLowerCase().replace(/\s+/g, "-"), name, hex };
            })
            .filter((c) => c.name);

        const id = `${name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

        saveUserProduct({ id, name, team, price: Number(price), images: imgs, colors: cols });
        setMessage("Product uploaded — it will appear in the grid.");
        setName("");
        setTeam("");
        setPrice(0);
        setImages("");
        setColors("");
    }

    return (
        <div className="mx-auto max-w-2xl p-6">
            <h2 className="text-xl font-semibold">Upload a product</h2>
            <p className="mt-2 text-sm text-zinc-600">Quick uploader for buyers/sellers (prototype)</p>

            <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
                <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border px-3 py-2" />
                <input placeholder="Team" value={team} onChange={(e) => setTeam(e.target.value)} className="rounded-md border px-3 py-2" />
                <input required type="number" step="0.01" placeholder="Price (₵)" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="rounded-md border px-3 py-2" />
                <input placeholder="Image URLs (comma separated)" value={images} onChange={(e) => setImages(e.target.value)} className="rounded-md border px-3 py-2" />
                <input placeholder="Colors (name|hex, comma separated) e.g. Red|#ff0000" value={colors} onChange={(e) => setColors(e.target.value)} className="rounded-md border px-3 py-2" />

                <div className="mt-4 flex gap-2">
                    <Button type="submit">Upload</Button>
                    <Button variant="ghost" onClick={() => { setName(""); setTeam(""); setPrice(0); setImages(""); setColors(""); }}>
                        Reset
                    </Button>
                </div>

                {message && <div className="mt-2 text-sm text-green-600">{message}</div>}
            </form>
        </div>
    );
}
