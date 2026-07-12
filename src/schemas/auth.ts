import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Password is required."),
  rememberMe: z.coerce.boolean().optional().default(false),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Password must include one uppercase letter.")
    .regex(/[a-z]/, "Password must include one lowercase letter.")
    .regex(/\d/, "Password must include one number.")
    .regex(/[^A-Za-z0-9]/, "Password must include one special character."),
  phone: z.string().trim().optional(),
  employeeId: z.string().trim().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
