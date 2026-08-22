"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

export function RoleSelector() {
  const [role, setRole] = useState<"landlord" | "agent">("landlord");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState("");

  async function selectRole() {
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/backend/me/role", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const payload = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Role selection failed");
      setStatus("saved");
      setMessage(payload.message ?? "Role selected. Sign in again to refresh permissions.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Role selection failed");
    }
  }

  if (status === "saved") {
    return (
      <div className="role-selected" role="status">
        <Icon name="check" size={21} />
        <div><strong>{role === "agent" ? "Agent" : "Landlord"} role selected</strong><p>{message}</p><a className="button button-dark button-small" href="/api/auth/logout">Sign out to refresh role</a></div>
      </div>
    );
  }

  return (
    <div className="role-selector">
      <div className="role-selector-heading"><span className="section-kicker">One-time choice</span><h2>Do you want to post spaces?</h2><p>Choose one posting role. This is a self-declared account label—not identity or property verification.</p></div>
      <div className="role-options">
        <label className={role === "landlord" ? "is-selected" : ""}><input type="radio" name="posting-role" value="landlord" checked={role === "landlord"} onChange={() => setRole("landlord")} /><Icon name="building" size={21} /><span><strong>Landlord</strong><small>Post spaces you control or own.</small></span></label>
        <label className={role === "agent" ? "is-selected" : ""}><input type="radio" name="posting-role" value="agent" checked={role === "agent"} onChange={() => setRole("agent")} /><Icon name="tag" size={21} /><span><strong>Agent</strong><small>Post with clear commission terms.</small></span></label>
      </div>
      <button className="button button-gold" type="button" disabled={status === "saving"} onClick={selectRole}>{status === "saving" ? "Saving…" : "Confirm this role"}<Icon name="arrow-right" size={17} /></button>
      {message && <p className="form-notice" role="status">{message}</p>}
    </div>
  );
}
