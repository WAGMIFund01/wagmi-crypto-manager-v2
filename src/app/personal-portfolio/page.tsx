import PersonalPortfolioClient from './PersonalPortfolioClient';

export default async function PersonalPortfolioPage() {
  // For now, allow access to personal portfolio without strict authentication
  // This can be enhanced later with proper user authentication
  return <PersonalPortfolioClient />;
}
