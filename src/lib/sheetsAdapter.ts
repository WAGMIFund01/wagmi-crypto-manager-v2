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
  coinGeckoId?: string; // CoinGecko ID for price fetching
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
      if (result.valid && result.investor) {
        // Convert camelCase to snake_case to match the Investor interface
        return {
          investor_id: result.investor.id,
          name: result.investor.name,
          email: result.investor.email,
          join_date: result.investor.joinDate,
          investment_value: result.investor.investmentValue,
          current_value: result.investor.currentValue,
          share_percentage: result.investor.sharePercentage,
          return_percentage: result.investor.returnPercentage,
        };
      }
      return null;
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
          const coinGeckoId = row[10]?.toString()?.trim() || undefined; // Column K (index 10)
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
              coinGeckoId,
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
  async getKpiData(): Promise<{
    totalInvestors: number;
    totalInvested: number;
    totalAUM: number;
    cumulativeReturn: number;
    monthlyReturn: number;
  }> {
    try {
      await this.initializeServiceAccount();
      
      if (!this.sheets) {
        throw new Error('Sheets API not initialized');
      }

      // Read the KPIs sheet with raw values (not formatted)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'KPIs!A:B', // A and B columns (metric name and value)
        valueRenderOption: 'UNFORMATTED_VALUE', // Get raw numeric values
      });

      if (!response.data.values || response.data.values.length === 0) {
        throw new Error('No data found in KPIs sheet');
      }

      const rows = response.data.values;
      const kpiData: {
        totalInvestors: number;
        totalInvested: number;
        totalAUM: number;
        cumulativeReturn: number;
        monthlyReturn: number;
      } = {
        totalInvestors: 0,
        totalInvested: 0,
        totalAUM: 0,
        cumulativeReturn: 0,
        monthlyReturn: 0,
      };

      // Process all rows (Google Sheets data doesn't include header in rows)
      for (const row of rows) {
        if (row && row.length >= 2) {
          const metricName = row[0]?.toString() || '';
          const value = row[1];
          
          if (metricName && value !== undefined && value !== '') {
            // Map the metric names to our expected format
            switch (metricName.toLowerCase().trim()) {
              case 'total investors':
                kpiData.totalInvestors = parseFloat(value) || 0;
                break;
              case 'total invested':
                kpiData.totalInvested = parseFloat(value) || 0;
                break;
              case 'total aum':
                kpiData.totalAUM = parseFloat(value) || 0;
                break;
              case 'cumulative retur':
              case 'cumulative return':
                kpiData.cumulativeReturn = parseFloat(value) || 0;
                break;
              case 'monthly return':
                kpiData.monthlyReturn = parseFloat(value) || 0;
                break;
            }
          }
        }
      }

      console.log('Google Sheets KPI data extracted:', kpiData);
      return kpiData;
    } catch (error) {
      console.error('Error fetching KPI data:', error);
      throw new Error('Failed to fetch KPI data');
    }
  }

  async validateInvestor(investorId: string): Promise<{
    valid: boolean;
    investor?: {
      id: string;
      name: string;
      email: string;
      joinDate: string;
      investmentValue: number;
      currentValue: number;
      sharePercentage: number;
      returnPercentage: number;
    };
  }> {
    try {
      await this.initializeServiceAccount();
      
      if (!this.sheets) {
        throw new Error('Sheets API not initialized');
      }

      // Read the Investors sheet to find the investor
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Investors!A:H', // A through H columns
        valueRenderOption: 'UNFORMATTED_VALUE', // Get raw numeric values
      });

      // Also get formatted values for dates
      const formattedResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Investors!A:H', // A through H columns
        valueRenderOption: 'FORMATTED_VALUE', // Get formatted values for dates
      });

      if (!response.data.values || response.data.values.length === 0) {
        throw new Error('No data found in Investors sheet');
      }

      if (!formattedResponse.data.values) {
        throw new Error('No formatted data found in Investors sheet');
      }

      const rows = response.data.values;
      const formattedRows = formattedResponse.data.values;
      const normalizedInvestorId = investorId.toUpperCase().trim();

      // Search for the investor ID in the sheet
      for (let i = 1; i < rows.length; i++) { // Skip header row
        const row = rows[i];
        const formattedRow = formattedRows[i];
        
        if (row && row.length >= 8) {
          const rowInvestorId = row[0]?.toString().toUpperCase().trim();
          
          if (rowInvestorId === normalizedInvestorId) {
            // Found the investor, return their data
            const investor = {
              id: row[0]?.toString() || '',
              name: row[1]?.toString() || '',
              email: row[2]?.toString() || '',
              joinDate: formattedRow[3]?.toString() || '',
              investmentValue: parseFloat(row[4]) || 0,
              currentValue: parseFloat(row[5]) || 0,
              sharePercentage: parseFloat(row[6]) || 0,
              returnPercentage: parseFloat(row[7]) || 0,
            };

            console.log(`Investor validation successful: ${normalizedInvestorId}`);
            return {
              valid: true,
              investor: investor
            };
          }
        }
      }

      // Investor not found
      console.log(`Investor validation failed: ${normalizedInvestorId} not found`);
      return {
        valid: false
      };

    } catch (error) {
      console.error('Error validating investor:', error);
      throw new Error('Failed to validate investor');
    }
  }

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

      // Read the entire Investors sheet with raw values (not formatted)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Investors!A:J', // A through J columns (added I and J for investor type and fees)
        valueRenderOption: 'UNFORMATTED_VALUE', // Get raw numeric values instead of formatted
      });

      // Also get formatted values for dates
      const formattedResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Investors!A:J', // A through J columns (added I and J for investor type and fees)
        valueRenderOption: 'FORMATTED_VALUE', // Get formatted values for dates
      });

      if (!response.data.values || response.data.values.length === 0) {
        throw new Error('No data found in Investors sheet');
      }

      const rows = response.data.values;
      const formattedRows = formattedResponse.data.values;
      
      if (!formattedRows) {
        throw new Error('No formatted data found in Investors sheet');
      }
      const investors: Array<{
        id: string;
        name: string;
        email: string;
        joinDate: string;
        investmentValue: number;
        currentValue: number;
        sharePercentage: number;
        returnPercentage: number;
        investorType: string;
        fees: number;
      }> = [];

      // Process all rows starting from index 1 (skip header row)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const formattedRow = formattedRows[i];
        
        // Ensure we have enough columns (at least 8 required columns)
        if (row && row.length >= 8) {
          const investor = {
            id: row[0]?.toString() || '', // investor_id (raw)
            name: row[1]?.toString() || '', // name (raw)
            email: row[2]?.toString() || '', // email (raw)
            joinDate: formattedRow[3]?.toString() || '', // join_date (formatted)
            investmentValue: parseFloat(row[4]) || 0, // investment_value (raw)
            currentValue: parseFloat(row[5]) || 0, // current_value (raw)
            sharePercentage: parseFloat(row[6]) || 0, // share_percentage (raw)
            returnPercentage: parseFloat(row[7]) || 0, // return_percentage (raw)
            investorType: row[8]?.toString() || 'N/A', // investor_type (raw) - column I
            fees: parseFloat(row[9]) || 0, // fees (raw) - column J
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

  /**
   * Add a new asset to the Portfolio Overview sheet
   */
  async addPortfolioAsset(assetRow: any[]): Promise<void> {
    try {
      if (!this.sheets) {
        throw new Error('Sheets API not initialized');
      }

      console.log('Adding new asset to portfolio:', assetRow);

      const range = 'Portfolio Overview!A:M'; // All columns from A to M
      
      // Append the new row to the sheet
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        resource: {
          values: [assetRow]
        }
      });

      console.log('Asset added successfully:', response.data);
    } catch (error) {
      console.error('Error adding asset to portfolio:', error);
      throw new Error('Failed to add asset to portfolio');
    }
  }

  /**
   * Remove an asset from the Portfolio Overview sheet by symbol
   */
  async removePortfolioAsset(symbol: string): Promise<void> {
    try {
      if (!this.sheets) {
        throw new Error('Sheets API not initialized');
      }

      console.log('Removing asset from portfolio:', symbol);

      // First, get all portfolio data to find the row index
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Portfolio Overview!A:M'
      });

      const rows = response.data.values || [];
      
      // Find the row index of the asset to remove (skip header row)
      let rowIndexToRemove = -1;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length > 1 && row[1]?.toString().toUpperCase() === symbol.toUpperCase()) {
          rowIndexToRemove = i + 1; // +1 because Google Sheets uses 1-based indexing
          break;
        }
      }

      if (rowIndexToRemove === -1) {
        throw new Error(`Asset with symbol ${symbol} not found`);
      }

      // Delete the row
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0, // Portfolio Overview is the first sheet
                dimension: 'ROWS',
                startIndex: rowIndexToRemove - 1, // Convert to 0-based index
                endIndex: rowIndexToRemove
              }
            }
          }]
        }
      });

      console.log(`Asset ${symbol} removed successfully from row ${rowIndexToRemove}`);
    } catch (error) {
      console.error('Error removing asset from portfolio:', error);
      throw new Error('Failed to remove asset from portfolio');
    }
  }
}

// Export a singleton instance
export const sheetsAdapter = new SheetsAdapter();
