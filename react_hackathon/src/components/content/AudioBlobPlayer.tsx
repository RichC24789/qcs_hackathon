import { Pause, Play } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

const BLOB_COUNT = 42
const MIN_BLOB_HEIGHT = 10
const MAX_BLOB_HEIGHT = 54
const USABLE_FREQUENCY_FRACTION = 0.2
const idleBlobHeights = Array.from(
  { length: BLOB_COUNT },
  (_, index) => 14 + ((index * 17) % 20)
)

type AudioBlobPlayerProps = {
  src?: string
  title: string
}

export function AudioBlobPlayer({ src, title }: AudioBlobPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [blobHeights, setBlobHeights] = useState(idleBlobHeights)

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      audioContextRef.current?.close().catch(() => undefined)
      audioContextRef.current = null
      analyserRef.current = null
      sourceRef.current = null
    }
  }, [])

  function setupAnalyser() {
    const audio = audioRef.current
    if (!audio || sourceRef.current) {
      return
    }

    const audioWindow = window as Window & {
      webkitAudioContext?: typeof AudioContext
    }
    const AudioContextConstructor =
      globalThis.AudioContext ?? audioWindow.webkitAudioContext

    if (!AudioContextConstructor) {
      setHasError(true)
      return
    }

    const audioContext = new AudioContextConstructor()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaElementSource(audio)

    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.72

    source.connect(analyser)
    analyser.connect(audioContext.destination)

    audioContextRef.current = audioContext
    analyserRef.current = analyser
    sourceRef.current = source
  }

  function updateBlobHeights() {
    const analyser = analyserRef.current
    if (!analyser) {
      return
    }

    const frequencyData = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(frequencyData)

    const usableBins = Math.max(
      BLOB_COUNT,
      Math.floor(frequencyData.length * USABLE_FREQUENCY_FRACTION)
    )

    setBlobHeights(
      Array.from({ length: BLOB_COUNT }, (_, index) => {
        const start = Math.floor((index / BLOB_COUNT) * usableBins)
        const end = Math.max(
          start + 1,
          Math.floor(((index + 1) / BLOB_COUNT) * usableBins)
        )
        const band = frequencyData.slice(start, end)
        const average =
          band.reduce((total, value) => total + value, 0) / band.length
        const boost = 1 + (index / BLOB_COUNT) * 0.5
        const intensity = Math.min(1, (average / 255) * boost)

        return Math.max(
          MIN_BLOB_HEIGHT,
          MIN_BLOB_HEIGHT + intensity * (MAX_BLOB_HEIGHT - MIN_BLOB_HEIGHT)
        )
      })
    )

    animationFrameRef.current = requestAnimationFrame(updateBlobHeights)
  }

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio || !isReady) {
      return
    }

    setupAnalyser()

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume()
    }

    if (audio.paused) {
      await audio.play()
      return
    }

    audio.pause()
  }

  return (
    <div className="mt-3 flex w-full items-center gap-3">
      <audio
        ref={audioRef}
        className="hidden"
        src={src}
        preload="metadata"
        crossOrigin="anonymous"
        onLoadStart={() => {
          setIsReady(false)
          setHasError(false)
          setIsPlaying(false)
          setBlobHeights(idleBlobHeights)
        }}
        onCanPlay={() => {
          setIsReady(true)
          setHasError(false)
        }}
        onPlay={() => {
          setIsPlaying(true)
          if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current)
          }
          updateBlobHeights()
        }}
        onPause={() => {
          setIsPlaying(false)
          if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current)
            animationFrameRef.current = null
          }
          setBlobHeights(idleBlobHeights)
        }}
        onEnded={() => {
          setIsPlaying(false)
          setBlobHeights(idleBlobHeights)
        }}
        onError={() => {
          setHasError(true)
          setIsReady(false)
          setIsPlaying(false)
        }}
      />
      <button
        type="button"
        aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
        disabled={!isReady}
        onClick={togglePlayback}
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0F4146] text-white shadow-sm transition-all",
          "hover:bg-[#0B3337] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4146]/40 focus-visible:ring-offset-2",
          !isReady && "cursor-wait opacity-60"
        )}
      >
        {isPlaying ? (
          <Pause className="size-5 fill-current" />
        ) : (
          <Play className="ml-0.5 size-5 fill-current" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "grid min-h-[54px] w-full items-center gap-0.5 overflow-hidden rounded-full",
            !isReady && "animate-pulse"
          )}
          style={{ gridTemplateColumns: `repeat(${BLOB_COUNT}, minmax(0, 1fr))` }}
          aria-hidden="true"
        >
          {blobHeights.map((height, index) => (
            <span
              key={index}
              className="w-full min-w-0 rounded-full bg-[#0F4146] transition-[height,opacity] duration-75 ease-out"
              style={{
                height,
                opacity: isPlaying ? 0.45 + height / MAX_BLOB_HEIGHT / 2 : 0.45,
              }}
            />
          ))}
        </div>
        {hasError ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Audio could not be loaded.
          </p>
        ) : null}
      </div>
    </div>
  )
}
