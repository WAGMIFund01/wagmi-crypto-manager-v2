import { SortDirection } from '@/components/ui/SortableHeader';

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export function sortData<T>(data: T[], sortConfig: SortConfig): T[] {
  if (!sortConfig.direction) {
    return data;
  }

  return [...data].sort((a, b) => {
    const aValue = getNestedValue(a, sortConfig.key);
    const bValue = getNestedValue(b, sortConfig.key);

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    // Handle different data types
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }

    // Convert to string for comparison
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    const comparison = aStr.localeCompare(bStr);
    
    return sortConfig.direction === 'asc' ? comparison : -comparison;
  });
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

export function createSortHandler(
  currentSort: SortConfig,
  setSort: (sort: SortConfig) => void
) {
  return (key: string) => {
    let direction: SortDirection = 'asc';

    if (currentSort.key === key) {
      // Cycle through: asc -> desc -> null -> asc
      switch (currentSort.direction) {
        case 'asc':
          direction = 'desc';
          break;
        case 'desc':
          direction = null;
          break;
        default:
          direction = 'asc';
          break;
      }
    }

    setSort({ key, direction });
  };
}
