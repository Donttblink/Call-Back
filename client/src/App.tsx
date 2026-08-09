import { useEffect, useState } from "react";
import "./App.css";
import type { Audition } from "./types";
import { AuditionForm } from "./AuditionForm";

const STATUSES = ["upcoming", "submitted", "callback", "booked", "passed"];

function App() {
  const [auditions, setAuditions] = useState<Audition[]>([]);

  useEffect(() => {
    fetch("/api/auditions")
      .then((res) => res.json())
      .then(setAuditions);
  }, []);

  async function handleStatusChange(id: number, status: string) {
    const res = await fetch(`/api/auditions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      console.error("Failed to update status:", await res.text());
      return;
    }
    const updated: Audition = await res.json();
    setAuditions((prev) => prev.map((a) => (a.id === id ? updated : a)));
  }
  async function handleDelete(id: number) {
    const res = await fetch(`/api/auditions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      console.error("Failed to delete:", await res.text());
      return;
    }
    setAuditions((prev) => prev.filter((a) => a.id !== id));
  }
  return (
    <main>
      <h1>Call-Back</h1>
      <AuditionForm
        onCreated={(a) =>
          setAuditions((prev) =>
            [...prev, a].sort((x, y) =>
              (x.audition_date ?? "").localeCompare(y.audition_date ?? ""),
            ),
          )
        }
      />
      <ul>
        {auditions.map((a) => (
          <li key={a.id}>
            <strong>{a.project_title}</strong> - {a.role_name}
            <select
              value={a.status}
              onChange={(e) => handleStatusChange(a.id, e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>{" "}
            <button onClick={() => handleDelete(a.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
