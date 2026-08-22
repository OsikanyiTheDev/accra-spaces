import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { PostListingForm } from "@/components/post-listing-form";
import { getAuthConfig, getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Post a listing", description: "Prepare a clear property listing with transparent terms and day/night photo slots." };

export default async function PostPage() {
  const configured = Boolean(getAuthConfig());
  const session = await getSession();
  const accountRole = session?.role === "landlord" || session?.role === "agent" ? session.role : undefined;

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
          {!configured ? (
            <div className="preview-callout"><Icon name="info" size={18} /><p><strong>Build preview:</strong> local draft saving works now. Publishing remains unavailable until the reviewed Cognito and API deployment is connected.</p></div>
          ) : !session ? (
            <div className="preview-callout"><Icon name="shield" size={18} /><p><strong>Sign-in required:</strong> you can prepare and save a local draft, but must <Link href="/auth">sign in with verified email</Link> before publishing.</p></div>
          ) : !accountRole ? (
            <div className="preview-callout"><Icon name="info" size={18} /><p><strong>Posting role required:</strong> choose Landlord or Agent once in <Link href="/account">My Account</Link> before publishing.</p></div>
          ) : null}
          <PostListingForm signedIn={Boolean(session)} accountRole={accountRole} accountEmail={session?.email} />
        </div>
      </section>
    </>
  );
}
