"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, MapPin, Calendar, User, Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { adminAPI, type Laporan } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminLaporanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [laporan, setLaporan] = useState<Laporan | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [verifyStatus, setVerifyStatus] = useState<"valid" | "invalid">("valid")
  const [catatan, setCatatan] = useState("")
  const { toast } = useToast()

  const fetchDetail = async () => {
    try {
      const response = await adminAPI.getLaporanDetail(Number(params.id))
      if (response.success && response.data) {
        setLaporan(response.data)
        if (response.data.catatan_admin) {
          setCatatan(response.data.catatan_admin)
        }
      } else {
        toast({
          title: "Error",
          description: "Laporan tidak ditemukan",
          variant: "destructive",
        })
        router.push("/admin/dashboard")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat detail laporan",
        variant: "destructive",
      })
      router.push("/admin/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [params.id])

  const handleVerify = async () => {
    if (!laporan) return

    setIsVerifying(true)
    try {
      const response = await adminAPI.verifyLaporan(laporan.id, verifyStatus, catatan || undefined)
      if (response.success) {
        toast({
          title: "Berhasil",
          description: `Laporan berhasil diverifikasi sebagai ${verifyStatus}`,
        })
        fetchDetail()
      } else {
        toast({
          title: "Error",
          description: response.message || "Gagal memverifikasi laporan",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memverifikasi laporan",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
      setShowVerifyDialog(false)
    }
  }

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
      <ProtectedRoute allowedRoles={["admin"]}>
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
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>
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
                </CardContent>
              </Card>

              {/* Verification Section */}
              {laporan.status === "pending" && (
                <Card className="mt-6 border-border">
                  <CardHeader>
                    <CardTitle>Verifikasi Laporan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="catatan">Catatan untuk Petugas (Opsional)</Label>
                      <Textarea
                        id="catatan"
                        placeholder="Tambahkan catatan atau feedback..."
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setVerifyStatus("valid")
                          setShowVerifyDialog(true)
                        }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Setujui Laporan
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          setVerifyStatus("invalid")
                          setShowVerifyDialog(true)
                        }}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Tolak Laporan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Admin Notes */}
              {laporan.catatan_admin && laporan.status !== "pending" && (
                <Card className="mt-6 border-border">
                  <CardHeader>
                    <CardTitle>Catatan Verifikasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-relaxed text-foreground">{laporan.catatan_admin}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Laporan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {laporan.petugas && (
                    <div>
                      <div className="flex items-start gap-3">
                        <User className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Pelapor</p>
                          <p className="mt-1 text-sm font-medium text-foreground">{laporan.petugas.nama}</p>
                          <p className="text-xs text-muted-foreground">{laporan.petugas.email}</p>
                        </div>
                      </div>
                    </div>
                  )}

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

        {/* Verify Confirmation Dialog */}
        <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{verifyStatus === "valid" ? "Setujui Laporan?" : "Tolak Laporan?"}</AlertDialogTitle>
              <AlertDialogDescription>
                {verifyStatus === "valid"
                  ? "Laporan akan ditandai sebagai valid dan dapat dilihat oleh petugas."
                  : "Laporan akan ditandai sebagai invalid. Pastikan Anda telah memberikan catatan yang jelas."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isVerifying}>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleVerify} disabled={isVerifying}>
                {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {verifyStatus === "valid" ? "Setujui" : "Tolak"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}
