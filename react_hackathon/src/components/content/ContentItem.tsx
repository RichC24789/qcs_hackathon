import { useEffect, useState } from "react"
import { Heart, Share2 } from "lucide-react"

import { getTopicLikeStatus, likeTopic, unlikeTopic } from "@/lib/api"
import { cn } from "@/lib/utils"

export type ContentItemProps = {
  slug: string
  title: string
  body: string
  userEmail: string | null
}

export function ContentItem({ slug, title, body, userEmail }: ContentItemProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false

    getTopicLikeStatus(slug, userEmail)
      .then((status) => {
        if (!cancelled) {
          setIsLiked(status.likedByCurrentUser)
          setLikeCount(status.likeCount)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsLiked(false)
          setLikeCount(0)
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug, userEmail])

  async function toggleLike() {
    if (!userEmail || isUpdating) {
      return
    }

    setIsUpdating(true)

    try {
      const status = isLiked
        ? await unlikeTopic(slug, userEmail)
        : await likeTopic(slug, userEmail)

      setIsLiked(status.likedByCurrentUser)
      setLikeCount(status.likeCount)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <article className="border-b px-4 py-4">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{body}</p>

      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          aria-label={isLiked ? "Unlike" : "Like"}
          aria-pressed={isLiked}
          disabled={!userEmail || isUpdating}
          onClick={toggleLike}
          className="flex items-center gap-1 p-1 disabled:opacity-50"
        >
          <Heart
            className={cn(
              "size-6",
              isLiked && "fill-current text-red-500"
            )}
          />
          <span className="text-sm">{likeCount}</span>
        </button>
        <button type="button" aria-label="Share" className="p-1">
          <Share2 className="size-6" />
        </button>
      </div>
    </article>
  )
}
