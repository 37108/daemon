import * as v from "valibot";
import type { Result } from "../models";
import { Task } from "./models";
import type { TaskRepository } from "./repositories";

export class TaskService {
  constructor(private repository: TaskRepository) {}

  findById(id: string): Result<Task | null, Error> {
    const result = this.repository.findById(id);
    return { success: true, value: result };
  }

  findAll(): Result<Task[], Error> {
    const result = this.repository.findAll();
    return { success: true, value: result };
  }

  create(data: unknown): Result<Task, Error> {
    let value: Parameters<typeof Task.of>[0];

    try {
      value = v.parse(v.omit(Task.schema, ["id"]), data);
    } catch (error) {
      return { success: false, error };
    }

    try {
      const task = Task.of(value);
      this.repository.save(task);
      return { success: true, value: task };
    } catch (error) {
      return { success: false, error };
    }
  }

  update(data: unknown): Result<null, Error> {
    let value: v.InferInput<typeof Task.schema>;

    try {
      value = v.parse(Task.schema, data);
    } catch (error) {
      return { success: false, error };
    }

    try {
      const task = new Task(value.id, value.name);
      this.repository.update(task);
      return { success: true, value: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  delete(id: string): Result<null, Error> {
    this.repository.delete(id);
    return { success: true, value: null };
  }
}
