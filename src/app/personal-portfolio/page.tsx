import { redirect } from 'next/navigation';

export default function PersonalPortfolioPage() {
  // For now, redirect to WAGMI Fund module to use identical UI
  // This is Step 2 of our strangling approach - same UI, components, and functions
  redirect('/wagmi-fund-module');
}
