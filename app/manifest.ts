import type { MetadataRoute } from "next";

// Installed to the home screen, the app runs in "standalone" display mode:
// no Safari address bar or tab strip, which is what makes it read as a real
// app rather than a bookmark.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stock Manager",
    short_name: "Stock",
    description: "Manage stock, sales, and expenses",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf7f2",
    theme_color: "#b45309",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Extra padding so Android can crop to a circle/squircle without
      // clipping the glyph.
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
