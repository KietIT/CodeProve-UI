import type { MetadataRoute } from "next";

const base = "https://codeprove.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/students", "/universities", "/employers", "/pricing", "/privacy", "/terms"];
  const now = new Date();
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: r === "" ? 1 : 0.7,
  }));
}
