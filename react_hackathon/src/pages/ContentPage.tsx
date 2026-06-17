import { useCallback, useEffect, useState } from "react"

import { ContentItem } from "@/components/content/ContentItem"
import { PullToRefresh } from "@/components/content/PullToRefresh"
import { useAuth } from "@/contexts/useAuth"
import { getContentFeed, type ContentFeedItem } from "@/lib/api"

export function ContentPage() {
  const { email, isLoggedIn } = useAuth()
  const [items, setItems] = useState<ContentFeedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchFeed = useCallback(async () => {
    if (!email) {
      return []
    }

    return getContentFeed(email, 10)
  }, [email])

  useEffect(() => {
    if (!isLoggedIn || !email) {
      return
    }

    let cancelled = false

    fetchFeed()
      .then((nextItems) => {
        if (!cancelled) {
          setItems(nextItems)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load your feed from the API.")
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
  }, [email, fetchFeed, isLoggedIn])

  const handleRefresh = useCallback(async () => {
    if (!email) {
      return
    }

    setIsLoading(true)
    try {
      const nextItems = await fetchFeed()
      setItems(nextItems)
      setError(null)
    } catch {
      setError("Could not load your feed from the API.")
    } finally {
      setIsLoading(false)
    }
  }, [email, fetchFeed])

  if (!isLoggedIn) {
    return (
      <p className="text-muted-foreground px-4 py-4 text-sm">
        Log in to see your personalized feed.
      </p>
    )
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className="px-1 pb-14 pt-1">
      {error ? (
        <p className="text-muted-foreground px-4 py-4 text-sm">{error}</p>
      ) : null}

      {isLoading && items.length === 0 ? (
        <p className="text-muted-foreground px-4 py-4 text-sm">Loading feed…</p>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <p className="text-muted-foreground px-4 py-4 text-sm">
          No content available right now. Pull down to refresh.
        </p>
      ) : null}

      {items.map((item) => (
        <ContentItem
          key={item.slug}
          slug={item.slug}
          title={item.title}
          subtitle={item.theme}
          contentType={item.contentType}
          contentUrl={item.contentUrl}
          hook={item.hook}
          text={item.text}
          userEmail={email}
          initialLikeCount={item.likeCount}
          initialLikedByCurrentUser={item.likedByCurrentUser}
        />
      ))}
    </PullToRefresh>
  )
}
