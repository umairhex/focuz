import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(145deg, #1a1916, #252420)",
        borderRadius: "36px",
      }}
    >
      <div
        style={{
          width: "130px",
          height: "130px",
          borderRadius: "50%",
          border: "4px solid rgba(74,103,65,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            border: "3.5px solid #4a6741",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "44px",
              color: "#8fb58a",
              fontFamily: "Georgia, serif",
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 1,
              display: "flex",
            }}
          >
            I
          </div>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
