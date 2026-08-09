import { useState, type SubmitEvent } from "react";
import type { Audition } from "./types";

type Props = {
  onCreated: (audition: Audition) => void;
};

export function AuditionForm({ onCreated }: Props) {
  const [projectTitle, setProjectTitle] = useState("");
  const [roleName, setRoleName] = useState("");
  const [auditionDate, setAuditionDate] = useState("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const res = await fetch("/api/auditions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_title: projectTitle,
        role_name: roleName,
        audition_date: auditionDate || null,
      }),
    });
    if (!res.ok) {
      console.error("Failed to save audition:", await res.text());
      return;
    }

    const created: Audition = await res.json();
    onCreated(created);
    setProjectTitle("");
    setRoleName("");
    setAuditionDate("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Project Title"
        value={projectTitle}
        onChange={(e) => setProjectTitle(e.target.value)}
        required
      />
      <input
        placeholder="Role"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
        required
      />
      <input
        placeholder="date"
        value={auditionDate}
        onChange={(e) => setAuditionDate(e.target.value)}
        required
      />
      <button type="submit">Add audition</button>
    </form>
  );
}
