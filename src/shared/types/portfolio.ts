export interface PortfolioAsset {
  symbol: string;
  name: string;
  quantity: number;
  currentPrice: number;
  targetAllocation: number;
  currentAllocation: number;
  value: number;
  pnl: number;
  pnlPercentage: number;
}

export interface Portfolio {
  investorId: string;
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  assets: PortfolioAsset[];
  lastUpdated: string;
}

export interface Transaction {
  id: string;
  investorId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: string;
  notes?: string;
}
