import React from 'react';
import { Loader2 } from 'lucide-react';

export function SavingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <p className="text-lg font-medium text-gray-900">Saving changes...</p>
        </div>
      </div>
    </div>
  );
}