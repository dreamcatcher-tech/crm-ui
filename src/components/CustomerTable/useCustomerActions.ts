import { useCallback } from 'react';
import type { Customer } from './types';

interface UseCustomerActionsProps {
  customer: Customer;
  onShowDetails: (customer: Customer) => void;
  onRowClick: (id: string) => void;
}

export function useCustomerActions({ customer, onShowDetails, onRowClick }: UseCustomerActionsProps) {
  const handleCodeClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection
    onShowDetails(customer);
    onRowClick(customer.id); // Select the row when opening modal
  }, [customer, onShowDetails]);

  return { handleCodeClick };
}