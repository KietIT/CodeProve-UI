import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Preview } from "./preview";

export const metadata: Metadata = {
  title: "UI Preview",
  robots: { index: false, follow: false },
  icons: { icon: "data:," },
};
export default function UIPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Preview />;
}
