import { Outlet } from "react-router-dom"

import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"

export function AppLayout() {
  return (
    <div className="min-h-svh bg-neutral-100">
      <div className="mx-auto flex min-h-svh w-full max-w-[430px] flex-col bg-white shadow-sm">
        <Header />
        <main className="flex-1 overflow-y-auto pb-14">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
