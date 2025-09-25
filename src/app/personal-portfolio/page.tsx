import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PersonalPortfolioClient from './PersonalPortfolioClient';

export default async function PersonalPortfolioPage() {
  const session = await getServerSession(authOptions);

  // For now, allow access to personal portfolio without strict authentication
  // This can be enhanced later with proper user authentication
  if (!session) {
    redirect('/');
  }

  return <PersonalPortfolioClient />;
}
