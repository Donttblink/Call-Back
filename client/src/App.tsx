import { useEffect, useState } from "react";
import type { Audition } from "./types";
import { AuditionForm } from "./AuditionForm";
import { AuditionList } from "./AuditionList";
import { ScriptEditor } from "./ScriptEditor";

const STATUSES = ["upcoming", "submitted", "callback", "booked", "passed"];

function App() {
  const [auditions, setAuditions] = useState<Audition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auditions");
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        setAuditions(await res.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    load();
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
    if (selectedId === id) setSelectedId(null);
  }
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Call-Back</h1>
      <AuditionForm
        onCreated={(a) =>
          setAuditions((prev) =>
            [...prev, a].sort((x, y) =>
              (x.audition_date ?? "").localeCompare(y.audition_date ?? ""),
            ),
          )
        }
      />
      {loading ? (
        <p className="text-center text-stone-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <AuditionList
          auditions={auditions}
          statuses={STATUSES}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
        />
      )}
      {selectedId && <ScriptEditor auditionId={selectedId} />}
    </main>
  );
}

export default App;
