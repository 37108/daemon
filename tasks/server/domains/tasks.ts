import * as v from "valibot";

export const TaskSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  name: v.pipe(v.string(), v.maxLength(100)),
  description: v.optional(v.pipe(v.string(), v.maxLength(256)), ""),
  categories: v.optional(v.array(v.string()), []),
  priority: v.optional(v.union([v.literal("HIGH"), v.literal("MEDIUM"), v.literal("LOW")])),
  due: v.optional(v.nullable(v.date())),
  children: v.optional(v.array(v.pipe(v.string(), v.uuid()))),
});
export type TaskSchema = v.InferInput<typeof TaskSchema>;

export const CreateTaskSchema = v.omit(TaskSchema, ["id"]);
export type CreateTaskSchema = v.InferInput<typeof CreateTaskSchema>;

export const UpdateTaskSchema = v.object({
  ...v.pick(TaskSchema, ["id"]).entries,
  ...v.partial(CreateTaskSchema).entries,
});
export type UpdateTaskSchema = v.InferInput<typeof UpdateTaskSchema>;
