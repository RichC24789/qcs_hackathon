import { useState } from "react"
import { Heart, Share2 } from "lucide-react"

import { cn } from "@/lib/utils"

export type ContentItemProps = {
  id: string
  title: string
  body: string
}

export function ContentItem({ title, body }: ContentItemProps) {
  const [isLiked, setIsLiked] = useState(false)

  return (
    <article className="border-b px-4 py-4">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-muted-foreground mt-1 text-sm">{body}</p>

      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          aria-label={isLiked ? "Unlike" : "Like"}
          aria-pressed={isLiked}
          onClick={() => setIsLiked((liked) => !liked)}
          className="p-1"
        >
          <Heart
            className={cn(
              "size-6",
              isLiked && "fill-current text-red-500"
            )}
          />
        </button>
        <button type="button" aria-label="Share" className="p-1">
          <Share2 className="size-6" />
        </button>
      </div>
    </article>
  )
}
