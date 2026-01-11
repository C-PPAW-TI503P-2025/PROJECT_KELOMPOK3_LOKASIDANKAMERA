"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Camera, RotateCw, X, Loader2 } from "lucide-react"

interface CameraCaptureProps {
  onCapture: (file: File, preview: string) => void
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen, facingMode])

  const startCamera = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }

      setIsLoading(false)
    } catch (err) {
      setIsLoading(false)
      setError("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.")
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement("canvas")
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0)

    canvas.toBlob(
      (blob) => {
        if (!blob) return

        const file = new File([blob], `foto-${Date.now()}.jpg`, {
          type: "image/jpeg",
        })

        const preview = canvas.toDataURL("image/jpeg")
        onCapture(file, preview)
        setIsOpen(false)
      },
      "image/jpeg",
      0.95,
    )
  }

  const flipCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  return (
    <>
      <Button type="button" variant="default" onClick={() => setIsOpen(true)} className="w-full">
        <Camera className="mr-2 h-4 w-4" />
        Ambil Foto dengan Kamera
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ambil Foto</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-muted p-8 text-center">
                <div className="space-y-4">
                  <X className="mx-auto h-12 w-12 text-destructive" />
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button onClick={startCamera}>Coba Lagi</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative overflow-hidden rounded-lg bg-black">
                  {isLoading && (
                    <div className="flex h-[400px] items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className={`w-full ${isLoading ? "hidden" : ""}`}
                    style={{ maxHeight: "500px" }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={flipCamera} className="flex-1 bg-transparent">
                    <RotateCw className="mr-2 h-4 w-4" />
                    Putar Kamera
                  </Button>
                  <Button type="button" onClick={capturePhoto} disabled={isLoading} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Jepret Foto
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
