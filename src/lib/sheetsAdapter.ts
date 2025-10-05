import { config } from './config';
import { google } from 'googleapis';
import { trackOperation } from './performance-monitor';

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
    return trackOperation('getPortfolioData', async () => {
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
    }, { sheetId: this.sheetId, range: 'Portfolio Overview!A:M' });
  }

  /**
   * Get KPI data from the KPIs sheet (WAGMI Fund)
   * Uses authenticated Google Sheets API for reliability
   */
  async getKpiData(): Promise<{
    totalInvestors: number;
    totalInvested: number;
    totalAUM: number;
    cumulativeReturn: number;
    monthlyReturn: number;
    lastUpdated: string;
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
        lastUpdated: string;
      } = {
        totalInvestors: 0,
        totalInvested: 0,
        totalAUM: 0,
        cumulativeReturn: 0,
        monthlyReturn: 0,
        lastUpdated: '',
      };

      // Process all rows
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row && row.length >= 2) {
          const metricName = row[0]?.toString() || '';
          const value = row[1];
          
          // Special handling for "Last Updated" - check if this is the metric name row
          if (metricName && metricName.toLowerCase().trim() === 'last updated') {
            console.log('🔍 Found "Last Updated" metric name row at index:', i);
            
            // Check if the value is in the next row (common pattern in this sheet)
            if (i + 1 < rows.length) {
              const nextRow = rows[i + 1];
              const nextRowValue = nextRow && nextRow.length >= 2 ? nextRow[1] : null;
              console.log('🔍 Next row value:', nextRowValue);
              
              if (nextRowValue !== undefined && nextRowValue !== null && nextRowValue !== '') {
                kpiData.lastUpdated = nextRowValue.toString();
                console.log('🔍 Using next row value for lastUpdated:', kpiData.lastUpdated);
                continue; // Skip processing the next row since we've already used it
              }
            }
            
            // Fallback to current row value if next row doesn't have it
            if (value !== undefined && value !== null && value !== '') {
              kpiData.lastUpdated = value.toString();
              console.log('🔍 Using current row value for lastUpdated:', kpiData.lastUpdated);
            }
            continue;
          }
          
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

      console.log('✅ Google Sheets KPI data extracted:', kpiData);
      return kpiData;
    } catch (error) {
      console.error('❌ Error fetching KPI data:', error);
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
      // Note: We skip Column I (Total Value) to preserve Google Sheets formula
      const assetRow = [
        assetData.assetName,           // A: Asset Name
        assetData.symbol,             // B: Symbol
        assetData.chain,              // C: Chain
        assetData.riskLevel,          // D: Risk Level
        assetData.location,           // E: Location
        assetData.coinType,           // F: Coin Type
        assetData.quantity,           // G: Quantity
        assetData.currentPrice,       // H: Current Price
        // I: Total Value - SKIPPED (preserve Google Sheets formula)
        new Date().toISOString(),     // J: Last Updated
        assetData.coinGeckoId || '',  // K: CoinGecko ID
        assetData.priceChange24h || 0, // L: 24hr Change
        assetData.thesis || ''        // M: Thesis
      ];

      // Add the asset to Personal portfolio sheet
      // First, find the last row with data to determine where to insert
      const lastRowResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Personal portfolio!A:A', // Just check column A to find last row
      });

      const lastRow = lastRowResponse.data.values?.length || 1;
      const insertRow = lastRow + 1;
      
      console.log(`Last row with data: ${lastRow}, inserting at row: ${insertRow}`);

      // We need to insert values in two parts to skip Column I
      // Part 1: Columns A-H (Asset Name through Current Price)
      const part1Range = `Personal portfolio!A${insertRow}:H${insertRow}`;
      const part1Values = [assetRow.slice(0, 8)]; // First 8 columns
      
      // Part 2: Columns J-M (Last Price Update through Thesis)
      const part2Range = `Personal portfolio!J${insertRow}:M${insertRow}`;
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
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: part2Range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: part2Values
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
    originalAsset?: any;
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
      
      // Find the row index of the asset to edit using original asset data
      let rowIndexToEdit = -1;
      console.log(`Looking for asset with symbol: ${editData.symbol.toUpperCase()}`);
      console.log(`Total rows in Personal portfolio sheet: ${rows.length}`);
      
      // Use original asset data to find the correct row, or fall back to new data matching
      const searchSymbol = editData.originalAsset?.symbol?.toUpperCase() || editData.symbol.toUpperCase();
      const searchLocation = editData.originalAsset?.location || editData.location;
      const searchCoinType = editData.originalAsset?.coinType || editData.coinType;
      
      console.log(`Searching for Personal portfolio asset with original values - Symbol: "${searchSymbol}", Location: "${searchLocation}", CoinType: "${searchCoinType}"`);
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowSymbol = row && row.length > 1 ? row[1]?.toString().toUpperCase() : '';
        const rowLocation = row && row.length > 4 ? row[4]?.toString() : '';
        const rowCoinType = row && row.length > 5 ? row[5]?.toString() : '';
        
        console.log(`Personal portfolio Row ${i}: Symbol = "${rowSymbol}", Location = "${rowLocation}", CoinType = "${rowCoinType}", Asset = "${row[0]}"`);
        
        // Match by original asset data to identify the specific asset
        if (row && row.length > 5 && 
            rowSymbol === searchSymbol &&
            rowLocation === searchLocation &&
            rowCoinType === searchCoinType) {
          rowIndexToEdit = i;
          console.log(`Found matching Personal portfolio asset at row ${rowIndexToEdit + 1}`);
          break;
        }
      }

      if (rowIndexToEdit === -1) {
        console.log(`No Personal portfolio asset found with symbol: ${searchSymbol}, location: ${searchLocation}, coinType: ${searchCoinType}`);
        return {
          success: false,
          error: `Asset with symbol ${searchSymbol}, location ${searchLocation}, and type ${searchCoinType} not found in Personal portfolio`
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

  /**
   * Get Personal Portfolio data
   */
  async getPersonalPortfolioData(): Promise<PortfolioAsset[]> {
    return trackOperation('getPersonalPortfolioData', async () => {
      if (!this.isServiceAccountInitialized) {
        await this.initializeServiceAccount();
      }

      if (!this.sheets) {
        throw new Error('Google Sheets API client not initialized');
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'Personal portfolio!A:M',
      });

      const rows = response.data.values || [];
      
      if (rows.length <= 1) {
        return [];
      }

      const assets: PortfolioAsset[] = [];
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const asset: PortfolioAsset = {
          assetName: row[0]?.toString() || '',
          symbol: row[1]?.toString() || '',
          chain: row[2]?.toString() || '',
          riskLevel: row[3]?.toString() || 'Medium',
          location: row[4]?.toString() || '',
          coinType: row[5]?.toString() || 'Altcoin',
          quantity: parseFloat(row[6]?.toString()) || 0,
          currentPrice: parseFloat(row[7]?.toString()) || 0,
          totalValue: parseFloat(row[8]?.toString()) || 0,
          lastPriceUpdate: row[9]?.toString() || '',
          coinGeckoId: row[10]?.toString() || '',
          priceChange24h: parseFloat(row[11]?.toString()) || 0,
          thesis: row[12]?.toString() || ''
        };
        
        if (asset.symbol && asset.quantity > 0) {
          assets.push(asset);
        }
      }
      
      return assets;
    }, { sheetId: this.sheetId, range: 'Personal portfolio!A:M' });
  }

  /**
   * Get Personal Portfolio KPI data from KPIs tab
   * - Total AUM from cell B8 (Total AUM - personal)
   * - Last Updated from cell B9 (Last Updated - personal)
   */
  async getPersonalPortfolioKpiFromKpisTab(): Promise<{
    totalAUM: number;
    lastUpdated: string;
  }> {
    return trackOperation('getPersonalPortfolioKpiFromKpisTab', async () => {
      if (!this.isServiceAccountInitialized) {
        await this.initializeServiceAccount();
      }

      if (!this.sheets) {
        throw new Error('Google Sheets API client not initialized');
      }

      // Get specific cells: B8 (Total AUM - personal) and B9 (Last Updated - personal)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: 'KPIs!B8:B9',
      });

      const rows = response.data.values || [];
      
      // Extract values from the response
      const totalAUMValue = rows[0] && rows[0][0] ? rows[0][0] : '0';
      const lastUpdatedValue = rows[1] && rows[1][0] ? rows[1][0] : new Date().toISOString();
      
      const totalAUM = parseFloat(totalAUMValue.toString()) || 0;
      const lastUpdated = lastUpdatedValue.toString();
      
      return {
        totalAUM,
        lastUpdated
      };
    }, { sheetId: this.sheetId, range: 'KPIs!B8:B9' });
  }

  // ============================================================================
  // NEW METHODS - PHASE 1: DATA ARCHITECTURE UNIFICATION
  // Added: October 2025
  // Status: TESTING PHASE - Not yet used in production endpoints
  // ============================================================================

  /**
   * Update price for a single asset in Portfolio Overview or Personal Portfolio sheet
   *
   * @param symbol - Asset symbol (e.g., 'BTC', 'ETH')
   * @param price - New price value
   * @param timestamp - ISO timestamp of when price was fetched
   * @param priceChange24h - 24-hour price change percentage (REQUIRED)
   * @param isPersonalPortfolio - If true, updates Personal portfolio sheet, otherwise Portfolio Overview
   *
   * @example
   * // Update WAGMI Fund portfolio
   * await sheetsAdapter.updateAssetPrice('BTC', 45000, '2024-10-05T10:30:00Z', 2.5, false);
   * 
   * // Update Personal Portfolio
   * await sheetsAdapter.updateAssetPrice('ETH', 2500, '2024-10-05T10:30:00Z', -1.2, true);
   */
  async updateAssetPrice(
    symbol: string,
    price: number,
    timestamp: string,
    priceChange24h: number,
    isPersonalPortfolio: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    return trackOperation('updateAssetPrice', async () => {
      try {
        const portfolioType = isPersonalPortfolio ? 'Personal Portfolio' : 'WAGMI Fund';
        console.log(`📝 Updating price for ${symbol} in ${portfolioType}: $${price} (${priceChange24h >= 0 ? '+' : ''}${priceChange24h}%)`);

        if (!this.isServiceAccountInitialized) {
          await this.initializeServiceAccount();
        }

        if (!this.sheets) {
          throw new Error('Google Sheets API client not initialized');
        }

        // Determine which sheet to use
        const sheetName = isPersonalPortfolio ? 'Personal portfolio' : 'Portfolio Overview';
        const range = `${sheetName}!A:M`;

        // Get current portfolio data to find the asset row
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.sheetId,
          range: range
        });

        const rows = response.data.values || [];
        let rowIndex = -1;

        // Find the row with matching symbol (Column B)
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row && row.length > 1 && row[1]?.toString().toUpperCase() === symbol.toUpperCase()) {
            rowIndex = i + 1; // Google Sheets is 1-indexed
            break;
          }
        }

        if (rowIndex === -1) {
          console.error(`❌ Asset ${symbol} not found in ${sheetName}`);
          return {
            success: false,
            error: `Asset ${symbol} not found in ${portfolioType}`
          };
        }

        // Prepare batch update for price, timestamp, and 24h change (all required)
        const updates: { range: string; values: any[][] }[] = [
          {
            range: `${sheetName}!H${rowIndex}`, // Column H: Current Price
            values: [[price]]
          },
          {
            range: `${sheetName}!J${rowIndex}`, // Column J: Last Price Update
            values: [[timestamp]]
          },
          {
            range: `${sheetName}!L${rowIndex}`, // Column L: 24h Change
            values: [[priceChange24h]]
          }
        ];

        // Execute batch update
        await this.sheets.spreadsheets.values.batchUpdate({
          spreadsheetId: this.sheetId,
          requestBody: {
            valueInputOption: 'USER_ENTERED',
            data: updates
          }
        });

        console.log(`✅ Successfully updated price for ${symbol} in ${portfolioType}`);
        return { success: true };

      } catch (error) {
        console.error(`❌ Error updating price for ${symbol}:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, { symbol, price, timestamp, priceChange24h, isPersonalPortfolio });
  }

  /**
   * Update prices for multiple assets at once (batch operation)
   * More efficient than calling updateAssetPrice multiple times
   *
   * @param updates - Array of price updates
   * @param isPersonalPortfolio - If true, updates Personal portfolio sheet, otherwise Portfolio Overview
   *
   * @example
   * // Update WAGMI Fund portfolio
   * await sheetsAdapter.batchUpdatePrices([
   *   { symbol: 'BTC', price: 45000, timestamp: '2024-10-05T10:30:00Z', priceChange24h: 2.5 },
   *   { symbol: 'ETH', price: 2500, timestamp: '2024-10-05T10:30:00Z', priceChange24h: -1.2 }
   * ], false);
   * 
   * // Update Personal Portfolio
   * await sheetsAdapter.batchUpdatePrices([
   *   { symbol: 'SOL', price: 150, timestamp: '2024-10-05T10:30:00Z', priceChange24h: 5.0 }
   * ], true);
   */
  async batchUpdatePrices(
    updates: Array<{
      symbol: string;
      price: number;
      timestamp: string;
      priceChange24h: number; // REQUIRED
    }>,
    isPersonalPortfolio: boolean = false
  ): Promise<{
    success: boolean;
    successCount: number;
    failedCount: number;
    errors?: Array<{ symbol: string; error: string }>;
  }> {
    return trackOperation('batchUpdatePrices', async () => {
      try {
        const portfolioType = isPersonalPortfolio ? 'Personal Portfolio' : 'WAGMI Fund';
        console.log(`📝 Batch updating prices for ${updates.length} assets in ${portfolioType}`);

        if (!this.isServiceAccountInitialized) {
          await this.initializeServiceAccount();
        }

        if (!this.sheets) {
          throw new Error('Google Sheets API client not initialized');
        }

        // Determine which sheet to use
        const sheetName = isPersonalPortfolio ? 'Personal portfolio' : 'Portfolio Overview';
        const range = `${sheetName}!A:M`;

        // Get current portfolio data once (more efficient than multiple reads)
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.sheetId,
          range: range
        });

        const rows = response.data.values || [];

        // Build a map of symbol -> row index for quick lookup
        const symbolToRowIndex = new Map<string, number>();
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row && row.length > 1) {
            const symbol = row[1]?.toString().toUpperCase();
            if (symbol) {
              symbolToRowIndex.set(symbol, i + 1); // Google Sheets is 1-indexed
            }
          }
        }

        // Prepare all updates
        const batchUpdates: { range: string; values: any[][] }[] = [];
        const errors: Array<{ symbol: string; error: string }> = [];
        let successCount = 0;

        for (const update of updates) {
          const rowIndex = symbolToRowIndex.get(update.symbol.toUpperCase());

          if (!rowIndex) {
            console.warn(`⚠️ Asset ${update.symbol} not found in ${sheetName}, skipping`);
            errors.push({ symbol: update.symbol, error: `Asset not found in ${portfolioType}` });
            continue;
          }

          // Add price update
          batchUpdates.push({
            range: `${sheetName}!H${rowIndex}`, // Column H: Current Price
            values: [[update.price]]
          });

          // Add timestamp update
          batchUpdates.push({
            range: `${sheetName}!J${rowIndex}`, // Column J: Last Price Update
            values: [[update.timestamp]]
          });

          // Add 24h change (always required now)
          batchUpdates.push({
            range: `${sheetName}!L${rowIndex}`, // Column L: 24h Change
            values: [[update.priceChange24h]]
          });

          successCount++;
        }

        // Execute all updates in a single batch request (much faster!)
        if (batchUpdates.length > 0) {
          await this.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: this.sheetId,
            requestBody: {
              valueInputOption: 'USER_ENTERED',
              data: batchUpdates
            }
          });
        }

        console.log(`✅ Batch update complete for ${portfolioType}: ${successCount} successful, ${errors.length} failed`);

        return {
          success: errors.length === 0,
          successCount,
          failedCount: errors.length,
          errors: errors.length > 0 ? errors : undefined
        };

      } catch (error) {
        console.error('❌ Error in batch price update:', error);
        return {
          success: false,
          successCount: 0,
          failedCount: updates.length,
          errors: [{ symbol: 'ALL', error: error instanceof Error ? error.message : 'Unknown error' }]
        };
      }
    }, { updateCount: updates.length, isPersonalPortfolio });
  }


  /**
   * Update the "Last Updated" timestamp in the KPIs sheet
   * Called after price updates to show when data was last refreshed
   * 
   * @param timestamp - ISO timestamp string
   * @param isPersonalPortfolio - If true, updates personal portfolio timestamp (B9), otherwise WAGMI fund (B7)
   * 
   * @example
   * await sheetsAdapter.updateKpiTimestamp(new Date().toISOString(), false);
   */
  async updateKpiTimestamp(
    timestamp: string,
    isPersonalPortfolio: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    return trackOperation('updateKpiTimestamp', async () => {
      try {
        console.log(`📝 Updating KPI timestamp: ${timestamp}`);
        
        if (!this.isServiceAccountInitialized) {
          await this.initializeServiceAccount();
        }

        if (!this.sheets) {
          throw new Error('Google Sheets API client not initialized');
        }

        // Determine which cell to update based on portfolio type
        // B7 = WAGMI Fund navbar timestamp (FIXED: was B2)
        // B9 = Personal Portfolio navbar timestamp
        const cell = isPersonalPortfolio ? 'B9' : 'B7';
        const range = `KPIs!${cell}`;

        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.sheetId,
          range: range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[timestamp]]
          }
        });

        console.log(`✅ Updated KPI timestamp in ${range}`);
        return { success: true };

      } catch (error) {
        console.error('❌ Error updating KPI timestamp:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }, { timestamp, isPersonalPortfolio });
  }

  /**
   * Get the last updated timestamp for WAGMI Fund from KPIs sheet (cell B7)
   * Used by UniversalNavbar to display when data was last refreshed
   * 
   * @returns Timestamp string or null if not found
   * 
   * @example
   * const timestamp = await sheetsAdapter.getWagmiTimestamp();
   * // Returns: "10/05/2024, 14:30:00"
   */
  async getWagmiTimestamp(): Promise<string | null> {
    return trackOperation('getWagmiTimestamp', async () => {
      try {
        if (!this.isServiceAccountInitialized) {
          await this.initializeServiceAccount();
        }

        if (!this.sheets) {
          throw new Error('Google Sheets API client not initialized');
        }

        // Read cell B7 from KPIs sheet
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.sheetId,
          range: 'KPIs!B7'
        });

        const values = response.data.values;
        const timestamp = values && values[0] && values[0][0] ? values[0][0].toString() : null;

        console.log(`✅ Retrieved WAGMI timestamp: ${timestamp}`);
        return timestamp;

      } catch (error) {
        console.error('❌ Error getting WAGMI timestamp:', error);
        return null;
      }
    }, { sheetId: this.sheetId });
  }

  /**
   * Get the last updated timestamp for Personal Portfolio from KPIs sheet (cell B9)
   * Used by UniversalNavbar to display when data was last refreshed
   * 
   * @returns Timestamp string or null if not found
   * 
   * @example
   * const timestamp = await sheetsAdapter.getPersonalPortfolioTimestamp();
   * // Returns: "10/05/2024, 14:30:00"
   */
  async getPersonalPortfolioTimestamp(): Promise<string | null> {
    return trackOperation('getPersonalPortfolioTimestamp', async () => {
      try {
        if (!this.isServiceAccountInitialized) {
          await this.initializeServiceAccount();
        }

        if (!this.sheets) {
          throw new Error('Google Sheets API client not initialized');
        }

        // Read cell B9 from KPIs sheet
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.sheetId,
          range: 'KPIs!B9'
        });

        const values = response.data.values;
        const timestamp = values && values[0] && values[0][0] ? values[0][0].toString() : null;

        console.log(`✅ Retrieved Personal Portfolio timestamp: ${timestamp}`);
        return timestamp;

      } catch (error) {
        console.error('❌ Error getting Personal Portfolio timestamp:', error);
        return null;
      }
    }, { sheetId: this.sheetId });
  }

  /**
   * Get 24-hour price changes for all assets
   *
   * @param isPersonalPortfolio - If true, reads from Personal portfolio sheet, otherwise Portfolio Overview
   * @returns Array of symbols with their 24h price changes
   *
   * @example
   * // Get WAGMI Fund 24h changes
   * const changes = await sheetsAdapter.get24HourChanges(false);
   * // Returns: [{ symbol: 'BTC', priceChange24h: 2.5 }, ...]
   * 
   * // Get Personal Portfolio 24h changes
   * const personalChanges = await sheetsAdapter.get24HourChanges(true);
   */
  async get24HourChanges(isPersonalPortfolio: boolean = false): Promise<Array<{
    symbol: string;
    priceChange24h: number;
  }>> {
    return trackOperation('get24HourChanges', async () => {
      try {
        const portfolioType = isPersonalPortfolio ? 'Personal Portfolio' : 'WAGMI Fund';
        
        if (!this.isServiceAccountInitialized) {
          await this.initializeServiceAccount();
        }

        if (!this.sheets) {
          throw new Error('Google Sheets API client not initialized');
        }

        // Determine which sheet to use
        const sheetName = isPersonalPortfolio ? 'Personal portfolio' : 'Portfolio Overview';
        const range = `${sheetName}!B:L`;

        // Read symbol (B) and 24h change (L) columns
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.sheetId,
          range: range
        });

        const rows = response.data.values || [];
        const changes: Array<{ symbol: string; priceChange24h: number }> = [];

        // Skip header row, process data rows
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row && row.length >= 11) { // Need at least columns B through L
            const symbol = row[0]?.toString(); // Column B (index 0 in B:L range)
            const priceChange24h = parseFloat(row[10]) || 0; // Column L (index 10 in B:L range)

            if (symbol) {
              changes.push({ symbol, priceChange24h });
            }
          }
        }

        console.log(`✅ Retrieved 24h changes for ${changes.length} assets in ${portfolioType}`);
        return changes;

      } catch (error) {
        console.error('❌ Error getting 24h changes:', error);
        throw new Error('Failed to get 24-hour price changes');
      }
    }, { sheetId: this.sheetId, isPersonalPortfolio });
  }

  /**
   * Get transaction history for a specific investor
   * 
   * @param investorId - Investor ID to fetch transactions for
   * @returns Array of transactions
   * 
   * @example
   * const transactions = await sheetsAdapter.getTransactions('INV001');
   */
  async getTransactions(investorId: string): Promise<Array<{
    date: string;
    type: string;
    amount: number;
    description: string;
  }>> {
    return trackOperation('getTransactions', async () => {
      try {
        console.log(`📝 Fetching transactions for investor: ${investorId}`);
        
        if (!this.isServiceAccountInitialized) {
          await this.initializeServiceAccount();
        }

        if (!this.sheets) {
          throw new Error('Google Sheets API client not initialized');
        }

        // Read from Transactions sheet
        // Structure: A=transaction_id, B=investor_id, C=type, D=amount, E=date, F=note
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.sheetId,
          range: 'Transactions!A:F' // Read all columns A through F
        });

        const rows = response.data.values || [];
        const transactions: Array<{
          date: string;
          type: string;
          amount: number;
          description: string;
        }> = [];

        const normalizedInvestorId = investorId.toUpperCase().trim();

        // Process rows, filtering by investor ID (Column B)
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row && row.length >= 6) { // Need at least 6 columns (A-F)
            const rowInvestorId = row[1]?.toString().toUpperCase().trim(); // Column B = investor_id
            
            if (rowInvestorId === normalizedInvestorId) {
              transactions.push({
                date: row[4]?.toString() || '', // Column E = date
                type: row[2]?.toString() || '', // Column C = type
                amount: parseFloat(row[3]) || 0, // Column D = amount
                description: row[5]?.toString() || '' // Column F = note
              });
            }
          }
        }

        console.log(`✅ Found ${transactions.length} transactions for ${investorId}`);
        return transactions;

      } catch (error) {
        console.error(`❌ Error fetching transactions for ${investorId}:`, error);
        // Return empty array if sheet doesn't exist or other error
        // This prevents breaking existing functionality
        return [];
      }
    }, { investorId });
  }

  /**
   * Get WAGMI Fund historical performance data from "MoM performance" sheet
   * Returns monthly performance metrics for WAGMI Fund
   * 
   * @returns Array of monthly performance data
   * 
   * @example
   * const performance = await sheetsAdapter.getWagmiHistoricalPerformance();
   * // Returns: [{ month: 'Oct-2024', endingAUM: 6264.09, wagmiMoM: 28.5, ... }, ...]
   */
  async getWagmiHistoricalPerformance(): Promise<Array<{
    month: string;
    endingAUM: number;
    wagmiMoM: number;
    totalMoM: number;
    total3MoM: number;
    wagmiCumulative: number;
    totalCumulative: number;
    total3Cumulative: number;
  }>> {
    return trackOperation('getWagmiHistoricalPerformance', async () => {
      try {
        console.log('📝 Fetching WAGMI Fund historical performance from MoM performance sheet');
        
        if (!this.isServiceAccountInitialized) {
          await this.initializeServiceAccount();
        }

        if (!this.sheets) {
          throw new Error('Google Sheets API client not initialized');
        }

        // Read from MoM performance sheet - columns B (month), G-I (WAGMI), L-M (Total), P-Q (Total3)
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.sheetId,
          range: 'MoM performance!B:Q',
          valueRenderOption: 'UNFORMATTED_VALUE'
        });

        const rows = response.data.values || [];
        const performanceData: Array<{
          month: string;
          endingAUM: number;
          wagmiMoM: number;
          totalMoM: number;
          total3MoM: number;
          wagmiCumulative: number;
          totalCumulative: number;
          total3Cumulative: number;
        }> = [];

        // Get current date for filtering future months
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Process data rows (skip header row at index 0)
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 17) continue; // Need columns B through Q

          // Column B (index 0 in B:Q range) - Month
          const monthValue = row[0];
          if (!monthValue) continue;

          // Parse month string (e.g., "Oct-2024")
          const monthStr = monthValue.toString().trim();
          const monthMatch = monthStr.match(/(\w{3})-(\d{4})/);
          if (!monthMatch) continue;

          const monthName = monthMatch[1];
          const year = parseInt(monthMatch[2]);
          const monthIndex = monthNames.indexOf(monthName);

          // Skip future months (but include current month)
          if (year > currentYear || (year === currentYear && monthIndex > currentMonth)) {
            continue;
          }

          // Extract performance data from correct columns
          // In B:Q range: G=index 5, H=6, I=7, L=10, M=11, P=14, Q=15
          const endingAUM = parseFloat(row[5]) || 0; // Column G
          const wagmiMoM = (parseFloat(row[6]) || 0) * 100; // Column H - convert to percentage
          const wagmiCumulative = (parseFloat(row[7]) || 0) * 100; // Column I - convert to percentage
          const totalMoM = (parseFloat(row[10]) || 0) * 100; // Column L - convert to percentage
          const totalCumulative = (parseFloat(row[11]) || 0) * 100; // Column M - convert to percentage
          const total3MoM = (parseFloat(row[14]) || 0) * 100; // Column P - convert to percentage
          const total3Cumulative = (parseFloat(row[15]) || 0) * 100; // Column Q - convert to percentage

          performanceData.push({
            month: monthStr,
            endingAUM,
            wagmiMoM,
            totalMoM,
            total3MoM,
            wagmiCumulative,
            totalCumulative,
            total3Cumulative
          });
        }

        console.log(`✅ Retrieved WAGMI historical performance for ${performanceData.length} months`);
        return performanceData;

      } catch (error) {
        console.error('❌ Error fetching WAGMI historical performance:', error);
        throw new Error('Failed to fetch WAGMI historical performance data');
      }
    }, { sheetId: this.sheetId });
  }

  /**
   * Get Personal Portfolio historical performance data from "Personal portfolio historical" sheet
   * Returns monthly performance metrics for Personal Portfolio
   * 
   * @returns Array of monthly performance data
   * 
   * @example
   * const performance = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();
   * // Returns: [{ month: 'Oct-2024', endingAUM: 6264.09, personalMoM: 28.5, ... }, ...]
   */
  async getPersonalPortfolioHistoricalPerformance(): Promise<Array<{
    month: string;
    endingAUM: number;
    personalMoM: number;
    totalMoM: number;
    total3MoM: number;
    personalCumulative: number;
    totalCumulative: number;
    total3Cumulative: number;
  }>> {
    return trackOperation('getPersonalPortfolioHistoricalPerformance', async () => {
      try {
        console.log('📝 Fetching Personal Portfolio historical performance from Personal portfolio historical sheet');
        
        if (!this.isServiceAccountInitialized) {
          await this.initializeServiceAccount();
        }

        if (!this.sheets) {
          throw new Error('Google Sheets API client not initialized');
        }

        // Read from Personal portfolio historical sheet - same structure as WAGMI
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId: this.sheetId,
          range: 'Personal portfolio historical!B:Q',
          valueRenderOption: 'UNFORMATTED_VALUE'
        });

        const rows = response.data.values || [];
        const performanceData: Array<{
          month: string;
          endingAUM: number;
          personalMoM: number;
          totalMoM: number;
          total3MoM: number;
          personalCumulative: number;
          totalCumulative: number;
          total3Cumulative: number;
        }> = [];

        // Get current date for filtering future months
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Process data rows (skip header row at index 0)
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length < 17) continue; // Need columns B through Q

          // Column B (index 0 in B:Q range) - Month
          const monthValue = row[0];
          if (!monthValue) continue;

          // Parse month string (e.g., "Oct-2024")
          const monthStr = monthValue.toString().trim();
          const monthMatch = monthStr.match(/(\w{3})-(\d{4})/);
          if (!monthMatch) continue;

          const monthName = monthMatch[1];
          const year = parseInt(monthMatch[2]);
          const monthIndex = monthNames.indexOf(monthName);

          // Skip future months (but include current month)
          if (year > currentYear || (year === currentYear && monthIndex > currentMonth)) {
            continue;
          }

          // Extract performance data from correct columns
          // In B:Q range: G=index 5, H=6, I=7, L=10, M=11, P=14, Q=15
          const endingAUM = parseFloat(row[5]) || 0; // Column G
          const personalMoM = (parseFloat(row[6]) || 0) * 100; // Column H - convert to percentage
          const personalCumulative = (parseFloat(row[7]) || 0) * 100; // Column I - convert to percentage
          const totalMoM = (parseFloat(row[10]) || 0) * 100; // Column L - convert to percentage
          const totalCumulative = (parseFloat(row[11]) || 0) * 100; // Column M - convert to percentage
          const total3MoM = (parseFloat(row[14]) || 0) * 100; // Column P - convert to percentage
          const total3Cumulative = (parseFloat(row[15]) || 0) * 100; // Column Q - convert to percentage

          performanceData.push({
            month: monthStr,
            endingAUM,
            personalMoM,
            totalMoM,
            total3MoM,
            personalCumulative,
            totalCumulative,
            total3Cumulative
          });
        }

        console.log(`✅ Retrieved Personal Portfolio historical performance for ${performanceData.length} months`);
        return performanceData;

      } catch (error) {
        console.error('❌ Error fetching Personal Portfolio historical performance:', error);
        throw new Error('Failed to fetch Personal Portfolio historical performance data');
      }
    }, { sheetId: this.sheetId });
  }
}

// Export a singleton instance
export const sheetsAdapter = new SheetsAdapter();
