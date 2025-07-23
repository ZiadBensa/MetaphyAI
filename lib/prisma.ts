// lib/prisma.ts
import { PrismaClient } from "@prisma/client"

// Declare a global variable for PrismaClient to prevent multiple instances in development
declare global {
  var prismaGlobal: PrismaClient | undefined
}

const prisma =
  process.env.NODE_ENV === "production"
    ? new PrismaClient()
    : global.prismaGlobal || (global.prismaGlobal = new PrismaClient())

export default prisma
