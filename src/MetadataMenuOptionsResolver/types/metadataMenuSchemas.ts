import { z } from 'zod';

export const SelectOptionsSchema = z.discriminatedUnion("sourceType", [
  z.object({
    sourceType: z.literal("ValuesList"),
    valuesList: z.record(z.string())
  }),
  z.object({
    sourceType: z.literal("ValuesFromDVQuery"),
    valuesFromDVQuery: z.string(),
    valuesList: z.record(z.unknown()).optional()
  }),
  z.object({
    sourceType: z.literal("ValuesListNotePath"),
    valuesListNotePath: z.string(),
    valuesList: z.record(z.unknown()).optional()
  })
]);
export type SelectOptions = z.infer<typeof SelectOptionsSchema>;

export const NumberOptionsSchema = z.object({
  step: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional()
}).passthrough();
export type NumberOptions = z.infer<typeof NumberOptionsSchema>;

export const DateOptionsSchema = z.object({
  dateShiftInterval: z.string().optional(),
  dateFormat: z.string().optional(),
  defaultInsertAsLink: z.boolean().optional(),
  linkPath: z.string().optional()
}).passthrough();
export type DateOptions = z.infer<typeof DateOptionsSchema>;

export const InputOptionsSchema = z.object({}).passthrough();
export type InputOptions = z.infer<typeof InputOptionsSchema>;

export const CycleOptionsSchema = z.object({
  sourceType: z.literal("ValuesList"),
  valuesList: z.record(z.string())
}).passthrough();
export type CycleOptions = z.infer<typeof CycleOptionsSchema>;

export const BooleanOptionsSchema = z.object({}).passthrough();
export type BooleanOptions = z.infer<typeof BooleanOptionsSchema>;

export const TimeOptionsSchema = z.object({
  dateShiftInterval: z.string().optional(),
  dateFormat: z.string().optional(),
  defaultInsertAsLink: z.boolean().optional(),
  linkPath: z.string().optional()
}).passthrough();
export type TimeOptions = z.infer<typeof TimeOptionsSchema>;

export const MultiOptionsSchema = z.object({
  sourceType: z.literal("ValuesList"), // Assuming similar structure for predefined values
  valuesList: z.record(z.string())
}).passthrough();
export type MultiOptions = z.infer<typeof MultiOptionsSchema>;

export const FileOptionsSchema = z.object({
  dvQueryString: z.string().optional()
}).passthrough();
export type FileOptions = z.infer<typeof FileOptionsSchema>;

export const MediaOptionsSchema = z.object({
  embed: z.boolean().optional(),
  folders: z.array(z.string()).optional(),
  display: z.enum(["card", "list"]).optional(),
  thumbnailSize: z.string().optional()
}).passthrough();
export type MediaOptions = z.infer<typeof MediaOptionsSchema>;

export const FieldTypeEnumSchema = z.enum([
  "Input", "Number", "Select", "Cycle", "Boolean", "Date", "DateTime", "Time",
  "Multi", "File", "MultiFile", "Media", "MultiMedia", "Canvas", "CanvasGroup",
  "CanvasGroupLink", "Formula", "Lookup", "JSON", "YAML", "Object", "ObjectList"
]);
export type FieldTypeEnum = z.infer<typeof FieldTypeEnumSchema>;

export const BaseFieldInfoSchema = z.object({
  name: z.string(),
  type: FieldTypeEnumSchema,
  options: z.any()
});

export const ValidatedFieldInfoSchema = BaseFieldInfoSchema.superRefine((val, ctx) => {
  let schema: z.ZodTypeAny;
  switch (val.type) {
    case "Select":
      schema = SelectOptionsSchema;
      break;
    case "Number":
      schema = NumberOptionsSchema;
      break;
    case "Date":
    case "DateTime":
      schema = DateOptionsSchema;
      break;
    case "Input":
      schema = InputOptionsSchema;
      break;
    case "Cycle":
      schema = CycleOptionsSchema;
      break;
    case "Boolean":
      schema = BooleanOptionsSchema;
      break;
    case "Time":
      schema = TimeOptionsSchema;
      break;
    case "Multi":
      schema = MultiOptionsSchema;
      break;
    case "File":
    case "MultiFile":
      schema = FileOptionsSchema;
      break;
    case "Media":
    case "MultiMedia":
      schema = MediaOptionsSchema;
      break;
    case "Canvas":
    case "CanvasGroup":
    case "CanvasGroupLink":
    case "Formula":
    case "Lookup":
    case "JSON":
    case "YAML":
    case "Object":
    case "ObjectList":
    default:
      schema = z.any(); // Fallback for types without specific option schemas or complex ones
      break;
  }

  const result = schema.safeParse(val.options);
  if (!result.success) {
    result.error.issues.forEach(issue => {
      ctx.addIssue({
        ...issue,
        path: ["options", ...issue.path]
      });
    });
  }
});

export type ValidatedFieldInfo = z.infer<typeof ValidatedFieldInfoSchema>;