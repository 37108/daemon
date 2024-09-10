import { createServer } from "http";
import { DatabaseSync } from "node:sqlite";
import * as v from "valibot";
import { Task } from "./tasks/models";

const PORT = 3000;
const database = new DatabaseSync(":memory:");

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
      response.writeHead(200, { "Content-Type": "application/json" });

      const query = database.prepare("SELECT * FROM tasks");
      response.end(JSON.stringify({ tasks: query.all() }));
      return;
    }
    if (method === "POST") {
      let body = "";
      request.on("data", (chunk) => {
        body = body + chunk.toString();
      });

      request.on("end", () => {
        const data = JSON.parse(body);
        try {
          v.parse(v.omit(Task.schema, ["id"]), data);
        } catch (err) {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: err.message }));
          return;
        }
        try {
          const task = Task.of(data);

          // todo: 項目の改善
          insert.run(task.id, task.name);

          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(task));
          return;
        } catch (err) {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: err.message }));
          return;
        }
      });
    }
  }
  if (/^\/tasks\/(\d+)$/.test(path)) {
    if (method === "GET") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ name: "12345" }));
      return;
    }
  }
});

server.listen(PORT);
