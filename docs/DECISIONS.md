# Design decisions & deferred concepts

## Decided

- Scripts are ordered typed lines (scene_heading | action | dialogue) in
  one table; order lives in `position`; identity in `id`. Derived views
  (my lines, grouped-by-character) are computed at render, never stored.
- Partial updates via PATCH + COALESCE; clients send only changed fields.
- Interaction grammar: double-click= edit(desktop); explicit chip =
  toggle ownership. One editingId at a time.

  ## Deferred (with trigger conditions)

- **Characters table**: create when a character needs data of its own
  (voice_id for TTS is the trigger). Backfill from DISTINCT
  character_name, and character_id FK to script_lines. Until then: derive
  name list, datalist UI.
  **is_mine rethink**: when characters table lands, "myself" likely
  becomes per-character (is_me), per-line boolean derived or kept as
  override. Decide then.
  **Reordering**: position renumbering needs a transaction; consider fractional positions. Build with drag UI when script editor matures.
  **Optimistic updates**: all mutations currently wait for server round-trip. Revisit when app feels laggy on real networks / phone.
  **URL routing**: selection (audition id) should line in the URL. Add with React Router when second screen (practice view) exists.
  **Mobile/native**: target is iPhone. Original app wraps React via Capacitor, default plan is the same path. Implications now: touch-first grammar (no hover/double-click dependence for core actions), 44pt tap targets, APU treated as a future versioned contract. Edit-mode needs a tap path (tap-select + button, or long-press) before mobile ship.
