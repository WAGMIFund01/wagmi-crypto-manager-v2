import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SheetsAdapter } from '../sheetsAdapter';

// Mock Google Sheets API
const mockSheets = {
  spreadsheets: {
    values: {
      get: vi.fn(),
    },
  },
};

vi.mock('googleapis', () => ({
  google: {
    sheets: vi.fn(() => mockSheets),
  },
}));

describe('SheetsAdapter - Date Conversion Tests', () => {
  let sheetsAdapter: SheetsAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    sheetsAdapter = new SheetsAdapter();
  });

  describe('Excel Serial Date Conversion', () => {
    it('correctly converts Excel serial dates to month labels', async () => {
      // Mock data with Excel serial dates
      const mockData = [
        ['Date', 'Ending AUM', 'Personal MoM', 'Total MoM', 'Total 3MoM', 'Personal Cumulative', 'Total Cumulative', 'Total 3Cumulative', 'Investment'],
        [45566, 2455.19, -21.1, 2.8, 2.2, -21.1, 2.8, 2.2, 3109.91], // Sep 30, 2024 -> Oct-2024
        [45597, 4553.22, 0.1, 3.2, 2.8, 8.9, 6.1, 5.1, 3200.00], // Oct 31, 2024 -> Nov-2024
      ];

      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: mockData,
        },
      });

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      expect(result).toHaveLength(2);
      expect(result[0].month).toBe('Oct-2024');
      expect(result[1].month).toBe('Nov-2024');
    });

    it('correctly converts WAGMI fund Excel serial dates', async () => {
      // Mock data with Excel serial dates
      const mockData = [
        ['Date', 'Ending AUM', 'WAGMI MoM', 'Total MoM', 'Total 3MoM', 'WAGMI Cumulative', 'Total Cumulative', 'Total 3Cumulative'],
        [45566, 6264.09, 28.5, 11.59, 3.75, 28.5, 11.59, 3.75], // Sep 30, 2024 -> Oct-2024
        [45597, 18686.35, 6.2, 46.75, 77.63, 15.3, 46.75, 77.63], // Oct 31, 2024 -> Nov-2024
      ];

      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: mockData,
        },
      });

      const result = await sheetsAdapter.getWagmiHistoricalPerformance();

      expect(result).toHaveLength(2);
      expect(result[0].month).toBe('Oct-2024');
      expect(result[1].month).toBe('Nov-2024');
    });

    it('handles leap year dates correctly', async () => {
      // Mock data with leap year dates
      const mockData = [
        ['Date', 'Ending AUM', 'Personal MoM', 'Total MoM', 'Total 3MoM', 'Personal Cumulative', 'Total Cumulative', 'Total 3Cumulative', 'Investment'],
        [44927, 1000, 5.0, 2.0, 1.5, 5.0, 2.0, 1.5, 500], // Feb 29, 2024 -> Mar-2024
      ];

      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: mockData,
        },
      });

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      expect(result).toHaveLength(1);
      expect(result[0].month).toBe('Mar-2024');
    });

    it('handles year boundary dates correctly', async () => {
      // Mock data crossing year boundary
      const mockData = [
        ['Date', 'Ending AUM', 'Personal MoM', 'Total MoM', 'Total 3MoM', 'Personal Cumulative', 'Total Cumulative', 'Total 3Cumulative', 'Investment'],
        [45292, 1000, 5.0, 2.0, 1.5, 5.0, 2.0, 1.5, 500], // Dec 31, 2023 -> Jan-2024
        [45323, 1100, 10.0, 3.0, 2.0, 15.0, 5.0, 3.5, 550], // Jan 31, 2024 -> Feb-2024
      ];

      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: mockData,
        },
      });

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      expect(result).toHaveLength(2);
      expect(result[0].month).toBe('Jan-2024');
      expect(result[1].month).toBe('Feb-2024');
    });

    it('filters out future months correctly', async () => {
      // Mock current date to be October 2024
      const originalDate = Date;
      global.Date = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(2024, 9, 15); // October 15, 2024
          } else {
            super(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
          }
        }
      } as any;

      const mockData = [
        ['Date', 'Ending AUM', 'Personal MoM', 'Total MoM', 'Total 3MoM', 'Personal Cumulative', 'Total Cumulative', 'Total 3Cumulative', 'Investment'],
        [45566, 1000, 5.0, 2.0, 1.5, 5.0, 2.0, 1.5, 500], // Sep 30, 2024 -> Oct-2024 (current month, should include)
        [45597, 1100, 10.0, 3.0, 2.0, 15.0, 5.0, 3.5, 550], // Oct 31, 2024 -> Nov-2024 (future month, should exclude)
        [45628, 1200, 15.0, 4.0, 2.5, 30.0, 9.0, 6.0, 600], // Nov 30, 2024 -> Dec-2024 (future month, should exclude)
      ];

      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: mockData,
        },
      });

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      expect(result).toHaveLength(1);
      expect(result[0].month).toBe('Oct-2024');

      // Restore original Date
      global.Date = originalDate;
    });

    it('handles invalid Excel serial dates gracefully', async () => {
      const mockData = [
        ['Date', 'Ending AUM', 'Personal MoM', 'Total MoM', 'Total 3MoM', 'Personal Cumulative', 'Total Cumulative', 'Total 3Cumulative', 'Investment'],
        ['invalid', 1000, 5.0, 2.0, 1.5, 5.0, 2.0, 1.5, 500], // Invalid date
        [45566, 1100, 10.0, 3.0, 2.0, 15.0, 5.0, 3.5, 550], // Valid date
      ];

      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: mockData,
        },
      });

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      // Should only include the valid date
      expect(result).toHaveLength(1);
      expect(result[0].month).toBe('Oct-2024');
    });

    it('handles empty date values', async () => {
      const mockData = [
        ['Date', 'Ending AUM', 'Personal MoM', 'Total MoM', 'Total 3MoM', 'Personal Cumulative', 'Total Cumulative', 'Total 3Cumulative', 'Investment'],
        ['', 1000, 5.0, 2.0, 1.5, 5.0, 2.0, 1.5, 500], // Empty date
        [45566, 1100, 10.0, 3.0, 2.0, 15.0, 5.0, 3.5, 550], // Valid date
      ];

      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: mockData,
        },
      });

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      // Should only include the valid date
      expect(result).toHaveLength(1);
      expect(result[0].month).toBe('Oct-2024');
    });
  });

  describe('Month Name Generation', () => {
    it('generates correct month names for all months', async () => {
      const monthTests = [
        { serial: 45292, expected: 'Jan-2024' }, // Dec 31, 2023 -> Jan-2024
        { serial: 45323, expected: 'Feb-2024' }, // Jan 31, 2024 -> Feb-2024
        { serial: 45351, expected: 'Mar-2024' }, // Feb 29, 2024 -> Mar-2024
        { serial: 45382, expected: 'Apr-2024' }, // Mar 31, 2024 -> Apr-2024
        { serial: 45412, expected: 'May-2024' }, // Apr 30, 2024 -> May-2024
        { serial: 45443, expected: 'Jun-2024' }, // May 31, 2024 -> Jun-2024
        { serial: 45473, expected: 'Jul-2024' }, // Jun 30, 2024 -> Jul-2024
        { serial: 45504, expected: 'Aug-2024' }, // Jul 31, 2024 -> Aug-2024
        { serial: 45535, expected: 'Sep-2024' }, // Aug 31, 2024 -> Sep-2024
        { serial: 45566, expected: 'Oct-2024' }, // Sep 30, 2024 -> Oct-2024
        { serial: 45597, expected: 'Nov-2024' }, // Oct 31, 2024 -> Nov-2024
        { serial: 45628, expected: 'Dec-2024' }, // Nov 30, 2024 -> Dec-2024
      ];

      for (const test of monthTests) {
        const mockData = [
          ['Date', 'Ending AUM', 'Personal MoM', 'Total MoM', 'Total 3MoM', 'Personal Cumulative', 'Total Cumulative', 'Total 3Cumulative', 'Investment'],
          [test.serial, 1000, 5.0, 2.0, 1.5, 5.0, 2.0, 1.5, 500],
        ];

        mockSheets.spreadsheets.values.get.mockResolvedValue({
          data: {
            values: mockData,
          },
        });

        const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();
        expect(result[0].month).toBe(test.expected);
      }
    });
  });

  describe('Data Integrity', () => {
    it('preserves all data fields during date conversion', async () => {
      const mockData = [
        ['Date', 'Ending AUM', 'Personal MoM', 'Total MoM', 'Total 3MoM', 'Personal Cumulative', 'Total Cumulative', 'Total 3Cumulative', 'Investment'],
        [45566, 2455.19, -21.1, 2.8, 2.2, -21.1, 2.8, 2.2, 3109.91],
      ];

      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: mockData,
        },
      });

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      expect(result[0]).toEqual({
        month: 'Oct-2024',
        endingAUM: 2455.19,
        personalMoM: -21.1,
        totalMoM: 2.8,
        total3MoM: 2.2,
        personalCumulative: -21.1,
        totalCumulative: 2.8,
        total3Cumulative: 2.2,
        investment: 3109.91,
      });
    });

    it('handles negative values correctly', async () => {
      const mockData = [
        ['Date', 'Ending AUM', 'Personal MoM', 'Total MoM', 'Total 3MoM', 'Personal Cumulative', 'Total Cumulative', 'Total 3Cumulative', 'Investment'],
        [45566, -1000, -50.5, -10.2, -5.1, -50.5, -10.2, -5.1, -500],
      ];

      mockSheets.spreadsheets.values.get.mockResolvedValue({
        data: {
          values: mockData,
        },
      });

      const result = await sheetsAdapter.getPersonalPortfolioHistoricalPerformance();

      expect(result[0].endingAUM).toBe(-1000);
      expect(result[0].personalMoM).toBe(-50.5);
      expect(result[0].investment).toBe(-500);
    });
  });
});
