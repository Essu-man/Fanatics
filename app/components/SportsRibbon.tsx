"use client";

const sports = [
	{ id: "premier-league", label: "Premier League", emoji: "⚽" },
	{ id: "la-liga", label: "La Liga", emoji: "⚽" },
	{ id: "bundesliga", label: "Bundesliga", emoji: "⚽" },
	{ id: "serie-a", label: "Serie A", emoji: "⚽" },
	{ id: "ligue-1", label: "Ligue 1", emoji: "⚽" },
	{ id: "national-teams", label: "National Teams", emoji: "🌍" },
	{ id: "mens", label: "Men's", emoji: "👔" },
	{ id: "womens", label: "Women's", emoji: "👗" },
	{ id: "kids", label: "Kids", emoji: "👶" },
	{ id: "authentic", label: "Authentic", emoji: "⭐" },
	{ id: "sale", label: "Sale", emoji: "💸" },
	{ id: "new-arrivals", label: "New Arrivals", emoji: "🆕" }
];

export default function SportsRibbon() {
	return (
		<div className="border-b border-zinc-200 bg-white">
			<div className="mx-auto max-w-7xl px-6 py-3">
				<div className="flex snap-x gap-6 overflow-x-auto pb-1">
					{sports.map((s) => (
						<button
							key={s.id}
							className="flex min-w-[72px] snap-start flex-col items-center gap-2"
							aria-label={s.label}
						>
							<span className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-200 bg-white text-lg">
								{s.emoji}
							</span>
							<span className="text-[11px] font-medium text-zinc-700">{s.label}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}


