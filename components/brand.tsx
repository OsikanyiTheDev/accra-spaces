import Link from "next/link";

export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Accra Spaces home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 36 36" role="img">
          <path d="M5 27V14.5L18 6l13 8.5V27" />
          <path d="M11 27V16l7-4 7 4v11M15 27v-6h6v6" />
        </svg>
      </span>
      <span>Accra <strong>Spaces</strong></span>
    </Link>
  );
}
