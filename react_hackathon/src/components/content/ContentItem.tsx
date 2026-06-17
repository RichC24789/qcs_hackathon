import { useEffect, useRef, useState } from "react"
import { Heart, Share2 } from "lucide-react"

import { AudioBlobPlayer } from "@/components/content/AudioBlobPlayer"
import { ContentText } from "@/components/content/ContentText"
import { QcsLink } from "@/components/content/QcsLink"
import { ShareSheet } from "@/components/content/ShareSheet"
import { Button } from "@/components/ui/button"
import {
  getTopicLikeStatus,
  likeTopic,
  logActivity,
  resolveBackendUrl,
  unlikeTopic,
} from "@/lib/api"
import { cn } from "@/lib/utils"

const actionButtonClass =
  "text-muted-foreground hover:text-foreground cursor-pointer rounded-full transition-colors hover:bg-[#0F4146]/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4146]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:active:scale-100"

export type ContentItemProps = {
  slug: string
  title: string
  subtitle: string
  contentType: string
  contentUrl?: string
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
  contentType,
  contentUrl,
  hook,
  text,
  userEmail,
  initialLikeCount,
  initialLikedByCurrentUser,
}: ContentItemProps) {
  const articleRef = useRef<HTMLElement>(null)
  const hasLoggedViewRef = useRef(false)
  const [isLiked, setIsLiked] = useState(initialLikedByCurrentUser ?? false)
  const [likeCount, setLikeCount] = useState(initialLikeCount ?? 0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const normalizedContentType = contentType.toLowerCase()
  const isPodcast = normalizedContentType === "podcast"
  const isPoster = normalizedContentType === "poster"
  const resolvedContentUrl = contentUrl ? resolveBackendUrl(contentUrl) : undefined
  const isTextContent =
    normalizedContentType === "text" || normalizedContentType === "text-card"
  const bodyText = text

  useEffect(() => {
    if (initialLikeCount !== undefined && initialLikedByCurrentUser !== undefined) {
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

  useEffect(() => {
    if (!isTextContent || !isExpanded) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      const article = articleRef.current
      if (!article || article.contains(event.target as Node)) {
        return
      }

      setIsExpanded(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
    }
  }, [isExpanded, isTextContent])

  function toggleExpanded() {
    if (!isTextContent) {
      return
    }

    setIsExpanded(true)
  }

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
    <article
      ref={articleRef}
      className="mx-1.5 my-1.5 shrink-0 rounded-xl border bg-card px-4 py-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle ? (
            <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
          ) : null}
        </div>
        <QcsLink />
      </div>
      <p className="mt-2 text-sm leading-relaxed">{hook}</p>

      {isPodcast ? (
        <AudioBlobPlayer src={resolvedContentUrl} title={title} />
      ) : null}

      {isPoster && resolvedContentUrl ? (
        <img
          src={resolvedContentUrl}
          alt={title}
          loading="lazy"
          className="mt-3 w-full rounded-lg border object-contain"
        />
      ) : null}

      {isTextContent && !isExpanded ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3 gap-1.5 rounded-full"
          aria-expanded={isExpanded}
          onClick={toggleExpanded}
        >
          Read more
        </Button>
      ) : null}

      {isTextContent ? (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-out",
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={cn(
                "transition-[opacity,transform,margin-top] duration-300 ease-out",
                isExpanded
                  ? "mt-3 translate-y-0 opacity-100"
                  : "-translate-y-1 opacity-0"
              )}
            >
              {bodyText ? (
                <ContentText text={bodyText} showSummary={false} />
              ) : (
                <p className="text-muted-foreground text-sm">
                  Full text is not available for this item.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          aria-label={isLiked ? "Unlike" : "Like"}
          aria-pressed={isLiked}
          disabled={!userEmail || isUpdating}
          onClick={toggleLike}
          className={cn("flex items-center gap-1 p-1.5", actionButtonClass)}
        >
          <Heart
            className={cn(
              "size-6 shrink-0",
              isLiked && "fill-current text-red-500"
            )}
          />
          <span className="w-6 text-left text-sm tabular-nums">{likeCount}</span>
        </button>
        <button
          type="button"
          aria-label="Share"
          className={cn("shrink-0 p-1.5", actionButtonClass)}
          onClick={() => setIsShareOpen(true)}
        >
          <Share2 className="size-6" />
        </button>
      </div>

      <ShareSheet
        title={title}
        description={hook}
        slug={slug}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </article>
  )
}
