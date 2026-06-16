import { useCallback, useEffect, useState } from "react"

import { ContentItem } from "@/components/content/ContentItem"
import { PullToRefresh } from "@/components/content/PullToRefresh"
import { useAuth } from "@/contexts/AuthContext"
import { getContentFeed, type ContentFeedItem } from "@/lib/api"

export function ContentPage() {
  const { email, isLoggedIn } = useAuth()
  const [items, setItems] = useState<ContentFeedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadFeed = useCallback(async () => {
    if (!email) {
      setItems([])
      return
    }

    const nextItems = await getContentFeed(email, 10)
    setItems(nextItems)
    setError(null)
  }, [email])

  useEffect(() => {
    if (!isLoggedIn || !email) {
      setIsLoading(false)
      return
    }

    loadFeed()
      .catch(() => setError("Could not load your feed from the API."))
      .finally(() => setIsLoading(false))
  }, [email, isLoggedIn, loadFeed])

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 650))
    await loadFeed()
  }, [loadFeed])

  if (!isLoggedIn) {
    return (
      <p className="text-muted-foreground px-4 py-4 text-sm">
        Log in to see your personalized feed.
      </p>
    )
  }

  if (error) {
    return <p className="text-muted-foreground px-4 py-4 text-sm">{error}</p>
  }

  if (isLoading) {
    return <p className="text-muted-foreground px-4 py-4 text-sm">Loading feed…</p>
  }

  if (items.length === 0) {
    return (
      <p className="text-muted-foreground px-4 py-4 text-sm">
        No content available right now. Pull down to refresh.
      </p>
    )
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className="pb-14">
      {items.map((item) => (
        <ContentItem
          key={item.slug}
          slug={item.slug}
          title={item.title}
          subtitle={`${item.theme} · ${item.primaryFormat}`}
          hook={item.hook}
          userEmail={email}
          initialLikeCount={item.likeCount}
          initialLikedByCurrentUser={item.likedByCurrentUser}
        />
      ))}
    </PullToRefresh>
  )
}
