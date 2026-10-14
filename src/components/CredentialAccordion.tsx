"use client";

import { useState } from "react";
import type { Credential } from "@/lib/types";
import styles from "./CredentialAccordion.module.css";

/**
 * The one accordion on the public site  -  fifteen certificates listed flat
 * would dominate the page, and the issuer is more useful than the items.
 * All groups start collapsed; the count carries the information either way.
 */
export function CredentialAccordion({
  groups,
}: {
  groups: { group: string; items: Credential[] }[];
}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      {groups.map(({ group, items }) => {
        const expanded = open === group;
        const panelId = `cred-panel-${slugify(group)}`;
        const buttonId = `cred-button-${slugify(group)}`;

        return (
          <div key={group} className={styles.group}>
            <h3 className={styles.heading}>
              <button
                type="button"
                id={buttonId}
                className={styles.trigger}
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? null : group)}
              >
                <span className={styles.triggerLeft}>
                  <span className={styles.issuer}>{group}</span>
                  <span className="kick tnum">
                    {items.length} {items.length === 1 ? "certificate" : "certificates"}
                  </span>
                </span>
                <span className="kick">{expanded ? "Collapse" : "Expand"}</span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!expanded}
              className={styles.panel}
            >
              {items.map((item) => (
                <div key={item.name} className={styles.item}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemMeta}>
                    <span className="kick tnum">{item.date}</span>
                    {item.verifyUrl ? (
                      <a
                        href={item.verifyUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 13 }}
                      >
                        Verify
                      </a>
                    ) : (
                      <span className="kick">Certified</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
