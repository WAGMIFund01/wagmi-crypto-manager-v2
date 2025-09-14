import { config } from './config';
import { google } from 'googleapis';

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

export interface PortfolioAsset {
  assetName: string;
  symbol: string;
  chain: string;
  riskLevel: string;
  location: string;
  coinType: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  lastPriceUpdate: string;
  priceChange24h?: number;
  thesis?: string;
}

export class SheetsAdapter {
  private baseUrl: string;
  private sheets: ReturnType<typeof google.sheets> | null = null;
  private sheetId: string;
  private isServiceAccountInitialized: boolean = false;

  constructor() {
    this.baseUrl = config.googleSheetsEndpoint;
    this.sheetId = process.env.GOOGLE_SHEET_ID || '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';
  }

  /**
   * Initialize Google Sheets API with Service Account authentication
   */
  private async initializeServiceAccount(): Promise<void> {
    if (this.isServiceAccountInitialized) {
      return;
    }

    try {
      const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (!serviceAccountEmail || !privateKey) {
        throw new Error('Missing Google Sheets API credentials');
      }

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccountEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.isServiceAccountInitialized = true;
      
      console.log('Google Sheets Service Account initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Sheets Service Account:', error);
      throw new Error('Failed to initialize Google Sheets Service Account');
    }
  }

  /**
   * Test connection to Google Sheets
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.initializeServiceAccount();
      
      if (!this.sheets) {
        throw new Error('Sheets API not initialized');
      }
      
      // Test by reading a small range
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Portfolio Overview!A1:A1',
      });

      return response.data.values !== undefined;
    } catch (error) {
      console.error('Google Sheets connection test failed:', error);
      return false;
    }
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

  /**
   * Get all portfolio assets from the Portfolio Overview sheet
   */
  async getPortfolioData(): Promise<PortfolioAsset[]> {
    try {
      await this.initializeServiceAccount();
      
      if (!this.sheets) {
        throw new Error('Sheets API not initialized');
      }

      // Read the entire Portfolio Overview sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Portfolio Overview!A:M', // A through M columns
      });

      if (!response.data.values || response.data.values.length === 0) {
        throw new Error('No data found in Portfolio Overview sheet');
      }

      const rows = response.data.values;
      const portfolioAssets: PortfolioAsset[] = [];

      // Process all rows starting from index 1 (skip header row)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // Ensure we have enough columns (at least 10 required columns)
        if (row && row.length >= 10) {
          const assetName = row[0]?.toString() || '';
          const symbol = row[1]?.toString() || '';
          const chain = row[2]?.toString() || '';
          const riskLevel = row[3]?.toString() || '';
          const location = row[4]?.toString() || '';
          const coinType = row[5]?.toString() || '';
          const quantity = parseFloat(row[6]) || 0;
          const currentPrice = parseFloat(row[7]) || 0;
          const totalValue = parseFloat(row[8]) || 0;
          const lastPriceUpdate = row[9]?.toString() || '';
          const priceChange24h = row[11] ? parseFloat(row[11]) : undefined; // Column L (index 11)
          const thesis = row[12]?.toString() || ''; // Column M (index 12)

          // Only add assets that have a name and symbol, and exclude header-like entries
          if (assetName && symbol && 
              assetName.toLowerCase() !== 'asset name' && 
              symbol.toLowerCase() !== 'symbol' &&
              !isNaN(quantity) && !isNaN(currentPrice) && !isNaN(totalValue)) {
            portfolioAssets.push({
              assetName,
              symbol,
              chain,
              riskLevel,
              location,
              coinType,
              quantity,
              currentPrice,
              totalValue,
              lastPriceUpdate,
              priceChange24h,
              thesis
            });
          }
        }
      }

      console.log(`Google Sheets portfolio data extracted: ${portfolioAssets.length} assets`);
      return portfolioAssets;

    } catch (error) {
      console.error('Error fetching portfolio data:', error);
      throw new Error('Failed to fetch portfolio data');
    }
  }

  /**
   * Get all investors from the Investors sheet
   */
  async getInvestorData(): Promise<Array<{
    id: string;
    name: string;
    email: string;
    joinDate: string;
    investmentValue: number;
    currentValue: number;
    sharePercentage: number;
    returnPercentage: number;
  }>> {
    try {
      await this.initializeServiceAccount();
      
      if (!this.sheets) {
        throw new Error('Sheets API not initialized');
      }

      // Read the entire Investors sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Investors!A:H', // A through H columns
      });

      if (!response.data.values || response.data.values.length === 0) {
        throw new Error('No data found in Investors sheet');
      }

      const rows = response.data.values;
      const investors: Array<{
        id: string;
        name: string;
        email: string;
        joinDate: string;
        investmentValue: number;
        currentValue: number;
        sharePercentage: number;
        returnPercentage: number;
      }> = [];

      // Process all rows starting from index 1 (skip header row)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        
        // Ensure we have enough columns (at least 8 required columns)
        if (row && row.length >= 8) {
          const investor = {
            id: row[0]?.toString() || '', // investor_id
            name: row[1]?.toString() || '', // name
            email: row[2]?.toString() || '', // email
            joinDate: row[3]?.toString() || '', // join_date
            investmentValue: parseFloat(row[4]) || 0, // investment_value
            currentValue: parseFloat(row[5]) || 0, // current_value
            sharePercentage: parseFloat(row[6]) || 0, // share_percentage
            returnPercentage: parseFloat(row[7]) || 0, // return_percentage
          };
          
          // Only add if we have essential data (ID and name)
          if (investor.id && investor.name) {
            investors.push(investor);
          }
        }
      }

      console.log(`Successfully fetched ${investors.length} investors from Google Sheets`);
      console.log('Investor data:', investors);
      return investors;

    } catch (error) {
      console.error('Error fetching investor data:', error);
      throw new Error('Failed to fetch investor data');
    }
  }
}

// Export a singleton instance
export const sheetsAdapter = new SheetsAdapter();
