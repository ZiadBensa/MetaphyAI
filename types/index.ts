import type { DefaultSession } from "next-auth"

// Extend the default session type
declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string
    userId?: string // This is now your internal database user ID from Prisma
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    userId?: string // This is now your internal database user ID from Prisma
  }
}

// Existing types...
export interface ExtractResponse {
  text: string
  filename: string
}

export interface HumanizeRequest {
  text: string
  tone: string
}

export interface HumanizeResponse {
  humanized_text: string
  tone: string
}

export interface FileUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  acceptedTypes: string[]
  maxSize: number
}

export interface ToneOption {
  value: string
  label: string
  description: string
}

export interface ApiError {
  message: string
  status: number
}

// Represents your application's internal User model from Prisma
export interface User {
  id: string // Your internal database ID for the user (from Prisma)
  googleId?: string | null // Google's ID
  email: string
  name?: string | null
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

// Type for AI Interaction History (if fetched by frontend)
export interface AIInteraction {
  id: string
  userId: string
  interactionType: string
  inputText?: string | null
  inputFilename?: string | null
  outputText: string
  tone?: string | null
  createdAt: string // Date string
}
