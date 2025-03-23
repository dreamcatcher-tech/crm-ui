import React from 'react';
import { Calendar, DollarSign, Clock, Container, ShoppingBag } from 'lucide-react';
import type { CustomerEvent, EventType } from '../../types';
import { formatDate } from '../../utils';

interface EventLogProps {
  events: CustomerEvent[];
}

function getEventIcon(type: EventType, serviceType: 'bin' | 'bag' | undefined) {
  switch (type) {
    case 'payment':
      return <DollarSign className="w-4 h-4" />;
    case 'collection':
      return serviceType === 'bin' 
        ? <Container className="w-4 h-4" />
        : <ShoppingBag className="w-4 h-4" />;
    case 'scheduled':
      return serviceType === 'bin'
        ? <Container className="w-4 h-4" />
        : <ShoppingBag className="w-4 h-4" />;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(amount);
}

export function EventLog({ events }: EventLogProps) {
  const today = new Date();

  return (
    <div className="h-full flex flex-col">
      <h4 className="text-sm font-medium text-gray-500 mb-4">Transaction History</h4>
      <div className="flex-1 rounded-lg border border-gray-200 overflow-hidden min-h-0">
        <div className="overflow-y-auto h-full">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" className="w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="w-[120px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Event
              </th>
              <th scope="col" className="w-[300px] px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="w-[120px] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="w-[120px] px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {events.map((event) => {
              const eventDate = new Date(event.date);
              const isFuture = eventDate > today;
              const baseRowClass = isFuture ? 'bg-gray-50/50' : '';
              
              return (
                <tr
                  key={event.id}
                  className={`${baseRowClass} hover:bg-gray-50 transition-colors duration-150`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className={`flex items-center font-mono ${isFuture ? 'text-gray-400' : 'text-gray-900'}`}>
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.date)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${event.type === 'payment'
                        ? 'bg-green-100 text-green-800'
                        : event.type === 'collection'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                      } ${isFuture ? 'opacity-60' : ''}`}
                    >
                      <span className="mr-1">{getEventIcon(event.type, event.serviceType)}</span>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-sm ${isFuture ? 'text-gray-400' : 'text-gray-900'}`}>
                    {event.description}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right whitespace-nowrap
                    ${event.amount > 0
                      ? 'text-green-600'
                      : 'text-red-600'
                    } ${isFuture ? 'opacity-60' : ''}`}
                  >
                    {formatCurrency(event.amount)}
                  </td>
                  <td className={`px-4 py-3 text-sm text-right font-medium whitespace-nowrap
                    ${event.balance >= 0 ? 'text-green-600' : 'text-red-600'}
                    ${isFuture ? 'opacity-60' : ''}`}
                  >
                    {formatCurrency(event.balance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}