import { Loader2 } from "lucide-react"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"

import { cn } from "@/lib/utils"

const PULL_THRESHOLD = 64
const REFRESH_HOLD = 52
const MAX_PULL = 140
const PULL_SPIN_START = 8
const SCROLL_END_THRESHOLD = 120

type PullToRefreshProps = {
  onRefresh: () => Promise<void>
  onReachEnd?: () => Promise<void>
  children: ReactNode
  className?: string
}

function isAtScrollTop(container: HTMLElement) {
  return container.scrollTop <= 1
}

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false
  }

  return target.closest("button, a, input, textarea, select, label") !== null
}

export function PullToRefresh({
  onRefresh,
  onReachEnd,
  children,
  className,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onRefreshRef = useRef(onRefresh)
  const onReachEndRef = useRef(onReachEnd)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const startYRef = useRef(0)
  const isPullingRef = useRef(false)
  const pullDistanceRef = useRef(0)
  const isRefreshingRef = useRef(false)
  const isMousePullRef = useRef(false)
  const isLoadingMoreRef = useRef(false)

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  useEffect(() => {
    onReachEndRef.current = onReachEnd
  }, [onReachEnd])

  useEffect(() => {
    pullDistanceRef.current = pullDistance
  }, [pullDistance])

  useEffect(() => {
    isRefreshingRef.current = isRefreshing
  }, [isRefreshing])

  const resetPull = useCallback(() => {
    pullDistanceRef.current = 0
    setPullDistance(0)
  }, [])

  const animateTo = useCallback((distance: number) => {
    pullDistanceRef.current = distance
    setIsAnimating(true)
    setPullDistance(distance)
    window.setTimeout(() => setIsAnimating(false), 220)
  }, [])

  const scrollToTopAfterLayout = useCallback((container: HTMLElement) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.scrollTop = 0
      })
    })
  }, [])

  const applyPullDelta = useCallback((delta: number) => {
    if (delta > 0) {
      const nextDistance = Math.min(delta * 0.55, MAX_PULL)
      pullDistanceRef.current = nextDistance
      setPullDistance(nextDistance)
      return true
    }

    if (delta < 0) {
      resetPull()
    }

    return false
  }, [resetPull])

  const finishPull = useCallback((container: HTMLElement) => {
    if (
      pullDistanceRef.current >= PULL_THRESHOLD &&
      !isRefreshingRef.current
    ) {
      isRefreshingRef.current = true
      setIsRefreshing(true)
      pullDistanceRef.current = REFRESH_HOLD
      setPullDistance(REFRESH_HOLD)

      void onRefreshRef
        .current()
        .finally(() => {
          isRefreshingRef.current = false
          setIsRefreshing(false)
          animateTo(0)
          scrollToTopAfterLayout(container)
        })
    } else {
      animateTo(0)
    }
  }, [animateTo, scrollToTopAfterLayout])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    function canStartPull(target: EventTarget | null) {
      return (
        !isRefreshingRef.current &&
        !isInteractiveTarget(target) &&
        isAtScrollTop(container!)
      )
    }

    function stopPull() {
      isPullingRef.current = false
      isMousePullRef.current = false
    }

    function handleTouchStart(event: TouchEvent) {
      if (!canStartPull(event.target)) {
        stopPull()
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
        stopPull()
        resetPull()
        return
      }

      const delta = event.touches[0].clientY - startYRef.current
      if (applyPullDelta(delta)) {
        event.preventDefault()
      }
    }

    function handleTouchEnd() {
      if (!isPullingRef.current) {
        return
      }

      stopPull()
      finishPull(container!)
    }

    function handleMouseDown(event: MouseEvent) {
      if (event.button !== 0 || !canStartPull(event.target)) {
        stopPull()
        return
      }

      startYRef.current = event.clientY
      isPullingRef.current = true
      isMousePullRef.current = true
    }

    function handleMouseMove(event: MouseEvent) {
      if (!isMousePullRef.current || !isPullingRef.current || isRefreshingRef.current) {
        return
      }

      if (!isAtScrollTop(container!)) {
        stopPull()
        resetPull()
        return
      }

      const delta = event.clientY - startYRef.current
      if (applyPullDelta(delta)) {
        event.preventDefault()
      }
    }

    function handleMouseUp() {
      if (!isMousePullRef.current) {
        return
      }

      const wasPulling = isPullingRef.current
      stopPull()

      if (wasPulling) {
        finishPull(container!)
      }
    }

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)
    container.addEventListener("touchcancel", handleTouchEnd)
    container.addEventListener("mousedown", handleMouseDown)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
      container.removeEventListener("touchcancel", handleTouchEnd)
      container.removeEventListener("mousedown", handleMouseDown)
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [applyPullDelta, finishPull, resetPull])

  useEffect(() => {
    const container = containerRef.current
    if (!container || !onReachEnd) {
      return
    }

    function isNearBottom() {
      const distanceFromBottom =
        container!.scrollHeight - container!.scrollTop - container!.clientHeight
      return distanceFromBottom <= SCROLL_END_THRESHOLD
    }

    async function handleScroll() {
      if (
        !onReachEndRef.current ||
        isLoadingMoreRef.current ||
        isRefreshingRef.current ||
        !isNearBottom()
      ) {
        return
      }

      isLoadingMoreRef.current = true

      try {
        await onReachEndRef.current()
      } finally {
        isLoadingMoreRef.current = false
      }
    }

    container.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [onReachEnd])

  const spinnerOpacity = isRefreshing
    ? 1
    : Math.min(pullDistance / PULL_THRESHOLD, 1)

  const shouldSpin =
    isRefreshing || pullDistance >= PULL_SPIN_START

  return (
    <div
      ref={containerRef}
      className={cn(
        "scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-y-none",
        pullDistance > 0 && "touch-none",
        className
      )}
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div
        className={cn(
          "relative will-change-transform",
          isAnimating && "transition-transform duration-200 ease-out",
          pullDistance > 0 && "select-none"
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
              shouldSpin && "animate-spin"
            )}
            style={{ opacity: spinnerOpacity }}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
