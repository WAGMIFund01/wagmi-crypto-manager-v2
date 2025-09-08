import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      role: 'manager' | 'investor';
      investorId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    role: 'manager' | 'investor';
    investorId?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'manager' | 'investor';
    investorId?: string;
  }
}
