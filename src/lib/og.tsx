/**
 * The shared share-card composition  -  ground, hairline, one accent rule  - 
 * reused by the root card and every per-route override so a link shared from
 * any page carries its own title instead of the generic positioning line.
 * Cormorant is not available to the OG renderer, so it falls back to the
 * serif the token stack already names.
 */
export function ShareCard({
  kicker,
  title,
  footer,
}: {
  kicker: string;
  title: string;
  footer: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f3f2f2",
        color: "#201f1d",
        padding: "72px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          fontSize: 22,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#7d7979",
        }}
      >
        {kicker}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ height: 1, background: "#b68235", width: 120 }} />
        <div
          style={{
            fontSize: 62,
            lineHeight: 1.1,
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "#605d5d" }}>{footer}</div>
    </div>
  );
}
