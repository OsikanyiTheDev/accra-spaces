"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import type { SearchParams } from "@/lib/types";

interface SavedSearch { id: string; params: SearchParams }

function searchLabel(params: SearchParams): string {
  return [params.type, params.mode === "sale" ? "for sale" : params.mode === "rent" ? "for rent" : "", params.area, params.beds ? `${params.beds}+ beds` : ""].filter(Boolean).join(" · ") || "Saved search";
}

export function SavedContent() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  function load() {
    setFavorites(JSON.parse(localStorage.getItem("accra-spaces:favorites") ?? "[]") as string[]);
    setSearches(JSON.parse(localStorage.getItem("accra-spaces:saved-searches") ?? "[]") as SavedSearch[]);
  }

  useEffect(() => {
    load();
    window.addEventListener("accra-spaces:saved", load);
    return () => window.removeEventListener("accra-spaces:saved", load);
  }, []);

  function removeFavorite(id: string) {
    const next = favorites.filter((item) => item !== id);
    localStorage.setItem("accra-spaces:favorites", JSON.stringify(next));
    setFavorites(next);
  }

  function removeSearch(id: string) {
    const next = searches.filter((item) => item.id !== id);
    localStorage.setItem("accra-spaces:saved-searches", JSON.stringify(next));
    setSearches(next);
  }

  return (
    <div className="saved-grid">
      <section className="saved-panel">
        <div className="saved-panel-heading"><span className="saved-icon"><Icon name="heart" size={20} /></span><div><h2>Saved listings</h2><p>Stored only in this browser for now.</p></div></div>
        {favorites.length ? <ul className="saved-list">{favorites.map((id) => <li key={id}><Link href={`/listings/${id}`}><Icon name="building" size={17} /><span>{id.startsWith("demo-") ? "Illustrative listing" : "Saved property"}<small>{id}</small></span></Link><button type="button" onClick={() => removeFavorite(id)}>Remove</button></li>)}</ul> : <div className="saved-empty"><p>No saved listings yet.</p><Link href="/#spaces">Explore spaces</Link></div>}
      </section>
      <section className="saved-panel">
        <div className="saved-panel-heading"><span className="saved-icon"><Icon name="bookmark" size={20} /></span><div><h2>Saved searches</h2><p>Alerts are planned for a later release.</p></div></div>
        {searches.length ? <ul className="saved-list">{searches.map((search) => { const query = new URLSearchParams(Object.entries(search.params).filter((entry): entry is [string, string] => Boolean(entry[1]))); return <li key={search.id}><Link href={`/?${query.toString()}#spaces`}><Icon name="search" size={17} /><span>{searchLabel(search.params)}<small>Apply these filters</small></span></Link><button type="button" onClick={() => removeSearch(search.id)}>Remove</button></li>; })}</ul> : <div className="saved-empty"><p>No saved searches yet.</p><Link href="/#search">Build a search</Link></div>}
      </section>
    </div>
  );
}
