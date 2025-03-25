"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import Tesseract from "tesseract.js"

interface VinScannerProps {
  onVinCaptured: (vin: string) => void
}

export default function VinScanner({ onVinCaptured }: VinScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    initCamera()
    return () => {
      stopCamera()
    }
  }, [])

  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasCamera(true)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setHasCamera(false)
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan your VIN number.",
        variant: "destructive",
      })
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsScanning(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get the image data from the canvas
    canvas.toBlob((blob) => {
      if (!blob) {
        setIsScanning(false)
        return
      }

      processImage(blob)
    }, "image/jpeg")
  }

  const processImage = async (imageBlob: Blob) => {
    try {
      const result = await Tesseract.recognize(imageBlob, "eng", {
        logger: (m) => console.log(m),
      })

      const text = result.data.text.replace(/\s/g, "")

      // Basic VIN validation (17 alphanumeric characters, no I, O, or Q)
      const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i
      const possibleVins = text.match(/[A-HJ-NPR-Z0-9]{17}/gi)

      if (possibleVins && possibleVins.length > 0) {
        const vin = possibleVins[0].toUpperCase()
        if (vinRegex.test(vin)) {
          onVinCaptured(vin)
          toast({
            title: "VIN Detected",
            description: `Found VIN: ${vin}`,
          })
        } else {
          toast({
            title: "Invalid VIN Format",
            description: "The detected text doesn't appear to be a valid VIN. Please try again or enter manually.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "No VIN Detected",
          description:
            "Couldn't find a valid VIN in the image. Please try again with better lighting or enter manually.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error processing image:", error)
      toast({
        title: "Processing Error",
        description: "Failed to process the image. Please try again or enter the VIN manually.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden relative aspect-video bg-muted">
        {hasCamera ? (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-primary m-8 pointer-events-none"></div>
            <canvas ref={canvasRef} className="hidden" />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Camera not available</p>
          </div>
        )}
      </Card>

      <div className="flex justify-center">
        {hasCamera ? (
          <Button onClick={captureImage} disabled={isScanning} size="lg" className="gap-2">
            {isScanning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Capture VIN
              </>
            )}
          </Button>
        ) : (
          <Button onClick={initCamera}>
            <Camera className="mr-2 h-4 w-4" />
            Enable Camera
          </Button>
        )}
      </div>
    </div>
  )
}

