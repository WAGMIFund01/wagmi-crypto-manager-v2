import { ReportContext } from './aiService';

export interface PortfolioData {
  totalAUM: string;
  activeInvestors: string;
  cumulativeReturn: string;
  monthOnMonth: string;
  assets: Array<{
    name: string;
    symbol: string;
    amount: string;
    value: string;
    change24h: string;
    riskLevel: string;
    location: string;
    coinType: string;
  }>;
}

export interface PreviousReport {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'update';
}

class ReportContextService {
  /**
   * Fetch current portfolio data for AI context
   */
  async getCurrentPortfolioData(): Promise<any> {
    try {
      // Fetch portfolio data - pass it through RAW to preserve all fields
      const portfolioResponse = await fetch('/api/get-portfolio-data');
      const portfolioData = await portfolioResponse.json();

      if (!portfolioData.success) {
        console.error('Failed to fetch portfolio data');
        return null;
      }

      // Return the raw portfolio data with all fields intact
      return portfolioData;
    } catch (error) {
      console.error('Error fetching portfolio context:', error);
      return null;
    }
  }

  /**
   * Fetch previous investor reports for context
   * This would typically come from a database or file system
   * For now, we'll return sample data structure
   */
  async getPreviousReports(): Promise<PreviousReport[]> {
    try {
      // In a real implementation, this would fetch from a database
      // For now, return sample data structure
      const sampleReports: PreviousReport[] = [
        {
          id: '1',
          title: 'Q4 2024 Investor Report',
          content: 'This is a sample previous report content that would be fetched from storage.',
          date: '2024-12-01',
          type: 'quarterly'
        },
        {
          id: '2',
          title: 'November 2024 Update',
          content: 'This is another sample report showing the structure.',
          date: '2024-11-01',
          type: 'monthly'
        }
      ];

      return sampleReports;
    } catch (error) {
      console.error('Error fetching previous reports:', error);
      return [];
    }
  }

  /**
   * Prepare context for AI report generation
   */
  async prepareReportContext(): Promise<ReportContext> {
    const [portfolioData, previousReports] = await Promise.all([
      this.getCurrentPortfolioData(),
      this.getPreviousReports()
    ]);

    return {
      previousReports: previousReports.map(report => 
        `${report.title} (${report.date})\n${report.content}`
      ),
      currentPortfolioData: portfolioData,
      newDetails: undefined
    };
  }

  /**
   * Save a generated report (for future context)
   */
  async saveGeneratedReport(report: {
    title: string;
    content: string;
    type: 'monthly' | 'quarterly' | 'annual' | 'update';
  }): Promise<boolean> {
    try {
      // In a real implementation, this would save to a database
      console.log('Saving generated report:', report);
      
      // For now, just log the report
      // In production, you would:
      // 1. Save to database
      // 2. Store in file system
      // 3. Send to document management system
      
      return true;
    } catch (error) {
      console.error('Error saving report:', error);
      return false;
    }
  }

  /**
   * Get report templates based on type
   */
  getReportTemplate(type: 'monthly' | 'quarterly' | 'annual' | 'update'): string {
    const templates = {
      monthly: `
# Monthly Investor Report - {month} {year}

## Executive Summary
[AI will generate based on portfolio performance]

## Portfolio Performance
- Total AUM: {totalAUM}
- Monthly Return: {monthlyReturn}
- Key Performance Indicators: {kpis}

## Market Analysis
[AI will analyze current market conditions]

## Risk Management
[AI will assess portfolio risk factors]

## Outlook
[AI will provide forward-looking insights]
      `,
      quarterly: `
# Quarterly Investor Report - Q{quarter} {year}

## Executive Summary
[AI will generate comprehensive quarterly analysis]

## Portfolio Performance
- Total AUM: {totalAUM}
- Quarterly Return: {quarterlyReturn}
- Year-to-Date Performance: {ytdReturn}

## Market Analysis
[AI will provide detailed market analysis]

## Strategic Updates
[AI will highlight any strategic changes]

## Risk Assessment
[AI will provide comprehensive risk analysis]

## Outlook
[AI will provide quarterly outlook and predictions]
      `,
      annual: `
# Annual Investor Report - {year}

## Executive Summary
[AI will generate comprehensive annual analysis]

## Portfolio Performance
- Total AUM: {totalAUM}
- Annual Return: {annualReturn}
- Performance vs Benchmarks: {benchmarkComparison}

## Market Analysis
[AI will provide detailed annual market analysis]

## Strategic Review
[AI will review strategic decisions and outcomes]

## Risk Management
[AI will provide comprehensive annual risk assessment]

## Outlook
[AI will provide annual outlook and strategic direction]
      `,
      update: `
# Portfolio Update - {date}

## Key Updates
[AI will highlight recent changes and developments]

## Performance Update
[AI will provide current performance metrics]

## Market Update
[AI will provide current market analysis]

## Next Steps
[AI will outline upcoming actions and plans]
      `
    };

    return templates[type] || templates.update;
  }
}

export const reportContextService = new ReportContextService();
