import { describe, expect, it } from "vitest";
import type { CreateTaskSchema, TaskSchema } from "../domains/tasks";
import type { TaskRepository } from "../repositories/tasks";
import { TaskService } from "./";

const id = "3982d5a8-e556-4f64-b1fe-c6d8814f1866";

class TestTaskRepository implements TaskRepository {
  async save(_: CreateTaskSchema) {
    const task = { id: "3982d5a8-e556-4f64-b1fe-c6d8814f1866", name: "sample task" };
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
      { id: "3982d5a8-e556-4f64-b1fe-c6d8814f1866", name: "sample task 1" },
      { id: "c13898a8-8899-4ef8-a605-ee165c1555cd", name: "sample task 2" },
    ];
    return tasks;
  }
}

describe("Task Services", () => {
  const service = new TaskService(new TestTaskRepository());

  it("should return a task", async () => {
    const result = await service.findById(id);
    expect(result.success).toBeTruthy();
    if (result.success) {
      expect(result.value?.id).toBe(id);
    }
  });

  it("should return tasks", async () => {
    const result = await service.findAll();
    expect(result.success).toBeTruthy();
    if (result.success) {
      expect(result.value).toBeDefined();
    }
  });
});
