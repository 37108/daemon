import { createServer } from "http";
import { DatabaseSync } from "node:sqlite";
import { InMemoryTaskRepository } from "./tasks/repositories";
import { TaskService } from "./tasks/services";

const PORT = 3000;
export const database = new DatabaseSync(":memory:");

database.exec("CREATE TABLE IF NOT EXISTS tasks (id TEXT, name TEXT)");

const insert = database.prepare("INSERT INTO tasks(id, name) VALUES (?, ?)");
insert.run("1", "sample 1");
insert.run("2", "sample 2");

const server = createServer((request, response) => {
  if (!request.url || !request.method) {
    throw new Error("path or method is not defined");
  }
  const path = request.url;
  const method = request.method;

  if (path === "/tasks") {
    if (method === "GET") {
      const taskService = new TaskService(new InMemoryTaskRepository());
      const { result, error } = taskService.all();
      if (error) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: error.message }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ tasks: result }));
      return;
    }
    if (method === "POST") {
      let body = "";
      request.on("data", (chunk) => {
        body = body + chunk.toString();
      });

      request.on("end", () => {
        const data = JSON.parse(body);
        const taskService = new TaskService(new InMemoryTaskRepository());

        const { result, error } = taskService.create(data);

        if (error) {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: error.message }));
          return;
        }
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify(result));
      });
    }
  }
  if (/^\/tasks\/(\d+)$/.test(path)) {
    if (method === "GET") {
      const id = path.split("/")[2];

      const taskService = new TaskService(new InMemoryTaskRepository());
      const { result, error } = taskService.one(id);
      if (error) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: error.message }));
        return;
      }
      if (!result) {
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "task not found" }));
        return;
      }

      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify(result));
      return;
    }

    if (method === "DELETE") {
      const id = path.split("/")[2];

      const taskService = new TaskService(new InMemoryTaskRepository());
      const { error } = taskService.delete(id);
      if (error) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: error.message }));
        return;
      }

      response.writeHead(204, { "Content-Type": "application/json" });
      return;
    }
  }
});

server.listen(PORT);
