import { Loader2 } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

const PULL_THRESHOLD = 72
const MAX_PULL = 120

type PullToRefreshProps = {
  onRefresh: () => Promise<void>
  children: ReactNode
  className?: string
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startYRef = useRef(0)
  const isPullingRef = useRef(false)
  const pullDistanceRef = useRef(0)
  const isRefreshingRef = useRef(false)

  pullDistanceRef.current = pullDistance
  isRefreshingRef.current = isRefreshing

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    function handleTouchStart(event: TouchEvent) {
      if (isRefreshingRef.current || container!.scrollTop > 0) {
        isPullingRef.current = false
        return
      }

      startYRef.current = event.touches[0].clientY
      isPullingRef.current = true
    }

    function handleTouchMove(event: TouchEvent) {
      if (!isPullingRef.current || isRefreshingRef.current) {
        return
      }

      if (container!.scrollTop > 0) {
        isPullingRef.current = false
        setPullDistance(0)
        return
      }

      const delta = event.touches[0].clientY - startYRef.current
      if (delta > 0) {
        event.preventDefault()
        const nextDistance = Math.min(delta * 0.45, MAX_PULL)
        pullDistanceRef.current = nextDistance
        setPullDistance(nextDistance)
      }
    }

    async function handleTouchEnd() {
      if (!isPullingRef.current) {
        return
      }

      isPullingRef.current = false

      if (
        pullDistanceRef.current >= PULL_THRESHOLD &&
        !isRefreshingRef.current
      ) {
        setIsRefreshing(true)
        setPullDistance(48)
        isRefreshingRef.current = true

        try {
          await onRefresh()
        } finally {
          isRefreshingRef.current = false
          setIsRefreshing(false)
          setPullDistance(0)
        }
      } else {
        setPullDistance(0)
      }
    }

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)
    container.addEventListener("touchcancel", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("touchcancel", handleTouchEnd)
    }
  }, [onRefresh])

  const showIndicator = isRefreshing || pullDistance > 0
  const indicatorHeight = isRefreshing ? 48 : pullDistance

  return (
    <div
      ref={containerRef}
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-y-contain", className)}
    >
      <div
        className="flex items-end justify-center overflow-hidden transition-[height] duration-200 ease-out"
        style={{ height: showIndicator ? indicatorHeight : 0 }}
        aria-hidden={!showIndicator}
      >
        <Loader2
          className={cn(
            "text-muted-foreground mb-2 size-6",
            isRefreshing && "animate-spin"
          )}
          style={{
            opacity: isRefreshing
              ? 1
              : Math.min(pullDistance / PULL_THRESHOLD, 1),
            transform: isRefreshing
              ? undefined
              : `rotate(${pullDistance * 3}deg)`,
          }}
        />
      </div>
      {children}
    </div>
  )
}
