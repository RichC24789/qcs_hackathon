import { useCallback, useEffect, useState } from "react"

import { ContentItem } from "@/components/content/ContentItem"
import { PullToRefresh } from "@/components/content/PullToRefresh"
import { useAuth } from "@/contexts/AuthContext"
import { getTopics, type TopicSummary } from "@/lib/api"

export function ContentPage() {
  const { email } = useAuth()
  const [topics, setTopics] = useState<TopicSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadTopics = useCallback(async () => {
    const nextTopics = await getTopics()
    setTopics(nextTopics)
    setError(null)
  }, [])

  useEffect(() => {
    loadTopics()
      .catch(() => setError("Could not load topics from the API."))
      .finally(() => setIsLoading(false))
  }, [loadTopics])

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 650))
    await loadTopics()
  }, [loadTopics])

  if (error) {
    return <p className="text-muted-foreground px-4 py-4 text-sm">{error}</p>
  }

  if (isLoading) {
    return <p className="text-muted-foreground px-4 py-4 text-sm">Loading topics…</p>
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className="pb-14">
      {topics.map((topic) => (
        <ContentItem
          key={topic.slug}
          slug={topic.slug}
          title={topic.title}
          body={`${topic.theme} · ${topic.primaryFormat}`}
          userEmail={email}
        />
      ))}
    </PullToRefresh>
  )
}
