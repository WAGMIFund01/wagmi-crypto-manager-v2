export interface User {
  email: string;
  role: 'manager' | 'investor';
  investorId?: string; // null for manager, INV001/INV002/etc for investors
}

export interface AuthUser extends User {
  id: string;
  name?: string;
  image?: string;
}
