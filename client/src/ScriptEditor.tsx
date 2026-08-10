import { useEffect, useState, type SubmitEvent } from "react";
import type { ScriptLine } from "./types";

export function ScriptEditor({ auditionId }: { auditionId: number }) {
  const [lines, setLines] = useState<ScriptLine[]>([]);
  const [elementType, setElementType] =
    useState<ScriptLine["element_type"]>("action");
  const [characterName, setCharacterName] = useState("");
  const [isMine, setIsMine] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(`/api/auditions/${auditionId}/lines`)
      .then((res) => res.json())
      .then(setLines);
  }, [auditionId]);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const res = await fetch(`/api/auditions/${auditionId}/lines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        element_type: elementType,
        character_name: elementType === "dialogue" ? characterName : null,
        is_mine: elementType === "dialogue" ? isMine : false,
        content,
      }),
    });
    if (!res.ok) {
      console.error("Failed to add line:", await res.text());
      return;
    }
    const created: ScriptLine = await res.json();
    setLines((prev) => [...prev, created]);
    setContent("");
  }

  return (
    <section className="mt-8 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-bold">Script</h2>

      <div className="mb-6 font-mono text-sm">
        {lines.map((line) => (
          <div key={line.id} className="mb-2">
            {line.element_type === "scene_heading" && (
              <p className="font-bold uppercase">{line.content}</p>
            )}
            {line.element_type === "action" && <p>{line.content}</p>}
            {line.element_type === "dialogue" && (
              <div
                className={`mx-auto max-w-xs rounded px-2 py-1 text-center ${line.is_mine ? "bg-yellow-100" : ""}`}
              >
                <p className="uppercase">{line.character_name}</p>
                <p>{line.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <select
            value={elementType}
            onChange={(e) =>
              setElementType(e.target.value as ScriptLine["element_type"])
            }
            className="rounded-md border border-stone-300 p-2"
          >
            <option value="scene_heading">Scene heading</option>
            <option value="action">Action</option>
            <option value="dialogue">Dialogue</option>
          </select>
          {elementType === "dialogue" && (
            <>
              <input
                className="flex-1 rounded-md border border-stone-300 p-2"
                placeholder="Character name"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                required
              />
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={isMine}
                  onChange={(e) => setIsMine(e.target.checked)}
                />
                My Line
              </label>
            </>
          )}
        </div>
        <textarea
          className="rounded-md border border-stone-300 p-2"
          placeholder="Line content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
        <button
          type="submit"
          className="self-start rounded-md bg-stone-800 px-4 py-2 text-white"
        >
          Add line
        </button>
      </form>
    </section>
  );
}
