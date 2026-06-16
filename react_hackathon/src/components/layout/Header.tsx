import { Link } from "react-router-dom"

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="flex h-[44px] items-center px-4">
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight"
        >
          QCS
        </Link>
      </div>
    </header>
  )
}
