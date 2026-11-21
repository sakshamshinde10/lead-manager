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

// The status and source lists are owned by the server (GET /leads/options),
// so here we only check that something was chosen. The server enforces the
// exact allowed values.
export const leadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  email,
  phone: z
    .string()
    .trim()
    .max(20, 'Phone must be at most 20 characters')
    .refine((value) => value === '' || /^\+?[\d\s\-()]{7,20}$/.test(value), 'Enter a valid phone number'),
  company: z.string().trim().max(100, 'Company must be at most 100 characters'),
  source: z.string().min(1, 'Choose a source'),
  status: z.string().min(1, 'Choose a status'),
})

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
