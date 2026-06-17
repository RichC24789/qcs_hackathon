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

type PullToRefreshProps = {
  onRefresh: () => Promise<void>
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
  const activePointerIdRef = useRef<number | null>(null)

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

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

    function handlePointerDown(event: PointerEvent) {
      if (
        isRefreshingRef.current ||
        !isAtScrollTop(container!) ||
        isInteractiveTarget(event.target) ||
        activePointerIdRef.current !== null
      ) {
        isPullingRef.current = false
        return
      }

      activePointerIdRef.current = event.pointerId
      startYRef.current = event.clientY
      isPullingRef.current = true
      container!.setPointerCapture(event.pointerId)
    }

    function handlePointerMove(event: PointerEvent) {
      if (
        !isPullingRef.current ||
        isRefreshingRef.current ||
        event.pointerId !== activePointerIdRef.current
      ) {
        return
      }

      if (!isAtScrollTop(container!)) {
        isPullingRef.current = false
        resetPull()
        return
      }

      const delta = event.clientY - startYRef.current
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

    function handlePointerEnd(event: PointerEvent) {
      if (event.pointerId !== activePointerIdRef.current) {
        return
      }

      activePointerIdRef.current = null
      if (container!.hasPointerCapture(event.pointerId)) {
        container!.releasePointerCapture(event.pointerId)
      }

      if (!isPullingRef.current) {
        return
      }

      isPullingRef.current = false
      finishPull(container!)
    }

    container.addEventListener("pointerdown", handlePointerDown)
    container.addEventListener("pointermove", handlePointerMove, {
      passive: false,
    })
    container.addEventListener("pointerup", handlePointerEnd)
    container.addEventListener("pointercancel", handlePointerEnd)

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown)
      container.removeEventListener("pointermove", handlePointerMove)
      container.removeEventListener("pointerup", handlePointerEnd)
      container.removeEventListener("pointercancel", handlePointerEnd)
    }
  }, [finishPull, resetPull])

  const spinnerOpacity = isRefreshing
    ? 1
    : Math.min(pullDistance / PULL_THRESHOLD, 1)

  return (
    <div
      ref={containerRef}
      className={cn(
        "scrollbar-hide min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-y-contain",
        className
      )}
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
