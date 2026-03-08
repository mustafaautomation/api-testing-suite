import { z } from 'zod';

export const LoginResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
});

export const ErrorResponseSchema = z.object({
  message: z.string().min(1),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
