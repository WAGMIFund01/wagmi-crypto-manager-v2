// Debug script to check Personal Portfolio historical data
const { google } = require('googleapis');

async function debugPersonalPortfolioData() {
  try {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = process.env.GOOGLE_SHEET_ID || '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

    // Read a larger range to see all available data
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Personal portfolio historical!A:Z', // Read more columns and rows
      valueRenderOption: 'UNFORMATTED_VALUE'
    });

    const rows = response.data.values || [];
    console.log(`📊 Total rows in Personal portfolio historical sheet: ${rows.length}`);
    
    // Show first few rows to understand the structure
    console.log('\n📋 First 5 rows:');
    rows.slice(0, 5).forEach((row, index) => {
      console.log(`Row ${index}:`, row);
    });

    // Check for dates in column B (index 1)
    console.log('\n📅 Dates found in column B:');
    for (let i = 1; i < Math.min(rows.length, 20); i++) {
      const row = rows[i];
      if (row && row.length > 1) {
        const dateValue = row[1];
        console.log(`Row ${i}: ${dateValue}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugPersonalPortfolioData();
