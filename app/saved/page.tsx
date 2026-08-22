import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { SavedContent } from "@/components/saved-content";

export const metadata: Metadata = { title: "Saved spaces and searches" };

export default function SavedPage() {
  return (
    <section className="saved-page">
      <div className="shell">
        <div className="page-heading"><span className="eyebrow"><Icon name="bookmark" size={15} /> Your shortlist</span><h1>Saved on this device</h1><p>Favorites and searches stay in this browser until account storage is connected.</p></div>
        <SavedContent />
      </div>
    </section>
  );
}
