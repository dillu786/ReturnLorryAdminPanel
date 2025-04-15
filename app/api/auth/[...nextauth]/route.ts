import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'secr3t',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const { email, password } = credentials ?? {};

        const user = await fakeLogin(email, password);

        if (user) {
          return user;
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial login, attach user data to the token

      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Add custom token fields to session.user
      if (session.user) {
        session.user.id = token.id as number;
        session.user.role = token.role as unknown as any;
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

// Fake login function
async function fakeLogin(email: string, password: string) {
    console.log("secret"+  process.env.NEXTAUTH_SECRET)
  if (email === 'user@example.com' && password === 'password123') {
    return {
      id: '1',
      name: 'Test User',
      email,
      role: 'manager'
    };
  }
  return null;
}
