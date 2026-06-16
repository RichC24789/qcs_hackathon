import { AppLayout } from "@/components/layout/AppLayout"
import { ContentPage } from "@/pages/ContentPage"
import { ProfilePage } from "@/pages/ProfilePage"
import type { RouteObject } from "react-router-dom"

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <ContentPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]
