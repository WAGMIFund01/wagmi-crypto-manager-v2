import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { config } from './config';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn() {
      // Allow sign in for now - we'll add user management later
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Add user role and investorId to token
        // For now, we'll determine this based on email
        const email = user.email || '';
        
        // Manager role for specific emails (you can customize this)
        if (email === 'manager@wagmi.com' || email.includes('manager')) {
          token.role = 'manager';
          token.investorId = undefined;
        } else {
          // Investor role with generated investorId
          token.role = 'investor';
          token.investorId = `INV${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as 'manager' | 'investor';
        session.user.investorId = token.investorId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: config.nextAuthSecret,
};
