import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

// Force Next.js to bundle the database file by referencing it via path.join
const dbPath = path.join(process.cwd(), 'prisma', 'dev.db')
if (process.env.NODE_ENV === 'production') {
  if (fs.existsSync(dbPath)) {
    console.log('Prisma Database file exists at bundle path.')
  } else {
    console.warn('Prisma Database file not found at bundle path:', dbPath)
  }
}

const prismaClientSingleton = () => {
  return new PrismaClient()
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
