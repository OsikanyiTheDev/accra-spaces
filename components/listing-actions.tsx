"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Icon } from "@/components/icons";
import { formatGhs, whatsappHref } from "@/lib/format";
import type { ListingDetail, ResultSource } from "@/lib/types";

export function ListingActions({ listing, source, signedIn }: { listing: ListingDetail; source: ResultSource; signedIn: boolean }) {
  const [tab, setTab] = useState<"viewing" | "offer">("viewing");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);
  const liveContact = source === "api" && listing.poster.whatsapp;

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setNotice("");
    if (source === "demo") {
      setNotice("Preview only—no request was sent. Illustrative listings cannot be contacted or booked.");
      return;
    }
    if (!signedIn) {
      setNotice("Sign in with a verified email before sending this request.");
      return;
    }

    const data = new FormData(formElement);
    const payload = tab === "viewing"
      ? {
          contact_name: String(data.get("contact_name") ?? ""),
          whatsapp: String(data.get("whatsapp") ?? ""),
          date_time: String(data.get("date_time") ?? ""),
          note: String(data.get("note") ?? ""),
        }
      : {
          contact_name: String(data.get("contact_name") ?? ""),
          whatsapp: String(data.get("whatsapp") ?? ""),
          amount_ghs: Number(data.get("amount_ghs")),
          note: String(data.get("note") ?? ""),
        };
    const path = tab === "viewing" ? "viewing-requests" : "offers";

    setSending(true);
    try {
      const response = await fetch(`/api/backend/listings/${listing.id}/${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await response.json() as { error?: string; details?: string[] };
      if (!response.ok) throw new Error(body.details?.join(" ") ?? body.error ?? "Request could not be sent");
      formElement.reset();
      setNotice(tab === "viewing" ? "Viewing request sent to the poster." : "Offer sent to the poster.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Request could not be sent");
    } finally {
      setSending(false);
    }
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

      <form className="action-form" onSubmit={submitRequest}>
        <label><span>Your name</span><input required name="contact_name" minLength={2} maxLength={80} placeholder="Name for the poster" /></label>
        <label><span>WhatsApp number</span><input required name="whatsapp" inputMode="tel" pattern="\+?[0-9]{9,15}" placeholder="+233…" /></label>
        {tab === "viewing" ? (
          <>
            <label><span>Preferred date and time</span><input required type="datetime-local" name="date_time" /></label>
            <label><span>Short note</span><textarea name="note" rows={3} maxLength={500} placeholder="For example: weekday after 5 pm" /></label>
          </>
        ) : (
          <>
            <label><span>Your offer (GHS)</span><input required type="number" name="amount_ghs" min="1" placeholder="Enter amount" /></label>
            <label><span>Note</span><textarea name="note" rows={3} maxLength={500} placeholder="Add any conditions or context" /></label>
          </>
        )}
        <button className="button button-dark button-full" type="submit" disabled={sending}>
          <Icon name={tab === "viewing" ? "calendar" : "tag"} size={18} /> {sending ? "Sending…" : tab === "viewing" ? "Send viewing request" : "Send offer"}
        </button>
        <p className="auth-required"><Icon name="shield" size={14} /> Verified email sign-in is required to send.</p>
        {notice && <p className="form-notice" role="status">{notice} {!signedIn && source !== "demo" && <Link href="/auth">Go to sign in</Link>}</p>}
      </form>
    </aside>
  );
}
