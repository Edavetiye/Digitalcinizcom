import { z } from "zod";

export const customerCreateSchema = z.object({
  name: z.string().trim().min(2, "Ad en az 2 karakter olmalı."),
  email: z.string().trim().email("Geçerli bir e-posta girin."),
  phone: z
    .string()
    .trim()
    .max(30)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  plan: z.enum(["free", "pro"]).default("free"),
});

export const customerUpdateSchema = customerCreateSchema
  .omit({ email: true })
  .extend({ id: z.string().uuid() });

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;
