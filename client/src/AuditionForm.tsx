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
    <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
      <input
        className="flex-1 rounded-md border border-stone-300 p-2"
        placeholder="Project Title"
        value={projectTitle}
        onChange={(e) => setProjectTitle(e.target.value)}
        required
      />
      <input
        className="flex-1 rounded-md border border-stone-300 p-2"
        placeholder="Role"
        value={roleName}
        onChange={(e) => setRoleName(e.target.value)}
        required
      />
      <input
        className="flex-1 rounded-md border border-stone-300 p-2"
        placeholder="date"
        value={auditionDate}
        onChange={(e) => setAuditionDate(e.target.value)}
        required
      />
      <button
        type="submit"
        className="rounded-md bg-stone-800 px-4 py-2 text-white"
      >
        Add audition
      </button>
    </form>
  );
}
