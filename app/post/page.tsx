import type { Metadata } from "next";
import { Icon } from "@/components/icons";
import { PostListingForm } from "@/components/post-listing-form";

export const metadata: Metadata = { title: "Post a listing", description: "Prepare a clear property listing with transparent terms and day/night photo slots." };

export default function PostPage() {
  return (
    <>
      <section className="page-hero page-hero-post">
        <div className="shell page-hero-inner">
          <div><span className="eyebrow"><span className="eyebrow-dot" /> Clear listings get clearer enquiries</span><h1>Present your space with the details people ask for.</h1><p>Structured GHS pricing, maintenance responsibility, agent terms and dedicated day/night photo slots—all in one listing.</p></div>
          <aside><Icon name="shield" size={22} /><div><strong>Honest by design</strong><p>Account role and listing completeness are shown without claiming identity or property verification.</p></div></aside>
        </div>
      </section>
      <section className="post-page-section">
        <div className="shell narrow-shell">
          <div className="preview-callout"><Icon name="info" size={18} /><p><strong>Build preview:</strong> local draft saving works now. Publishing and photo upload stay disabled until Cognito and the reviewed AWS infrastructure are deployed.</p></div>
          <PostListingForm />
        </div>
      </section>
    </>
  );
}
