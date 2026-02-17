"use client";

import Link from "next/link";
import { Shirt, Dumbbell } from "lucide-react";

export default function CategoryNav() {
	// Custom Football Icon (Soccer Ball)
	const FootballIcon = (props: any) => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			{...props}
		>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
			<path d="M12 2c1-2 2-3 2-4" stroke="none" /> {/* Spacer/Hack removal if exists */}
			<path d="M12 7l-4.5 3.5 1.5 5.5h6l1.5-5.5L12 7z" /> {/* Central pentagon */}
			<path d="M12 2v5" />
			<path d="M7.5 10.5L3.5 13" />
			<path d="M16.5 10.5L20.5 13" />
			<path d="M9 16l-4 4" />
			<path d="M15 16l4 4" />
		</svg>
	);

	const categories = [
		{
			id: "football",
			name: "Football Jerseys",
			icon: FootballIcon,
			href: "/shop?category=jersey",
		},
		{
			id: "training",
			name: "Training Kits",
			icon: Dumbbell,
			href: "/shop?category=trainers",
		},
	];

	return (
		<section className="border-b border-zinc-200 bg-white">
			<div className="mx-auto max-w-7xl px-4 md:px-6">
				<div className="flex items-center justify-center gap-6 overflow-x-auto scrollbar-hide py-3">
					{categories.map((category) => (
						<Link
							key={category.id}
							href={category.href}
							className="flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 hover:text-[var(--brand-red)]"
						>
							<category.icon className="h-4 w-4" />
							<span>{category.name}</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
}
