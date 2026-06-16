import { Loader2 } from "lucide-react"
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

const PULL_THRESHOLD = 64
const REFRESH_HOLD = 52
const MAX_PULL = 140

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
  const [isAnimating, setIsAnimating] = useState(false)
  const startYRef = useRef(0)
  const isPullingRef = useRef(false)
  const pullDistanceRef = useRef(0)
  const isRefreshingRef = useRef(false)

  pullDistanceRef.current = pullDistance
  isRefreshingRef.current = isRefreshing

  function animateTo(distance: number) {
    setIsAnimating(true)
    setPullDistance(distance)
    window.setTimeout(() => setIsAnimating(false), 250)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    function handleTouchStart(event: TouchEvent) {
      if (isRefreshingRef.current || container!.scrollTop > 1) {
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

      if (container!.scrollTop > 1) {
        isPullingRef.current = false
        setPullDistance(0)
        return
      }

      const delta = event.touches[0].clientY - startYRef.current
      if (delta > 0) {
        event.preventDefault()
        const nextDistance = Math.min(delta * 0.55, MAX_PULL)
        pullDistanceRef.current = nextDistance
        setPullDistance(nextDistance)
      } else if (delta < 0) {
        isPullingRef.current = false
        pullDistanceRef.current = 0
        setPullDistance(0)
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
        setPullDistance(REFRESH_HOLD)
        isRefreshingRef.current = true

        try {
          await onRefresh()
        } finally {
          isRefreshingRef.current = false
          setIsRefreshing(false)
          animateTo(0)
        }
      } else {
        animateTo(0)
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

  const spinnerOpacity = isRefreshing
    ? 1
    : Math.min(pullDistance / PULL_THRESHOLD, 1)

  return (
    <div
      ref={containerRef}
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
        className
      )}
    >
      <div
        className={cn(
          "relative will-change-transform",
          isAnimating && "transition-transform duration-200 ease-out"
        )}
        style={{ transform: `translate3d(0, ${pullDistance}px, 0)` }}
      >
        <div
          className="pointer-events-none absolute right-0 left-0 flex items-end justify-center"
          style={{
            bottom: "100%",
            height: REFRESH_HOLD,
            paddingBottom: 8,
          }}
          aria-hidden={pullDistance === 0 && !isRefreshing}
        >
          <Loader2
            className={cn(
              "text-muted-foreground size-6",
              isRefreshing && "animate-spin"
            )}
            style={{
              opacity: spinnerOpacity,
              transform: isRefreshing
                ? undefined
                : `rotate(${pullDistance * 2.5}deg)`,
            }}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
