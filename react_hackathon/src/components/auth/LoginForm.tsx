import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { ApiError } from "@/lib/api"

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = email.trim()
    if (!trimmed) {
      setError("Enter your email address.")
      return
    }

    if (!trimmed.includes("@")) {
      setError("Enter a valid email address.")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await login(trimmed)
      navigate("/", { replace: true })
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 401) {
        setError(
          "That email is not registered. Use one of the seeded demo accounts."
        )
      } else {
        setError("Unable to log in right now. Please try again.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <h1 className="text-lg font-semibold">Log in</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Enter a seeded demo email to continue, for example{" "}
        <span className="font-medium">alice.care@example.com</span>.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="alice.care@example.com"
            disabled={isSubmitting}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-3 disabled:opacity-50"
          />
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </>
  )
}
