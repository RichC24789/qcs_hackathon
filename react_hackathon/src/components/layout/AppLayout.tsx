import { Outlet } from "react-router-dom"

import { LoginModal } from "@/components/auth/LoginModal"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

export function AppLayout() {
  const { isLoggedIn } = useAuth()

  return (
    <div className="min-h-svh bg-neutral-100">
      <div
        className={cn(
          "relative mx-auto flex min-h-svh w-full max-w-[430px] flex-col bg-white shadow-sm",
          !isLoggedIn && "pointer-events-none select-none"
        )}
      >
        <Header />
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
      <LoginModal />
    </div>
  )
}
