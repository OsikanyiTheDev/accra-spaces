"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Icon } from "@/components/icons";
import { formatGhs, whatsappHref } from "@/lib/format";
import type { ListingDetail, ResultSource } from "@/lib/types";

export function ListingActions({ listing, source }: { listing: ListingDetail; source: ResultSource }) {
  const [tab, setTab] = useState<"viewing" | "offer">("viewing");
  const [notice, setNotice] = useState("");
  const liveContact = source === "api" && listing.poster.whatsapp;

  function previewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(source === "demo"
      ? "Preview only—no request was sent. This form will use authenticated API requests after deployment."
      : "Sign in is required before this authenticated request can be sent.");
  }

  return (
    <aside className="action-card">
      <div className="action-card-price">
        <span>{listing.sale_mode === "rent" ? "Monthly rent" : "Asking price"}</span>
        <strong>{formatGhs(listing.price_ghs)}</strong>
        {listing.negotiable && <small>Price marked negotiable</small>}
      </div>

      <div className="contact-buttons">
        {liveContact ? (
          <a className="button button-whatsapp" href={whatsappHref(listing.poster.whatsapp!, listing.title)} target="_blank" rel="noreferrer">
            <Icon name="whatsapp" size={19} /> WhatsApp
          </a>
        ) : (
          <span className="button button-whatsapp is-disabled" aria-disabled="true"><Icon name="whatsapp" size={19} /> WhatsApp</span>
        )}
        {source === "api" && listing.poster.phone ? (
          <a className="button button-quiet" href={`tel:${listing.poster.phone}`}><Icon name="phone" size={18} /> Call</a>
        ) : (
          <span className="button button-quiet is-disabled" aria-disabled="true"><Icon name="phone" size={18} /> Call</span>
        )}
      </div>
      {source !== "api" && <p className="contact-preview-note">Contact actions are disabled for illustrative listings.</p>}

      <div className="action-tabs" role="tablist" aria-label="Listing actions">
        <button type="button" className={tab === "viewing" ? "is-active" : ""} onClick={() => { setTab("viewing"); setNotice(""); }}>Book viewing</button>
        <button type="button" className={tab === "offer" ? "is-active" : ""} onClick={() => { setTab("offer"); setNotice(""); }}>Make an offer</button>
      </div>

      <form className="action-form" onSubmit={previewSubmit}>
        {tab === "viewing" ? (
          <>
            <label><span>Preferred date and time</span><input required type="datetime-local" name="date_time" /></label>
            <label><span>Short note</span><textarea name="note" rows={3} placeholder="For example: weekday after 5 pm" /></label>
          </>
        ) : (
          <>
            <label><span>Your offer (GHS)</span><input required type="number" name="amount_ghs" min="1" placeholder="Enter amount" /></label>
            <label><span>Note</span><textarea name="note" rows={3} placeholder="Add any conditions or context" /></label>
          </>
        )}
        <button className="button button-dark button-full" type="submit">
          <Icon name={tab === "viewing" ? "calendar" : "tag"} size={18} /> {tab === "viewing" ? "Continue to request" : "Continue with offer"}
        </button>
        <p className="auth-required"><Icon name="shield" size={14} /> Verified email sign-in is required to send.</p>
        {notice && <p className="form-notice" role="status">{notice} <Link href="/auth">Go to sign in</Link></p>}
      </form>
    </aside>
  );
}
