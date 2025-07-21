import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from '../../../././../db/prisma/prisma';
import bcrypt from 'bcryptjs';

// Define custom types for our user
type UserRole = "admin" | "manager" | "operator";

interface CustomUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

//const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.admin.findUnique({
            where: { email: credentials.email },
            include: {      
                  roles: {
                    include:{
                      role:{
                        select:{
                          name:true
                        }
                      }
                    }
                  }           
            }
          });

          if (!user || !user.isActive) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
          
          if (!isValidPassword) {
            return null;
          }

          // Get the user's role from user_roles
          const userRole = user.roles.find(a=>a.role.name);
          
          if (!userRole) {
            return null;
          }

          // Update last login
          await prisma.admin.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: userRole as any
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        token.id = customUser.id;
        token.role = customUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
