const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5280"

export function resolveBackendUrl(path: string) {
  return new URL(path, API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`).toString()
}

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
  contentType: string
  contentUrl: string
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
  otherUsersLikeCount: number
}

export type TopicDetail = TopicSummary & {
  sections: Record<string, string>
  text: string
  rawMarkdown: string
}

export function getTopics() {
  return apiFetch<TopicSummary[]>("/api/topics")
}

export function getTopicBySlug(slug: string, email: string | null = null) {
  return apiFetch<TopicDetail>(`/api/topics/by-slug/${slug}`, { email })
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
