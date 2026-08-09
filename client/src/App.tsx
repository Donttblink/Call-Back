import { useEffect, useState } from "react";
import "./App.css";
import type { Audition } from "./types";
import { AuditionForm } from "./AuditionForm";

function App() {
  const [auditions, setAuditions] = useState<Audition[]>([]);

  useEffect(() => {
    fetch("/api/auditions")
      .then((res) => res.json())
      .then(setAuditions);
  }, []);

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
            <strong>{a.project_title}</strong> - {a.role_name} ({a.status})
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
