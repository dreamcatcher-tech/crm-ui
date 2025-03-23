import React from 'react';
import type { Customer } from '../../../types';
import { formatPhoneNumber, isValidPhoneNumber } from '../../../utils';

interface PersonalInformationProps {
  formData: Customer;
  changedFields: Set<string>;
  onFieldChange: (field: string, value: any) => void;
}

export function PersonalInformation({ formData, changedFields, onFieldChange }: PersonalInformationProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-500">Personal Information</h4>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200
            ${changedFields.has('name')
              ? 'ring-2 ring-yellow-200 border-yellow-400'
              : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            }`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => onFieldChange('email', e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200
            ${changedFields.has('email')
              ? 'ring-2 ring-yellow-200 border-yellow-400'
              : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            }`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <div className="relative">
          <input
            type="tel"
            pattern="[0-9\s]*"
            value={formData.phone}
            onChange={(e) => {
              const input = e.target.value.replace(/[^\d\s]/g, '');
              if (input.length <= 12) { // Max 11 digits + 1 space
                const formatted = formatPhoneNumber(input);
                onFieldChange('phone', formatted);
              }
            }}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200 
              ${changedFields.has('phone')
                ? 'ring-2 ring-yellow-200 border-yellow-400'
                : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'} 
              ${!isValidPhoneNumber(formData.phone) ? 'border-red-300 focus:ring-red-500' : ''
              }`}
            placeholder="02X XXX XXXX or 0X XXX XXXX"
          />
          {!isValidPhoneNumber(formData.phone) && (
            <p className="absolute left-0 -bottom-5 text-xs text-red-500">
              Please enter a valid NZ phone number
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => onFieldChange('status', e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200
            ${changedFields.has('status')
              ? 'ring-2 ring-yellow-200 border-yellow-400'
              : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            }`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}