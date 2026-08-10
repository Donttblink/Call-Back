import type { Audition } from "./types";

const STATUS_STYLES: Record<string, string> = {
  upcoming: "bg-amber-100 text-amber-800",
  submitted: "bg-blue-100 text-blue-800",
  callback: "bg-purple-100 text-purple-800",
  booked: "bg-green-100 text-green-800",
  passed: "bg-stone-200 text-stone-600",
};

type Props = {
  auditions: Audition[];
  statuses: string[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
};

export function AuditionList({
  auditions,
  statuses,
  selectedId,
  onSelect,
  onDelete,
  onStatusChange,
}: Props) {
  if (auditions.length === 0) {
    return (
      <p className="empty text-center text-stone-500">
        No Auditions yet - add your first one above.
      </p>
    );
  }

  return (
    <ul className="audition-list flex flex-col gap-3">
      {auditions.map((a) => (
        <li
          key={a.id}
          onClick={() => onSelect(a.id)}
          className={`flex items-center justify-between rounded-lg bg-white px-4 py-3 shadow-sm hover:bg-stone-50 cursor-pointer transition ${
            a.id === selectedId ? "ring-2 ring-stone-400" : "hover:bg-stone-50"
          }`}
        >
          <div className="audition-info flex flex-col">
            <strong>{a.project_title}</strong>
            <span>{a.role_name}</span>
            {a.audition_date && (
              <span className="date">
                {new Date(a.audition_date).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="audition-actions flex items-center gap-2">
            <select
              value={a.status}
              onChange={(e) => onStatusChange(a.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[a.status] ?? ""}`}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              className="text-sm text-red-600 hover:underline cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(a.id);
              }}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
