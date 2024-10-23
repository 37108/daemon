import { PrismaClient } from "@prisma/client";

export interface CategoryRepository {
  save({ taskId, name }: { taskId: string; name: string }): Promise<{
    id: string;
    taskId: string;
    name: string;
  } | null>;

  deleteByTaskId(taskId: string): Promise<void>;
}

export class PostgresCategoryRepository implements CategoryRepository {
  prisma = new PrismaClient();

  async save({ taskId, name }: { taskId: string; name: string }) {
    const result = await this.prisma.category.create({
      data: {
        taskId,
        name,
      },
    });
    return result;
  }

  async deleteByTaskId(taskId: string) {
    await this.prisma.category.deleteMany({ where: { taskId } });
    return;
  }
}
