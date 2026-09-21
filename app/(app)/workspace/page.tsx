import type { Metadata } from "next";
import { WorkspaceLanding } from "@/components/app/WorkspaceLanding";

export const metadata: Metadata = { title: "Workspace" };

export default function WorkspacePage() {
  return <WorkspaceLanding />;
}
