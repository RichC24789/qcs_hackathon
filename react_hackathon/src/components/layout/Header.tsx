import { Link } from "react-router-dom"

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[#0F4146] bg-[#0F4146]">
      <div className="flex h-16 items-center px-4">
        <Link to="/" aria-label="QCS home" className="inline-flex items-center">
          <img
            src="/qcs-logo-white.png"
            alt="Quality Compliance Systems"
            className="h-11 w-auto"
          />
        </Link>
      </div>
    </header>
  )
}
