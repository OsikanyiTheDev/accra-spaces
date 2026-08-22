import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { RoleSelector } from "@/components/role-selector";
import { getAuthConfig, getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const configured = Boolean(getAuthConfig());
  const session = await getSession();

  return (
    <section className="account-page">
      <div className="shell account-shell">
        <div className="page-heading"><span className="eyebrow"><Icon name="shield" size={15} /> Account</span><h1>Your Accra Spaces account</h1><p>Manage your role and the actions connected to your verified email.</p></div>

        {!configured ? (
          <div className="account-state"><Icon name="info" size={25} /><div><h2>Authentication is ready in code, not deployed</h2><p>Add the reviewed Cognito outputs to the server environment after AWS deployment. No account can be created in this preview.</p><Link href="/">Continue exploring</Link></div></div>
        ) : !session ? (
          <div className="account-state"><Icon name="shield" size={25} /><div><h2>Sign in to open your account</h2><p>Cognito will verify your email before account actions are available.</p><a className="button button-dark" href="/api/auth/login">Sign in or create account</a></div></div>
        ) : (
          <div className="account-grid">
            <aside className="account-summary">
              <span className="account-avatar">{(session.name ?? session.email ?? "A").charAt(0).toUpperCase()}</span>
              <small>Signed in with verified email</small>
              <h2>{session.name ?? "Accra Spaces member"}</h2>
              <p>{session.email}</p>
              <dl><div><dt>Current role</dt><dd>{session.role}</dd></div><div><dt>Identity verification</dt><dd>Not offered in v1</dd></div></dl>
              <a className="button button-quiet button-full" href="/api/auth/logout">Sign out</a>
            </aside>
            <div className="account-main">
              {session.role === "admin" ? (
                <div className="role-selected account-role-card"><Icon name="shield" size={22} /><div><span className="section-kicker">Manually assigned</span><h2>Admin account</h2><p>Admin is not a public posting role and cannot be selected through account onboarding.</p></div></div>
              ) : session.canPost ? (
                <div className="role-selected account-role-card"><Icon name="check" size={22} /><div><span className="section-kicker">Posting enabled</span><h2>{session.role === "agent" ? "Agent" : "Landlord"} account</h2><p>This role is self-declared and does not carry a verified badge. Listing completeness remains separate.</p><Link className="button button-gold" href="/post">Post a space <Icon name="arrow-right" size={16} /></Link></div></div>
              ) : <RoleSelector />}
              <div className="account-actions"><article><Icon name="heart" size={20} /><h3>Saved listings</h3><p>Keep a shortlist on this device; account sync follows after API deployment.</p><Link href="/saved">Open saved</Link></article><article><Icon name="calendar" size={20} /><h3>Viewing requests</h3><p>Authenticated requests will appear here after the backend is deployed.</p><span>Prepared, not live</span></article></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
