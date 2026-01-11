"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MapPin, Calendar, Eye, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { laporanAPI, type Laporan } from "@/lib/api"
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

export default function PetugasDashboardContent() {
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchLaporan = async () => {
    setIsLoading(true)
    try {
      const params: any = { page, limit: 10 }
      if (statusFilter !== "all") {
        params.status = statusFilter
      }

      const response = await laporanAPI.getMyLaporan(params)
      if (response.success && response.data) {
        setLaporan(response.data.laporan)
        setTotalPages(response.data.pagination.totalPages)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memuat data laporan",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLaporan()
  }, [statusFilter, page])

  const handleDelete = async (id: number) => {
    try {
      const response = await laporanAPI.delete(id)
      if (response.success) {
        toast({
          title: "Berhasil",
          description: "Laporan berhasil dihapus",
        })
        fetchLaporan()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus laporan",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const filteredLaporan = laporan.filter((item) => item.keterangan.toLowerCase().includes(searchQuery.toLowerCase()))

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      valid: { variant: "default", label: "Valid" },
      invalid: { variant: "destructive", label: "Invalid" },
    }
    return variants[status] || variants.pending
  }

  return (
    <ProtectedRoute allowedRoles={["petugas"]}>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard Petugas</h1>
              <p className="mt-1 text-muted-foreground">Kelola laporan kebersihan Anda</p>
            </div>
            <Link href="/petugas/laporan/create">
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Buat Laporan Baru
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-border">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan keterangan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="valid">Valid</SelectItem>
                  <SelectItem value="invalid">Invalid</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Laporan List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredLaporan.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery ? "Tidak ada laporan yang cocok dengan pencarian" : "Belum ada laporan"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredLaporan.map((item) => {
                const statusBadge = getStatusBadge(item.status)
                return (
                  <Card key={item.id} className="border-border">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row">
                        {/* Photo */}
                        <div className="relative h-48 w-full overflow-hidden rounded-lg md:h-32 md:w-32">
                          <img
                            src={item.foto.startsWith("/") ? `http://localhost:3000${item.foto}` : item.foto}
                            alt="Foto laporan"
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="mb-2 flex items-start justify-between">
                            <div>
                              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/petugas/laporan/${item.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              {item.status === "pending" && (
                                <>
                                  <Link href={`/petugas/laporan/${item.id}/edit`}>
                                    <Button variant="outline" size="sm">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button variant="outline" size="sm" onClick={() => setDeleteId(item.id)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          <p className="mb-3 text-lg font-medium text-foreground">{item.keterangan}</p>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(item.createdAt).toLocaleDateString("id-ID")}</span>
                            </div>
                          </div>

                          {item.catatan_admin && (
                            <div className="mt-3 rounded-md border border-border bg-muted/50 p-3">
                              <p className="text-xs font-medium text-muted-foreground">Catatan Admin:</p>
                              <p className="mt-1 text-sm text-foreground">{item.catatan_admin}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                Selanjutnya
              </Button>
            </div>
          )}
        </main>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Laporan?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini tidak dapat dibatalkan. Laporan akan dihapus secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && handleDelete(deleteId)}
                className="bg-destructive text-destructive-foreground"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}
