import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1a1916",
        borderRadius: "6px",
      }}
    >
      <div
        style={{
          width: "26px",
          height: "26px",
          borderRadius: "50%",
          border: "2.5px solid #4a6741",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: "12px",
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
    </div>,
    { ...size },
  );
}
