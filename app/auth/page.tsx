import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { getAuthConfig, getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Account access", description: "Verified email and password account access for seekers, landlords and agents." };

const ERROR_MESSAGES: Record<string, string> = {
  invalid_callback: "The sign-in callback could not be verified. Please try again.",
  not_configured: "Account access is not connected in this environment yet.",
  token_exchange_failed: "Sign-in could not be completed. Please try again.",
};

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = Boolean(getAuthConfig());
  const session = await getSession();

  return (
    <section className="auth-page">
      <div className="shell auth-layout">
        <div className="auth-story">
          <span className="eyebrow eyebrow-light"><Icon name="shield" size={16} /> One account, clear roles</span>
          <h1>Save what matters. Post with accountability.</h1>
          <p>Verified email and password access supports favorites, saved searches, viewing requests and transparent landlord or agent posting.</p>
          <ul>
            <li><Icon name="bookmark" size={18} /><span><strong>Seekers</strong>Save spaces and searches, then send structured requests.</span></li>
            <li><Icon name="building" size={18} /><span><strong>Landlords</strong>Choose the role once, prepare listings and manage interest.</span></li>
            <li><Icon name="tag" size={18} /><span><strong>Agents</strong>Choose the role once and disclose commission on every listing.</span></li>
          </ul>
          <p className="auth-honesty"><Icon name="info" size={15} /> Landlord and Agent are self-declared account roles, not KYC or property verification.</p>
        </div>
        <div className="auth-card">
          <span className="auth-lock"><Icon name="shield" size={28} /></span>
          <span className="section-kicker">Secure account access</span>
          <h2>{session ? "You are signed in" : "Continue with verified email"}</h2>
          {error && <p className="auth-error" role="alert">{ERROR_MESSAGES[error] ?? "Sign-in could not be completed."}</p>}
          {session ? (
            <>
              <p>Signed in as <strong>{session.email}</strong>. Your current account role is {session.role}.</p>
              <Link className="button button-gold button-full" href="/account">Open my account <Icon name="arrow-right" size={17} /></Link>
              <a className="text-link" href="/api/auth/logout">Sign out</a>
            </>
          ) : (
            <>
              <p>{configured ? "Use your email and password. New accounts confirm the verification code sent to their email." : "Account access is not connected in this environment yet."}</p>
              <div className="auth-status-list">
                <span><Icon name="check" size={16} /> Verified email + password</span>
                <span><Icon name="check" size={16} /> Verification code confirmation by email</span>
              </div>
              {configured ? <a className="button button-dark button-full" href="/api/auth/login">Sign in or create account <Icon name="arrow-right" size={17} /></a> : <button className="button button-dark button-full is-disabled" type="button" disabled>Sign in or create account</button>}
              <small>{configured ? "Your password is handled securely by the account service." : "No password or personal information is collected by this preview."}</small>
              <Link className="text-link" href="/">Continue exploring instead</Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
