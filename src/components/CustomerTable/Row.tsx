import React, { useEffect } from 'react'
import { Container, ShoppingBag, UserCheck, UserX } from 'lucide-react'
import type { Customer } from './types'
import { useCustomerActions } from './useCustomerActions'
import { type TreeEntry, useFile } from '@artifact/context'

interface RowProps {
  index: number
  style: React.CSSProperties
  data: {
    items: [string, TreeEntry][]
    selectedId: string | null
    onRowClick: (id: string) => void
    onShowDetails: (customer: Customer) => void
  }
}

export function Row(
  { index, style, data: { items, selectedId, onRowClick, onShowDetails } }:
    RowProps,
) {
  // const entry = items.tree.get()
  // const customer = useFile('Name/'+ items[index])
  // useEffect(() => {
  //   if (!customer) return
  //   console.log(customer)
  // }, [customer])
  // if (!customer) return null
  return <div style={style}>{items[index][0]}</div>
  // const { handleCodeClick } = useCustomerActions({ customer, onShowDetails, onRowClick });

  // return (
  //   <div
  //     style={style}
  //     onClick={() => onRowClick(customer.id)}
  //     className={`flex items-center border-b border-gray-200 cursor-pointer transition-colors duration-150 ${
  //       selectedId === customer.id
  //         ? 'bg-indigo-50 hover:bg-indigo-100'
  //         : 'hover:bg-gray-50'
  //     }`}
  //   >
  //     <button
  //       onClick={handleCodeClick}
  //       className="w-24 px-6 py-1.5 my-0.5 ml-1.5 truncate font-mono text-indigo-600 hover:text-indigo-700 focus:outline-none focus:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded transition-all duration-150 border border-indigo-200 flex items-center justify-center group"
  //     >
  //       <span>{customer.code}</span>
  //     </button>
  //     <div className="flex-1 px-6 py-2 truncate">
  //       <div className="font-medium text-gray-900">{customer.name}</div>
  //     </div>
  //     <div className="flex-1 px-6 py-2 truncate text-gray-500">
  //       {customer.email}
  //     </div>
  //     <div className="flex-1 px-6 py-2">
  //       <span
  //         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
  //           customer.status === 'active'
  //             ? 'bg-green-100 text-green-800'
  //             : 'bg-red-100 text-red-800'
  //         }`}
  //       >
  //         {customer.status === 'active' ? (
  //           <UserCheck className="w-3 h-3 mr-1" />
  //         ) : (
  //           <UserX className="w-3 h-3 mr-1" />
  //         )}
  //         {customer.status}
  //       </span>
  //     </div>
  //     <div className="flex-1 px-6 py-2">
  //       <span
  //         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
  //           customer.product === 'bin'
  //             ? 'bg-purple-100 text-purple-800'
  //             : 'bg-amber-100 text-amber-800'
  //         }`}
  //       >
  //         {customer.product === 'bin' ? (
  //           <Container className="w-3 h-3 mr-1" />
  //         ) : (
  //           <ShoppingBag className="w-3 h-3 mr-1" />
  //         )}
  //         {customer.product}
  //       </span>
  //     </div>
  //     <div className="flex-1 px-6 py-2">
  //       <span
  //         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
  //           customer.balance >= 0
  //             ? 'bg-emerald-100 text-emerald-800'
  //             : 'bg-rose-100 text-rose-800'
  //         }`}
  //       >
  //         ${customer.balance.toFixed(2)}
  //       </span>
  //     </div>
  //     <div className="w-48 px-6 py-2 text-gray-500 whitespace-nowrap font-mono">
  //       {customer.nextCollection}
  //     </div>
  //     <div className="w-48 px-6 py-2 text-gray-500 whitespace-nowrap font-mono">
  //       {customer.lastCollection}
  //     </div>
  //   </div>
  // );
}
