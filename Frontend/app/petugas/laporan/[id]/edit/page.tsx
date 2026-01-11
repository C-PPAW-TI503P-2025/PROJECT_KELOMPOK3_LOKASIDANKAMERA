"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Save, MapPin, Loader2, Camera } from "lucide-react"
import Link from "next/link"
import { laporanAPI, type Laporan } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { CameraCapture } from "@/components/camera-capture"

export default function EditLaporanPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [laporan, setLaporan] = useState<Laporan | null>(null)
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [keterangan, setKeterangan] = useState("")

  useEffect(() => {
    const fetchLaporan = async () => {
      try {
        const response = await laporanAPI.getDetail(Number(params.id))
        if (response.success && response.data) {
          if (response.data.status !== "pending") {
            toast({
              title: "Error",
              description: "Hanya laporan dengan status pending yang dapat diedit",
              variant: "destructive",
            })
            router.push("/petugas/dashboard")
            return
          }

          setLaporan(response.data)
          setLatitude(response.data.latitude.toString())
          setLongitude(response.data.longitude.toString())
          setKeterangan(response.data.keterangan)
          setFotoPreview(
            response.data.foto.startsWith("/") ? `http://localhost:3000${response.data.foto}` : response.data.foto,
          )
        } else {
          toast({
            title: "Error",
            description: "Laporan tidak ditemukan",
            variant: "destructive",
          })
          router.push("/petugas/dashboard")
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Gagal memuat data laporan",
          variant: "destructive",
        })
        router.push("/petugas/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLaporan()
  }, [params.id])

  const handleCameraCapture = (file: File, preview: string) => {
    setFoto(file)
    setFotoPreview(preview)
    toast({
      title: "Berhasil",
      description: "Foto berhasil diambil",
    })
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran foto maksimal 5MB",
          variant: "destructive",
        })
        return
      }

      if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
        toast({
          title: "Error",
          description: "Format foto harus JPG, JPEG, atau PNG",
          variant: "destructive",
        })
        return
      }

      setFoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Browser Anda tidak mendukung GPS",
        variant: "destructive",
      })
      return
    }

    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString())
        setLongitude(position.coords.longitude.toString())
        setIsGettingLocation(false)
        toast({
          title: "Berhasil",
          description: "Lokasi GPS berhasil didapatkan",
        })
      },
      (error) => {
        setIsGettingLocation(false)
        toast({
          title: "Error",
          description: "Gagal mendapatkan lokasi GPS",
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!laporan) return

    if (!latitude || !longitude || !keterangan) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      })
      return
    }

    const lat = Number.parseFloat(latitude)
    const lon = Number.parseFloat(longitude)

    if (isNaN(lat) || isNaN(lon)) {
      toast({
        title: "Error",
        description: "Format latitude atau longitude tidak valid",
        variant: "destructive",
      })
      return
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      toast({
        title: "Error",
        description: "Latitude atau longitude di luar jangkauan",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      if (foto) {
        formData.append("foto", foto)
      }
      formData.append("latitude", latitude)
      formData.append("longitude", longitude)
      formData.append("keterangan", keterangan)

      const response = await laporanAPI.update(laporan.id, formData)

      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Laporan berhasil diupdate",
        })
        router.push("/petugas/dashboard")
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal mengupdate laporan",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengupdate laporan",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["petugas"]}>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!laporan) return null

  return (
    <ProtectedRoute allowedRoles={["petugas"]}>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/petugas/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>

          <Card className="mx-auto max-w-2xl border-border">
            <CardHeader>
              <CardTitle className="text-2xl">Edit Laporan</CardTitle>
              <p className="text-sm text-muted-foreground">Update informasi laporan kebersihan</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Capture */}
                <div className="space-y-2">
                  <Label>Foto Laporan (Opsional - biarkan kosong jika tidak ingin mengganti)</Label>
                  <div className="space-y-4">
                    <CameraCapture onCapture={handleCameraCapture} />

                    {fotoPreview && (
                      <div className="relative overflow-hidden rounded-lg border border-border">
                        <img
                          src={fotoPreview || "/placeholder.svg"}
                          alt="Preview"
                          className="h-64 w-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2">
                          {/*<Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setFoto(null)
                            }}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Ganti Foto
                          </Button>*/}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">Klik tombol untuk mengambil foto baru dengan kamera</p>
                  </div>
                </div>

                {/* GPS Location */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>
                      Lokasi GPS <span className="text-destructive">*</span>
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                    >
                      {isGettingLocation ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Mendapatkan Lokasi...
                        </>
                      ) : (
                        <>
                          <MapPin className="mr-2 h-4 w-4" />
                          Update Lokasi
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="text"
                        placeholder="-7.797068"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="text"
                        placeholder="110.370529"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Keterangan */}
                <div className="space-y-2">
                  <Label htmlFor="keterangan">
                    Keterangan <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="keterangan"
                    placeholder="Jelaskan kondisi kebersihan yang ditemukan..."
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    rows={5}
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Link href="/petugas/dashboard" className="flex-1">
                    <Button type="button" variant="outline" className="w-full bg-transparent">
                      Batal
                    </Button>
                  </Link>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
