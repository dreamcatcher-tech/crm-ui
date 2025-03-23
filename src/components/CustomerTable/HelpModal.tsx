import React from 'react';
import { Modal } from '../Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
    >
      <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Navigation</h4>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600">Move up</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">↑</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Move down</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">↓</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Page up</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">PgUp</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Page down</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">PgDn</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Go to top</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Home</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Go to bottom</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">End</kbd>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Actions</h4>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600">Focus search</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">/</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Show this help</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">?</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Clear selection / Exit search</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-sm">Esc</kbd>
              </li>
            </ul>
          </div>
        </div>
    </Modal>
  );
}