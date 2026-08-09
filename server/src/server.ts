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

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
