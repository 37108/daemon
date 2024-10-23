import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { PostgresCategoryRepository } from "./repositories/categories";
import { PostgresTaskRepository } from "./repositories/tasks";
import { TaskService } from "./services";

const PORT = 3000;

const app = new Hono();
app.get("/tasks", async (context) => {
  const taskService = new TaskService(
    new PostgresTaskRepository(),
    new PostgresCategoryRepository(),
  );

  const result = await taskService.findAll();
  if (!result.success) {
    context.status(400);
    return context.json({ error: result.error.message });
  }

  context.status(200);
  return context.json({ tasks: result.value ?? [] });
});

app.post("/tasks", async (context) => {
  const taskService = new TaskService(
    new PostgresTaskRepository(),
    new PostgresCategoryRepository(),
  );

  const result = await taskService.create(await context.req.json());

  if (!result.success) {
    context.status(400);
    return context.json({ error: result.error.message });
  }
  context.status(200);
  return context.json(result.value);
});

app.get("/tasks/:id", async (context) => {
  const taskService = new TaskService(
    new PostgresTaskRepository(),
    new PostgresCategoryRepository(),
  );

  const result = await taskService.findById(context.req.param("id"));
  if (!result.success) {
    context.status(400);
    return context.json({ error: result.error.message });
  }
  if (result.value == null) {
    context.status(404);
    return context.json({ error: "task not found" });
  }

  context.status(200);
  return context.json(result.value);
});

app.put("/tasks/:id", async (context) => {
  const taskService = new TaskService(
    new PostgresTaskRepository(),
    new PostgresCategoryRepository(),
  );

  const result = await taskService.update({
    ...(await context.req.json()),
    id: context.req.param("id"),
  });

  if (!result.success) {
    context.status(400);
    return context.json({ error: result.error.message });
  }
  context.status(200);
  return context.json(result.value);
});

app.delete("/tasks/:id", async (context) => {
  const taskService = new TaskService(
    new PostgresTaskRepository(),
    new PostgresCategoryRepository(),
  );

  const result = await taskService.delete(context.req.param("id"));

  if (!result.success) {
    context.status(400);
    return context.json({ error: result.error.message });
  }

  context.status(204);
  return context.text("");
});

serve({
  fetch: app.fetch,
  port: PORT,
});
