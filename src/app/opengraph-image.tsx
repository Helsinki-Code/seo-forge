import { ImageResponse } from "next/og";

export const alt = "SEO Forge — Autonomous SEO Mission Control";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#050507",
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(59,130,246,0.35), transparent 45%), radial-gradient(circle at 85% 85%, rgba(245,158,11,0.25), transparent 45%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "#f59e0b",
            }}
          />
          <div style={{ display: "flex", fontSize: 42, fontWeight: 700, color: "#e6eaf2" }}>
            SEO<span style={{ color: "#3b82f6" }}>Forge</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 60,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#e6eaf2",
            maxWidth: 980,
          }}
        >
          Your website, optimized while you sleep.
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 28,
            color: "#9aa4b8",
            maxWidth: 900,
          }}
        >
          Autonomous SEO agents · Human-approved deploys
        </div>
      </div>
    ),
    { ...size }
  );
}
