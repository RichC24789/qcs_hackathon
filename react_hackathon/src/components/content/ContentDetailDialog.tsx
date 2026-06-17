import { X } from "lucide-react"
import { useEffect } from "react"

import { ContentText } from "@/components/content/ContentText"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ContentDetailDialogProps = {
  title: string
  summary: string
  text: string
  onClose: () => void
}

export function ContentDetailDialog({
  title,
  summary,
  text,
  onClose,
}: ContentDetailDialogProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <Card className="relative z-10 flex max-h-[85svh] w-full max-w-[390px] flex-col overflow-hidden shadow-xl">
        <CardHeader className="shrink-0 border-b">
          <CardTitle className="pr-8 text-base leading-snug">{title}</CardTitle>
          <CardAction>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={onClose}
            >
              <X />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="scrollbar-hide overflow-y-auto py-4">
          <ContentText summary={summary} text={text} />
        </CardContent>
      </Card>
    </div>
  )
}
