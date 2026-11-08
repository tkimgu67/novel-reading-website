import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="hnw-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8DE5D6" />
          <stop offset="1" stopColor="#20B2AA" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#0d1414" stroke="url(#hnw-g)" strokeOpacity=".5" />
      <path d="M9 12.5c3.8-1.6 7.6-1.2 11 1.3v15c-3.4-2.5-7.2-2.9-11-1.3v-15Z" fill="url(#hnw-g)" opacity=".9" />
      <path d="M31 12.5c-3.8-1.6-7.6-1.2-11 1.3v15c3.4-2.5 7.2-2.9 11-1.3v-15Z" fill="url(#hnw-g)" opacity=".55" />
      <circle cx="29" cy="9" r="1.6" fill="#8DE5D6" />
    </svg>
  );
}

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="HeyNovelWorld home">
      <LogoMark className={size === "lg" ? "h-11 w-11" : "h-9 w-9"} />
      <span className={`font-display font-bold tracking-tight ${size === "lg" ? "text-2xl" : "text-xl"}`}>
        Hey<span className="text-sea transition-colors group-hover:text-mint">Novel</span>World
      </span>
    </Link>
  );
}
