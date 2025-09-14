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
}

// Export a singleton instance
export const sheetsAdapter = new SheetsAdapter();
