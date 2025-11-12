"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type MegaItem = {
	name: string;
	href?: string;
};

type Category = {
	label: string;
	items: MegaItem[];
};

const categories: Category[] = [
	{
		label: "Jerseys",
		items: [
			{ name: "Men's Jerseys" },
			{ name: "Women's Jerseys" },
			{ name: "Kids' Jerseys" },
			{ name: "Authentic" },
			{ name: "Replica" },
			{ name: "Custom" }
		]
	},
	{
		label: "Teams",
		items: [
			{ name: "Premier League" },
			{ name: "La Liga" },
			{ name: "Bundesliga" },
			{ name: "Serie A" },
			{ name: "Ligue 1" },
			{ name: "National Teams" }
		]
	},
	{
		label: "Apparel",
		items: [
			{ name: "Hoodies & Sweatshirts" },
			{ name: "T-Shirts" },
			{ name: "Jackets" },
			{ name: "Tracksuits" },
			{ name: "Shorts" }
		]
	},
	{
		label: "Accessories",
		items: [
			{ name: "Hats" },
			{ name: "Scarves" },
			{ name: "Bags" },
			{ name: "Socks" }
		]
	},
	{
		label: "Sale",
		items: [
			{ name: "Clearance" },
			{ name: "Last Chance" },
			{ name: "Under ₵200" }
		]
	}
];

export default function CategoryNav() {
	const [active, setActive] = useState<string | null>(null);

	return (
		<div className="hidden md:block">
			<div className="bg-white text-zinc-900 border-t border-b border-zinc-200">
				<div className="mx-auto max-w-7xl px-6">
					<ul className="flex h-12 items-stretch gap-2">
						{categories.map((cat) => (
							<li
								key={cat.label}
								className="group relative"
								onMouseEnter={() => setActive(cat.label)}
								onMouseLeave={() => setActive((curr) => (curr === cat.label ? null : curr))}
							>
								<button className="flex h-full items-center gap-1 px-3 text-sm font-semibold text-zinc-800 hover:text-[var(--brand-red)]">
									{cat.label}
									<ChevronDown className="h-4 w-4" />
								</button>

								{/* Mega panel */}
								<div
									className={`absolute left-0 top-full w-screen border-t border-zinc-200 bg-white text-zinc-900 shadow-xl transition-opacity ${active === cat.label ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
								>
									<div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-6 py-6 md:grid-cols-3">
										{cat.items.map((item) => (
											<Link
												key={item.name}
												href={item.href || "#"}
												className="rounded-md p-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50 hover:text-[var(--brand-red)]"
											>
												{item.name}
											</Link>
										))}
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	);
}


