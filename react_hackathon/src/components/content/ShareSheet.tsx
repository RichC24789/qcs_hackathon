import {
  Check,
  Link2,
  Mail,
  MessageCircle,
  MoreHorizontal,
  X,
} from "lucide-react"
import { useCallback, useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

type ShareSheetProps = {
  title: string
  description: string
  slug: string
  isOpen: boolean
  onClose: () => void
}

function getShareUrl(slug: string) {
  const url = new URL(window.location.href)
  url.searchParams.set("topic", slug)
  return url.toString()
}

function getShareText(title: string, description: string) {
  return `${title}\n\n${description}`
}

type ShareOption = {
  id: string
  label: string
  icon: ReactNode
  onClick: () => void
}

export function ShareSheet({
  title,
  description,
  slug,
  isOpen,
  onClose,
}: ShareSheetProps) {
  const [copied, setCopied] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const shareUrl = getShareUrl(slug)
  const shareText = getShareText(title, description)

  const handleClose = useCallback(() => {
    onClose()
    window.setTimeout(() => setCopied(false), 300)
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"

      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === "Escape") {
          handleClose()
        }
      }

      window.addEventListener("keydown", handleKeyDown)

      return () => {
        document.body.style.overflow = previousOverflow
        window.removeEventListener("keydown", handleKeyDown)
      }
    }

    const timer = window.setTimeout(() => setIsVisible(false), 300)
    return () => window.clearTimeout(timer)
  }, [isOpen, handleClose])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  async function shareNative() {
    if (!navigator.share) {
      await copyLink()
      return
    }

    try {
      await navigator.share({ title, text: description, url: shareUrl })
      handleClose()
    } catch {
      // user cancelled or unavailable
    }
  }

  const options: ShareOption[] = [
    {
      id: "copy",
      label: copied ? "Copied" : "Copy link",
      icon: copied ? (
        <Check className="size-5 text-[#1ed760]" />
      ) : (
        <Link2 className="size-5" />
      ),
      onClick: () => void copyLink(),
    },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageCircle className="size-5" />,
      onClick: () => {
        window.open(
          `sms:?&body=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
          "_blank"
        )
      },
    },
    {
      id: "email",
      label: "Email",
      icon: <Mail className="size-5" />,
      onClick: () => {
        window.open(
          `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
          "_blank"
        )
      },
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      icon: (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      onClick: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
          "_blank",
          "noopener,noreferrer"
        )
      },
    },
    {
      id: "more",
      label: "More",
      icon: <MoreHorizontal className="size-5" />,
      onClick: () => void shareNative(),
    },
  ]

  if (!isOpen && !isVisible) {
    return null
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center",
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        aria-label="Close share menu"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-sheet-title"
        className={cn(
          "relative z-10 w-full max-w-[480px] rounded-t-2xl bg-[#282828] px-4 pb-8 pt-3 text-white shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/30" />

        <div className="mb-6 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              id="share-sheet-title"
              className="truncate text-base font-semibold"
            >
              {title}
            </p>
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm text-[#b3b3b3]">
              {description}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="rounded-full p-1 text-[#b3b3b3] hover:bg-white/10 hover:text-white"
            onClick={handleClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className="flex w-16 shrink-0 flex-col items-center gap-2"
              onClick={option.onClick}
            >
              <span className="flex size-14 items-center justify-center rounded-full bg-[#535353] text-white transition-colors hover:bg-[#6a6a6a]">
                {option.icon}
              </span>
              <span className="w-full truncate text-center text-[11px] text-[#b3b3b3]">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  )
}
