import { ulid } from "ulidx";
import * as v from "valibot";

export const TaskSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.maxLength(100)),
  description: v.optional(v.pipe(v.string(), v.maxLength(256)), ""),
  categories: v.optional(v.array(v.string()), []),
  priority: v.optional(v.union([v.literal("HIGH"), v.literal("MEDIUM"), v.literal("LOW")])),
  due: v.optional(v.nullable(v.date())),
  children: v.optional(v.array(v.pipe(v.string(), v.ulid()))),
});
export type TaskSchema = v.InferInput<typeof TaskSchema>;

export const CreateTaskSchema = v.omit(TaskSchema, ["id"]);
export type CreateTaskSchema = v.InferInput<typeof CreateTaskSchema>;

export const UpdateTaskSchema = v.object({
  ...v.pick(TaskSchema, ["id"]).entries,
  ...v.partial(CreateTaskSchema).entries,
});
export type UpdateTaskSchema = v.InferInput<typeof UpdateTaskSchema>;

export class Task {
  constructor(
    public id: string,
    public name: string,
    public description?: string,
    public categories?: string[],
    public priority?: "HIGH" | "MEDIUM" | "LOW",
    public due?: Date | null,
    private children?: string[],
  ) {}

  static schema = v.object({
    id: v.pipe(v.string(), v.uuid()),
    name: v.pipe(v.string(), v.maxLength(100)),
    description: v.optional(v.pipe(v.string(), v.maxLength(256)), ""),
    categories: v.optional(v.array(v.string()), []),
    priority: v.optional(v.union([v.literal("HIGH"), v.literal("MEDIUM"), v.literal("LOW")])),
    due: v.optional(v.nullable(v.date())),
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
