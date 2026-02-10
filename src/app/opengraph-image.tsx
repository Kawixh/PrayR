import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PrayR daily prayer times";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at 20% 10%, #c6fff6 0%, #6db7ba 40%, #10232a 100%)",
          color: "#08171d",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "center",
          padding: "64px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid rgba(8, 23, 29, 0.18)",
            borderRadius: "999px",
            fontSize: 28,
            letterSpacing: 3,
            marginBottom: 28,
            padding: "12px 28px",
            textTransform: "uppercase",
          }}
        >
          PrayR
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 920,
            textAlign: "center",
          }}
        >
          Accurate Daily Prayer Times
        </div>
        <div
          style={{
            fontSize: 34,
            marginTop: 18,
            opacity: 0.9,
            textAlign: "center",
          }}
        >
          Fajr, Dhuhr, Asr, Maghrib, Isha
        </div>
      </div>
    ),
    size,
  );
}
