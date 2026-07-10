import { ImageResponse } from "next/og";
import { getPost } from "@/lib/posts";

export const alt = "SEO Forge blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "SEO Forge — Field notes";
  const tag = post?.tag ?? "SEO Forge";

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
        <div
          style={{
            display: "flex",
            width: "fit-content",
            fontSize: 24,
            fontWeight: 600,
            color: "#3b82f6",
            background: "rgba(59,130,246,0.15)",
            borderRadius: 999,
            padding: "8px 22px",
          }}
        >
          {tag}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#e6eaf2",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#f59e0b",
            }}
          />
          <div style={{ display: "flex", fontSize: 26, color: "#9aa4b8" }}>
            SEO<span style={{ color: "#3b82f6" }}>Forge</span> · Field notes
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
