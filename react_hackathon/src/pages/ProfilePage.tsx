import { Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

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

      <section className="mt-8">
        <h2 className="text-sm font-medium">Liked posts</h2>
        <div className="mt-3 rounded-xl border bg-card px-4 py-6 text-center shadow-sm">
          <Heart className="text-muted-foreground mx-auto size-8" aria-hidden />
          <p className="text-muted-foreground mt-2 text-sm">
            Posts you like will appear here.
          </p>
        </div>
      </section>

      <div className="mt-8 flex flex-col gap-3">
        <Button variant="outline" onClick={logout}>
          Log out
        </Button>
        <Button variant="destructive" type="button">
          Delete account
        </Button>
      </div>
    </div>
  )
}
