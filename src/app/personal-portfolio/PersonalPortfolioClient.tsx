'use client';

import { useState } from 'react';
import UniversalNavbar from '@/components/UniversalNavbar';
import PersonalPortfolioOverview from '@/components/tabs/PersonalPortfolioOverview';
import PersonalPortfolioAnalytics from '@/components/tabs/PersonalPortfolioAnalytics';

export default function PersonalPortfolioClient() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
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
        return <PersonalPortfolioOverview onRefresh={triggerDataRefresh} isPrivacyMode={isPrivacyMode} />;
      case 'analytics':
        return <PersonalPortfolioAnalytics onRefresh={triggerDataRefresh} />;
      default:
        return <PersonalPortfolioOverview onRefresh={triggerDataRefresh} isPrivacyMode={isPrivacyMode} />;
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
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}
