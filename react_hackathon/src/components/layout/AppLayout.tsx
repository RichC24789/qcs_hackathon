import { Outlet } from "react-router-dom"

import { LoginModal } from "@/components/auth/LoginModal"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

export function AppLayout() {
  const { isLoggedIn, isLoading } = useAuth()

  return (
    <div className="h-svh bg-[#EEF7F1]">
      <div
        className={cn(
          "relative mx-auto flex h-svh w-full max-w-[430px] flex-col overflow-hidden bg-[#EEF7F1] shadow-sm",
          !isLoading && !isLoggedIn && "pointer-events-none select-none"
        )}
      >
        <Header />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <Outlet />
        </main>
        <Footer />
      </div>
      <LoginModal />
    </div>
  )
}
