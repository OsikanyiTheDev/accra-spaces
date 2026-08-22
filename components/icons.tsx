import type { SVGProps } from "react";

type IconName =
  | "arrow-right"
  | "search"
  | "map-pin"
  | "bed"
  | "bath"
  | "ruler"
  | "heart"
  | "shield"
  | "moon"
  | "sun"
  | "whatsapp"
  | "phone"
  | "calendar"
  | "tag"
  | "check"
  | "bookmark"
  | "clock"
  | "building"
  | "upload"
  | "chevron-down"
  | "info";

const paths: Record<IconName, React.ReactNode> = {
  "arrow-right": <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></>,
  "map-pin": <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  bed: <><path d="M3 19v-8h18v8"/><path d="M3 15h18M5 11V7h5a3 3 0 0 1 3 3v1M3 19v2M21 19v2"/></>,
  bath: <><path d="M4 12h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6v-2ZM7 12V5a2 2 0 0 1 4 0"/><path d="M4 20v1M20 20v1"/></>,
  ruler: <><path d="m4 17 13-13 3 3L7 20l-3-3Z"/><path d="m13 8 3 3M10 11l2 2M7 14l3 3"/></>,
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
  shield: <><path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  moon: <path d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  whatsapp: <><path d="M21 11.5a9 9 0 0 1-13.4 7.9L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z"/><path d="M8.2 8.1c.3 4 3.5 7 7.5 7.6l1.2-1.8-2.5-1.2-.9 1c-1.6-.6-2.8-1.8-3.4-3.4l1-1L10 6.9 8.2 8.1Z"/></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L9.1 10.8a16 16 0 0 0 4.1 4.1l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  tag: <><path d="M20 13 13 20l-9-9V4h7l9 9Z"/><circle cx="8.5" cy="8.5" r="1.2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  bookmark: <path d="M6 3h12v18l-6-4-6 4V3Z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  building: <><path d="M4 21V7l8-4 8 4v14M9 21v-4h6v4"/><path d="M8 9h1M12 9h1M16 9h1M8 13h1M12 13h1M16 13h1"/></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 15v5h16v-5"/></>,
  "chevron-down": <path d="m6 9 6 6 6-6"/>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
