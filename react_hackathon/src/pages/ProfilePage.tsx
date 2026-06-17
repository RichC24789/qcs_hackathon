import { useEffect, useState } from "react"
import { ChevronRight, Heart } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/useAuth"
import { getLikedContent, type ContentFeedItem } from "@/lib/api"

export function ProfilePage() {
  const { email, isLoggedIn, logout } = useAuth()
  const [likedItems, setLikedItems] = useState<ContentFeedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isLoggedIn || !email) {
      return
    }

    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) {
        setIsLoading(true)
      }
    })

    getLikedContent(email)
      .then((items) => {
        if (!cancelled) {
          setLikedItems(items)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLikedItems([])
          setError("Could not load your liked posts.")
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [email, isLoggedIn])

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

        {isLoading ? (
          <p className="text-muted-foreground mt-3 text-sm">Loading liked posts…</p>
        ) : null}

        {error ? (
          <p className="text-muted-foreground mt-3 text-sm">{error}</p>
        ) : null}

        {!isLoading && !error && likedItems.length === 0 ? (
          <div className="mt-3 rounded-xl border bg-card px-4 py-6 text-center shadow-sm">
            <Heart className="text-muted-foreground mx-auto size-8" aria-hidden />
            <p className="text-muted-foreground mt-2 text-sm">
              Posts you like will appear here.
            </p>
          </div>
        ) : null}

        {likedItems.length > 0 ? (
          <Link
            to="/profile/liked"
            className="mt-3 flex items-center gap-3 rounded-xl border bg-card px-4 py-4 shadow-sm transition-colors hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4146]/40 focus-visible:ring-offset-2"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#0F4146]/10 text-[#0F4146]">
              <Heart className="size-5 fill-current" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">
                {likedItems.length} liked {likedItems.length === 1 ? "post" : "posts"}
              </span>
              <span className="text-muted-foreground mt-1 block truncate text-xs">
                {likedItems
                  .slice(0, 2)
                  .map((item) => item.title)
                  .join(", ")}
              </span>
            </span>
            <ChevronRight className="text-muted-foreground size-5 shrink-0" />
          </Link>
        ) : null}
      </section>

      <div className="mt-8 flex flex-col gap-3">
        <Button variant="outline" onClick={logout}>
          Log out
        </Button>
        <Button variant="destructive" type="button" onClick={logout}>
          Delete account
        </Button>
      </div>
    </div>
  )
}
