import { pool } from "./db.js";
import Fastify, { fastify } from "fastify";

const app = fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok" };
});

app.get("/api/auditions", async () => {
  const result = await pool.query(
    "SELECT * FROM auditions ORDER BY audition_date",
  );
  return result.rows;
});

app.post("/api/auditions", async (request, reply) => {
  const body = request.body as {
    project_title: string;
    role_name: string;
    project_type?: string;
    audition_date?: string;
    notes?: string;
  };

  const result = await pool.query(
    `INSERT INTO auditions (project_title, role_name, project_type, audition_date, notes) 
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      body.project_title,
      body.role_name,
      body.project_type ?? "film",
      body.audition_date ?? null,
      body.notes ?? null,
    ],
  );

  reply.code(201);
  return result.rows[0];
});

app.delete("/api/auditions/:id", async (request, reply) => {
  const { id } = request.params as { id: string };

  const result = await pool.query(
    "DELETE FROM auditions WHERE id = $1 RETURNING id",
    [id],
  );

  if (result.rowCount === 0) {
    reply.code(404);
    return { error: "Audition not found" };
  }
  return { deleted: result.rows[0].id };
});

app.patch("/api/auditions/:id", async (request, reply) => {
  const { id } = request.params as { id: string };
  const { status } = request.body as { status: string };

  const result = await pool.query(
    "UPDATE auditions SET status = $1 WHERE id = $2 RETURNING *",
    [status, id],
  );

  if (result.rowCount === 0) {
    reply.code(404);
    return { error: "Audition not found" };
  }

  return result.rows[0];
});

app.get("/api/auditions/:id/lines", async (request) => {
  const { id } = request.params as { id: string };
  const result = await pool.query(
    "SELECT * FROM script_lines WHERE audition_id = $1 ORDER BY position",
    [id],
  );
  return result.rows;
});

app.post("/api/auditions/:id/lines", async (request, reply) => {
  const { id } = request.params as { id: string };
  const body = request.body as {
    element_type: string;
    character_name?: string;
    is_mine?: boolean;
    content: string;
  };

  const result = await pool.query(
    `INSERT INTO script_lines (audition_id, position, element_type, character_name, is_mine, content)
    VALUES (
    $1,
    COALESCE((SELECT MAX(position) FROM script_lines WHERE audition_id = $1), 0) + 1,
    $2, $3, $4, $5
  )
    RETURNING *`,
    [
      id,
      body.element_type,
      body.character_name ?? null,
      body.is_mine ?? false,
      body.content,
    ],
  );

  reply.code(201);
  return result.rows[0];
});

app.delete("/api/lines/:id", async (request, reply) => {
  const { id } = request.params as { id: string };

  const result = await pool.query(
    "DELETE FROM script_lines WHERE id = $1 RETURNING id",
    [id],
  );

  if (result.rowCount === 0) {
    reply.code(404);
    return { error: "Line not found" };
  }
  return { deleted: result.rows[0].id };
});

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
