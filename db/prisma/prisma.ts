import { PrismaClient } from '../generated/prisma'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma