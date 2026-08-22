import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <section className="page-state shell">
      <span className="empty-icon"><Icon name="building" size={32} /></span>
      <span className="section-kicker">Not found</span>
      <h1>That space is not available here.</h1>
      <p>The link may be old, the listing may be disabled, or the property ID may be incorrect.</p>
      <Link className="button button-dark" href="/#spaces">Explore spaces</Link>
    </section>
  );
}
