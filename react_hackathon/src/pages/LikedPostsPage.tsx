import { useEffect, useState } from "react"
import { Heart } from "lucide-react"

import { ContentItem } from "@/components/content/ContentItem"
import { useAuth } from "@/contexts/useAuth"
import { getLikedContent, type ContentFeedItem } from "@/lib/api"

export function LikedPostsPage() {
  const { email, isLoggedIn } = useAuth()
  const [items, setItems] = useState<ContentFeedItem[]>([])
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
      .then((nextItems) => {
        if (!cancelled) {
          setItems(nextItems)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([])
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
        Log in to view your liked posts.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 pb-14">
      <div className="flex items-center gap-2">
        <Heart className="size-5 fill-current text-[#0F4146]" aria-hidden />
        <h1 className="text-base font-semibold">Liked posts</h1>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground mt-4 text-sm">Loading liked posts…</p>
      ) : null}

      {error ? (
        <p className="text-muted-foreground mt-4 text-sm">{error}</p>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <p className="text-muted-foreground mt-8 text-center text-sm">
          Posts you like will appear here.
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="-mx-2 mt-2">
          {items.map((item) => (
            <ContentItem
              key={`${item.number}-${item.slug}`}
              slug={item.slug}
              title={item.title}
              subtitle={item.theme}
              contentType={item.contentType}
              contentUrl={item.contentUrl}
              hook={item.hook}
              text={item.text ?? ""}
              themes={item.themes ?? []}
              quizType={item.type}
              quizQuestion={item.question}
              quizOptions={item.options}
              quizCorrectAnswer={item.correctAnswer}
              userEmail={email}
              initialLikeCount={item.likeCount}
              initialLikedByCurrentUser={item.likedByCurrentUser}
              otherUsersLikeCount={item.otherUsersLikeCount}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
