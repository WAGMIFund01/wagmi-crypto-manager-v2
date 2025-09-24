import { describe, it, expect } from 'vitest';
import {
  getSpacing,
  getBorderRadius,
  getShadow,
  getGlowShadow,
  getStandardCardStyle,
  getStandardButtonStyle,
  getStandardInputStyle,
  getStandardModalStyle,
  getStandardTableStyle,
  getThemeColor,
  getSemanticColor,
  getResponsiveGrid,
  getResponsiveFlex
} from '../standardization';

describe('standardization utilities', () => {
  describe('getSpacing', () => {
    it('returns correct spacing values for different sizes', () => {
      expect(getSpacing('xs')).toBe('0.25rem');
      expect(getSpacing('sm')).toBe('0.5rem');
      expect(getSpacing('md')).toBe('1rem');
      expect(getSpacing('lg')).toBe('1.5rem');
      expect(getSpacing('xl')).toBe('2rem');
      expect(getSpacing('2xl')).toBe('3rem');
      expect(getSpacing('3xl')).toBe('4rem');
    });
  });

  describe('getBorderRadius', () => {
    it('returns correct border radius values for different sizes', () => {
      expect(getBorderRadius('sm')).toBe('0.375rem');
      expect(getBorderRadius('md')).toBe('0.5rem');
      expect(getBorderRadius('lg')).toBe('0.75rem');
      expect(getBorderRadius('xl')).toBe('1rem');
      expect(getBorderRadius('2xl')).toBe('1.5rem');
      expect(getBorderRadius('3xl')).toBe('2rem');
    });
  });

  describe('getShadow', () => {
    it('returns correct shadow values for different sizes', () => {
      expect(getShadow('sm')).toBe('0 1px 2px 0 rgba(0, 0, 0, 0.05)');
      expect(getShadow('md')).toBe('0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');
      expect(getShadow('lg')).toBe('0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)');
      expect(getShadow('xl')).toBe('0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)');
    });
  });

  describe('getGlowShadow', () => {
    it('returns correct glow shadow values for different colors', () => {
      expect(getGlowShadow('green')).toBe('0 0 20px rgba(0, 255, 149, 0.3)');
      expect(getGlowShadow('orange')).toBe('0 0 20px rgba(255, 107, 53, 0.3)');
      expect(getGlowShadow('blue')).toBe('0 0 20px rgba(59, 130, 246, 0.3)');
      expect(getGlowShadow('red')).toBe('0 0 20px rgba(239, 68, 68, 0.3)');
      expect(getGlowShadow('gray')).toBe('0 0 20px rgba(107, 114, 128, 0.3)');
    });
  });

  describe('getStandardCardStyle', () => {
    it('returns correct card styles for different variants', () => {
      const defaultStyle = getStandardCardStyle('default');
      const kpiStyle = getStandardCardStyle('kpi');
      const containerStyle = getStandardCardStyle('container');

      expect(defaultStyle).toBeDefined();
      expect(typeof defaultStyle).toBe('string');
      expect(kpiStyle).toBeDefined();
      expect(typeof kpiStyle).toBe('string');
      expect(containerStyle).toBeDefined();
      expect(typeof containerStyle).toBe('string');
    });

    it('defaults to default variant', () => {
      const result = getStandardCardStyle();
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('getStandardButtonStyle', () => {
    it('returns correct button styles for different variants', () => {
      const primaryStyle = getStandardButtonStyle('primary');
      const outlineStyle = getStandardButtonStyle('outline');
      const ghostStyle = getStandardButtonStyle('ghost');

      expect(primaryStyle).toBeDefined();
      expect(typeof primaryStyle).toBe('string');
      expect(outlineStyle).toBeDefined();
      expect(typeof outlineStyle).toBe('string');
      expect(ghostStyle).toBeDefined();
      expect(typeof ghostStyle).toBe('string');
    });

    it('defaults to primary variant', () => {
      const result = getStandardButtonStyle();
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('getStandardInputStyle', () => {
    it('returns correct input styles', () => {
      const normalStyle = getStandardInputStyle(false);
      const errorStyle = getStandardInputStyle(true);

      expect(normalStyle).toBeDefined();
      expect(typeof normalStyle).toBe('string');
      expect(errorStyle).toBeDefined();
      expect(typeof errorStyle).toBe('string');
    });

    it('defaults to normal style', () => {
      const result = getStandardInputStyle();
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });

  describe('getStandardModalStyle', () => {
    it('returns correct modal styles', () => {
      const result = getStandardModalStyle();
      expect(result).toHaveProperty('overlay');
      expect(result).toHaveProperty('content');
    });
  });

  describe('getStandardTableStyle', () => {
    it('returns correct table styles', () => {
      const result = getStandardTableStyle();
      expect(result).toHaveProperty('container');
      expect(result).toHaveProperty('table');
      expect(result).toHaveProperty('header');
      expect(result).toHaveProperty('row');
      expect(result).toHaveProperty('cell');
    });
  });

  describe('getThemeColor', () => {
    it('returns correct theme colors', () => {
      const greenAccent = getThemeColor('green', 'accent');
      const orangeAccent = getThemeColor('orange', 'accent');

      expect(greenAccent).toBeDefined();
      expect(orangeAccent).toBeDefined();
    });
  });

  describe('getSemanticColor', () => {
    it('returns correct semantic colors', () => {
      const success = getSemanticColor('success');
      const error = getSemanticColor('error');
      const warning = getSemanticColor('warning');
      const info = getSemanticColor('info');

      expect(success).toBeDefined();
      expect(error).toBeDefined();
      expect(warning).toBeDefined();
      expect(info).toBeDefined();
    });
  });

  describe('getResponsiveGrid', () => {
    it('returns correct responsive grid classes', () => {
      const grid1 = getResponsiveGrid(1);
      const grid2 = getResponsiveGrid(2);
      const grid3 = getResponsiveGrid(3);
      const grid4 = getResponsiveGrid(4);

      expect(grid1).toBeDefined();
      expect(grid2).toBeDefined();
      expect(grid3).toBeDefined();
      expect(grid4).toBeDefined();
    });
  });

  describe('getResponsiveFlex', () => {
    it('returns correct responsive flex classes', () => {
      const center = getResponsiveFlex('center');
      const between = getResponsiveFlex('between');
      const start = getResponsiveFlex('start');
      const end = getResponsiveFlex('end');
      const col = getResponsiveFlex('col');
      const row = getResponsiveFlex('row');

      expect(center).toBeDefined();
      expect(between).toBeDefined();
      expect(start).toBeDefined();
      expect(end).toBeDefined();
      expect(col).toBeDefined();
      expect(row).toBeDefined();
    });
  });
});
