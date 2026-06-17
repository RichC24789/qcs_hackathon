const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5280"

type ApiOptions = {
  method?: string
  email?: string | null
  body?: unknown
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, path: string) {
    super(`API ${status}: ${path}`)
    this.name = "ApiError"
    this.status = status
  }
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  }

  if (options.email) {
    headers["X-User-Email"] = options.email
  }

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json"
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) {
    throw new ApiError(response.status, path)
  }

  if (response.status === 202) {
    return undefined as T
  }

  return (await response.json()) as T
}

export type UserSummary = {
  id: number
  email: string
  displayName: string
}

export function loginUser(email: string) {
  return apiFetch<UserSummary>("/api/auth/login", {
    method: "POST",
    body: { email },
  })
}

export type TopicSummary = {
  number: number
  slug: string
  title: string
  theme: string
  primaryFormat: string
  secondaryFormat: string
}

export type TopicLikeStatus = {
  topicSlug: string
  likeCount: number
  likedByCurrentUser: boolean
}

export type ContentFeedItem = TopicSummary & {
  hook: string
  text: string
  likeCount: number
  likedByCurrentUser: boolean
}

export function getTopics() {
  return apiFetch<TopicSummary[]>("/api/topics")
}

export function getContentFeed(email: string, limit = 10) {
  return apiFetch<ContentFeedItem[]>(`/api/content?limit=${limit}`, { email })
}

export function getTopicLikeStatus(slug: string, email: string | null) {
  return apiFetch<TopicLikeStatus>(`/api/topics/${slug}/likes`, { email })
}

export function likeTopic(slug: string, email: string) {
  return apiFetch<TopicLikeStatus>(`/api/topics/${slug}/likes`, {
    method: "PUT",
    email,
  })
}

export function unlikeTopic(slug: string, email: string) {
  return apiFetch<TopicLikeStatus>(`/api/topics/${slug}/likes`, {
    method: "DELETE",
    email,
  })
}

export function logActivity(
  email: string,
  activityType: string,
  topicSlug?: string,
  details?: string
) {
  return apiFetch<void>("/api/activity", {
    method: "POST",
    email,
    body: { activityType, topicSlug, details },
  })
}
