/**
 * WAGMI Crypto Investment Manager - Google Sheets API
 * This script provides an API endpoint to read investor data from Google Sheets
 */

// Configuration - Update these values to match your sheet
const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Replace with your actual Google Sheet ID
const SHEET_NAME = 'Investors'; // Replace with your actual sheet name
const HEADER_ROW = 1; // Row number where headers are located

/**
 * Main function to handle GET requests
 * @param {Object} e - The event object containing request parameters
 */
function doGet(e) {
  try {
    const { sheet, range } = e.parameter;
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          success: false,
          error: 'Sheet parameter is required'
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = readSheetData(sheet, range);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        values: data
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main function to handle POST requests
 * @param {Object} e - The event object containing request data
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const { action, investorId } = requestData;
    
    if (action === 'validateInvestor') {
      return validateInvestor(investorId);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Invalid action'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Read data from the specified sheet and range
 * @param {string} sheetName - Name of the sheet to read from
 * @param {string} range - Optional range to read (e.g., "A1:Z100")
 */
function readSheetData(sheetName, range) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`);
  }
  
  const dataRange = range ? sheet.getRange(range) : sheet.getDataRange();
  return dataRange.getValues();
}

/**
 * Validate an investor ID and return their data
 * @param {string} investorId - The investor ID to validate
 */
function validateInvestor(investorId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`);
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    const headers = data[HEADER_ROW - 1]; // Headers are in the first row
    
    // Find the investor ID column (assuming it's in column A)
    const investorIdColumn = 0; // Column A
    const nameColumn = 1; // Column B
    const emailColumn = 2; // Column C
    const investmentValueColumn = 3; // Column D
    const currentValueColumn = 4; // Column E
    const returnPercentageColumn = 5; // Column F
    
    // Search for the investor ID
    for (let i = HEADER_ROW; i < data.length; i++) {
      const row = data[i];
      if (row[investorIdColumn] && row[investorIdColumn].toString().toUpperCase() === investorId.toUpperCase()) {
        // Found the investor
        const investor = {
          investorId: row[investorIdColumn],
          name: row[nameColumn] || '',
          email: row[emailColumn] || '',
          investmentValue: parseFloat(row[investmentValueColumn]) || 0,
          currentValue: parseFloat(row[currentValueColumn]) || 0,
          returnPercentage: parseFloat(row[returnPercentageColumn]) || 0
        };
        
        return ContentService
          .createTextOutput(JSON.stringify({
            success: true,
            valid: true,
            investor: investor
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Investor not found
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        valid: false,
        error: 'Investor ID not found'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the setup
 */
function testSetup() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`);
    }
    
    const data = sheet.getDataRange().getValues();
    console.log('Sheet data:', data);
    
    return {
      success: true,
      message: 'Setup test successful',
      rowCount: data.length,
      headers: data[0]
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.toString()
    };
  }
}
