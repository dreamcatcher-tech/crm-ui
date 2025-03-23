import React from 'react';
import type { Address } from '../../../types';

interface AddressFieldsProps {
  address: Address;
  type: 'service' | 'mailing';
  changedFields: Set<string>;
  onFieldChange: (field: string, value: string, parentField: string) => void;
}

export function AddressFields({ address, type, changedFields, onFieldChange }: AddressFieldsProps) {
  const prefix = `${type}Address`;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street
        </label>
        <input
          type="text"
          value={address.street}
          onChange={(e) => onFieldChange('street', e.target.value, prefix)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200
            ${changedFields.has(`${prefix}.street`)
              ? 'ring-2 ring-yellow-200 border-yellow-400'
              : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            }`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Suburb
        </label>
        <input
          type="text"
          value={address.suburb}
          onChange={(e) => onFieldChange('suburb', e.target.value, prefix)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200
            ${changedFields.has(`${prefix}.suburb`)
              ? 'ring-2 ring-yellow-200 border-yellow-400'
              : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
            }`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            value={address.city}
            onChange={(e) => onFieldChange('city', e.target.value, prefix)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200
              ${changedFields.has(`${prefix}.city`)
                ? 'ring-2 ring-yellow-200 border-yellow-400'
                : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postcode
          </label>
          <input
            type="text"
            value={address.postcode}
            onChange={(e) => onFieldChange('postcode', e.target.value, prefix)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md transition-all duration-200
              ${changedFields.has(`${prefix}.postcode`)
                ? 'ring-2 ring-yellow-200 border-yellow-400'
                : 'focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
              }`}
          />
        </div>
      </div>
    </div>
  );
}