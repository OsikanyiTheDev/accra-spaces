import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "Account access", description: "Account access for seekers, landlords and agents." };

export default function AuthPage() {
  return (
    <section className="auth-page">
      <div className="shell auth-layout">
        <div className="auth-story">
          <span className="eyebrow eyebrow-light"><Icon name="shield" size={16} /> One account, clear roles</span>
          <h1>Save what matters. Post with accountability.</h1>
          <p>Account access supports favorites, saved searches, viewing requests and transparent landlord or agent posting.</p>
          <ul>
            <li><Icon name="bookmark" size={18} /><span><strong>Seekers</strong>Save spaces and searches, then send structured requests.</span></li>
            <li><Icon name="building" size={18} /><span><strong>Landlords</strong>Prepare listings and manage interest in one place.</span></li>
            <li><Icon name="tag" size={18} /><span><strong>Agents</strong>Disclose commission terms on every agent listing.</span></li>
          </ul>
          <p className="auth-honesty"><Icon name="info" size={15} /> Account roles are self-declared in v1 and are not KYC verification.</p>
        </div>
        <div className="auth-card">
          <span className="auth-lock"><Icon name="shield" size={28} /></span>
          <span className="section-kicker">Secure account access</span>
          <h2>Sign-in connection is prepared</h2>
          <p>Cognito infrastructure is defined in Terraform, but no AWS environment has been applied. Account creation remains disabled until the plan is reviewed and deployed.</p>
          <div className="auth-status-list">
            <span><Icon name="check" size={16} /> Email verification planned</span>
            <span><Icon name="check" size={16} /> Seeker, landlord and agent roles</span>
            <span><Icon name="check" size={16} /> JWT-protected posting routes</span>
          </div>
          <button className="button button-dark button-full is-disabled" type="button" disabled>Continue with email</button>
          <small>No password or personal information is collected by this preview.</small>
          <Link className="text-link" href="/">Continue exploring instead</Link>
        </div>
      </div>
    </section>
  );
}
