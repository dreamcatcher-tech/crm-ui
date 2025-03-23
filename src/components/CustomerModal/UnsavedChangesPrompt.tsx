import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnsavedChangesPrompt({ isOpen, onClose, onConfirm, onCancel }: UnsavedChangesPromptProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Unsaved Changes
            </h3>
            <p className="text-sm text-gray-500">
              You have unsaved changes. Are you sure you want to close without saving?
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close Without Saving
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700"
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