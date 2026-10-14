"use client";

import { useState, type KeyboardEvent } from "react";

/** Tags as removable chips plus one "+ add" affordance. */
export function TagInput({
  id,
  value,
  onChange,
  writable = true,
}: {
  id: string;
  value: string[];
  onChange: (next: string[]) => void;
  writable?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
    setAdding(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      setDraft("");
      setAdding(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
      {value.map((tag) => (
        <span key={tag} className="tag tag-accent">
          {tag}
          {writable ? (
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
              style={{
                background: "none",
                border: 0,
                cursor: "pointer",
                color: "inherit",
                font: "inherit",
                marginLeft: 6,
                padding: 0,
              }}
            >
              ×
            </button>
          ) : null}
        </span>
      ))}
      {writable ? (
        adding ? (
          <input
            id={id}
            className="input"
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={onKeyDown}
            style={{ width: 140, minHeight: 26, fontSize: 12, padding: "2px 8px" }}
          />
        ) : (
          <button type="button" className="tag tag-outline" onClick={() => setAdding(true)}>
            + add
          </button>
        )
      ) : null}
    </div>
  );
}
