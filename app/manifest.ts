import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Prayerly",
    short_name: "Prayerly",
    description: "Your prayer and reminder app",
    start_url: "/home",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#fafafa",
    orientation: "portrait",
    icons: [
      {
        src: "/images/icon.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
        purpose: "any",
      },
      {
        src: "/images/icon.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
