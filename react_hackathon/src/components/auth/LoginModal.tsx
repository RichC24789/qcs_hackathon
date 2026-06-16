import { LoginForm } from "@/components/auth/LoginForm"
import { useAuth } from "@/contexts/AuthContext"

export function LoginModal() {
  const { isLoggedIn } = useAuth()

  if (isLoggedIn) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="bg-background relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-xl"
      >
        <div id="login-title">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
