export default function PortfolioOverview() {
  return (
    <div className="space-y-6">
      <h2 
        className="text-2xl font-bold"
        style={{ 
          color: '#00FF95',
          textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
        }}
      >
        Portfolio Overview
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Portfolio Cards will go here */}
        <div 
          className="group relative p-6 rounded-2xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,149,0.15)]"
          style={{ 
            backgroundColor: '#1A1F1A',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05), 0 0 15px rgba(0, 255, 149, 0.1)'
          }}
        >
          <div className="space-y-4">
            <h3 
              className="text-lg font-semibold"
              style={{ 
                color: '#00FF95',
                textShadow: '0 0 10px rgba(0, 255, 149, 0.3)'
              }}
            >
              Portfolio Summary
            </h3>
            <p style={{ color: '#E0E0E0', fontSize: '14px', lineHeight: '1.5' }}>
              View and manage all investor portfolios with real-time performance metrics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
