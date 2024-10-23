import { PrismaClient } from "@prisma/client";
import * as v from "valibot";
import { type CreateTaskSchema, TaskSchema, type UpdateTaskSchema } from "./models";

export interface TaskRepository {
  save(task: CreateTaskSchema): Promise<TaskSchema | null>;
  update(task: TaskSchema);
  delete(id: string);
  findById(id: string): Promise<TaskSchema | null>;
  findAll(): Promise<TaskSchema[]>;
}

export class PostgresTaskRepository implements TaskRepository {
  prisma = new PrismaClient();

  async save(task: CreateTaskSchema) {
    const result = await this.prisma.task.create({
      data: { name: task.name, description: task.description },
    });
    if (task.categories) {
      const promises = task.categories.map((category) =>
        this.prisma.category.create({
          data: {
            taskId: result.id,
            name: category,
          },
        }),
      );
      await Promise.all(promises);
    }

    try {
      return v.parse(TaskSchema, result);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async update(task: UpdateTaskSchema) {
    await this.prisma.task.update({
      where: {
        id: task.id,
      },
      data: {
        name: task.name,
        description: task.description,
      },
    });
    if (task.categories) {
      const promises = task.categories.map((category) =>
        this.prisma.category.create({
          data: {
            taskId: task.id,
            name: category,
          },
        }),
      );
      await Promise.all(promises);
    }
  }

  async delete(id: string) {
    await this.prisma.task.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: string) {
    const result = await this.prisma.task.findUnique({
      where: {
        id,
      },
      include: {
        categories: true,
      },
    });
    try {
      return v.parse(TaskSchema, {
        ...result,
        categories: result?.categories.map((category) => category.name),
      });
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async findAll() {
    const result = await this.prisma.task.findMany({
      include: {
        categories: true,
      },
    });
    try {
      return result.map((item) =>
        v.parse(TaskSchema, { ...item, categories: item.categories.map((i) => i.name) }),
      );
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
