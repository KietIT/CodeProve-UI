import { apiFetch } from "./client";
import type { DashboardOut } from "@/lib/types/dashboard";

export const getDashboard = () => apiFetch<DashboardOut>("/dashboard");
