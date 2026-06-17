import { Search } from "lucide-react"

export function SearchPage() {
  return (
    <div className="flex flex-1 flex-col px-4 py-6 pb-14">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="relative">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <input
          id="search"
          type="search"
          placeholder="Search topics…"
          className="border-input bg-card focus-visible:ring-ring w-full rounded-xl border py-2.5 pr-4 pl-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
        />
      </div>
      <p className="text-muted-foreground mt-8 text-center text-sm">
        Search is coming soon.
      </p>
    </div>
  )
}
