import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pa Ndambi Paul Angemba Memorial",
    short_name: "Pa Ndambi Memorial",
    description: "Celebrating the Life and Legacy of Pa Ndambi Paul Angemba",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c9a44c",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
