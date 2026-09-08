import { useEffect, useState, type SubmitEvent } from "react";
import type { ScriptLine } from "./types";

export function ScriptEditor({ auditionId }: { auditionId: number }) {
  const [lines, setLines] = useState<ScriptLine[]>([]);
  const [elementType, setElementType] =
    useState<ScriptLine["element_type"]>("action");
  const [characterName, setCharacterName] = useState("");
  const [isMine, setIsMine] = useState(false);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftContent, setDraftContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadLines() {
      const res = await fetch(`/api/auditions/${auditionId}/lines`);
      if (!res.ok) {
        console.error("Failed to load lines:", await res.text());
        return;
      }
      setLines(await res.json());
    }
    loadLines();
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

  async function handleDelete(id: number) {
    const res = await fetch(`/api/lines/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      console.error("Failed to delete:", await res.text());
      return;
    }
    setLines((prev) => prev.filter((line) => line.id !== id));
  }

  async function handleToggleMine(line: ScriptLine) {
    const res = await fetch(`/api/lines/${line.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_mine: !line.is_mine }),
    });
    if (!res.ok) {
      console.error("Failed to update line:", await res.text());
      return;
    }
    const updated: ScriptLine = await res.json();
    setLines((prev) => prev.map((l) => (l.id === line.id ? updated : l)));
  }

  function startEdit(line: ScriptLine) {
    if (!isEditing) return;
    setEditingId(line.id);
    setDraftContent(line.content);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function toggleEditMode() {
    setIsEditing((prev) => !prev);
    setEditingId(null);
  }

  async function handleEditSave(line: ScriptLine) {
    const res = await fetch(`/api/lines/${line.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: draftContent,
      }),
    });
    if (!res.ok) {
      console.error("Failed to save edit:", await res.text());
      return;
    }
    const edited: ScriptLine = await res.json();
    setLines((prev) => prev.map((l) => (l.id === line.id ? edited : l)));
    setEditingId(null);
  }

  return (
    <section className="mt-8 rounded-lg bg-white p-6 shadow-sm">
      <h2 className="flex justify-between mb-4 text-lg font-bold">Script</h2>
      <button
        type="submit"
        className="self-start rounded-md bg-stone-800 px-4 py-2 text-white"
        onClick={toggleEditMode}
      >
        {!isEditing ? "Edit" : "Done"}
      </button>

      <div className="mb-6 font-mono text-sm">
        {lines.map((line) => (
          <div
            key={line.id}
            onDoubleClick={() => startEdit(line)}
            className="mb-2 flex items-center gap-2"
          >
            {line.id === editingId ? (
              <textarea
                autoFocus
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleEditSave(line);
                  }
                  if (e.key === "Escape") {
                    cancelEdit();
                  }
                }}
                className="w-full rounded-md border border-stone-300 p-2"
              />
            ) : (
              <>
                {line.element_type === "scene_heading" && (
                  <p className="font-bold uppercase">{line.content}</p>
                )}
                {line.element_type === "action" && <p>{line.content}</p>}
                {line.element_type === "dialogue" && (
                  <div
                    className={`mx-auto max-w-xs rounded px-2 py-1 text-center ${line.is_mine ? "bg-yellow-100" : ""}`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <p className="uppercase">{line.character_name}</p>
                      {isEditing && (
                        <button
                          type="button"
                          title="Click to toggle whose line this is"
                          onClick={() => handleToggleMine(line)}
                          onDoubleClick={(e) => e.stopPropagation()}
                          className={`rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer ${
                            line.is_mine
                              ? "bg-orange-300 text-orange-700"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {line.is_mine ? "MINE" : "READER"}
                        </button>
                      )}
                    </div>

                    <p>{line.content}</p>
                  </div>
                )}
              </>
            )}
            {isEditing && (
              <button
                className="text-sm text-red-600 hover:underline cursor-pointer"
                onClick={() => handleDelete(line.id)}
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
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
      )}
    </section>
  );
}
