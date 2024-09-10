import { ulid } from "ulidx";
import * as v from "valibot";

export class Task {
  constructor(
    public id: string,
    public name: string,
    public description?: string,
    public categories?: string[],
    public priority?: "HIGH" | "MEDIUM" | "LOW",
    public due?: Date,
    // public children?: Task[],
  ) {}

  static schema = v.object({
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    priority: v.optional(v.union([v.literal("HIGH"), v.literal("MEDIUM"), v.literal("LOW")])),
    due: v.optional(v.date()),
    // children: v.array(v.string()),
  });

  static of({
    name,
    description,
    categories,
    priority,
    due,
  }: Omit<v.InferOutput<typeof this.schema>, "id">) {
    const id = ulid();
    return new Task(id, name, description, categories, priority, due);
  }

  isOverdue(): boolean {
    return this.due ? this.due < new Date() : false;
  }

  // todo: IDの重複や、子タスクであるものが入らないようにする
  addChild(): void {}
}
