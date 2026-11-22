import { ApiError } from './api'

// Shows a failed request on a React Hook Form form:
//   - the server named specific fields  -> each message goes under its field
//     (for example "You already have a lead with this email" under Email)
//   - anything else (wrong password, server unreachable) -> one message at the
//     top of the form, stored under the special "root" key
export function showApiError(error, setError) {
  if (error instanceof ApiError && error.errors) {
    Object.entries(error.errors).forEach(([field, message]) => setError(field, { message }))
  } else {
    setError('root', { message: error.message })
  }
}
