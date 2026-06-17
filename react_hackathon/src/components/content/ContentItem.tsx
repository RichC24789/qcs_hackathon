import { useEffect, useRef, useState } from "react"
import { Heart, Share2 } from "lucide-react"

import { ContentDetailDialog } from "@/components/content/ContentDetailDialog"
import { Button } from "@/components/ui/button"
import { getTopicLikeStatus, likeTopic, logActivity, unlikeTopic } from "@/lib/api"
import { cn } from "@/lib/utils"

export type ContentItemProps = {
  slug: string
  title: string
  subtitle: string
  hook: string
  text: string
  userEmail: string | null
  initialLikeCount?: number
  initialLikedByCurrentUser?: boolean
  otherUsersLikeCount?: number
}

export function ContentItem({
  slug,
  title,
  subtitle,
  hook,
  text,
  userEmail,
  initialLikeCount,
  initialLikedByCurrentUser,
  otherUsersLikeCount = 0,
}: ContentItemProps) {
  const articleRef = useRef<HTMLElement>(null)
  const hasLoggedViewRef = useRef(false)
  const [isLiked, setIsLiked] = useState(initialLikedByCurrentUser ?? false)
  const [likeCount, setLikeCount] = useState(initialLikeCount ?? 0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  useEffect(() => {
    if (initialLikeCount !== undefined && initialLikedByCurrentUser !== undefined) {
      setIsLiked(initialLikedByCurrentUser)
      setLikeCount(initialLikeCount)
      return
    }

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
  }, [slug, userEmail, initialLikeCount, initialLikedByCurrentUser])

  useEffect(() => {
    if (!userEmail || !articleRef.current) {
      return
    }

    const element = articleRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries.some((entry) => entry.isIntersecting)
        if (!isVisible || hasLoggedViewRef.current) {
          return
        }

        hasLoggedViewRef.current = true
        logActivity(userEmail, "topic_viewed", slug).catch(() => {
          hasLoggedViewRef.current = false
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
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
    <>
      <article
        ref={articleRef}
        className="mx-3 my-3 shrink-0 rounded-xl border bg-card px-4 py-4 shadow-sm"
      >
        <h2 className="text-base font-semibold">{title}</h2>
        {subtitle ? (
          <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
        ) : null}
        {otherUsersLikeCount > 0 ? (
          <p className="text-muted-foreground mt-1 text-xs">
            Popular with {otherUsersLikeCount} other learner{otherUsersLikeCount === 1 ? "" : "s"}
          </p>
        ) : null}
        <p className="mt-2 text-sm leading-relaxed">{hook}</p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setIsDetailOpen(true)}
        >
          Read more
        </Button>

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
                "size-6 shrink-0",
                isLiked && "fill-current text-red-500"
              )}
            />
            <span className="w-6 text-left text-sm tabular-nums">{likeCount}</span>
          </button>
          <button type="button" aria-label="Share" className="shrink-0 p-1">
            <Share2 className="size-6" />
          </button>
        </div>
      </article>

      {isDetailOpen ? (
        <ContentDetailDialog
          title={title}
          summary={hook}
          text={text}
          onClose={() => setIsDetailOpen(false)}
        />
      ) : null}
    </>
  )
}
