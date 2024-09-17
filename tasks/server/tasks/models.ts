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
    private children?: string[],
  ) {}

  static schema = v.object({
    id: v.pipe(v.string(), v.ulid()),
    name: v.pipe(v.string(), v.maxLength(100)),
    description: v.optional(v.pipe(v.string(), v.maxLength(256))),
    categories: v.optional(v.array(v.string())),
    priority: v.optional(v.union([v.literal("HIGH"), v.literal("MEDIUM"), v.literal("LOW")])),
    due: v.optional(v.date()),
    children: v.optional(v.array(v.pipe(v.string(), v.ulid()))),
  });

  static of({
    name,
    description,
    categories,
    priority,
    due,
  }: Omit<v.InferOutput<typeof this.schema>, "id">) {
    const id = ulid();
    const task = new Task(id, name, description, categories, priority, due);

    // todo: children のチェックと追加を行う
    return task;
  }

  // todo: IDの重複や、子タスクであるものが入らないようにする
  addChild(): void {}
}
