"use client";

const sports = [
	{ id: "nfl", label: "NFL", emoji: "🏈" },
	{ id: "ncaa", label: "College", emoji: "🎓" },
	{ id: "mlb", label: "MLB", emoji: "⚾" },
	{ id: "nba", label: "NBA", emoji: "🏀" },
	{ id: "nhl", label: "NHL", emoji: "🏒" },
	{ id: "soccer", label: "Soccer", emoji: "⚽" },
	{ id: "wwe", label: "WWE", emoji: "💪" },
	{ id: "wnba", label: "WNBA", emoji: "🏀" },
	{ id: "motorsports", label: "Motorsports", emoji: "🏎️" },
	{ id: "collectibles", label: "Collectibles", emoji: "🎁" },
	{ id: "sale", label: "Sale", emoji: "💸" },
	{ id: "jerseys", label: "Jerseys", emoji: "🎽" },
	{ id: "gifts", label: "Gifts", emoji: "🎁" }
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


