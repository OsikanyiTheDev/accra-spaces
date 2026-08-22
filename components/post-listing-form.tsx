"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { AMENITIES, AREAS, PROPERTY_TYPES } from "@/lib/constants";

const DRAFT_KEY = "accra-spaces:listing-draft";
type Draft = Record<string, string | string[]>;

export function PostListingForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<Draft>({});
  const [ready, setReady] = useState(false);
  const [role, setRole] = useState("landlord");
  const [notice, setNotice] = useState("");
  const [dayFiles, setDayFiles] = useState<string[]>([]);
  const [nightFiles, setNightFiles] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(DRAFT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Draft;
        setDraft(parsed);
        setRole(typeof parsed.role === "string" ? parsed.role : "landlord");
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
    setReady(true);
  }, []);

  function saveDraft() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const value: Draft = {};
    data.forEach((entry, key) => {
      if (entry instanceof File) return;
      if (key === "amenities") {
        const current = Array.isArray(value[key]) ? value[key] as string[] : [];
        value[key] = [...current, entry];
      } else value[key] = entry;
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
    setDraft(value);
    setNotice("Draft saved locally on this device. Photos are not stored in the browser draft.");
  }

  function submitPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("No listing was published. Sign-in and the reviewed AWS deployment must be connected before publishing is enabled.");
  }

  function text(name: string): string {
    return typeof draft[name] === "string" ? draft[name] as string : "";
  }

  function checked(name: string): boolean {
    return Array.isArray(draft.amenities) && draft.amenities.includes(name);
  }

  return (
    <form ref={formRef} key={ready ? "ready" : "loading"} className="post-form" onSubmit={submitPreview}>
      <section className="form-section">
        <div className="form-section-heading"><span>01</span><div><h2>Who is posting?</h2><p>Account type is shown honestly and does not mean identity-verified.</p></div></div>
        <div className="form-grid">
          <label className="field"><span>Your name</span><input required name="poster_name" defaultValue={text("poster_name")} placeholder="Name shown on the listing" /></label>
          <label className="field"><span>Email</span><input required type="email" name="email" defaultValue={text("email")} placeholder="you@example.com" /></label>
          <label className="field"><span>Phone</span><input required name="phone" defaultValue={text("phone")} placeholder="+233…" /></label>
          <label className="field"><span>WhatsApp number</span><input required name="whatsapp" defaultValue={text("whatsapp")} placeholder="+233…" /></label>
          <label className="field"><span>Role</span><select name="role" value={role} onChange={(event) => setRole(event.target.value)}><option value="landlord">Landlord</option><option value="agent">Agent</option></select></label>
          {role === "agent" && <label className="field"><span>Posting with landlord permission?</span><select name="landlord_permission" defaultValue={text("landlord_permission") || "yes"}><option value="yes">Yes</option><option value="no">Not yet</option></select></label>}
        </div>
        {role === "agent" && (
          <div className="nested-fields">
            <h3>Agent commission</h3>
            <div className="form-grid form-grid-three">
              <label className="field"><span>Commission type</span><select name="commission_type" defaultValue={text("commission_type") || "one_month_rent"}><option value="one_month_rent">One month’s rent</option><option value="percentage">Percentage</option><option value="flat_fee">Flat fee</option><option value="none">None</option></select></label>
              <label className="field"><span>Value</span><input name="commission_value" type="number" min="0" defaultValue={text("commission_value")} placeholder="For example, 10" /></label>
              <label className="field"><span>Notes</span><input name="commission_note" defaultValue={text("commission_note")} placeholder="For example, on completion" /></label>
            </div>
          </div>
        )}
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>02</span><div><h2>Describe the space</h2><p>Use the terms seekers need to compare confidently.</p></div></div>
        <div className="form-grid">
          <label className="field field-full"><span>Listing title</span><input required name="title" defaultValue={text("title")} placeholder="For example, bright two-bedroom apartment near Oxford Street" /></label>
          <label className="field"><span>For</span><select name="sale_mode" defaultValue={text("sale_mode") || "rent"}><option value="rent">Rent</option><option value="sale">Sale</option></select></label>
          <label className="field"><span>Property type</span><select name="type" defaultValue={text("type") || "apartment"}>{PROPERTY_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label>
          <label className="field"><span>Price (GHS)</span><input required name="price_ghs" type="number" min="1" defaultValue={text("price_ghs")} placeholder="0" /></label>
          <label className="field"><span>Price flexibility</span><select name="negotiable" defaultValue={text("negotiable") || "false"}><option value="false">Fixed</option><option value="true">Negotiable</option></select></label>
          <label className="field"><span>Deposit months</span><input required name="deposit_months" type="number" min="0" max="24" defaultValue={text("deposit_months")} placeholder="2" /></label>
          <label className="field"><span>Maintenance policy</span><select name="maintenance_policy" defaultValue={text("maintenance_policy") || "landlord_annual"}><option value="landlord_annual">Annual maintenance by landlord</option><option value="tenant_deduct">Tenant handles and deducts later</option><option value="included">Included</option></select></label>
          <label className="field"><span>Bedrooms</span><input name="beds" type="number" min="0" max="20" defaultValue={text("beds")} placeholder="0" /></label>
          <label className="field"><span>Bathrooms</span><input name="baths" type="number" min="0" max="20" defaultValue={text("baths")} placeholder="0" /></label>
          <label className="field"><span>Size (m²)</span><input name="size_m2" type="number" min="1" defaultValue={text("size_m2")} placeholder="Optional" /></label>
          <label className="field"><span>Exterior colour / note</span><input name="color" defaultValue={text("color")} placeholder="Optional" /></label>
          <label className="field field-full"><span>Description</span><textarea required name="description" rows={5} defaultValue={text("description")} placeholder="Describe access, surroundings and the details a visitor should know." /></label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>03</span><div><h2>Location and address</h2><p>Exact directions should be confirmed directly before a visit.</p></div></div>
        <div className="form-grid">
          <label className="field"><span>Area / neighbourhood</span><select required name="area" defaultValue={text("area")}><option value="" disabled>Select an area</option>{AREAS.map((area) => <option key={area} value={area}>{area}</option>)}</select></label>
          <label className="field"><span>GhanaPost Digital Address</span><input name="digital_address" defaultValue={text("digital_address")} pattern="[A-Za-z]{2}-[0-9]{3}-[0-9]{4,5}" placeholder="GA-123-4567" /></label>
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>04</span><div><h2>Amenities</h2><p>Select only what is present and working.</p></div></div>
        <div className="amenity-checkbox-grid">
          {AMENITIES.map(([value, label]) => <label key={value}><input type="checkbox" name="amenities" value={value} defaultChecked={checked(value)} /><span><Icon name="check" size={15} /> {label}</span></label>)}
        </div>
      </section>

      <section className="form-section">
        <div className="form-section-heading"><span>05</span><div><h2>Day and night photos</h2><p>Separate slots set a clear expectation for lighting and street visibility.</p></div></div>
        <div className="upload-grid">
          <label className="upload-box"><Icon name="sun" size={25} /><strong>Day photos</strong><span>JPEG, PNG or WebP · up to 5 MB each</span><input type="file" name="day_photos" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setDayFiles(Array.from(event.target.files ?? []).map((file) => file.name))} />{dayFiles.length > 0 && <small>{dayFiles.length} file{dayFiles.length === 1 ? "" : "s"} selected</small>}</label>
          <label className="upload-box upload-night"><Icon name="moon" size={25} /><strong>Night photos</strong><span>Show lighting and street visibility honestly</span><input type="file" name="night_photos" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setNightFiles(Array.from(event.target.files ?? []).map((file) => file.name))} />{nightFiles.length > 0 && <small>{nightFiles.length} file{nightFiles.length === 1 ? "" : "s"} selected</small>}</label>
        </div>
        <p className="upload-privacy"><Icon name="shield" size={15} /> Uploads will use a private S3 bucket and constrained signed requests after AWS deployment. Selecting files in this preview does not upload them.</p>
      </section>

      <div className="form-actions-sticky">
        <div><strong>Not ready to publish?</strong><span>Keep the text fields as a local browser draft.</span></div>
        <button className="button button-quiet" type="button" onClick={saveDraft}><Icon name="bookmark" size={17} /> Save draft</button>
        <button className="button button-gold" type="submit">Sign in to publish <Icon name="arrow-right" size={17} /></button>
      </div>
      {notice && <p className="form-notice post-form-notice" role="status">{notice}</p>}
    </form>
  );
}
