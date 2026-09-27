import { redirect } from "next/navigation";

// Coming soon: the team is focusing on students first. Restore the PersonaPage
// render (personaKey="employers") and its metadata when this audience launches.
export default function EmployersPage() {
  redirect("/students");
}
