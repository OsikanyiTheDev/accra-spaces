"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";
import type { SearchParams } from "@/lib/types";

const KEY = "accra-spaces:saved-searches";

export function SaveSearchButton({ params }: { params: SearchParams }) {
  const [message, setMessage] = useState("");

  function save() {
    const active = Object.fromEntries(Object.entries(params).filter(([, value]) => Boolean(value)));
    if (Object.keys(active).length === 0) {
      setMessage("Choose at least one filter first.");
      return;
    }
    const current = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Array<{ id: string; params: SearchParams }>;
    const signature = JSON.stringify(active);
    if (!current.some((item) => JSON.stringify(item.params) === signature)) {
      current.unshift({ id: crypto.randomUUID(), params: active });
      localStorage.setItem(KEY, JSON.stringify(current.slice(0, 10)));
      window.dispatchEvent(new Event("accra-spaces:saved"));
    }
    setMessage("Search saved on this device.");
  }

  return (
    <div className="save-search-wrap">
      <button className="button button-quiet search-save-button" type="button" onClick={save}>
        <Icon name="bookmark" size={17} /> Save this search
      </button>
      <span className="save-search-message" role="status">{message}</span>
    </div>
  );
}
