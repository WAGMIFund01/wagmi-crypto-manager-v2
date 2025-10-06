// Debug script to test historical performance data reading
const { sheetsAdapter } = require('./src/lib/sheetsAdapter.ts');

async function debugHistorical() {
  try {
    console.log('🔍 Starting historical performance debug...');
    
    // Test WAGMI historical performance
    console.log('\n📊 Testing WAGMI Historical Performance...');
    const wagmiData = await sheetsAdapter.getWagmiHistoricalPerformance();
    console.log('WAGMI Result:', wagmiData);
    console.log('WAGMI Count:', wagmiData.length);
    
    // Test Personal Portfolio historical performance
    console.log('\n📊 Testing Personal Portfolio Historical Performance...');
    const personalData = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();
    console.log('Personal Result:', personalData);
    console.log('Personal Count:', personalData.length);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugHistorical();
