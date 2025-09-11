import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Google Sheet ID for WAGMI Investment Manager Database
    const SHEET_ID = '1h04nkcnQmxaFml8RubIGmPgffMiyoEIg350ryjXK0tM';

    // Fetch investor data directly from Google Sheets using public API
    try {
      // Use the public Google Sheets API to read the Investors sheet
      const response = await fetch(
        `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=Investors&tqx=out:json`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('Google Sheets API HTTP error:', response.status, response.statusText);
        throw new Error(`Google Sheets API error: ${response.status}`);
      }

      const text = await response.text();
      
      // Parse the Google Sheets response (it's wrapped in a callback)
      const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Google Sheets');
      }
      
      const data = JSON.parse(jsonMatch[1]);
      
      if (!data.table || !data.table.rows) {
        throw new Error('No data found in Investors sheet');
      }

      // Extract investor data from the sheet
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

      const rows = data.table.rows;
      
      // Skip header row (index 0) and process data rows
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.c && row.c.length >= 8) {
          const investor = {
            id: row.c[0]?.v?.toString() || '', // investor_id
            name: row.c[1]?.v?.toString() || '', // name
            email: row.c[2]?.v?.toString() || '', // email
            joinDate: row.c[3]?.v?.toString() || '', // join_date
            investmentValue: parseFloat(row.c[4]?.v) || 0, // investment_value
            currentValue: parseFloat(row.c[5]?.v) || 0, // current_value
            sharePercentage: parseFloat(row.c[6]?.v) || 0, // share_percentage
            returnPercentage: parseFloat(row.c[7]?.v) || 0, // return_percentage
          };
          
          // Only add if we have essential data
          if (investor.id && investor.name) {
            investors.push(investor);
          }
        }
      }

      console.log(`Successfully fetched ${investors.length} investors from Google Sheets`);

      return NextResponse.json({
        success: true,
        investors: investors
      });

    } catch (apiError) {
      console.error('Google Sheets API error:', apiError);
      return NextResponse.json({
        success: false,
        error: 'Unable to connect to Google Sheets. Please check the sheet is public and try again.',
        errorCode: 'EXTERNAL_SERVICE_ERROR'
      }, { status: 502 });
    }

  } catch (error: unknown) {
    console.error('Error fetching investor data:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during investor data fetch',
      errorCode: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}