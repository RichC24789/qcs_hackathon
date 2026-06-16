import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  clearStoredEmail,
  getStoredEmail,
  setStoredEmail,
} from "@/lib/auth-storage"

type AuthContextValue = {
  email: string | null
  isLoggedIn: boolean
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => getStoredEmail())

  const login = useCallback((nextEmail: string) => {
    const trimmed = nextEmail.trim()
    setStoredEmail(trimmed)
    setEmail(trimmed)
  }, [])

  const logout = useCallback(() => {
    clearStoredEmail()
    setEmail(null)
  }, [])

  const value = useMemo(
    () => ({
      email,
      isLoggedIn: email !== null,
      login,
      logout,
    }),
    [email, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
