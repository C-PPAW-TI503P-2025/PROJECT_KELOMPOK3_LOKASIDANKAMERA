"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Calendar, User, Loader2, Edit } from "lucide-react"
import Link from "next/link"
import { laporanAPI, type Laporan } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function LaporanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [laporan, setLaporan] = useState<Laporan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await laporanAPI.getDetail(Number(params.id))
        if (response.success && response.data) {
          setLaporan(response.data)
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
          description: "Gagal memuat detail laporan",
          variant: "destructive",
        })
        router.push("/petugas/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDetail()
  }, [params.id])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      valid: { variant: "default", label: "Valid" },
      invalid: { variant: "destructive", label: "Invalid" },
    }
    return variants[status] || variants.pending
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

  const statusBadge = getStatusBadge(laporan.status)

  return (
    <ProtectedRoute allowedRoles={["petugas"]}>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center gap-4">
            <Link href="/petugas/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
            {laporan.status === "pending" && (
              <Link href={`/petugas/laporan/${laporan.id}/edit`}>
                <Button size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Laporan
                </Button>
              </Link>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-2xl">Detail Laporan</CardTitle>
                    <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Photo */}
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={laporan.foto.startsWith("/") ? `http://localhost:3000${laporan.foto}` : laporan.foto}
                      alt="Foto laporan"
                      className="h-auto w-full object-cover"
                    />
                  </div>

                  {/* Keterangan */}
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Keterangan</h3>
                    <p className="text-lg leading-relaxed text-foreground">{laporan.keterangan}</p>
                  </div>

                  {/* Admin Notes */}
                  {laporan.catatan_admin && (
                    <div className="rounded-lg border border-border bg-muted/50 p-4">
                      <h3 className="mb-2 text-sm font-medium text-muted-foreground">Catatan dari Admin</h3>
                      <p className="leading-relaxed text-foreground">{laporan.catatan_admin}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Laporan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Lokasi GPS</p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {laporan.latitude.toFixed(6)}, {laporan.longitude.toFixed(6)}
                        </p>
                        <a
                          href={`https://www.google.com/maps?q=${laporan.latitude},${laporan.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-primary hover:underline"
                        >
                          Lihat di Google Maps
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Tanggal Dibuat</p>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {new Date(laporan.createdAt).toLocaleString("id-ID", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {laporan.updatedAt !== laporan.createdAt && (
                    <div>
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Terakhir Diupdate</p>
                          <p className="mt-1 text-sm font-medium text-foreground">
                            {new Date(laporan.updatedAt).toLocaleString("id-ID", {
                              dateStyle: "long",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {laporan.admin && (
                    <div>
                      <div className="flex items-start gap-3">
                        <User className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Diverifikasi oleh</p>
                          <p className="mt-1 text-sm font-medium text-foreground">{laporan.admin.nama}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
