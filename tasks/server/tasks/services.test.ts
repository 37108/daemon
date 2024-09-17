import { ulid } from "ulidx";
import { describe, expect, it } from "vitest";
import { Task } from "./models";
import type { TaskRepository } from "./repositories";
import { TaskService } from "./services";

class TestTaskRepository implements TaskRepository {
  save(_: Task) {}
  update(_: Task) {}
  delete(_: string) {}
  findById(id: string): Task | null {
    const task = new Task(id, "test task");
    return task;
  }
  findAll(): Task[] {
    const tasks = [Task.of({ name: "sample task 1" }), Task.of({ name: "sample task 2" })];
    return tasks;
  }
}

describe("Task Services", () => {
  const service = new TaskService(new TestTaskRepository());

  it("should return a task", () => {
    const id = ulid();
    const result = service.findById(id);
    expect(result.success).toBeTruthy();
    if (result.success) {
      expect(result.value?.id).toBe(id);
    }
  });

  it("should return tasks", () => {
    const result = service.findAll();
    expect(result.success).toBeTruthy();
    if (result.success) {
      expect(result.value).toBeDefined();
    }
  });
});
