import { useEffect, RefObject } from 'react';
import { FixedSizeList } from 'react-window';
import type { Customer } from './types';
import { ROW_HEIGHT } from './constants';

interface UseHotkeysProps {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  filteredAndSortedCustomers: Customer[];
  onShowDetails: (customer: Customer) => void;
  listRef: RefObject<FixedSizeList>;
}

export function useHotkeys({
  showHelp,
  setShowHelp,
  searchInputRef,
  selectedCustomerId,
  setSelectedCustomerId,
  filteredAndSortedCustomers,
  onShowDetails,
  listRef,
}: UseHotkeysProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if any modal is open by looking for modal backdrop
      const modalBackdrop = document.querySelector('.fixed.inset-0.bg-black');
      if (modalBackdrop) {
        return; // Don't handle any keyboard events when modal is open
      }

      // Ignore keyboard navigation when search input is focused
      if (document.activeElement === searchInputRef.current) {
        if (e.key === 'Escape') {
          e.preventDefault();
          searchInputRef.current.blur();
        }
        return;
      }

      const currentIndex = selectedCustomerId
        ? filteredAndSortedCustomers.findIndex(c => c.id === selectedCustomerId)
        : -1;

      switch (e.key) {
        case '/':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;

        case '?':
          e.preventDefault();
          setShowHelp(true);
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (currentIndex === -1) {
            // If nothing is selected, select the first item
            const firstId = filteredAndSortedCustomers[0]?.id;
            if (firstId) {
              setSelectedCustomerId(firstId);
              listRef.current?.scrollToItem(0, 'smart');
            }
          } else if (currentIndex < filteredAndSortedCustomers.length - 1) {
            // Select next item
            const nextId = filteredAndSortedCustomers[currentIndex + 1].id;
            setSelectedCustomerId(nextId);
            listRef.current?.scrollToItem(currentIndex + 1, 'smart');
          }
          break;

        case 'ArrowUp':
          e.preventDefault();
          if (currentIndex > 0) {
            // Select previous item
            const prevId = filteredAndSortedCustomers[currentIndex - 1].id;
            setSelectedCustomerId(prevId);
            listRef.current?.scrollToItem(currentIndex - 1, 'smart');
          }
          break;

        case 'Enter':
          if (selectedCustomerId) {
            const customer = filteredAndSortedCustomers.find(c => c.id === selectedCustomerId);
            if (customer) {
              onShowDetails(customer);
            }
          }
          break;

        case 'Escape':
          setSelectedCustomerId(null);
          break;

        case 'Home':
          e.preventDefault();
          if (filteredAndSortedCustomers.length > 0) {
            const firstId = filteredAndSortedCustomers[0].id;
            setSelectedCustomerId(firstId);
            listRef.current?.scrollToItem(0, 'start');
          }
          break;

        case 'End':
          e.preventDefault();
          if (filteredAndSortedCustomers.length > 0) {
            const lastIndex = filteredAndSortedCustomers.length - 1;
            const lastId = filteredAndSortedCustomers[lastIndex].id;
            setSelectedCustomerId(lastId);
            listRef.current?.scrollToItem(lastIndex, 'end');
          }
          break;

        case 'PageUp':
          e.preventDefault();
          if (filteredAndSortedCustomers.length > 0) {
            const visibleRows = Math.floor(600 / ROW_HEIGHT);
            const newIndex = Math.max(0, currentIndex - visibleRows);
            const newId = filteredAndSortedCustomers[newIndex].id;
            setSelectedCustomerId(newId);
            listRef.current?.scrollToItem(newIndex, 'start');
          }
          break;

        case 'PageDown':
          e.preventDefault();
          if (filteredAndSortedCustomers.length > 0) {
            const visibleRows = Math.floor(600 / ROW_HEIGHT);
            const newIndex = Math.min(
              filteredAndSortedCustomers.length - 1,
              currentIndex === -1 ? visibleRows - 1 : currentIndex + visibleRows
            );
            const newId = filteredAndSortedCustomers[newIndex].id;
            setSelectedCustomerId(newId);
            listRef.current?.scrollToItem(newIndex, 'end');
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showHelp,
    setShowHelp,
    searchInputRef,
    selectedCustomerId,
    setSelectedCustomerId,
    filteredAndSortedCustomers,
    listRef,
  ]);
}