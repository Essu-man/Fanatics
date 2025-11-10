"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import cn from "../../lib/cn";

const trending = ["Black Stars", "Messi", "Real Madrid", "Chelsea", "PSG", "Man United"];
const recentKey = "cediman:recentSearches";

export default function SearchAutocomplete() {
	const [query, setQuery] = useState("");
	const [open, setOpen] = useState(false);
	const [recent, setRecent] = useState<string[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(recentKey);
			if (raw) setRecent(JSON.parse(raw));
		} catch {}
	}, []);

	useEffect(() => {
		function onClick(e: MouseEvent) {
			if (!containerRef.current) return;
			if (!containerRef.current.contains(e.target as Node)) setOpen(false);
		}
		window.addEventListener("click", onClick);
		return () => window.removeEventListener("click", onClick);
	}, []);

	const suggestions = useMemo(() => {
		if (!query.trim()) return trending.slice(0, 6);
		const q = query.toLowerCase();
		return [...trending, ...recent].filter((s, i, arr) => arr.indexOf(s) === i).filter((s) => s.toLowerCase().includes(q)).slice(0, 8);
	}, [query, recent]);

	function submit(value: string) {
		const val = value.trim();
		if (!val) return;
		const next = [val, ...recent.filter((r) => r.toLowerCase() !== val.toLowerCase())].slice(0, 6);
		setRecent(next);
		try {
			localStorage.setItem(recentKey, JSON.stringify(next));
		} catch {}
		setOpen(false);
		// TODO: route to search results page
	}

	return (
		<div ref={containerRef} className="relative w-full max-w-[560px]">
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
					<Search className="h-5 w-5 text-zinc-500" />
				</div>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setOpen(true)}
					placeholder="What can we help you find?"
					className="h-11 w-full rounded-full border-0 bg-white pl-11 pr-4 text-sm text-zinc-900 shadow-sm outline-none ring-1 ring-zinc-200 placeholder:text-zinc-500 focus:ring-[var(--brand-navy-600)]"
				/>
			</div>
			<div
				className={cn(
					"absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-xl",
					open ? "block" : "hidden"
				)}
			>
				{(query ? suggestions.length > 0 : recent.length > 0) ? (
					<div className="max-h-80 overflow-y-auto py-2">
						{(query ? suggestions : recent).map((s) => (
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
				) : (
					<div className="px-3 py-6 text-center text-sm text-zinc-500">Try searching for your team or player</div>
				)}
			</div>
		</div>
	);
}


