# Google Sheets API Setup Guide

This guide will help you set up the Google Sheets API integration for your WAGMI Crypto Investment Manager.

## 📋 Prerequisites

- A Google account
- Access to your existing Google Sheet with investor data
- The Google Sheet ID (found in the URL)

## 🚀 Step-by-Step Setup

### Step 1: Get Your Google Sheet ID

1. Open your Google Sheet in a web browser
2. Look at the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit`
3. Copy the `YOUR_SHEET_ID_HERE` part - this is your Sheet ID

### Step 2: Create Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Delete the default code and paste the contents of `google-sheets-api.gs`
4. Update the configuration at the top of the script:
   ```javascript
   const SHEET_ID = 'YOUR_ACTUAL_SHEET_ID_HERE'; // Replace with your sheet ID
   const SHEET_NAME = 'Investors'; // Replace with your actual sheet name
   ```

### Step 3: Deploy the Script

1. Click "Deploy" → "New deployment"
2. Choose "Web app" as the type
3. Set the following:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click "Deploy"
5. Copy the web app URL (this will be your `GOOGLE_SHEETS_ENDPOINT`)

### Step 4: Test the Setup

1. In the Apps Script editor, run the `testSetup()` function
2. Check the logs to ensure it can read your sheet data
3. Test the API endpoint by visiting: `YOUR_WEB_APP_URL?sheet=Investors`

### Step 5: Configure Environment Variables

1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to "Environment Variables"
4. Add a new variable:
   - **Name**: `GOOGLE_SHEETS_ENDPOINT`
   - **Value**: Your web app URL from Step 3
5. Redeploy your Vercel app

## 🔧 Configuration Details

### Sheet Structure Expected

The script expects your sheet to have this structure:

| Column A | Column B | Column C | Column D | Column E | Column F |
|----------|----------|----------|----------|----------|----------|
| Investor ID | Name | Email | Investment Value | Current Value | Return % |
| LK1 | Leke Karunwi | leke@example.com | 2000 | 3199.60 | 60 |
| MO2 | Mariam Oyawoye | mummy@example.com | 1050.06 | 1676.71 | 60 |

### API Endpoints

The script provides these endpoints:

- **GET** `?sheet=Investors` - Read all investor data
- **POST** with `{"action": "validateInvestor", "investorId": "LK1"}` - Validate specific investor

## 🧪 Testing

### Test 1: Basic Sheet Access
```bash
curl "YOUR_WEB_APP_URL?sheet=Investors"
```

### Test 2: Investor Validation
```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{"action": "validateInvestor", "investorId": "LK1"}'
```

## 🚨 Troubleshooting

### Common Issues

1. **"Sheet not found" error**
   - Check that `SHEET_NAME` matches your actual sheet name
   - Ensure the sheet exists in your spreadsheet

2. **"Permission denied" error**
   - Make sure the web app is deployed with "Anyone" access
   - Check that the script has permission to access your sheet

3. **"Invalid sheet ID" error**
   - Verify the `SHEET_ID` is correct
   - Ensure the sheet is accessible with your Google account

### Debug Steps

1. Run `testSetup()` function in Apps Script editor
2. Check the execution logs for detailed error messages
3. Verify your sheet structure matches the expected format
4. Test the API endpoints manually before integrating with your app

## 🔄 Next Steps

Once this is set up:

1. Update your Vercel environment variables
2. Redeploy your app
3. Test investor login with real data
4. Set up Google OAuth for manager access

## 📞 Support

If you encounter issues:
1. Check the Apps Script execution logs
2. Verify your sheet structure
3. Test the API endpoints manually
4. Contact support with specific error messages
