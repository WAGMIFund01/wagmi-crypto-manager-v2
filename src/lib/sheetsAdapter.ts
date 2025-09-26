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
          // Handle totalValue - it might be empty if Google Sheets formula hasn't calculated yet
          const totalValue = row[8] && !isNaN(parseFloat(row[8])) ? parseFloat(row[8]) : (quantity * currentPrice);
          const lastPriceUpdate = row[9]?.toString() || '';
          const coinGeckoId = row[10]?.toString()?.trim() || undefined; // Column K (index 10)
          const priceChange24h = row[11] ? parseFloat(row[11]) : undefined; // Column L (index 11)
          const thesis = row[12]?.toString() || ''; // Column M (index 12)

          // Only add assets that have a name and symbol, and exclude header-like entries
          // Note: totalValue can be NaN if Google Sheets formula hasn't calculated yet
          if (assetName && symbol && 
              assetName.toLowerCase() !== 'asset name' && 
              symbol.toLowerCase() !== 'symbol' &&
              !isNaN(quantity) && !isNaN(currentPrice)) {
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

      // First, find the last row with data to determine where to insert
      const lastRowResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Portfolio Overview!A:A', // Just check column A to find last row
      });

      const lastRow = lastRowResponse.data.values?.length || 1;
      const insertRow = lastRow + 1;
      
      console.log(`Last row with data: ${lastRow}, inserting at row: ${insertRow}`);

      // Insert the new row at the specific position
      // Note: We skip Column I (Total Value) to preserve Google Sheets formula
      const range = `Portfolio Overview!A${insertRow}:M${insertRow}`;
      console.log(`Inserting at range: ${range}`);
      
      // We need to insert values in two parts to skip Column I
      // Part 1: Columns A-H (Asset Name through Current Price)
      const part1Range = `Portfolio Overview!A${insertRow}:H${insertRow}`;
      const part1Values = [assetRow.slice(0, 8)]; // First 8 columns
      
      // Part 2: Columns J-M (Last Price Update through Thesis)
      const part2Range = `Portfolio Overview!J${insertRow}:M${insertRow}`;
      const part2Values = [assetRow.slice(8)]; // Last 5 columns (skipping Column I)
      
      // Insert Part 1
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: part1Range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: part1Values
        }
      });
      
      // Insert Part 2
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: part2Range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: part2Values
        }
      });

      console.log('Asset added successfully:', response.data);
    } catch (error) {
      console.error('Error adding asset to portfolio:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        assetRow: assetRow
      });
      throw new Error(`Failed to add asset to portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Remove an asset from the Portfolio Overview sheet by symbol
   */
  async removePortfolioAsset(symbol: string): Promise<void> {
    try {
      if (!this.sheets) {
        console.error('Sheets API not initialized');
        throw new Error('Sheets API not initialized');
      }

      console.log('Removing asset from portfolio:', symbol);

      // First, get all portfolio data to find the row index
      console.log('Fetching portfolio data to find asset row...');
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Portfolio Overview!A:M'
      });
      console.log('Portfolio data fetched successfully');

      const rows = response.data.values || [];
      
      // Find the row index of the asset to remove (skip header row)
      let rowIndexToRemove = -1;
      const matchingRows: number[] = [];
      console.log(`Looking for asset with symbol: ${symbol.toUpperCase()}`);
      console.log(`Total rows in sheet: ${rows.length}`);
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowSymbol = row && row.length > 1 ? row[1]?.toString().toUpperCase() : '';
        console.log(`Row ${i}: Symbol = "${rowSymbol}", Asset = "${row[0]}"`);
        
        if (row && row.length > 1 && rowSymbol === symbol.toUpperCase()) {
          matchingRows.push(i + 1); // +1 because Google Sheets uses 1-based indexing
          console.log(`Found matching asset at row ${i + 1}`);
        }
      }
      
      if (matchingRows.length === 0) {
        console.log(`No asset found with symbol: ${symbol}`);
        throw new Error(`Asset with symbol ${symbol} not found`);
      }
      
      if (matchingRows.length > 1) {
        console.log(`⚠️ WARNING: Found ${matchingRows.length} duplicate entries for ${symbol}:`);
        matchingRows.forEach((rowIndex, index) => {
          console.log(`  ${index + 1}. Row ${rowIndex}: ${rows[rowIndex - 1]}`);
        });
        console.log(`Will delete the first occurrence at row ${matchingRows[0]}`);
      }
      
      rowIndexToRemove = matchingRows[0]; // Delete the first occurrence

      // Delete the row
      console.log(`Attempting to delete row ${rowIndexToRemove}...`);
      console.log(`Delete request details:`);
      console.log(`- Sheet ID: ${this.sheetId}`);
      console.log(`- Row index (1-based): ${rowIndexToRemove}`);
      console.log(`- Start index (0-based): ${rowIndexToRemove - 1}`);
      console.log(`- End index (0-based): ${rowIndexToRemove}`);
      
      // Get the actual sheet ID for Portfolio Overview
      console.log('Getting sheet metadata to find correct sheet ID...');
      const sheetMetadata = await this.sheets.spreadsheets.get({
        spreadsheetId: this.sheetId
      });
      
      const portfolioSheet = sheetMetadata.data.sheets?.find(sheet => 
        sheet.properties?.title === 'Portfolio Overview'
      );
      
      if (!portfolioSheet || !portfolioSheet.properties?.sheetId) {
        throw new Error('Portfolio Overview sheet not found or missing sheet ID');
      }
      
      const actualSheetId = portfolioSheet.properties.sheetId;
      console.log(`Found Portfolio Overview sheet ID: ${actualSheetId}`);
      
      const deleteRequest = {
        spreadsheetId: this.sheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: actualSheetId, // Use the actual sheet ID, not 0
                dimension: 'ROWS',
                startIndex: rowIndexToRemove - 1, // Convert to 0-based index
                endIndex: rowIndexToRemove
              }
            }
          }]
        }
      };
      
      console.log('Full delete request:', JSON.stringify(deleteRequest, null, 2));
      
      const deleteResponse = await this.sheets.spreadsheets.batchUpdate(deleteRequest);

      console.log('Delete operation response:', deleteResponse.data);
      console.log(`Asset ${symbol} removed successfully from row ${rowIndexToRemove}`);
      
      // Verify the asset was actually removed
      console.log('Verifying asset removal...');
      const verifyResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Portfolio Overview!A:M'
      });
      
      const verifyRows = verifyResponse.data.values || [];
      const stillExists = verifyRows.some((row: any[], index: number) => 
        index > 0 && row && row.length > 1 && row[1]?.toString().toUpperCase() === symbol.toUpperCase()
      );
      
      console.log(`Verification: Asset ${symbol} still exists: ${stillExists}`);
      console.log(`Total rows after removal: ${verifyRows.length}`);
      
      if (stillExists) {
        console.error(`ERROR: Asset ${symbol} was not actually removed from the sheet!`);
        throw new Error(`Asset ${symbol} was not actually removed from the sheet`);
      }
      
    } catch (error) {
      console.error('Error removing asset from portfolio:', error);
      throw new Error(`Failed to remove asset from portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Edit an existing asset in the portfolio
   */
  async editPortfolioAsset(editData: {
    symbol: string;
    quantity: number;
    riskLevel: string;
    location: string;
    coinType: string;
    thesis: string;
    originalAsset?: any;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`Editing asset ${editData.symbol} in portfolio...`);
      
      if (!this.isServiceAccountInitialized) {
        await this.initializeServiceAccount();
      }

      if (!this.sheets) {
        throw new Error('Google Sheets API client not initialized');
      }

      // Get the current portfolio data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Portfolio Overview!A:M'
      });
      
      console.log('Portfolio data fetched successfully');
      const rows = response.data.values || [];
      
      // Find the row index of the asset to edit using original asset data
      let rowIndexToEdit = -1;
      console.log(`Looking for asset with symbol: ${editData.symbol.toUpperCase()}`);
      console.log(`Total rows in sheet: ${rows.length}`);
      
      // Use original asset data to find the correct row, or fall back to new data matching
      const searchSymbol = editData.originalAsset?.symbol?.toUpperCase() || editData.symbol.toUpperCase();
      const searchLocation = editData.originalAsset?.location || editData.location;
      const searchCoinType = editData.originalAsset?.coinType || editData.coinType;
      
      console.log(`Searching for asset with original values - Symbol: "${searchSymbol}", Location: "${searchLocation}", CoinType: "${searchCoinType}"`);
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowSymbol = row && row.length > 1 ? row[1]?.toString().toUpperCase() : '';
        const rowLocation = row && row.length > 4 ? row[4]?.toString() : '';
        const rowCoinType = row && row.length > 5 ? row[5]?.toString() : '';
        
        console.log(`Row ${i}: Symbol = "${rowSymbol}", Location = "${rowLocation}", CoinType = "${rowCoinType}", Asset = "${row[0]}"`);
        
        // Match by original asset data to identify the specific asset
        if (row && row.length > 5 && 
            rowSymbol === searchSymbol &&
            rowLocation === searchLocation &&
            rowCoinType === searchCoinType) {
          rowIndexToEdit = i + 1; // +1 because Google Sheets uses 1-based indexing
          console.log(`Found matching asset at row ${rowIndexToEdit}`);
          break;
        }
      }
      
      if (rowIndexToEdit === -1) {
        console.log(`No asset found with symbol: ${searchSymbol}, location: ${searchLocation}, coinType: ${searchCoinType}`);
        return {
          success: false,
          error: `Asset with symbol ${searchSymbol}, location ${searchLocation}, and type ${searchCoinType} not found`
        };
      }

      // Get current asset data to preserve some fields
      const currentRow = rows[rowIndexToEdit - 1];
      const currentPrice = currentRow && currentRow.length > 7 ? parseFloat(currentRow[7]) || 0 : 0;

      // Prepare the updated row data
      // Note: Total Value (Column I) is completely skipped to preserve Google Sheets formula
      const part1Data = [
        currentRow[0] || '', // Asset Name (keep existing)
        editData.symbol.toUpperCase(), // Symbol
        currentRow[2] || '', // Chain (keep existing)
        editData.riskLevel, // Risk Level
        editData.location, // Location
        editData.coinType, // Coin Type
        editData.quantity, // Quantity
        currentPrice, // Current Price (keep existing)
      ];

      const part2Data = [
        currentRow[9] || '', // Last Price Update (keep existing)
        currentRow[10] || '', // Price Change 24h (keep existing)
        currentRow[11] || '', // CoinGecko ID (keep existing)
        editData.thesis // Thesis
      ];

      console.log(`Updating row ${rowIndexToEdit} with data (Part 1):`, part1Data);
      console.log(`Updating row ${rowIndexToEdit} with data (Part 2):`, part2Data);

      // Update the row in Google Sheets in two parts to skip Column I
      // Part 1: Columns A-H
      const part1Response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: `Portfolio Overview!A${rowIndexToEdit}:H${rowIndexToEdit}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [part1Data]
        }
      });

      // Part 2: Columns J-M
      const updateResponse = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: `Portfolio Overview!J${rowIndexToEdit}:M${rowIndexToEdit}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [part2Data]
        }
      });

      console.log('Update operation response:', updateResponse.data);
      console.log(`Asset ${editData.symbol} updated successfully at row ${rowIndexToEdit}`);
      
      return {
        success: true,
        data: {
          symbol: editData.symbol,
          quantity: editData.quantity,
          riskLevel: editData.riskLevel,
          location: editData.location,
          coinType: editData.coinType,
          thesis: editData.thesis
          // totalValue will be calculated by Google Sheets formula
        }
      };

    } catch (error) {
      console.error('Error editing asset in portfolio:', error);
      return {
        success: false,
        error: `Failed to edit asset in portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Add a new asset to the Personal portfolio
   */
  async addPersonalAsset(assetData: {
    assetName: string;
    symbol: string;
    chain: string;
    riskLevel: string;
    location: string;
    coinType: string;
    quantity: number;
    currentPrice: number;
    coinGeckoId?: string;
    priceChange24h?: number;
    thesis?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`Adding asset ${assetData.symbol} to Personal portfolio...`);
      
      if (!this.isServiceAccountInitialized) {
        await this.initializeServiceAccount();
      }

      if (!this.sheets) {
        throw new Error('Google Sheets API client not initialized');
      }

      // Prepare the asset row for Personal portfolio
      const assetRow = [
        assetData.assetName,           // A: Asset Name
        assetData.symbol,             // B: Symbol
        assetData.chain,              // C: Chain
        assetData.riskLevel,          // D: Risk Level
        assetData.location,           // E: Location
        assetData.coinType,           // F: Coin Type
        assetData.quantity,           // G: Quantity
        assetData.currentPrice,       // H: Current Price
        '',                          // I: Total Value (calculated by formula)
        new Date().toISOString(),     // J: Last Updated
        assetData.coinGeckoId || '',  // K: CoinGecko ID
        assetData.priceChange24h || 0, // L: 24hr Change
        assetData.thesis || ''        // M: Thesis
      ];

      // Add the asset to Personal portfolio sheet
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range: 'Personal portfolio!A:M',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        body: {
          values: [assetRow]
        }
      });

      console.log(`Asset ${assetData.symbol} added to Personal portfolio successfully`);
      return {
        success: true,
        data: {
          symbol: assetData.symbol,
          name: assetData.assetName,
          quantity: assetData.quantity,
          currentPrice: assetData.currentPrice
        }
      };

    } catch (error) {
      console.error('Error adding asset to Personal portfolio:', error);
      return {
        success: false,
        error: `Failed to add asset to Personal portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Edit an existing asset in the Personal portfolio
   */
  async editPersonalAsset(editData: {
    symbol: string;
    assetName?: string;
    chain?: string;
    riskLevel?: string;
    location?: string;
    coinType?: string;
    quantity?: number;
    currentPrice?: number;
    priceChange24h?: number;
    thesis?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log(`Editing asset ${editData.symbol} in Personal portfolio...`);
      
      if (!this.isServiceAccountInitialized) {
        await this.initializeServiceAccount();
      }

      if (!this.sheets) {
        throw new Error('Google Sheets API client not initialized');
      }

      // Get the current Personal portfolio data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Personal portfolio!A:M'
      });
      
      const rows = response.data.values || [];
      
      // Find the row index of the asset to edit
      let rowIndexToEdit = -1;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length > 1 && row[1]?.toString().toUpperCase() === editData.symbol.toUpperCase()) {
          rowIndexToEdit = i;
          break;
        }
      }

      if (rowIndexToEdit === -1) {
        return {
          success: false,
          error: `Asset ${editData.symbol} not found in Personal portfolio`
        };
      }

      // Prepare updates for individual fields
      const updates: { range: string; values: any[][] }[] = [];
      const rowNum = rowIndexToEdit + 1; // Google Sheets is 1-indexed

      if (editData.assetName !== undefined) {
        updates.push({
          range: `Personal portfolio!A${rowNum}`,
          values: [[editData.assetName]]
        });
      }
      if (editData.chain !== undefined) {
        updates.push({
          range: `Personal portfolio!C${rowNum}`,
          values: [[editData.chain]]
        });
      }
      if (editData.riskLevel !== undefined) {
        updates.push({
          range: `Personal portfolio!D${rowNum}`,
          values: [[editData.riskLevel]]
        });
      }
      if (editData.location !== undefined) {
        updates.push({
          range: `Personal portfolio!E${rowNum}`,
          values: [[editData.location]]
        });
      }
      if (editData.coinType !== undefined) {
        updates.push({
          range: `Personal portfolio!F${rowNum}`,
          values: [[editData.coinType]]
        });
      }
      if (editData.quantity !== undefined) {
        updates.push({
          range: `Personal portfolio!G${rowNum}`,
          values: [[editData.quantity]]
        });
      }
      if (editData.currentPrice !== undefined) {
        updates.push({
          range: `Personal portfolio!H${rowNum}`,
          values: [[editData.currentPrice]]
        });
      }
      if (editData.priceChange24h !== undefined) {
        updates.push({
          range: `Personal portfolio!L${rowNum}`,
          values: [[editData.priceChange24h]]
        });
      }
      if (editData.thesis !== undefined) {
        updates.push({
          range: `Personal portfolio!M${rowNum}`,
          values: [[editData.thesis]]
        });
      }

      // Update last updated timestamp
      updates.push({
        range: `Personal portfolio!J${rowNum}`,
        values: [[new Date().toISOString()]]
      });

      // Execute batch update if there are updates to make
      if (updates.length > 0) {
        await this.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: this.sheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates
          }
        });
      }

      console.log(`Asset ${editData.symbol} edited in Personal portfolio successfully`);
      return {
        success: true,
        data: {
          ...editData
        }
      };

    } catch (error) {
      console.error('Error editing asset in Personal portfolio:', error);
      return {
        success: false,
        error: `Failed to edit asset in Personal portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Remove an asset from the Personal portfolio
   */
  async removePersonalAsset(symbol: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`Removing asset ${symbol} from Personal portfolio...`);
      
      if (!this.isServiceAccountInitialized) {
        await this.initializeServiceAccount();
      }

      if (!this.sheets) {
        throw new Error('Google Sheets API client not initialized');
      }

      // Get the current Personal portfolio data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Personal portfolio!A:M'
      });
      
      const rows = response.data.values || [];
      
      // Find the row index of the asset to remove
      let rowIndexToRemove = -1;
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length > 1 && row[1]?.toString().toUpperCase() === symbol.toUpperCase()) {
          rowIndexToRemove = i;
          break;
        }
      }

      if (rowIndexToRemove === -1) {
        return {
          success: false,
          error: `Asset ${symbol} not found in Personal portfolio`
        };
      }

      // Delete the row
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.sheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming Personal portfolio is the first sheet
                dimension: 'ROWS',
                startIndex: rowIndexToRemove,
                endIndex: rowIndexToRemove + 1
              }
            }
          }]
        }
      });

      console.log(`Asset ${symbol} removed from Personal portfolio successfully`);
      return {
        success: true
      };

    } catch (error) {
      console.error('Error removing asset from Personal portfolio:', error);
      return {
        success: false,
        error: `Failed to remove asset from Personal portfolio: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export a singleton instance
export const sheetsAdapter = new SheetsAdapter();
