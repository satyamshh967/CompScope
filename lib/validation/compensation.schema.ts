import { z } from "zod";

export const compensationSchema = z.object({
  company: z.string().trim().min(1).max(100),

  role: z.string().trim().min(1).max(100),

  level: z.string().trim().min(1).max(100),

  city: z.string().trim().min(1).max(100),

  country: z.string().trim().min(1).max(100),

  baseSalary: z.number().finite().nonnegative(),

  stock: z.number().finite().nonnegative().default(0),

  bonus: z.number().finite().nonnegative().default(0),

  currency: z
    .string()
    .trim()
    .length(3)
    .default("INR"),

  yearsExperience: z
    .number()
    .finite()
    .nonnegative()
    .optional(),

  source: z
    .string()
    .trim()
    .max(200)
    .optional(),
});

export type CompensationInput = z.infer<
  typeof compensationSchema
>;