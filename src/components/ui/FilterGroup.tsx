'use client';

import React from 'react';
import FilterChip from './FilterChip';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroupProps {
  title: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  className?: string;
}

export default function FilterGroup({ 
  title, 
  options, 
  selectedValues, 
  onToggle, 
  className 
}: FilterGroupProps) {
  return (
    <div className={className}>
      {/* Group Label */}
      <div className="mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {title}
        </h3>
      </div>
      
      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            isActive={selectedValues.includes(option.value)}
            onClick={() => onToggle(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
