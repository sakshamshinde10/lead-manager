import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import FormField from '../components/FormField'
import { useAuth } from '../hooks/useAuth'
import { showApiError } from '../lib/formErrors'
import { signupSchema } from '../lib/schemas'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(signupSchema), defaultValues: { name: '', email: '', password: '' } })

  const onSubmit = async (values) => {
    try {
      await signup(values)
      navigate('/leads', { replace: true })
    } catch (error) {
      showApiError(error, setError)
    }
  }

  return (
    <AuthLayout
      lines={['Start with your', 'first lead.']}
      blurb="Lead Manager keeps every lead, where it came from and how far along it is, in one place."
    >
      <h1 data-fade className="display text-4xl">
        Create your account
      </h1>
      <p data-fade className="mt-2 text-muted">
        It takes about a minute.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-6">
        {errors.root && (
          <p role="alert" className="rounded-xl border-2 border-ink bg-brand-100 px-4 py-3 text-sm font-medium">
            {errors.root.message}
          </p>
        )}

        <FormField label="Your name" autoComplete="name" placeholder="Full name" error={errors.name?.message} {...register('name')} />

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
          autoComplete="new-password"
          hint="At least 8 characters, with a number and a special character (for example @ or !)."
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
          <Button type="submit" loading={isSubmitting} loadingText="Creating account…" className="w-full">
            Create account
          </Button>
        </div>
      </form>

      <p data-fade className="mt-8 text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-ink underline decoration-2 underline-offset-4 hover:decoration-brand-500">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
