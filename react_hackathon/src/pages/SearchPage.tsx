import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Search } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { ContentItem } from "@/components/content/ContentItem"
import { useAuth } from "@/contexts/useAuth"
import { getContentByTheme, type ContentFeedItem } from "@/lib/api"

export function SearchPage() {
  const { email, isLoggedIn } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTheme = searchParams.get("theme") ?? ""
  const [draftTheme, setDraftTheme] = useState(selectedTheme)
  const [items, setItems] = useState<ContentFeedItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setDraftTheme(selectedTheme)
  }, [selectedTheme])

  useEffect(() => {
    if (!isLoggedIn || !selectedTheme) {
      setItems([])
      setError(null)
      setIsLoading(false)
      return
    }

    let cancelled = false
    setIsLoading(true)

    getContentByTheme(selectedTheme, email)
      .then((nextItems) => {
        if (!cancelled) {
          setItems(nextItems)
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setItems([])
          setError("Could not load content for this hashtag.")
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
  }, [email, isLoggedIn, selectedTheme])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextTheme = draftTheme.trim()
    if (nextTheme) {
      setSearchParams({ theme: nextTheme })
    } else {
      setSearchParams({})
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 pb-14">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <form className="relative" onSubmit={handleSubmit}>
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          id="search"
          type="search"
          placeholder="Search topics…"
          value={draftTheme}
          onChange={(event) => setDraftTheme(event.target.value)}
          className="border-input bg-card focus-visible:ring-ring w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </form>

      {!selectedTheme ? (
        <p className="text-muted-foreground mt-8 text-center text-sm">
          Tap a hashtag to find related content.
        </p>
      ) : null}

      {selectedTheme ? (
        <p className="text-muted-foreground mt-4 text-sm">
          Showing results for #{selectedTheme.replace(/\s+/g, "").toLowerCase()}
        </p>
      ) : null}

      {error ? (
        <p className="text-muted-foreground mt-4 text-sm">{error}</p>
      ) : null}

      {isLoading ? (
        <p className="text-muted-foreground mt-4 text-sm">Loading results…</p>
      ) : null}

      {!isLoading && selectedTheme && !error && items.length === 0 ? (
        <p className="text-muted-foreground mt-4 text-sm">
          No content found for this hashtag.
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
