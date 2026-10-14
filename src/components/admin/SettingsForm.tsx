"use client";

import type { SiteSettings } from "@/lib/types";
import { isPlaceholderPositioning } from "@/lib/text";
import { Dialog } from "./Dialog";
import { ImageField } from "./ImageField";
import { useDraft } from "./useDraft";
import styles from "./admin.module.css";

export function SettingsForm({
  settings,
  writable,
}: {
  settings: SiteSettings;
  writable: boolean;
}) {
  const { draft, set, dirty, busy, savedAt, commit, guard } = useDraft({
    writable,
    // Settings is a singleton live document with no draft copy, so a silent
    // autosave would publish half-finished edits.
    autosave: false,
    initial: {
      name: settings.name,
      positioning: settings.positioning,
      role: settings.role,
      location: settings.location,
      locationShort: settings.locationShort,
      availability: settings.availability,
      about: settings.about.join("\n\n"),
      email: settings.email,
      phone: settings.phone,
      phoneHref: settings.phoneHref,
      resumeUrl: settings.resumeUrl,
      contactHeadline: settings.contactHeadline,
      linkedin: settings.links.linkedin,
      github: settings.links.github,
      youtube: settings.links.youtube,
      facebook: settings.links.facebook,
      portrait: settings.portrait ?? null,
      portraitAssetId:
        (settings.portrait as { assetId?: string } | null)?.assetId ?? null,
    },
    save: async (next) => {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: next.name,
          positioning: next.positioning,
          role: next.role,
          location: next.location,
          locationShort: next.locationShort,
          availability: next.availability,
          about: next.about.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean),
          email: next.email,
          phone: next.phone,
          phoneHref: next.phoneHref,
          resumeUrl: next.resumeUrl,
          contactHeadline: next.contactHeadline,
          links: {
            linkedin: next.linkedin,
            github: next.github,
            youtube: next.youtube,
            facebook: next.facebook,
          },
          portrait: next.portraitAssetId
            ? {
                _type: "image",
                asset: { _type: "reference", _ref: next.portraitAssetId },
                alt: `${next.name}  -  portrait`,
              }
            : null,
        }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "The save did not go through.");
      }
    },
  });

  const placeholderPositioning = isPlaceholderPositioning(draft.positioning);

  return (
    <>
      <form className={styles.settingsBlock} onSubmit={(event) => event.preventDefault()}>
        <div className="kick">Identity</div>

        <div className={styles.identityRow}>
          <ImageField
            label="Portrait"
            image={draft.portrait}
            writable={writable}
            onChange={(asset) => {
              set("portraitAssetId", asset?.id ?? null);
              set("portrait", asset ? { url: asset.url, alt: `${draft.name}  -  portrait` } : null);
            }}
          />
        </div>

        <Text id="name" label="Name" value={draft.name} onChange={(v) => set("name", v)} />

        <div className="field" data-invalid={placeholderPositioning ? "true" : undefined}>
          <label htmlFor="positioning">
            Positioning line  -  shows as the home headline
          </label>
          <input
            id="positioning"
            className="input"
            value={draft.positioning}
            placeholder="Write the one sentence the home page opens with"
            onChange={(event) => set("positioning", event.target.value)}
          />
          {placeholderPositioning ? (
            <div className="field-error">
              Still the placeholder. This is the first thing a visitor reads.
            </div>
          ) : null}
        </div>

        <div className={styles.formRow}>
          <Text id="role" label="Role" value={draft.role} onChange={(v) => set("role", v)} />
          <Text
            id="availability"
            label="Availability"
            value={draft.availability}
            onChange={(v) => set("availability", v)}
          />
        </div>

        <div className={styles.formRow}>
          <Text id="location" label="Location" value={draft.location} onChange={(v) => set("location", v)} />
          <Text
            id="locationShort"
            label="Location  -  sidebar"
            value={draft.locationShort}
            onChange={(v) => set("locationShort", v)}
          />
        </div>

        <Text
          id="about"
          label="About  -  a blank line starts a new paragraph"
          value={draft.about}
          onChange={(v) => set("about", v)}
          rows={7}
        />

        <Text
          id="contactHeadline"
          label="Contact headline"
          value={draft.contactHeadline}
          onChange={(v) => set("contactHeadline", v)}
        />

        <div className="hr" />
        <div className="kick">Links</div>

        <div className={styles.formRow}>
          <Text id="email" label="Email" value={draft.email} onChange={(v) => set("email", v)} />
          <Text id="phone" label="Phone" value={draft.phone} onChange={(v) => set("phone", v)} tnum />
        </div>
        <div className={styles.formRow}>
          <Text id="linkedin" label="LinkedIn" value={draft.linkedin} onChange={(v) => set("linkedin", v)} />
          <Text id="github" label="GitHub" value={draft.github} onChange={(v) => set("github", v)} />
        </div>
        <div className={styles.formRow}>
          <Text id="youtube" label="YouTube" value={draft.youtube} onChange={(v) => set("youtube", v)} />
          <Text id="facebook" label="Facebook" value={draft.facebook} onChange={(v) => set("facebook", v)} />
        </div>

        <Text
          id="resumeUrl"
          label="Résumé PDF  -  the Drive link the hero button points at"
          value={draft.resumeUrl}
          onChange={(v) => set("resumeUrl", v)}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void commit()}
            disabled={busy || !dirty || !writable}
          >
            {busy ? "Saving…" : "Save"}
          </button>
          {savedAt ? <span className="kick tnum">Saved {savedAt}</span> : null}
          {dirty ? <span className="tag tag-accent">Unsaved changes</span> : null}
        </div>
      </form>

      <Dialog
        open={guard.open}
        title="Leave without saving?"
        onClose={guard.stay}
        actions={
          <>
            <button type="button" className="btn btn-ghost" onClick={guard.stay}>
              Stay
            </button>
            <button type="button" className="btn btn-secondary" onClick={guard.leave}>
              Leave
            </button>
            <button type="button" className="btn btn-primary" onClick={guard.publishAndLeave}>
              Save and leave
            </button>
          </>
        }
      >
        Site settings have unsaved edits. The live site will not change until
        they are saved.
      </Dialog>
    </>
  );
}

function Text({
  id,
  label,
  value,
  onChange,
  rows,
  tnum,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  tnum?: boolean;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {rows ? (
        <textarea
          id={id}
          className="input"
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          className={`input ${tnum ? "tnum" : ""}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}
