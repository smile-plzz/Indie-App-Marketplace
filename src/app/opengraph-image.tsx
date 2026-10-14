import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/content";
import { ShareCard } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Md. Ismail Hossain";

export default async function Image() {
  const settings = await getSettings();

  return new ImageResponse(
    (
      <ShareCard
        kicker={settings.name}
        title={settings.positioning}
        footer={`${settings.role} · ${settings.locationShort}`}
      />
    ),
    size,
  );
}
