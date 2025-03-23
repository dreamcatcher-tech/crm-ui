import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Customer } from './types';

interface SortButtonProps {
  field: keyof Customer;
  children: React.ReactNode;
  sortField: keyof Customer | null;
  sortDirection: 'asc' | 'desc' | null;
  onSort: (field: keyof Customer) => void;
}

export function SortButton({ field, children, sortField, sortDirection, onSort }: SortButtonProps) {
  const isActive = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`flex items-center space-x-1 font-semibold transition-colors duration-150 ${
        isActive ? 'text-indigo-600' : 'hover:text-indigo-600'
      }`}
    >
      <span>{children}</span>
      <div className="w-4">
        {isActive && sortDirection === 'asc' && <ArrowUp className="h-4 w-4" />}
        {isActive && sortDirection === 'desc' && <ArrowDown className="h-4 w-4" />}
        {!isActive && <ArrowUp className="h-4 w-4 opacity-0 group-hover:opacity-50" />}
      </div>
    </button>
  );
}