import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AICopilotClient from './AICopilotClient';

export default async function AICopilotPage() {
  const session = await getServerSession(authOptions);
  
  return <AICopilotClient session={session} />;
}
