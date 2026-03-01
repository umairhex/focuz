import { ImageResponse } from "next/og";

export const alt = "Interval — Focus Timer & Productivity Tracker";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #1a1916, #2a2824)",
        fontFamily: "Georgia, serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(74,103,65,0.25) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
        }}
      />

      <div
        style={{
          width: "140px",
          height: "140px",
          borderRadius: "50%",
          border: "4px solid rgba(74,103,65,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            border: "3px solid #4a6741",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "42px",
            color: "#8fb58a",
            fontStyle: "italic",
          }}
        >
          25:00
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            fontSize: "72px",
            color: "#f0ede6",
            fontStyle: "italic",
            letterSpacing: "-0.02em",
          }}
        >
          Inter
        </span>
        <span
          style={{
            fontSize: "72px",
            color: "#4a6741",
            fontStyle: "italic",
            letterSpacing: "-0.02em",
          }}
        >
          val
        </span>
      </div>

      <div
        style={{
          fontSize: "24px",
          color: "rgba(240,237,230,0.5)",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          display: "flex",
        }}
      >
        Focus Timer & Productivity Tracker
      </div>

      {/* Bottom pill badges */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "36px",
        }}
      >
        {["Intervals", "Notes", "Todos", "Analytics"].map((label) => (
          <div
            key={label}
            style={{
              padding: "8px 20px",
              borderRadius: "100px",
              background: "rgba(74,103,65,0.18)",
              border: "1px solid rgba(74,103,65,0.3)",
              color: "#8fb58a",
              fontSize: "16px",
              letterSpacing: "0.03em",
              display: "flex",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
