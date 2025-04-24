import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { FixedSizeList as List } from 'react-window'
import { HelpCircle, Search } from 'lucide-react'
import type { Customer, PendingCustomer } from '../../types'
import { toCustomer } from '../../types'
import { Row } from './Row'
import { CustomerModal } from '../CustomerModal/CustomerModal'
import { HelpModal } from './HelpModal'
import { parseDate } from '../../utils'
import { ROW_HEIGHT } from './constants'
import { useHotkeys } from './useHotkeys'
import { TableHeader } from './TableHeader'
import { ArtifactContext, useDir, useWatch } from '@artifact/context'
import type { OrderedMap } from 'immutable'

export default function CustomerTable() {
  const [blobs, setBlobs] = useState<OrderedMap<string, Uint8Array>>()
  const syncer = useContext(ArtifactContext)
  useEffect(() => {
    if (!syncer) return
    let lastBlobs: OrderedMap<string, Uint8Array> | undefined
    return syncer.subscribe((s) => {
      if (lastBlobs === s.blobs) return
      lastBlobs = s.blobs
      setBlobs(s.blobs)
    })
  }, [syncer])

  useWatch({ path: 'Name', blobs: true })

  const dirEntries = useDir('Name', { shardRoot: 'Name', watch: false })
  const customers: (Customer | PendingCustomer)[] = useMemo(() => {
    const array = dirEntries?.tree.toArray() || []
    const customers = array.filter(
      ([, treeEntry]) => treeEntry.type === 'blob',
    )
      .map(([, treeEntry]) => {
        const record = blobs?.get(treeEntry.oid)
        if (!record) {
          let { path } = treeEntry
          if (path.endsWith('.json')) {
            path = path.slice(0, -'.json'.length)
          }
          return { id: path }
        }
        return toCachedCustomer(record)
      })

    return customers
  }, [dirEntries?.tree])

  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Customer | null>(
    'nextCollection',
  )
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    'desc',
  )
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  )
  const [showHelp, setShowHelp] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  )
  // const [customers, setCustomers] = useState<Customer[]>([]);
  const [listHeight, setListHeight] = useState(600)
  const containerRef = useRef<HTMLDivElement>(null)

  const listRef = useRef<List>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listOuterRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const topOffset = containerRect.top
        const windowHeight = globalThis.innerHeight
        const padding = 24 // 1.5rem (p-6)
        setListHeight(windowHeight - topOffset - (padding * 3) - 1)
      }
    }

    updateHeight()
    globalThis.addEventListener('resize', updateHeight)
    return () => globalThis.removeEventListener('resize', updateHeight)
  }, [])

  const handleShowDetails = (customer: Customer) => {
    setSelectedCustomer(customer)
  }

  useEffect(() => {
    // Add smooth scroll behavior to the list container
    if (listOuterRef.current) {
      listOuterRef.current.style.scrollBehavior = 'smooth'
    }
  }, [])

  const handleSort = (field: string | number | symbol) => {
    if (field === sortField) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      }
    } else {
      setSortField(field as keyof Customer)
      setSortDirection('asc')
    }
  }

  const filteredAndSortedCustomers = useMemo(() => {
    // Split search terms by spaces and filter out empty strings
    const searchTerms = searchTerm.toLowerCase().split(' ').filter(Boolean)

    return customers
      .filter((customer) => {
        // If no search terms, show all customers
        if (searchTerms.length === 0) return true
        if (!customer) return false
        if (!isCustomer(customer)) {
          return searchTerms.some((term) =>
            term.includes(customer.id.toLowerCase())
          )
        }

        // Create searchable text from all relevant fields
        const searchableText = customer.name.toLowerCase() + ' ' +
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

        // All search terms must match somewhere in the searchable text
        return searchTerms.every((term) => searchableText.includes(term))
      })
      .sort((a: Customer | PendingCustomer, b: Customer | PendingCustomer) => {
        const aIsCustomer = isCustomer(a)
        const bIsCustomer = isCustomer(b)
        if (!aIsCustomer && !bIsCustomer) return 0
        if (!aIsCustomer) return sortDirection === 'asc' ? 1 : -1
        if (!bIsCustomer) return sortDirection === 'asc' ? -1 : 1
        return sortField && sortDirection
          ? (sortField === 'nextCollection' || sortField === 'lastCollection'
            ? (parseDate(a[sortField] || '').getTime() -
              parseDate(b[sortField] || '').getTime()) *
              (sortDirection === 'asc' ? 1 : -1)
            : (String(a[sortField]) < String(b[sortField])
              ? (sortDirection === 'asc' ? -1 : 1)
              : (sortDirection === 'asc' ? 1 : -1)))
          : 0
      })
  }, [searchTerm, sortField, sortDirection, customers])

  useHotkeys({
    showHelp,
    setShowHelp,
    searchInputRef: searchInputRef as React.RefObject<HTMLInputElement>,
    selectedCustomerId,
    setSelectedCustomerId,
    filteredAndSortedCustomers: [],
    onShowDetails: handleShowDetails,
    listRef: listRef as React.RefObject<List>,
  })
  const handleRowClick = (customerId: string) => {
    setSelectedCustomerId(selectedCustomerId === customerId ? null : customerId)
  }

  const handleCustomerUpdate = (updatedCustomer: Customer) => {
    // setCustomers(prev => prev.map(c =>
    //   c.id === updatedCustomer.id ? updatedCustomer : c
    // ));
  }

  return (
    <div className='w-full max-w-6xl mx-auto p-6 h-full'>
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center space-x-4'>
            <h2 className='text-2xl font-bold text-gray-800'>Customers</h2>
            <button
              onClick={() => setShowHelp(true)}
              className='p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100'
              aria-label='Show keyboard shortcuts'
            >
              <HelpCircle className='w-5 h-5' />
            </button>
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
            <input
              type='text'
              placeholder='Search customers...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              ref={searchInputRef}
              className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            />
          </div>
        </div>

        <div
          className='bg-white rounded-lg shadow overflow-hidden'
          ref={containerRef}
        >
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
            width='100%'
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
  )
}

const cachedCustomers = new WeakMap<Uint8Array, Customer>()
function toCachedCustomer(record: Uint8Array): Customer {
  let customer = cachedCustomers.get(record)
  if (!customer) {
    const text = new TextDecoder().decode(record)
    const json = JSON.parse(text)
    customer = toCustomer(json)
    cachedCustomers.set(record, customer)
  }
  return customer
}

function isCustomer(
  customer: Customer | PendingCustomer,
): customer is Customer {
  return 'code' in customer
}
