import type { ListingSummary } from "@/lib/types";

interface PropertyVisualProps {
  listing: ListingSummary;
  night?: boolean;
  label?: string;
  imageUrl?: string;
  priority?: boolean;
}

export function PropertyVisual({ listing, night = false, label, imageUrl, priority = false }: PropertyVisualProps) {
  if (imageUrl) {
    return (
      <div className="property-visual property-visual-photo">
        {/* Signed S3 URLs are short lived, so browser-native loading is intentional. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={label ?? listing.title} loading={priority ? "eager" : "lazy"} />
      </div>
    );
  }

  const variant = listing.visual ?? listing.type;
  return (
    <div className={`property-visual visual-${variant} ${night ? "is-night" : "is-day"}`} role="img" aria-label={label ?? `Illustrative ${night ? "night" : "day"} view`}>
      <svg viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`sky-${listing.id}-${night ? "n" : "d"}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={night ? "#18202a" : "#dad9cd"} />
            <stop offset="1" stopColor={night ? "#56452d" : "#f0c786"} />
          </linearGradient>
          <linearGradient id={`ground-${listing.id}-${night ? "n" : "d"}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={night ? "#151816" : "#72735f"} />
            <stop offset="1" stopColor={night ? "#27271f" : "#4e553c"} />
          </linearGradient>
        </defs>
        <rect width="640" height="400" fill={`url(#sky-${listing.id}-${night ? "n" : "d"})`} />
        {night ? <circle cx="525" cy="70" r="24" fill="#f3dfb0" opacity=".9" /> : <circle cx="525" cy="70" r="32" fill="#fff2be" opacity=".8" />}
        <path d="M0 295C130 270 210 285 320 272s210-5 320 15v113H0Z" fill={`url(#ground-${listing.id}-${night ? "n" : "d"})`} />
        <path d="M95 270V145l78-48 80 48v125Z" fill={night ? "#332d24" : "#a47741"} />
        <path d="M173 97 95 145h158Z" fill={night ? "#1e211f" : "#493721"} />
        <rect x="135" y="186" width="38" height="84" rx="2" fill={night ? "#e2b969" : "#38260f"} />
        <rect x="194" y="166" width="32" height="38" rx="2" fill={night ? "#f3d28b" : "#c5d4ce"} />
        <path d="M245 270V133h212v137Z" fill={night ? "#383a34" : "#d9d5c8"} />
        <path d="M230 145h245l-20-30H255Z" fill={night ? "#171918" : "#6e6653"} />
        {[0, 1, 2].map((row) => [0, 1, 2, 3].map((col) => (
          <rect key={`${row}-${col}`} x={274 + col * 43} y={158 + row * 39} width="25" height="23" rx="2" fill={night ? (col + row) % 2 ? "#dcae59" : "#65706e" : "#73837e"} opacity={night ? ".9" : ".72"} />
        )))}
        <rect x="357" y="230" width="42" height="40" fill={night ? "#e4b55f" : "#5b4630"} />
        <path d="M60 302h520" stroke={night ? "#8c7952" : "#c6b287"} strokeWidth="6" strokeLinecap="round" opacity=".65" />
        <g fill={night ? "#151b16" : "#425136"}>
          <path d="M65 286c0-49 16-90 29-90s29 41 29 90Z" />
          <path d="M505 290c0-58 17-105 33-105s33 47 33 105Z" />
        </g>
        <g stroke={night ? "#f0c66f" : "#342718"} strokeWidth="4" strokeLinecap="round">
          <path d="M46 289v-56M30 244h32" />
          <path d="M586 296v-64M570 244h32" />
        </g>
        {night && <g fill="#f7d88e"><circle cx="30" cy="244" r="7"/><circle cx="62" cy="244" r="7"/><circle cx="570" cy="244" r="7"/><circle cx="602" cy="244" r="7"/></g>}
      </svg>
      {listing.is_demo && <span className="visual-demo-label">Illustrative preview</span>}
    </div>
  );
}
