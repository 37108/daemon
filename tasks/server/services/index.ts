import * as v from "valibot";
import { CreateTaskSchema, TaskSchema } from "../domains/tasks";
import type { CategoryRepository } from "../repositories/categories";
import type { TaskRepository } from "../repositories/tasks";
import type { Result } from "../types";

export class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private categoryRepository: CategoryRepository,
  ) {}

  async findById(id: string): Promise<Result<TaskSchema | null, Error>> {
    const result = await this.taskRepository.findById(id);
    return { success: true, value: result };
  }

  async findAll(): Promise<Result<TaskSchema[], Error>> {
    const result = await this.taskRepository.findAll();
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
      const res = await this.taskRepository.save(value);
      if (!res) {
        throw new Error("task did not created");
      }
      if (value.categories) {
        const promises = [...new Set(value.categories)].map((category) =>
          this.categoryRepository.save({ taskId: res.id, name: category }),
        );
        await Promise.all(promises);
      }
      const task = await this.findById(res.id);
      if (!task.success || !task.value) {
        throw new Error("task not found");
      }

      return { success: true, value: task.value };
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
      const res = await this.taskRepository.findById(value.id);
      if (!res) {
        throw new Error("task not found");
      }

      await this.taskRepository.update(value);

      const categories = res.categories ?? [];

      if (value.categories) {
        await this.categoryRepository.deleteByTaskId(value.id);

        const promises = [...new Set([...value.categories, ...categories])].map((category) =>
          this.categoryRepository.save({ taskId: res.id, name: category }),
        );
        await Promise.all(promises);
      }
      return { success: true, value: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  async delete(id: string): Promise<Result<null, Error>> {
    await this.categoryRepository.deleteByTaskId(id);
    await this.taskRepository.delete(id);
    return { success: true, value: null };
  }
}
