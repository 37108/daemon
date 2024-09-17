import { createServer } from "http";
import { DatabaseSync } from "node:sqlite";
import { ulid } from "ulidx";
import { InMemoryTaskRepository } from "./tasks/repositories";
import { TaskService } from "./tasks/services";

const PORT = 3000;
export const database = new DatabaseSync(":memory:");

database.exec("CREATE TABLE IF NOT EXISTS tasks (id TEXT, name TEXT)");

const insert = database.prepare("INSERT INTO tasks(id, name) VALUES (?, ?)");
insert.run(ulid(), "sample 1");
insert.run(ulid(), "sample 2");

const server = createServer((request, response) => {
  if (!request.url || !request.method) {
    throw new Error("path or method is not defined");
  }
  const path = request.url;
  const method = request.method;
  const taskService = new TaskService(new InMemoryTaskRepository());

  if (path === "/tasks") {
    if (method === "GET") {
      const result = taskService.findAll();

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

      request.on("end", () => {
        const data = JSON.parse(body);
        const result = taskService.create(data);

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
      const result = taskService.findById(id);

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

      request.on("end", () => {
        const data = JSON.parse(body);
        const id = path.split("/")[2];

        const result = taskService.update({ ...data, id });

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
      const result = taskService.delete(id);

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
