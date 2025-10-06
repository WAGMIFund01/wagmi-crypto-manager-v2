import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SheetsAdapter } from '../sheetsAdapter';

// Mock the Google Sheets API
vi.mock('googleapis', () => ({
  google: {
    sheets: vi.fn(() => ({
      spreadsheets: {
        values: {
          get: vi.fn()
        }
      }
    }))
  }
}));

describe('SheetsAdapter Cumulative Return Data Accuracy', () => {
  let sheetsAdapter: SheetsAdapter;
  let mockGet: any;

  beforeEach(() => {
    sheetsAdapter = new SheetsAdapter();
    mockGet = vi.fn();
    
    // Mock the Google Sheets API response
    const mockSheets = {
      spreadsheets: {
        values: {
          get: mockGet
        }
      }
    };
    
    vi.mocked(require('googleapis').google.sheets).mockReturnValue(mockSheets);
  });

  describe('Personal Portfolio Cumulative Return', () => {
    it('should read cumulative return directly from Column I without calculation', async () => {
      // Mock data from Personal Portfolio historical sheet
      const mockSheetData = {
        data: {
          values: [
            // Header row
            ['Date', 'Month', 'Year', 'Investment', 'A', 'B', 'Ending AUM', 'MoM Return', 'Cumulative Return', 'C', 'D', 'Total MoM', 'Total Cumulative', 'E', 'F', 'Total 3 MoM', 'Total 3 Cumulative'],
            // Data rows
            [45809, 'Jan', 2025, 500000, '', '', 1000000, 0.052, 0.052, '', '', 0.031, 0.031, '', '', 0.028, 0.028],
            [45840, 'Feb', 2025, 520000, '', '', 1050000, 0.048, 0.102, '', '', 0.029, 0.061, '', '', 0.025, 0.054],
            [45868, 'Mar', 2025, 540000, '', '', 1100000, 0.042, 0.148, '', '', 0.025, 0.088, '', '', 0.021, 0.076]
          ]
        }
      };

      mockGet.mockResolvedValue(mockSheetData);

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      // Verify that cumulative return is read directly from Column I (index 8)
      expect(result).toHaveLength(3);
      expect(result[0].personalCumulative).toBe(5.2); // 0.052 * 100
      expect(result[1].personalCumulative).toBe(10.2); // 0.102 * 100
      expect(result[2].personalCumulative).toBe(14.8); // 0.148 * 100

      // Verify that MoM return is read from Column H (index 7)
      expect(result[0].personalMoM).toBe(5.2); // 0.052 * 100
      expect(result[1].personalMoM).toBe(4.8); // 0.048 * 100
      expect(result[2].personalMoM).toBe(4.2); // 0.042 * 100
    });

    it('should handle empty cumulative return values gracefully', async () => {
      const mockSheetData = {
        data: {
          values: [
            ['Date', 'Month', 'Year', 'Investment', 'A', 'B', 'Ending AUM', 'MoM Return', 'Cumulative Return', 'C', 'D', 'Total MoM', 'Total Cumulative', 'E', 'F', 'Total 3 MoM', 'Total 3 Cumulative'],
            [45809, 'Jan', 2025, 500000, '', '', 1000000, 0.052, '', '', '', 0.031, 0.031, '', '', 0.028, 0.028]
          ]
        }
      };

      mockGet.mockResolvedValue(mockSheetData);

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      expect(result).toHaveLength(1);
      expect(result[0].personalCumulative).toBe(0); // Empty value should default to 0
    });

    it('should convert decimal values to percentages correctly', async () => {
      const mockSheetData = {
        data: {
          values: [
            ['Date', 'Month', 'Year', 'Investment', 'A', 'B', 'Ending AUM', 'MoM Return', 'Cumulative Return', 'C', 'D', 'Total MoM', 'Total Cumulative', 'E', 'F', 'Total 3 MoM', 'Total 3 Cumulative'],
            [45809, 'Jan', 2025, 500000, '', '', 1000000, 0.052, 0.052, '', '', 0.031, 0.031, '', '', 0.028, 0.028]
          ]
        }
      };

      mockGet.mockResolvedValue(mockSheetData);

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      // Verify percentage conversion (decimal * 100)
      expect(result[0].personalMoM).toBe(5.2);
      expect(result[0].personalCumulative).toBe(5.2);
      expect(result[0].totalMoM).toBe(3.1);
      expect(result[0].totalCumulative).toBe(3.1);
      expect(result[0].total3MoM).toBe(2.8);
      expect(result[0].total3Cumulative).toBe(2.8);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data consistency between MoM and Cumulative returns', async () => {
      const mockSheetData = {
        data: {
          values: [
            ['Date', 'Month', 'Year', 'Investment', 'A', 'B', 'Ending AUM', 'MoM Return', 'Cumulative Return', 'C', 'D', 'Total MoM', 'Total Cumulative', 'E', 'F', 'Total 3 MoM', 'Total 3 Cumulative'],
            [45809, 'Jan', 2025, 500000, '', '', 1000000, 0.052, 0.052, '', '', 0.031, 0.031, '', '', 0.028, 0.028],
            [45840, 'Feb', 2025, 520000, '', '', 1050000, 0.048, 0.102, '', '', 0.029, 0.061, '', '', 0.025, 0.054]
          ]
        }
      };

      mockGet.mockResolvedValue(mockSheetData);

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      // Verify that both MoM and Cumulative are read from their respective columns
      expect(result[0].personalMoM).toBe(5.2); // From Column H
      expect(result[0].personalCumulative).toBe(5.2); // From Column I
      expect(result[1].personalMoM).toBe(4.8); // From Column H
      expect(result[1].personalCumulative).toBe(10.2); // From Column I
    });

    it('should handle future month filtering correctly', async () => {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // 0-based
      
      // Create a future month (next month)
      const futureMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const futureYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      
      const mockSheetData = {
        data: {
          values: [
            ['Date', 'Month', 'Year', 'Investment', 'A', 'B', 'Ending AUM', 'MoM Return', 'Cumulative Return', 'C', 'D', 'Total MoM', 'Total Cumulative', 'E', 'F', 'Total 3 MoM', 'Total 3 Cumulative'],
            [45809, 'Jan', 2025, 500000, '', '', 1000000, 0.052, 0.052, '', '', 0.031, 0.031, '', '', 0.028, 0.028],
            // Future month should be filtered out
            [45840, futureMonth.toString(), futureYear, 520000, '', '', 1050000, 0.048, 0.102, '', '', 0.029, 0.061, '', '', 0.025, 0.054]
          ]
        }
      };

      mockGet.mockResolvedValue(mockSheetData);

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      // Should only return the current/past month, not the future month
      expect(result).toHaveLength(1);
      expect(result[0].month).toBe('Jan-2025');
    });
  });
});
