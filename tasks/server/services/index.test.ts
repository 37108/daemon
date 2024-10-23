import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import type { CreateTaskSchema, TaskSchema } from "../domains/tasks";
import type { CategoryRepository } from "../repositories/categories";
import type { TaskRepository } from "../repositories/tasks";
import { TaskService } from "./";

const TASK_ID_ONE = randomUUID();
const TASK_ID_TWO = randomUUID();

class TestTaskRepository implements TaskRepository {
  async save(_: CreateTaskSchema) {
    const task = { id: TASK_ID_ONE, name: "sample task" };
    return task;
  }
  async update(_: TaskSchema) {}
  async delete(_: string) {}
  async findById(id: string) {
    const task = { id, name: "sample task" };
    return task;
  }
  async findAll() {
    const tasks = [
      { id: TASK_ID_ONE, name: "sample task 1" },
      { id: TASK_ID_TWO, name: "sample task 2" },
    ];
    return tasks;
  }
}

class TestCategoryRepository implements CategoryRepository {
  async save(data: { taskId: string; name: string }) {
    return {
      id: randomUUID(),
      taskId: data.taskId,
      name: data.name,
    };
  }
  async deleteByTaskId(_: string) {}
}

describe("Task Services", () => {
  const service = new TaskService(new TestTaskRepository(), new TestCategoryRepository());

  it("should return a task", async () => {
    const result = await service.findById(TASK_ID_ONE);
    expect(result.success).toBeTruthy();
    if (result.success) {
      expect(result.value?.id).toBe(TASK_ID_ONE);
    }
  });

  it("should return tasks", async () => {
    const result = await service.findAll();
    expect(result.success).toBeTruthy();
    if (result.success) {
      expect(result.value.find((value) => value.id === TASK_ID_ONE)).toBeDefined();
      expect(result.value.find((value) => value.id === TASK_ID_TWO)).toBeDefined();
    }
  });
});
