import { redirect } from 'next/navigation';

export default function PersonalPortfolioPage() {
  // Step 2: Identical UI - Use same data source as WAGMI Fund for now
  // This ensures we have a clean baseline before implementing conditional rendering
  // Authentication is handled by the parent module selector page
  redirect('/wagmi-fund-module');
}
