import { createServer } from "http";
import { PostgresCategoryRepository } from "./repositories/categories";
import { PostgresTaskRepository } from "./repositories/tasks";
import { TaskService } from "./services";

const PORT = 3000;

const server = createServer(async (request, response) => {
  if (!request.url || !request.method) {
    throw new Error("path or method is not defined");
  }
  const path = request.url;
  const method = request.method;
  const taskService = new TaskService(
    new PostgresTaskRepository(),
    new PostgresCategoryRepository(),
  );

  if (path === "/tasks") {
    if (method === "GET") {
      const result = await taskService.findAll();

      if (!result.success) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: result.error.message }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ tasks: result.value }));
      return;
    }
    if (method === "POST") {
      let body = "";
      request.on("data", (chunk) => {
        body = body + chunk.toString();
      });

      request.on("end", async () => {
        const data = JSON.parse(body);
        const result = await taskService.create(data);

        if (!result.success) {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: result.error.message }));
          return;
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(result.value));
      });
    }
  }
  if (/^\/tasks\/([\w!?/+\-_~=;.,*&@#$%()'[\]]+)$/.test(path)) {
    if (method === "GET") {
      const id = path.split("/")[2];
      const result = await taskService.findById(id);

      if (!result.success) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: result.error.message }));
        return;
      }
      if (result.success && result.value == null) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "task not found" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(result.value));
      return;
    }

    if (method === "PUT") {
      let body = "";
      request.on("data", (chunk) => {
        body = body + chunk.toString();
      });

      request.on("end", async () => {
        const data = JSON.parse(body);
        const id = path.split("/")[2];

        const result = await taskService.update({ ...data, id });

        if (!result.success) {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: result.error.message }));
          return;
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(result.value));
      });
    }

    if (method === "DELETE") {
      const id = path.split("/")[2];
      const result = await taskService.delete(id);

      if (!result.success) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: result.error.message }));
        return;
      }

      response.writeHead(204, { "Content-Type": "application/json" });
      return;
    }
  }
});

server.listen(PORT);
