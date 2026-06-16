import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    login(trimmed)
  }

  return (
    <>
      <h1 className="text-lg font-semibold">Log in</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Enter your email to continue.
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
            placeholder="you@example.com"
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
          />
        </div>

        {error ? <p className="text-destructive text-sm">{error}</p> : null}

        <Button type="submit" className="w-full">
          Log in
        </Button>
      </form>
    </>
  )
}
