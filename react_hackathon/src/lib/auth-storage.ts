const STORAGE_KEY = "qcs_user_email"

export function getStoredEmail(): string | null {
  return localStorage.getItem(STORAGE_KEY)
}

export function setStoredEmail(email: string): void {
  localStorage.setItem(STORAGE_KEY, email)
}

export function clearStoredEmail(): void {
  localStorage.removeItem(STORAGE_KEY)
}
