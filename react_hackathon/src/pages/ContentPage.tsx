import { ContentItem, type ContentItemProps } from "@/components/content/ContentItem"

const mockContentItems: ContentItemProps[] = [
  {
    id: "1",
    title: "Welcome to QCS",
    body: "Browse content and manage your profile.",
  },
  {
    id: "2",
    title: "Hackathon update",
    body: "React layout with pages, components, and routing.",
  },
  {
    id: "3",
    title: "Getting started",
    body: "Tap the heart to mark items you like.",
  },
]

export function ContentPage() {
  return (
    <div className="flex flex-col">
      {mockContentItems.map((item) => (
        <ContentItem key={item.id} {...item} />
      ))}
    </div>
  )
}
