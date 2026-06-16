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

function isAtScrollTop(container: HTMLElement) {
  return container.scrollTop <= 1
}

export function PullToRefresh({
  onRefresh,
  children,
  className,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onRefreshRef = useRef(onRefresh)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const startYRef = useRef(0)
  const isPullingRef = useRef(false)
  const pullDistanceRef = useRef(0)
  const isRefreshingRef = useRef(false)

  onRefreshRef.current = onRefresh
  pullDistanceRef.current = pullDistance
  isRefreshingRef.current = isRefreshing

  function resetPull() {
    pullDistanceRef.current = 0
    setPullDistance(0)
  }

  function animateTo(distance: number) {
    pullDistanceRef.current = distance
    setIsAnimating(true)
    setPullDistance(distance)
    window.setTimeout(() => setIsAnimating(false), 220)
  }

  function scrollToTopAfterLayout(container: HTMLElement) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.scrollTop = 0
      })
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    function handleTouchStart(event: TouchEvent) {
      if (isRefreshingRef.current || !isAtScrollTop(container!)) {
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

      if (!isAtScrollTop(container!)) {
        isPullingRef.current = false
        resetPull()
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
        resetPull()
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
        isRefreshingRef.current = true
        setIsRefreshing(true)
        pullDistanceRef.current = REFRESH_HOLD
        setPullDistance(REFRESH_HOLD)

        try {
          await onRefreshRef.current()
        } finally {
          isRefreshingRef.current = false
          setIsRefreshing(false)
          animateTo(0)
          scrollToTopAfterLayout(container!)
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
  }, [])

  const spinnerOpacity = isRefreshing
    ? 1
    : Math.min(pullDistance / PULL_THRESHOLD, 1)

  return (
    <div
      ref={containerRef}
      className={cn(
        "scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
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
