import { config } from './config';

export interface Investor {
  investor_id: string;
  name: string;
  email: string;
  join_date: string;
  investment_value: number;
  current_value: number;
  share_percentage: number;
  return_percentage: number;
}

export interface GoogleSheetsResponse {
  success: boolean;
  data: Investor[];
  error?: string;
}

export class SheetsAdapter {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.googleSheetsEndpoint;
  }

  /**
   * Validate an investor ID against the Google Sheets database
   */
  async validateInvestor(investorId: string): Promise<{ valid: boolean; investor?: Investor }> {
    try {
      const url = `${this.baseUrl}?action=getInvestor&investorId=${encodeURIComponent(investorId)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GoogleSheetsResponse = await response.json();

      if (data.success && data.data && data.data.length > 0) {
        return {
          valid: true,
          investor: data.data[0]
        };
      }

      return { valid: false };
    } catch (error) {
      console.error('Error validating investor:', error);
      throw new Error('Failed to validate investor ID');
    }
  }

  /**
   * Get all investors (for manager dashboard)
   */
  async getAllInvestors(): Promise<Investor[]> {
    try {
      const url = `${this.baseUrl}?action=getAllInvestors`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GoogleSheetsResponse = await response.json();

      if (data.success && data.data) {
        return data.data;
      }

      throw new Error('Failed to fetch investors');
    } catch (error) {
      console.error('Error fetching investors:', error);
      throw new Error('Failed to fetch investors');
    }
  }

  /**
   * Get portfolio data for a specific investor
   */
  async getInvestorPortfolio(investorId: string): Promise<Investor | null> {
    try {
      const result = await this.validateInvestor(investorId);
      return result.valid ? result.investor || null : null;
    } catch (error) {
      console.error('Error fetching investor portfolio:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const sheetsAdapter = new SheetsAdapter();
