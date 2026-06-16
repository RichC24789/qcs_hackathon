import { LoginScreen } from "@/components/auth/LoginScreen"
import { useAuth } from "@/contexts/AuthContext"

export function ProfilePage() {
  const { email, isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <LoginScreen />
  }

  return (
    <div className="px-4 py-6">
      <p className="text-sm">{email}</p>
    </div>
  )
}
