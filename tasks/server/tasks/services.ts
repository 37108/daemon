import type { DatabaseSync } from "node:sqlite";
import * as v from "valibot";
import { Task } from "./models";

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class TaskService {
  static all(database: DatabaseSync): { result: null | unknown; error: null | Error } {
    const query = database.prepare("SELECT * FROM tasks");
    return { result: query.all(), error: null };
  }
  static one(database: DatabaseSync, id: string): { result: null | unknown; error: null | Error } {
    const query = database.prepare("SELECT * FROM tasks WHERE id = ?");
    const result = query.get(id) ?? null;
    return { result, error: null };
  }

  static delete(
    database: DatabaseSync,
    id: string,
  ): { result: null | unknown; error: null | Error } {
    const insert = database.prepare("DELETE FROM tasks WHERE id = ?");
    insert.run(id);
    return { result: null, error: null };
  }

  static create(
    database: DatabaseSync,
    data: unknown,
  ): { result: null | unknown; error: null | Error } {
    const insert = database.prepare("INSERT INTO tasks(id, name) VALUES (?, ?)");
    let value: Parameters<typeof Task.of>[0];

    try {
      value = v.parse(v.omit(Task.schema, ["id"]), data);
    } catch (error) {
      return { result: null, error: error };
    }

    try {
      const task = Task.of(value);

      // todo: 項目の改善
      insert.run(task.id, task.name);
      return { result: task, error: null };
    } catch (error) {
      return { result: null, error: error };
    }
  }
}
