import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/useAuth"

export function ProfilePage() {
  const { email, isLoggedIn, logout } = useAuth()

  if (!isLoggedIn) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center px-4 py-6 pb-14 text-center text-sm">
        Log in to view your profile.
      </div>
    )
  }

  return (
    <div className="scrollbar-hide flex-1 overflow-y-auto px-4 py-6 pb-14">
      <p className="text-sm font-medium">Signed in as</p>
      <p className="mt-1 text-sm">{email}</p>
      <Button variant="outline" className="mt-6" onClick={logout}>
        Log out
      </Button>
    </div>
  )
}
