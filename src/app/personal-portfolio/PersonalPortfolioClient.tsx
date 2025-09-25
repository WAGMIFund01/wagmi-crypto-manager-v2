'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import UniversalNavbar from '@/components/UniversalNavbar';
import PortfolioOverview from '@/components/tabs/PortfolioOverview';

interface Session {
  user?: {
    role?: "manager" | "investor" | "unauthorized";
    email?: string | null;
    name?: string | null;
    image?: string | null;
    investorId?: string;
  };
}

interface PersonalPortfolioClientProps {
  session: Session | null;
}

export default function PersonalPortfolioClient({ session }: PersonalPortfolioClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Initialize active tab from URL parameters
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['portfolio'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    // Update URL without page reload
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('tab', tabId);
    router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
  };

  // Handle privacy mode change
  const handlePrivacyModeChange = (privacyMode: boolean) => {
    setIsPrivacyMode(privacyMode);
  };

  // Create refresh function that triggers all data refreshes
  const triggerDataRefresh = () => {
    console.log('Personal portfolio data refresh triggered');
    // This will be handled by individual components
  };

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return <PortfolioOverview onRefresh={triggerDataRefresh} isPrivacyMode={isPrivacyMode} dataSource="personal-portfolio" />;
      default:
        return <PortfolioOverview onRefresh={triggerDataRefresh} isPrivacyMode={isPrivacyMode} dataSource="personal-portfolio" />;
    }
  };

  return (
    <div style={{ backgroundColor: '#0B0B0B' }}>
      {/* Universal Navbar */}
      <UniversalNavbar 
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onPrivacyModeChange={handlePrivacyModeChange}
        kpiData={null} // Personal portfolio doesn't have KPI data like the fund
        hasError={false}
        onKpiRefresh={async () => {}} // No KPI refresh for personal portfolio
        dataSource="personal-portfolio"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}
