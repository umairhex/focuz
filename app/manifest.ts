import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Interval — Focus Timer & Productivity Tracker",
    short_name: "Interval",
    description:
      "A distraction-free focus timer with interval tracking, productivity logging, notes and todos.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f2ee",
    theme_color: "#4a6741",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
