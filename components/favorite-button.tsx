"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

const KEY = "accra-spaces:favorites";

export function FavoriteButton({ listingId, compact = false }: { listingId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
    setSaved(ids.includes(listingId));
  }, [listingId]);

  function toggle() {
    const ids = new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[]);
    if (ids.has(listingId)) ids.delete(listingId);
    else ids.add(listingId);
    localStorage.setItem(KEY, JSON.stringify([...ids]));
    setSaved(ids.has(listingId));
    window.dispatchEvent(new Event("accra-spaces:saved"));
  }

  return (
    <button className={`favorite-button ${saved ? "is-saved" : ""} ${compact ? "is-compact" : ""}`} type="button" onClick={toggle} aria-pressed={saved} aria-label={saved ? "Remove from saved listings" : "Save listing"}>
      <Icon name="heart" size={compact ? 18 : 20} fill={saved ? "currentColor" : "none"} />
      {!compact && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
