"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Calendar, Eye, Loader2, CheckCircle, Users, FileText, Clock } from "lucide-react"
import Link from "next/link"
import { adminAPI, type Laporan, type Statistics } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboardContent() {
  const [laporan, setLaporan] = useState<Laporan[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchStatistics = async () => {
    try {
      const response = await adminAPI.getStatistics()
      if (response.success && response.data) {
        setStatistics(response.data)
      }
    } catch (error) {
      console.error("Failed to fetch statistics")
    }
  }

  const fetchLaporan = async () => {
    setIsLoading(true)
    try {
      const params: any = { page, limit: 10 }
      if (statusFilter !== "all") {
        params.status = statusFilter
      }
      if (searchQuery) {
        params.search = searchQuery
      }

      const response = await adminAPI.getAllLaporan(params)
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
    fetchStatistics()
  }, [])

  useEffect(() => {
    fetchLaporan()
  }, [statusFilter, searchQuery, page])

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      valid: { variant: "default", label: "Valid" },
      invalid: { variant: "destructive", label: "Invalid" },
    }
    return variants[status] || variants.pending
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
            <p className="mt-1 text-muted-foreground">Kelola dan verifikasi laporan kebersihan</p>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Laporan</p>
                      <p className="text-2xl font-bold text-foreground">{statistics.total_laporan}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-600">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-foreground">{statistics.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valid</p>
                      <p className="text-2xl font-bold text-foreground">{statistics.valid}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Invalid</p>
                      <p className="text-2xl font-bold text-foreground">{statistics.invalid}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Petugas</p>
                      <p className="text-2xl font-bold text-foreground">{statistics.total_petugas}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

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
          ) : laporan.length === 0 ? (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Tidak ada laporan ditemukan</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {laporan.map((item) => {
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
                            <div className="space-y-1">
                              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                              {item.petugas && (
                                <p className="text-xs text-muted-foreground">Pelapor: {item.petugas.nama}</p>
                              )}
                            </div>
                            <Link href={`/admin/laporan/${item.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                Detail & Verifikasi
                              </Button>
                            </Link>
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
      </div>
    </ProtectedRoute>
  )
}
