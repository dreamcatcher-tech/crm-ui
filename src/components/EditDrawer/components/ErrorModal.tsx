import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorModalProps {
  error: string;
  onRetry: () => void;
  onClose: () => void;
}

export function ErrorModal({ error, onRetry, onClose }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Save Failed
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {error}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onRetry}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}