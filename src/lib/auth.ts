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
        // Add your manager email addresses here
        const managerEmails = [
          'wagmifund01@gmail.com', // Your main manager email
          'manager@wagmi.com',
          // Add more manager emails as needed
        ];
        
        if (managerEmails.includes(email.toLowerCase())) {
          token.role = 'manager';
          token.investorId = undefined;
        } else {
          // For now, redirect non-manager users back to homepage
          // In the future, you might want to allow investor Google login too
          token.role = 'unauthorized';
          token.investorId = undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as 'manager' | 'investor' | 'household';
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
