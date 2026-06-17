import { createContext } from "react"

export type AuthContextValue = {
  email: string | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
