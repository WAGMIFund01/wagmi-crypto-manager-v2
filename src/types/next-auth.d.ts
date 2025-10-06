import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role: 'manager' | 'investor' | 'household' | 'unauthorized';
      investorId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'manager' | 'investor' | 'household' | 'unauthorized';
    investorId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'manager' | 'investor' | 'household' | 'unauthorized';
    investorId?: string;
  }
}
