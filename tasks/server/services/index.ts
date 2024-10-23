import * as v from "valibot";
import { CreateTaskSchema, TaskSchema } from "../domains/tasks";
import type { TaskRepository } from "../repositories/tasks";
import type { Result } from "../types";

export class TaskService {
  constructor(private repository: TaskRepository) {}

  async findById(id: string): Promise<Result<TaskSchema | null, Error>> {
    const result = await this.repository.findById(id);
    return { success: true, value: result };
  }

  async findAll(): Promise<Result<TaskSchema[], Error>> {
    const result = await this.repository.findAll();
    return { success: true, value: result };
  }

  async create(data: unknown): Promise<Result<TaskSchema, Error>> {
    let value: CreateTaskSchema;

    try {
      value = v.parse(CreateTaskSchema, data);
    } catch (error) {
      return { success: false, error };
    }

    try {
      const res = await this.repository.save(value);
      if (!res) {
        throw new Error("task did not created");
      }
      return { success: true, value: res };
    } catch (error) {
      console.error(error);
      return { success: false, error };
    }
  }

  async update(data: unknown): Promise<Result<null, Error>> {
    let value: TaskSchema;

    try {
      value = v.parse(TaskSchema, data);
    } catch (error) {
      return { success: false, error };
    }

    try {
      await this.repository.update(value);
      return { success: true, value: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  async delete(id: string): Promise<Result<null, Error>> {
    await this.repository.delete(id);
    return { success: true, value: null };
  }
}
