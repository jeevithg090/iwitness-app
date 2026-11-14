import { ImageResponse } from "next/og";

export const alt = "SafeReport: Anonymous incident reporting";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "radial-gradient(circle at 50% 0%, #0c4a6e 0%, #070709 60%)",
        color: "#f5f5f5",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 18,
            background: "linear-gradient(135deg, #38bdf8, #2563eb)",
          }}
        />
        SafeReport
      </div>
      <div style={{ marginTop: 48, fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
        Report incidents.
      </div>
      <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.1, color: "#38bdf8" }}>
        Protect your identity.
      </div>
      <div style={{ marginTop: 36, fontSize: 30, color: "#a1a1aa" }}>
        Anonymous reporting with AI-assisted drafting and private status tracking.
      </div>
    </div>,
    size,
  );
}
