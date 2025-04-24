import React from 'react'
import type { Customer } from '../../types'
import { SortButton } from './SortButton'

type SortField = keyof Pick<
  Customer,
  | 'code'
  | 'name'
  | 'email'
  | 'status'
  | 'product'
  | 'balance'
  | 'nextCollection'
  | 'lastCollection'
>

interface TableHeaderProps {
  sortField: string | number | symbol | null
  sortDirection: 'asc' | 'desc' | null
  onSort: (field: string | number | symbol) => void
}

export function TableHeader(
  { sortField, sortDirection, onSort }: TableHeaderProps,
) {
  return (
    <div className='bg-gray-50 border-b border-gray-200'>
      <div className='flex px-6 py-3'>
        <div className='w-24'>
          <SortButton
            field='code'
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          >
            Code
          </SortButton>
        </div>
        <div className='flex-1'>
          <SortButton
            field='name'
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          >
            Customer
          </SortButton>
        </div>
        <div className='flex-1'>
          <SortButton
            field='email'
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          >
            Email
          </SortButton>
        </div>
        <div className='flex-1'>
          <SortButton
            field='status'
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          >
            Status
          </SortButton>
        </div>
        <div className='flex-1'>
          <SortButton
            field='product'
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          >
            Product
          </SortButton>
        </div>
        <div className='flex-1'>
          <SortButton
            field='balance'
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          >
            Balance
          </SortButton>
        </div>
        <div className='w-48'>
          <SortButton
            field='nextCollection'
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          >
            Next Collection
          </SortButton>
        </div>
        <div className='w-48'>
          <SortButton
            field='lastCollection'
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={onSort}
          >
            Last Collection
          </SortButton>
        </div>
      </div>
    </div>
  )
}
