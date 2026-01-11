"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, MapPin, Camera, Shield, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/petugas/dashboard")
      }
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckCircle className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-foreground">CleanMonitor</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button>Daftar Sekarang</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-balance text-5xl font-bold leading-tight text-foreground md:text-6xl">
            Sistem Monitoring Kebersihan Yang Lebih <span className="text-primary">Efektif</span>
          </h1>
          <p className="mb-8 text-pretty text-xl leading-relaxed text-muted-foreground">
            Platform digital untuk pelaporan dan monitoring kebersihan secara real-time. Tingkatkan efisiensi kerja tim
            kebersihan Anda dengan teknologi modern.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Mulai Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                Masuk ke Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold text-foreground">Fitur Unggulan</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Camera className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Upload Foto Langsung</h3>
              <p className="leading-relaxed text-muted-foreground">
                Dokumentasikan kondisi kebersihan dengan foto langsung dari lapangan untuk transparansi maksimal.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">GPS Tracking</h3>
              <p className="leading-relaxed text-muted-foreground">
                Lokasi otomatis terekam untuk memudahkan tracking dan koordinasi tim di lapangan.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Verifikasi Admin</h3>
              <p className="leading-relaxed text-muted-foreground">
                Sistem verifikasi terpusat untuk memastikan setiap laporan valid dan dapat ditindaklanjuti.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Multi User Role</h3>
              <p className="leading-relaxed text-muted-foreground">
                Dashboard terpisah untuk petugas lapangan dan admin dengan akses sesuai kebutuhan.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Statistik Real-time</h3>
              <p className="leading-relaxed text-muted-foreground">
                Pantau performa tim dan status laporan dengan dashboard statistik yang informatif.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-card-foreground">Mudah Digunakan</h3>
              <p className="leading-relaxed text-muted-foreground">
                Interface yang intuitif dan responsif, mudah diakses dari smartphone atau desktop.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-12 text-center">
            <h2 className="mb-4 text-balance text-3xl font-bold text-card-foreground">
              Siap Meningkatkan Monitoring Kebersihan?
            </h2>
            <p className="mb-8 text-pretty text-lg leading-relaxed text-muted-foreground">
              Bergabunglah dengan tim yang telah merasakan efisiensi sistem monitoring digital.
            </p>
            <Link href="/register">
              <Button size="lg">Daftar Gratis Sekarang</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CleanMonitor. Platform Monitoring Kebersihan Digital.</p>
        </div>
      </footer>
    </div>
  )
}
