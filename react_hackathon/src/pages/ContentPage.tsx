import { useEffect, useState } from "react"

import { ContentItem } from "@/components/content/ContentItem"
import { useAuth } from "@/contexts/AuthContext"
import { getTopics, type TopicSummary } from "@/lib/api"

export function ContentPage() {
  const { email } = useAuth()
  const [topics, setTopics] = useState<TopicSummary[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getTopics()
      .then(setTopics)
      .catch(() => setError("Could not load topics from the API."))
  }, [])

  if (error) {
    return <p className="text-muted-foreground px-4 py-4 text-sm">{error}</p>
  }

  if (topics.length === 0) {
    return <p className="text-muted-foreground px-4 py-4 text-sm">Loading topics…</p>
  }

  return (
    <div className="flex flex-col">
      {topics.map((topic) => (
        <ContentItem
          key={topic.slug}
          slug={topic.slug}
          title={topic.title}
          body={`${topic.theme} · ${topic.primaryFormat}`}
          userEmail={email}
        />
      ))}
    </div>
  )
}
