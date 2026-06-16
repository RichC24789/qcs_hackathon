import { useCallback, useState } from "react"

import { ContentItem } from "@/components/content/ContentItem"
import { PullToRefresh } from "@/components/content/PullToRefresh"
import { getFeedItems } from "@/lib/content"

export function ContentPage() {
  const [items, setItems] = useState(() => getFeedItems())

  const handleRefresh = useCallback(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setItems(getFeedItems({ shuffle: true }))
  }, [])

  return (
    <PullToRefresh onRefresh={handleRefresh} className="pb-14">
      {items.map((item) => (
        <ContentItem key={item.id} id={item.id} title={item.title} body={item.body} />
      ))}
    </PullToRefresh>
  )
}
