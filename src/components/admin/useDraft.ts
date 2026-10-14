"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";

type Options<T> = {
  initial: T;
  /**
   * Persist the draft. `silent` marks an autosave, which must not promote a
   * draft to published. Resolves to a path when the save moved the document.
   */
  save: (draft: T, options: { silent: boolean }) => Promise<string | void>;
  writable: boolean;
  /**
   * Whether a silent background save is even possible. Posts have a real
   * `drafts.` document to write autosaves into; projects and settings do not
   * (projects use a `hidden` flag, settings is a singleton), so silently
   * "saving" there would patch the live document. Default true; editors
   * without a draft document must pass false.
   */
  autosave?: boolean;
};

/**
 * Draft state for the two editors: dirty tracking, autosave, an explicit save,
 * and the guard that stops a navigation losing unsaved edits.
 */
export function useDraft<T extends object>({
  initial,
  save,
  writable,
  autosave = true,
}: Options<T>) {
  const router = useRouter();
  const toast = useToast();

  const [draft, setDraft] = useState<T>(initial);
  const [saved, setSaved] = useState<T>(initial);
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  const draftRef = useRef(draft);
  draftRef.current = draft;
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const commit = useCallback(
    async (options: { silent?: boolean } = {}) => {
      if (!writable) {
        toast(
          "Studio is read-only  -  connect Sanity to save.",
          options.silent ? "neutral" : "error",
        );
        return false;
      }

      const snapshot = draftRef.current;
      setBusy(true);
      try {
        const movedTo = await save(snapshot, { silent: options.silent === true });
        setSaved(snapshot);
        setSavedAt(
          new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
        );
        if (!options.silent) toast("Published. Live in ~30 seconds.", "success");
        else toast("Autosaved as draft", "neutral");
        if (typeof movedTo === "string") router.replace(movedTo);
        router.refresh();
        return true;
      } catch (error) {
        toast(
          error instanceof Error ? error.message : "Could not save.",
          "error",
        );
        return false;
      } finally {
        setBusy(false);
      }
    },
    [router, save, toast, writable],
  );

  // Autosave four seconds after typing stops, and only when there is something
  // to persist  -  an idle editor should not write. Skipped entirely where a
  // silent save would have nowhere safe to land (see `autosave` above); the
  // dirty-tracking below still guards against losing those edits.
  useEffect(() => {
    if (!dirty || !writable || !autosave) return;
    const timer = window.setTimeout(() => void commit({ silent: true }), 4000);
    return () => window.clearTimeout(timer);
  }, [dirty, draft, commit, writable, autosave]);

  // A full page unload gets the browser's own prompt…
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // …and an in-app link gets the designed dialog. Capturing the click is the
  // only hook the App Router gives us before the transition starts.
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest("a");
      const href = anchor?.getAttribute("href");
      if (!anchor || !href || anchor.target === "_blank") return;
      if (!href.startsWith("/") || href.startsWith("//")) return;
      if (href === window.location.pathname) return;

      event.preventDefault();
      setPendingHref(href);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  const leave = useCallback(() => {
    const href = pendingHref;
    setPendingHref(null);
    setSaved(draftRef.current); // Stop the guard re-firing on the way out.
    if (href) router.push(href);
  }, [pendingHref, router]);

  const publishAndLeave = useCallback(async () => {
    const ok = await commit();
    if (ok) leave();
    else setPendingHref(null);
  }, [commit, leave]);

  return {
    draft,
    set,
    setDraft,
    dirty,
    busy,
    savedAt,
    commit,
    guard: {
      open: pendingHref !== null,
      stay: () => setPendingHref(null),
      leave,
      publishAndLeave,
    },
  };
}
