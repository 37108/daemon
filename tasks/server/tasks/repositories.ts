import * as v from "valibot";
import { database } from "../";
import { Task } from "./models";

export interface TaskRepository {
  save(task: Task);
  update(task: Task);
  delete(id: string);
  findById(id: string): Task | null;
  findAll(): Task[];
}

export class InMemoryTaskRepository implements TaskRepository {
  database = database;

  save(task: Task) {
    const insert = database.prepare("INSERT INTO tasks(id, name, description) VALUES (?, ?, ?)");
    insert.run(task.id, task.name, task.description ?? "");
  }

  update(task: Task) {
    const insert = database.prepare(
      `UPDATE tasks SET name = '${task.name}', description = '${task.description}' WHERE id = '${task.id}'`,
    );
    insert.run();
  }

  delete(id: string) {
    const insert = database.prepare("DELETE FROM tasks WHERE id = ?");
    insert.run(id);
    return { result: null, error: null };
  }

  findById(id: string): Task | null {
    const query = database.prepare("SELECT * FROM tasks WHERE id = ?");
    const result = query.get(id);
    try {
      const value = v.parse(Task.schema, result);
      return new Task(value.id, value.name, value.description);
    } catch (_) {
      return null;
    }
  }

  findAll(): Task[] {
    try {
      const query = database.prepare("SELECT * FROM tasks");
      const result = query.all();
      const tasks = result.map((item) => v.parse(Task.schema, item));

      return tasks.map((task) => new Task(task.id, task.name, task.description));
    } catch (_) {
      return [];
    }
  }
}
