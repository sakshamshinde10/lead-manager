import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../lib/api'
import { loginSchema } from '../lib/schemas'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // If the user was sent here from a protected page, return them to it.
  const destination = location.state?.from?.pathname ?? '/leads'

  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  const onSubmit = async (values) => {
    try {
      await login(values)
      navigate(destination, { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.errors) {
        // Put each server message next to the field it belongs to.
        Object.entries(error.errors).forEach(([field, message]) => setError(field, { message }))
      } else {
        // For example a wrong password, or the server being unreachable.
        setError('root', { message: error.message })
      }
    }
  }

  return (
    <AuthLayout
      lines={['Know who', 'you called,', "and who's next."]}
      blurb="Lead Manager keeps every lead, where it came from and how far along it is, in one place."
    >
      <h1 data-fade className="display text-4xl">
        Sign in
      </h1>
      <p data-fade className="mt-2 text-muted">
        Pick up where you left off.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-6">
        {errors.root && (
          <p role="alert" className="rounded-xl border-2 border-ink bg-brand-100 px-4 py-3 text-sm font-medium">
            {errors.root.message}
          </p>
        )}

        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <FormField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          error={errors.password?.message}
          right={
            <button
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-pressed={showPassword}
              className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-muted hover:text-ink"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          }
          {...register('password')}
        />

        <div data-field>
          <Button type="submit" loading={isSubmitting} loadingText="Signing in…" className="w-full">
            Sign in
          </Button>
        </div>
      </form>

      <p data-fade className="mt-8 text-sm text-muted">
        New here?{' '}
        <Link to="/signup" className="font-semibold text-ink underline decoration-2 underline-offset-4 hover:decoration-brand-500">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
