// API utility functions for cleanliness monitoring system

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

export interface User {
  user_id: number
  nama: string
  email: string
  role: "petugas" | "admin"
  token?: string
}

export interface Laporan {
  id: number
  user_id: number
  foto: string
  latitude: number
  longitude: number
  keterangan: string
  status: "pending" | "valid" | "invalid"
  validated_by: number | null
  catatan_admin: string | null
  createdAt: string
  updatedAt: string
  petugas?: {
    user_id: number
    nama: string
    email: string
  }
  admin?: {
    user_id: number
    nama: string
  } | null
}

export interface Statistics {
  total_laporan: number
  pending: number
  valid: number
  invalid: number
  total_petugas: number
}

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// Get token from localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Auth API
export const authAPI = {
  register: async (nama: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, email, password }),
    })
    return res.json() as Promise<ApiResponse<User>>
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    return res.json() as Promise<ApiResponse<User>>
  },

  logout: async () => {
    const token = getToken()
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.json() as Promise<ApiResponse>
  },
}

// Laporan API (Petugas)
export const laporanAPI = {
  create: async (formData: FormData) => {
    const token = getToken()
    const res = await fetch(`${API_BASE_URL}/laporan`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    return res.json() as Promise<ApiResponse<Laporan>>
  },

  getMyLaporan: async (params?: {
    status?: string
    page?: number
    limit?: number
  }) => {
    const token = getToken()
    const query = new URLSearchParams()
    if (params?.status) query.set("status", params.status)
    if (params?.page) query.set("page", params.page.toString())
    if (params?.limit) query.set("limit", params.limit.toString())

    const res = await fetch(`${API_BASE_URL}/laporan/me?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.json() as Promise<
      ApiResponse<{
        laporan: Laporan[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }>
    >
  },

  getDetail: async (id: number) => {
    const token = getToken()
    const res = await fetch(`${API_BASE_URL}/laporan/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.json() as Promise<ApiResponse<Laporan>>
  },

  update: async (id: number, formData: FormData) => {
    const token = getToken()
    const res = await fetch(`${API_BASE_URL}/laporan/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    return res.json() as Promise<ApiResponse<Laporan>>
  },

  delete: async (id: number) => {
    const token = getToken()
    const res = await fetch(`${API_BASE_URL}/laporan/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.json() as Promise<ApiResponse>
  },
}

// Admin API
export const adminAPI = {
  getAllLaporan: async (params?: {
    status?: string
    user_id?: number
    search?: string
    page?: number
    limit?: number
  }) => {
    const token = getToken()
    const query = new URLSearchParams()
    if (params?.status) query.set("status", params.status)
    if (params?.user_id) query.set("user_id", params.user_id.toString())
    if (params?.search) query.set("search", params.search)
    if (params?.page) query.set("page", params.page.toString())
    if (params?.limit) query.set("limit", params.limit.toString())

    const res = await fetch(`${API_BASE_URL}/admin/laporan?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.json() as Promise<
      ApiResponse<{
        laporan: Laporan[]
        pagination: {
          total: number
          page: number
          limit: number
          totalPages: number
        }
      }>
    >
  },

  getLaporanDetail: async (id: number) => {
    const token = getToken()
    const res = await fetch(`${API_BASE_URL}/admin/laporan/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.json() as Promise<ApiResponse<Laporan>>
  },

  verifyLaporan: async (id: number, status: "valid" | "invalid", catatan_admin?: string) => {
    const token = getToken()
    const res = await fetch(`${API_BASE_URL}/admin/laporan/${id}/verify`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status, catatan_admin }),
    })
    return res.json() as Promise<ApiResponse<Laporan>>
  },

  getStatistics: async () => {
    const token = getToken()
    const res = await fetch(`${API_BASE_URL}/admin/statistics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.json() as Promise<ApiResponse<Statistics>>
  },
}
