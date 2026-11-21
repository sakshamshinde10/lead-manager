import { z } from 'zod'

// These rules mirror the backend validators, so the user gets instant feedback
// in the browser. The server still re-checks everything: it never trusts the
// frontend, because anyone can call the API without it.

const email = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .max(254, 'Email is too long')
  .pipe(z.email('Enter a valid email address'))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email,
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be at most 72 characters'),
})
