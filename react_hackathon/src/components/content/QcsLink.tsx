import { ChevronRight } from "lucide-react"

export function QcsLink() {
  return (
    <a
      href="https://www.qcs.co.uk/what-we-do/"
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-0.5 text-[11px] font-medium tracking-wide"
    >
      QCS
      <ChevronRight className="size-3" aria-hidden />
    </a>
  )
}
