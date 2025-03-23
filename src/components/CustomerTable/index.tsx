import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Search, HelpCircle } from 'lucide-react';
import type { Customer } from './types';
import { Row } from './Row';
import { CustomerModal } from '../CustomerModal/CustomerModal';
import { HelpModal } from './HelpModal';
import { parseDate } from '../../utils';
import { MOCK_CUSTOMERS } from '../../mockData';
import { ROW_HEIGHT } from './constants';
import { useHotkeys } from './useHotkeys';
import { TableHeader } from './TableHeader';

export default function CustomerTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Customer | null>('nextCollection');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('desc');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [listHeight, setListHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const listRef = useRef<List>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listOuterRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const topOffset = containerRect.top;
        const windowHeight = window.innerHeight;
        const padding = 24; // 1.5rem (p-6)
        setListHeight(windowHeight - topOffset - (padding * 3) - 1);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleShowDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  useEffect(() => {
    // Add smooth scroll behavior to the list container
    if (listOuterRef.current) {
      listOuterRef.current.style.scrollBehavior = 'smooth';
    }
  }, []);

  const handleSort = (field: keyof Customer) => {
    if (field === sortField) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedCustomers = useMemo(() => {
    // Split search terms by spaces and filter out empty strings
    const searchTerms = searchTerm.toLowerCase().split(' ').filter(Boolean);

    return customers
      .filter(
        (customer) => {
          // If no search terms, show all customers
          if (searchTerms.length === 0) return true;

          // Create searchable text from all relevant fields
          const searchableText = (
            customer.name.toLowerCase() + ' ' +
            customer.email.toLowerCase() + ' ' +
            customer.code + ' ' +
            customer.serviceAddress.street.toLowerCase() + ' ' +
            customer.serviceAddress.suburb.toLowerCase() + ' ' +
            customer.serviceAddress.city.toLowerCase() + ' ' +
            customer.serviceAddress.postcode + ' ' +
            // Include mailing address if it exists and is different from service address
            (!customer.useServiceAddressForMail && customer.mailingAddress
              ? customer.mailingAddress.street.toLowerCase() + ' ' +
                customer.mailingAddress.suburb.toLowerCase() + ' ' +
                customer.mailingAddress.city.toLowerCase() + ' ' +
                customer.mailingAddress.postcode
              : '')
          );

          // All search terms must match somewhere in the searchable text
          return searchTerms.every(term => searchableText.includes(term));
        }
      )
      .sort((a, b) => 
        sortField && sortDirection
          ? (sortField === 'nextCollection' || sortField === 'lastCollection'
              ? (parseDate(a[sortField] || '').getTime() - parseDate(b[sortField] || '').getTime()) * (sortDirection === 'asc' ? 1 : -1)
              : (a[sortField] < b[sortField]
                  ? (sortDirection === 'asc' ? -1 : 1)
                  : (sortDirection === 'asc' ? 1 : -1)))
          : 0
      );
  }, [searchTerm, sortField, sortDirection]);

  useHotkeys({
    showHelp,
    setShowHelp,
    searchInputRef,
    selectedCustomerId,
    setSelectedCustomerId,
    filteredAndSortedCustomers,
    onShowDetails: handleShowDetails,
    listRef,
  });
  const handleRowClick = (customerId: string) => {
    setSelectedCustomerId(selectedCustomerId === customerId ? null : customerId);
  };

  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => 
      c.id === updatedCustomer.id ? updatedCustomer : c
    ));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 h-full">
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Show keyboard shortcuts"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            ref={searchInputRef}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden" ref={containerRef}>
        <TableHeader
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <List
          ref={listRef}
          height={listHeight}
          outerRef={listOuterRef}
          itemCount={filteredAndSortedCustomers.length}
          itemSize={ROW_HEIGHT}
          width="100%"
          itemData={{
            items: filteredAndSortedCustomers,
            selectedId: selectedCustomerId,
            onRowClick: handleRowClick,
            onShowDetails: handleShowDetails,
          }}
        >
          {Row}
        </List>
      </div>

    </div>
    <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    <CustomerModal 
      customer={selectedCustomer} 
      onClose={() => setSelectedCustomer(null)} 
      onUpdate={handleCustomerUpdate}
    />
  </div>
  );
}