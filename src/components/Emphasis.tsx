import { Fragment } from "react";

/**
 * Renders *asterisk* spans as italics. Emphasis in this system is italic, never
 * a heavier cut, and titles inside CV bullets need it.
 */
export function Emphasis({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("*") && part.endsWith("*") && part.length > 2 ? (
          <em key={i}>{part.slice(1, -1)}</em>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
