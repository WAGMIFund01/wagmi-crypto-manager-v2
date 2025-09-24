import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility', () => {
  it('combines class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('handles conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
  });

  it('handles undefined and null values', () => {
    expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
  });

  it('handles empty strings', () => {
    expect(cn('class1', '', 'class2')).toBe('class1 class2');
  });

  it('handles arrays of classes', () => {
    expect(cn(['class1', 'class2'], 'class3')).toBe('class1 class2 class3');
  });

  it('handles objects with boolean values', () => {
    expect(cn({
      'class1': true,
      'class2': false,
      'class3': true
    })).toBe('class1 class3');
  });

  it('handles mixed input types', () => {
    expect(cn(
      'class1',
      ['class2', 'class3'],
      {
        'class4': true,
        'class5': false
      },
      'class6'
    )).toBe('class1 class2 class3 class4 class6');
  });

  it('handles no arguments', () => {
    expect(cn()).toBe('');
  });

  it('handles single argument', () => {
    expect(cn('class1')).toBe('class1');
  });

  it('handles duplicate classes (cn does not remove duplicates)', () => {
    expect(cn('class1 class2', 'class2 class3')).toBe('class1 class2 class2 class3');
  });

  it('handles whitespace correctly', () => {
    expect(cn('  class1  ', '  class2  ')).toBe('class1 class2');
  });
});
