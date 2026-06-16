import { LayoutGrid, User } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import { cn } from "@/lib/utils"

const tabs = [
  {
    label: "Content",
    to: "/",
    icon: LayoutGrid,
    match: (path: string) => path === "/",
  },
  {
    label: "Profile",
    to: "/profile",
    icon: User,
    match: (path: string) => path.startsWith("/profile"),
  },
] as const

export function Footer() {
  const { pathname } = useLocation()

  return (
    <footer className="fixed bottom-0 left-1/2 z-10 w-full max-w-[430px] -translate-x-1/2 border-t bg-white">
      <nav className="flex h-[49px] items-center justify-around px-2">
        {tabs.map(({ label, to, icon: Icon, match }) => {
          const isActive = match(pathname)

          return (
            <Link
              key={label}
              to={to}
              aria-label={label}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-6 py-1",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("size-5", isActive && "stroke-[2.5]")} />
              <span className="text-xs">{label}</span>
            </Link>
          )
        })}
      </nav>
    </footer>
  )
}
