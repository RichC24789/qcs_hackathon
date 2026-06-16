import { BrowserRouter, useRoutes } from "react-router-dom"

import { AuthProvider } from "@/contexts/AuthContext"
import { routes } from "@/routes"

function AppRoutes() {
  return useRoutes(routes)
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
