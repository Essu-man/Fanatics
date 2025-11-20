import { Share2, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
    title: string;
    url?: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleShare = (platform: "facebook" | "twitter" | "whatsapp") => {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedTitle = encodeURIComponent(title);

        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
        };

        window.open(urls[platform], "_blank", "width=600,height=400");
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-700">Share:</span>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleShare("facebook")}
                    className="rounded-lg p-2 text-zinc-600 hover:bg-blue-50 hover:text-blue-600"
                    title="Share on Facebook"
                >
                    <Facebook className="h-4 w-4" />
                </button>
                <button
                    onClick={() => handleShare("twitter")}
                    className="rounded-lg p-2 text-zinc-600 hover:bg-sky-50 hover:text-sky-600"
                    title="Share on Twitter"
                >
                    <Twitter className="h-4 w-4" />
                </button>
                <button
                    onClick={() => handleShare("whatsapp")}
                    className="rounded-lg p-2 text-zinc-600 hover:bg-green-50 hover:text-green-600"
                    title="Share on WhatsApp"
                >
                    <Share2 className="h-4 w-4" />
                </button>
                <button
                    onClick={handleCopyLink}
                    className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100"
                    title="Copy link"
                >
                    <LinkIcon className="h-4 w-4" />
                </button>
            </div>
            {copied && (
                <span className="text-xs font-medium text-green-600">Copied!</span>
            )}
        </div>
    );
}
