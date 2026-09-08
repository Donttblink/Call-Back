# Design decisions & deferred concepts

## North star (the "Well..." test)

Open an audition → script appears in rehearse view → play works instantly.
Spot a bad line mid-rehearsal → enter edit mode in place → change/delete it →
cues, chunking, and reader audio all adjust with zero manual syncing → keep
rehearsing. Every architecture decision is graded against this scenario.

## Decided

- ONE script state. The open scene exists exactly once in memory; rehearse/edit are modes over it, never separate copies. (Original app kept independent Edit/Rehearse state with manual sync — root cause of its jank. Never again.)
- Script page opens in READ/REHEARSE mode; edit mode is explicitly engaged and reveals affordances (add form, delete, chips, double-click). Mode gates interaction only — it never changes which data is loaded.
- Scripts are ordered typed lines (scene_heading | action | dialogue), one ROW per line in script_lines. Never a single JSONB blob per scene: per-line PATCH keeps edits atomic (original's blob storage caused auto-save races).
- Everything downstream of lines is DERIVED, never stored:
  - Chunks/cue units: pure function folding consecutive same-owner dialogue (port the concept — and tests — from original lib/blocks/derive.ts). Visual "collapse into one text box" = rendering a derived unit; rows are NEVER merged in the DB (merging = information loss, one-way door).
  - Cue text = derived from the my-unit's content (last words / spokenText).
  - Reader audio = cache keyed by content (voiceId + text + speed, per original useTtsCache). Edits/deletes invalidate automatically by key miss.
- Identity/order/content separation: id = permanent identity (audio & cues attach here), position = order (freely rewritable), content = text. Never pair by array position.
- Partial updates via PATCH + COALESCE; clients send only changed fields.
- Interaction grammar: explicit chip = ownership toggle; double-click = edit (desktop; tap path owed before mobile). One editingId at a time.
- Visual identity/branding deliberately deferred; all current styling is placeholder until a dedicated design pass.
- Chunk merging is render-only: rehearse view folds consecutive same-owner dialogue into one flowing block; edit mode de-merges to true rows ("edit shows the seams"). Cues derive from chunks, so edits/deletes reshape cues by recomputation, never by update.

## Port from original (proven, keep)

- derive.ts pattern: spokenText + cueUnits as pure, tested functions.
- Content-keyed TTS cache (auto-invalidation).
- parts array concept: dialogue preserving interleaved stage directions (adopt when parsing arrives; manual entry doesn't need it yet).
- Speaker canonicalization rules (strip trailing parentheticals; never auto-merge distinct base names).
- Import review step: parsed script + source PDF preview for actor confirmation before save.
- Invariants doc culture: pair by id; normalize at write boundary; non-destructive grouping.

## Do NOT recreate from original

- Duplicate Edit/Rehearse state with sync layer.
- Dual representations (blocks + takes + adapters).
- Scene-as-JSONB-blob persistence.
- Untested core engine (cue matcher shipped with zero tests — our rule: the cue/chunk derivation gets tests the week it's written).

## Deferred (with trigger conditions)

- **Characters table**: when a character carries its own data (voice_id is the trigger). Backfill from DISTINCT character_name; add character_id FK. Until then: derive name list for datalist UI.
- **is_mine rethink**: with characters table, "myself" likely becomes per-character (is_me), per-line kept as override. Decide then.
- **Audition hierarchy** (folders / many scenes per audition / loose scenes): trigger = long-script import or user having >1 scene per audition. Likely auditions → scenes → script_lines. Today audition = one scene, fine.
- **Home page** (recent auditions, stats tiles): needs events + routing first.
- **Activity events**: append-only activity_events (event_type, entity_id, metadata JSONB, created_at). ONE-WAY CLOCK: start emitting the moment the rehearse/play feature exists — events can't be backfilled. Dashboard later, config-driven tiles = parameterized queries. Names: noun.verb_past.
- **Reordering**: position renumbering in a transaction; fractional positions considered. Build with drag UI when editor matures.
- **Optimistic updates**: revisit when round-trips feel laggy (phone reality).
- **URL routing**: audition id in URL; add with React Router when the home / collection view exists (that's the second screen).
- **Upload/parse pipeline**: parser emits the same script_lines rows manual entry creates (same three types + ownership via character selection). Review step before save. Parser is an alternate producer, never an alternate data model.
- **Mobile/native**: Capacitor path (original proves it). Touch-first grammar, 44pt targets, API = future versioned contract, tap path for edit mode.
