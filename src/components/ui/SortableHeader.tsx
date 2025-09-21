import React from 'react';

export type SortDirection = 'asc' | 'desc' | null;

interface SortableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSort: { key: string; direction: SortDirection };
  onSort: (key: string) => void;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export default function SortableHeader({ 
  children, 
  sortKey, 
  currentSort, 
  onSort, 
  className = '',
  align = 'left'
}: SortableHeaderProps) {
  const isActive = currentSort.key === sortKey;
  const direction = isActive ? currentSort.direction : null;

  const handleClick = () => {
    onSort(sortKey);
  };

  const getSortIcon = () => {
    if (!isActive) {
      return (
        <svg className="w-4 h-4 ml-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    if (direction === 'asc') {
      return (
        <svg className="w-4 h-4 ml-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
      );
    }

    if (direction === 'desc') {
      return (
        <svg className="w-4 h-4 ml-1 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
        </svg>
      );
    }

    return null;
  };

  const getAlignmentClass = () => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const getJustifyClass = () => {
    switch (align) {
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      default:
        return 'justify-start';
    }
  };

  return (
    <th 
      className={`px-6 py-3 cursor-pointer select-none transition-colors duration-200 hover:bg-gray-700/30 ${getAlignmentClass()} ${className}`}
      onClick={handleClick}
    >
      <div className={`flex items-center ${getJustifyClass()} group`}>
        <span className={`text-xs font-medium uppercase tracking-wider ${
          isActive ? 'text-white' : 'text-gray-400'
        } group-hover:text-white transition-colors`}>
          {children}
        </span>
        {getSortIcon()}
      </div>
    </th>
  );
}
