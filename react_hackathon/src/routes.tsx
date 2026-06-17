import { AppLayout } from "@/components/layout/AppLayout"
import { ContentPage } from "@/pages/ContentPage"
import { LikedPostsPage } from "@/pages/LikedPostsPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { SearchPage } from "@/pages/SearchPage"
import type { RouteObject } from "react-router-dom"

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <ContentPage /> },
      { path: "search", element: <SearchPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/liked", element: <LikedPostsPage /> },
    ],
  },
]
