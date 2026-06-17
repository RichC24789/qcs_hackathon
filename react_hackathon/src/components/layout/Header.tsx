import { Link } from "react-router-dom"

const QCS_URL = "https://www.qcs.co.uk/what-we-do/"

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[#0F4146] bg-[#0F4146]">
      <div className="flex h-16 items-center justify-between gap-3 px-4">
        <Link
          to="/"
          aria-label="QCS Pulse home"
          className="text-lg font-semibold tracking-tight text-white"
        >
          QCS Pulse
        </Link>
        <a
          href={QCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0F4146] transition-colors hover:bg-white/90 active:scale-95"
        >
          Get QCS
        </a>
      </div>
    </header>
  )
}
