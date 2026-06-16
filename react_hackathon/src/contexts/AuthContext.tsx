import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  clearStoredEmail,
  getStoredEmail,
  setStoredEmail,
} from "@/lib/auth-storage"
import { ApiError, logActivity, loginUser } from "@/lib/api"

type AuthContextValue = {
  email: string | null
  isLoggedIn: boolean
  isLoading: boolean
  login: (email: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const login = useCallback(async (nextEmail: string) => {
    const trimmed = nextEmail.trim()
    const user = await loginUser(trimmed)
    setStoredEmail(user.email)
    setEmail(user.email)
    void logActivity(user.email, "user_login").catch(() => undefined)
  }, [])

  const logout = useCallback(() => {
    clearStoredEmail()
    setEmail(null)
  }, [])

  useEffect(() => {
    const storedEmail = getStoredEmail()
    if (!storedEmail) {
      setIsLoading(false)
      return
    }

    void loginUser(storedEmail)
      .then((user) => {
        setStoredEmail(user.email)
        setEmail(user.email)
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          clearStoredEmail()
          setEmail(null)
          return
        }

        setEmail(storedEmail)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const value = useMemo(
    () => ({
      email,
      isLoggedIn: email !== null,
      isLoading,
      login,
      logout,
    }),
    [email, isLoading, login, logout]
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
