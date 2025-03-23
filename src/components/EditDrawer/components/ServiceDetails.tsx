import React from 'react';
import type { Customer } from '../../../types';
import { getNextAvailableDate, parseDate, formatDate } from '../../../utils';

interface SubscriptionsProps {
  formData: Customer;
  changedFields: Set<string>;
  onFieldChange: (field: string, value: any) => void;
}

export function Subscriptions({ formData, changedFields, onFieldChange }: SubscriptionsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-500">Subscriptions</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service Type
        </label>
        <select
          value={formData.product}
          onChange={(e) => {
            const newProduct = e.target.value as 'bin' | 'bag';
            // Reset frequency if changing from bin to bag and current frequency is 8weekly
            const newFrequency = newProduct === 'bag' && formData.frequency === '8weekly'
              ? '4weekly'
              : formData.frequency;
            onFieldChange('product', newProduct);
            if (newFrequency !== formData.frequency) {
              onFieldChange('frequency', newFrequency);
            }
          }}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200
            ${changedFields.has('product')
              ? 'ring-2 ring-yellow-200 border-yellow-400'
              : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            }`}
        >
          <option value="bin">Bin</option>
          <option value="bag">Bag</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Frequency
        </label>
        <select
          value={formData.frequency}
          onChange={(e) => onFieldChange('frequency', e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200
            ${changedFields.has('frequency')
              ? 'ring-2 ring-yellow-200 border-yellow-400'
              : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            }`}
        >
          <option value="weekly">Weekly</option>
          <option value="2weekly">2 Weekly</option>
          <option value="4weekly">4 Weekly</option>
          {formData.product === 'bin' && (
            <option value="8weekly">8 Weekly</option>
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Next Collection
        </label>
        <select
          value={formData.nextCollection || ''}
          onChange={(e) => onFieldChange('nextCollection', e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200
            ${changedFields.has('nextCollection')
              ? 'ring-2 ring-yellow-200 border-yellow-400'
              : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            }`}
        >
          {(() => {
            const nextAvailable = getNextAvailableDate();
            const baseDate = parseDate(nextAvailable);
            const options = [];
            
            // Add next available date
            options.push(
              <option key="next" value={nextAvailable}>
                Next Available ({nextAvailable})
              </option>
            );
            
            // Add weekly increments
            [1, 2, 4, 8].forEach(weeks => {
              const date = new Date(baseDate);
              date.setDate(date.getDate() + (weeks * 7));
              const formattedDate = formatDate(date);
              options.push(
                <option key={weeks} value={formattedDate}>
                  +{weeks} {weeks === 1 ? 'week' : 'weeks'} ({formattedDate})
                </option>
              );
            });
            
            return options;
          })()}
        </select>
      </div>
    </div>
  );
}