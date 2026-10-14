import Image from "next/image";
import type { ImageRef } from "@/lib/types";

type Props = {
  image: ImageRef;
  height: number | string;
  width?: number | string;
  /**
   * Shown instead of a graphic when there is no screenshot yet. The numeral
   * carries the rank the missing image would have carried; the tags say what
   * the thing is. The title is deliberately not repeated  -  it already sits
   * directly below in the card, and twice is worse than once.
   */
  fallbackNumber?: string;
  fallbackTags?: string[];
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/**
 * The image wrapper  -  a warm archival grade inside a thin surface mat, so
 * photographs read as tipped-in book plates. Every content photograph goes
 * through this.
 *
 * Nine of fourteen projects have no screenshot yet, so the no-image case is a
 * typographic panel built from the same primitives  -  never a placeholder
 * graphic and never an emoji.
 */
export function Plate({
  image,
  height,
  width,
  fallbackNumber,
  fallbackTags,
  priority,
  sizes = "(max-width: 1023px) 100vw, 50vw",
  className,
}: Props) {
  const h = typeof height === "number" ? `${height}px` : height;
  const w = typeof width === "number" ? `${width}px` : width;

  if (!image) {
    return (
      <div
        className={className}
        style={{
          height: h,
          width: w,
          flex: w ? "none" : undefined,
          border: "1px solid var(--color-divider)",
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "20px 24px",
          textAlign: "center",
        }}
      >
        {fallbackNumber ? (
          <span
            className="tnum"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 400,
              fontSize: 46,
              lineHeight: 1,
              color: "var(--color-meta)",
            }}
          >
            {fallbackNumber}
          </span>
        ) : null}
        {fallbackTags?.length ? (
          <span className="kick" style={{ color: "var(--color-meta)" }}>
            {fallbackTags.join(" · ")}
          </span>
        ) : null}
        {fallbackNumber || fallbackTags?.length ? (
          <span
            style={{
              fontSize: 11.5,
              fontStyle: "italic",
              color: "var(--color-meta)",
            }}
          >
            No screenshot yet
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`plate ${className ?? ""}`}
      style={{ height: h, width: w, flex: w ? "none" : undefined }}
    >
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

/** A plate around an already-known remote thumbnail (YouTube stills). */
export function ThumbPlate({
  src,
  alt,
  height,
}: {
  src: string;
  alt: string;
  height: number;
}) {
  return (
    <div className="plate" style={{ height }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 1023px) 50vw, 240px"
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
