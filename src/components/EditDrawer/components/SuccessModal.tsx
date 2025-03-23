import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export function SuccessModal() {
  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-green-600" />
          <p className="text-lg font-medium text-gray-900">Changes saved successfully</p>
        </div>
      </div>
    </div>
  );
}