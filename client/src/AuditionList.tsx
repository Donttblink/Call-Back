import type { Audition } from "./types";

type Props = {
  auditions: Audition[];
  statuses: string[];
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
};

export function AuditionList({
  auditions,
  statuses,
  onDelete,
  onStatusChange,
}: Props) {
  if (auditions.length === 0) {
    return (
      <p className="empty">No Auditions yet - add your first one above.</p>
    );
  }

  return (
    <ul className="audition-list">
      {auditions.map((a) => (
        <li key={a.id} className="audition-card">
          <div className="audition-info">
            <strong>{a.project_title}</strong>
            <span>{a.role_name}</span>
            {a.audition_date && (
              <span className="date">
                {new Date(a.audition_date).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="audition-actions">
            <select
              value={a.status}
              onChange={(e) => onStatusChange(a.id, e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button onClick={() => onDelete(a.id)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
