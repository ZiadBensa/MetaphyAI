import { getSession } from "next-auth/react"

// API configuration and helper functions
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class ApiError {
  message: string
  status: number

  constructor(message: string, status: number) {
    this.message = message
    this.status = status
  }
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession()
    const headers: HeadersInit = {}

    // Attach the access token from NextAuth.js session
    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`
    }
    // The backend will extract userId from the JWT, so no need to send it explicitly in a custom header
    // unless your backend specifically requires it outside of token validation.

    return headers
  }

  async extractText(file: File): Promise<{ text: string; filename: string }> {
    const formData = new FormData()
    formData.append("file", file)

    const authHeaders = await this.getAuthHeaders()

    const response = await fetch(`${this.baseUrl}/ai/extract/upload`, {
      // Updated path
      method: "POST",
      headers: {
        ...authHeaders,
      },
      body: formData,
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError("Authentication required. Please sign in again.", response.status)
      }
      throw new ApiError(`Failed to extract text: ${response.statusText}`, response.status)
    }

    return response.json()
  }

  async humanizeText(text: string, tone: string): Promise<{ humanized_text: string; tone: string }> {
    const authHeaders = await this.getAuthHeaders()

    const response = await fetch(`${this.baseUrl}/ai/humanize/`, {
      // Updated path
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ text, tone }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError("Authentication required. Please sign in again.", response.status)
      }
      throw new ApiError(`Failed to humanize text: ${response.statusText}`, response.status)
    }

    return response.json()
  }
}

// Export a default instance
export const apiClient = new ApiClient()
