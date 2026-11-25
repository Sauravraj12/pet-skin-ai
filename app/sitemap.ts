import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/check`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/how-it-works`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/demo`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
