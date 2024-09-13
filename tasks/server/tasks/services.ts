import * as v from "valibot";
import { Task } from "./models";
import type { InMemoryTaskRepository } from "./repositories";

export class TaskService {
  constructor(private repository: InMemoryTaskRepository) {}

  one(id: string): { result: null | unknown; error: null | Error } {
    const result = this.repository.findById(id);
    return { result, error: null };
  }

  all(): { result: null | unknown; error: null | Error } {
    const result = this.repository.findAll();
    return { result: result, error: null };
  }

  delete(id: string): { result: null | unknown; error: null | Error } {
    this.repository.delete(id);
    return { result: null, error: null };
  }

  create(data: unknown): { result: null | unknown; error: null | Error } {
    let value: Parameters<typeof Task.of>[0];

    try {
      value = v.parse(v.omit(Task.schema, ["id"]), data);
    } catch (error) {
      return { result: null, error: error };
    }

    try {
      const task = Task.of(value);
      this.repository.save(task);
      return { result: task, error: null };
    } catch (error) {
      return { result: null, error: error };
    }
  }
}
