/**
 * Structured data. Rendered server-side only, so nothing ships to the client
 * beyond the script tag itself.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is our own content, serialised  -  not user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
