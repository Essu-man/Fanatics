"use client";

import { Search, X, Clock, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import cn from "../../lib/cn";
import { products } from "../../lib/products";
import { footballTeams, basketballTeams } from "../../lib/teams";

const trending = ["Black Stars", "Messi", "Real Madrid", "Chelsea", "PSG", "Man United"];
const recentKey = "cediman:recentSearches";

export default function SearchAutocomplete() {
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [recent, setRecent] = useState<string[]>([]);
	const router = useRouter();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(recentKey);
			if (raw) setRecent(JSON.parse(raw));
		} catch { }
	}, []);

	useEffect(() => {
		function onClick(e: MouseEvent) {
			if (!containerRef.current) return;
			if (!containerRef.current.contains(e.target as Node)) setOpen(false);
		}
		window.addEventListener("click", onClick);
		return () => window.removeEventListener("click", onClick);
	}, []);

	const searchResults = useMemo(() => {
		if (!query.trim()) return { teams: [], products: [], suggestions: trending.slice(0, 6) };
		const q = query.toLowerCase();

		// Search teams
		const allTeams = [...footballTeams, ...basketballTeams];
		const matchingTeams = allTeams
			.filter((team) => team.name.toLowerCase().includes(q))
			.slice(0, 3);

		// Search products
		const matchingProducts = products
			.filter((p) =>
				p.name.toLowerCase().includes(q) ||
				p.team?.toLowerCase().includes(q)
			)
			.slice(0, 3);

		// Search suggestions
		const matchingSuggestions = [...trending, ...recent]
			.filter((s, i, arr) => arr.indexOf(s) === i)
			.filter((s) => s.toLowerCase().includes(q))
			.slice(0, 4);

		return { teams: matchingTeams, products: matchingProducts, suggestions: matchingSuggestions };
	}, [query, recent]);

	function submit(value: string) {
		const val = value.trim();
		if (!val) return;
		const next = [val, ...recent.filter((r) => r.toLowerCase() !== val.toLowerCase())].slice(0, 6);
		setRecent(next);
		try {
			localStorage.setItem(recentKey, JSON.stringify(next));
		} catch { }
		setOpen(false);
		setQuery("");
		router.push(`/search?q=${encodeURIComponent(val)}`);
	}

	function clearRecent() {
		setRecent([]);
		try {
			localStorage.removeItem(recentKey);
		} catch { }
	}

	return (
		<div ref={containerRef} className="relative w-full max-w-[560px]">
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
					<Search className="h-5 w-5 text-zinc-600" />
				</div>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setOpen(true)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && query.trim()) {
							submit(query);
						}
					}}
					placeholder="What can we help you find?"
					className="h-11 w-full rounded-full border border-zinc-300 bg-white pl-11 pr-4 text-sm text-zinc-900 outline-none placeholder:text-zinc-500 focus:border-zinc-400 focus:ring-0 sm:pl-12"
				/>
			</div>
			<div
				className={cn(
					"absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-xl",
					open ? "block" : "hidden"
				)}
			>
				{query.trim() ? (
					<div className="max-h-96 overflow-y-auto">
						{/* Teams */}
						{searchResults.teams.length > 0 && (
							<div className="border-b border-zinc-100">
								<div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase">Teams</div>
								{searchResults.teams.map((team) => (
									<Link
										key={team.id}
										href={`/teams/${team.id}`}
										onClick={() => setOpen(false)}
										className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
									>
										<div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold">
											{team.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
										</div>
										<div>
											<div className="font-medium">{team.name}</div>
											<div className="text-xs text-zinc-500">{team.league}</div>
										</div>
									</Link>
								))}
							</div>
						)}

						{/* Products */}
						{searchResults.products.length > 0 && (
							<div className="border-b border-zinc-100">
								<div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase">Products</div>
								{searchResults.products.map((product) => (
									<Link
										key={product.id}
										href={`/products/${product.id}`}
										onClick={() => setOpen(false)}
										className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
									>
										<div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-zinc-100">
											{product.images?.[0] && (
												<img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
											)}
										</div>
										<div className="min-w-0 flex-1">
											<div className="truncate font-medium">{product.name}</div>
											<div className="text-xs text-zinc-500">₵{product.price.toFixed(2)}</div>
										</div>
									</Link>
								))}
							</div>
						)}

						{/* Suggestions */}
						{searchResults.suggestions.length > 0 && (
							<div>
								<div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase">Suggestions</div>
								{searchResults.suggestions.map((s) => (
									<button
										key={s}
										className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => submit(s)}
									>
										<Search className="h-4 w-4 text-zinc-400" />
										{s}
									</button>
								))}
							</div>
						)}

						{searchResults.teams.length === 0 && searchResults.products.length === 0 && searchResults.suggestions.length === 0 && (
							<div className="px-3 py-6 text-center text-sm text-zinc-500">No results found</div>
						)}
					</div>
				) : (
					<div className="max-h-80 overflow-y-auto">
						{recent.length > 0 && (
							<div>
								<div className="flex items-center justify-between px-3 py-2">
									<div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase">
										<Clock className="h-3 w-3" />
										Recent Searches
									</div>
									<button
										onClick={clearRecent}
										className="text-xs text-zinc-500 hover:text-zinc-700"
									>
										Clear
									</button>
								</div>
								{recent.map((s) => (
									<button
										key={s}
										className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
										onMouseDown={(e) => e.preventDefault()}
										onClick={() => submit(s)}
									>
										<Clock className="h-4 w-4 text-zinc-400" />
										{s}
									</button>
								))}
							</div>
						)}
						<div className="border-t border-zinc-100">
							<div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-zinc-500 uppercase">
								<TrendingUp className="h-3 w-3" />
								Trending
							</div>
							{trending.slice(0, 6).map((s) => (
								<button
									key={s}
									className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50"
									onMouseDown={(e) => e.preventDefault()}
									onClick={() => submit(s)}
								>
									<TrendingUp className="h-4 w-4 text-zinc-400" />
									{s}
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}


