import { Suspense } from "react"
import PetugasDashboardContent from "./dashboard-content"

export default function PetugasDashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <PetugasDashboardContent />
    </Suspense>
  )
}
