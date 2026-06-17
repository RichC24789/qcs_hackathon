import { useEffect, useRef, useState } from "react"
import { Heart, Share2 } from "lucide-react"

import { ContentText } from "@/components/content/ContentText"
import { QcsLink } from "@/components/content/QcsLink"
import { ShareSheet } from "@/components/content/ShareSheet"
import { Button } from "@/components/ui/button"
import {
  getTopicBySlug,
  getTopicLikeStatus,
  likeTopic,
  logActivity,
  unlikeTopic,
} from "@/lib/api"
import { cn } from "@/lib/utils"

const TEXT_CARD_FORMAT = "text-card"

const actionButtonClass =
  "text-muted-foreground hover:text-foreground cursor-pointer rounded-full transition-colors hover:bg-[#0F4146]/10 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4146]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:active:scale-100"

export type ContentItemProps = {
  slug: string
  title: string
  subtitle: string
  hook: string
  text: string
  format: string
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
  format,
  userEmail,
  initialLikeCount,
  initialLikedByCurrentUser,
  otherUsersLikeCount: _otherUsersLikeCount = 0,
}: ContentItemProps) {
  const articleRef = useRef<HTMLElement>(null)
  const hasLoggedViewRef = useRef(false)
  const [isLiked, setIsLiked] = useState(initialLikedByCurrentUser ?? false)
  const [likeCount, setLikeCount] = useState(initialLikeCount ?? 0)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [fetchedText, setFetchedText] = useState("")
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const isTextCard = format === TEXT_CARD_FORMAT
  const bodyText = text || fetchedText

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

  async function loadBodyText() {
    if (bodyText) {
      return
    }

    setIsLoadingDetail(true)

    try {
      const topic = await getTopicBySlug(slug, userEmail)
      setFetchedText(topic.text ?? "")
    } catch {
      setFetchedText("")
    } finally {
      setIsLoadingDetail(false)
    }
  }

  async function toggleExpanded() {
    if (!isTextCard) {
      return
    }

    if (isExpanded) {
      setIsExpanded(false)
      return
    }

    setIsExpanded(true)
    await loadBodyText()
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

      {isTextCard ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          aria-expanded={isExpanded}
          onClick={() => void toggleExpanded()}
        >
          {isExpanded ? "Read less" : "Read more"}
        </Button>
      ) : null}

      {isTextCard ? (
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-in-out",
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={cn(
                "border-t pt-4 transition-opacity duration-300 ease-in-out",
                isExpanded ? "mt-3 opacity-100" : "opacity-0"
              )}
            >
              {isLoadingDetail ? (
                <p className="text-muted-foreground text-sm">Loading…</p>
              ) : bodyText ? (
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
