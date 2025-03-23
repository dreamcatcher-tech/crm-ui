import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, headerAction, children }: ModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full relative mx-6 my-8 h-[calc(100vh-4rem)] flex flex-col">
        <div className="absolute top-6 right-6 flex items-center space-x-2">
          {headerAction}
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-none p-6 pb-0">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        </div>
        <div className="flex-1 p-6 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}