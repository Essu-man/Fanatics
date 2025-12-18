import Link from "next/link";

export default function Breadcrumb({ league, team }: { league?: { id: string; name: string }, team?: { id: string; name: string } }) {
    return (
        <nav className="flex items-center gap-2 text-sm text-zinc-600 mb-4" aria-label="Breadcrumb">
            <Link href="/shop" className="hover:underline">Back</Link>
            {league && (
                <>
                    <span className="mx-1">/</span>
                    <Link href={`/shop?league=${encodeURIComponent(league.id)}`} className="hover:underline">
                        {league.name}
                    </Link>
                </>
            )}
            {team && (
                <>
                    <span className="mx-1">/</span>
                    <span className="font-semibold text-zinc-900">{team.name}</span>
                </>
            )}
        </nav>
    );
}
