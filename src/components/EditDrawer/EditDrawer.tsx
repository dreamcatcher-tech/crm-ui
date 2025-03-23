import React from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { Customer } from '../../types';
import { PersonalInformation } from './components/PersonalInformation';
import { AddressFields } from './components/AddressFields';
import { Subscriptions } from './components/ServiceDetails';
import { UnsavedChangesPrompt } from '../CustomerModal/UnsavedChangesPrompt';
import { SavingOverlay } from './components/SavingOverlay';
import { SuccessModal } from './components/SuccessModal';
import { ErrorModal } from './components/ErrorModal';
import { useEditDrawer } from './hooks/useEditDrawer';

interface EditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  onSave: (updatedCustomer: Customer) => void;
}

export function EditDrawer({ isOpen, onClose, customer, onSave }: EditDrawerProps) {
  const {
    formData,
    changedFields,
    showUnsavedPrompt,
    isSaving,
    showSuccess,
    saveError,
    setSaveError,
    hasChanges,
    setShowUnsavedPrompt,
    handleFieldChange,
    handleClose,
    handleCancel,
    handleConfirmClose,
    handleSubmit,
  } = useEditDrawer({ customer, onClose, onSave });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20"
        onClick={handleClose}
      />
      
      {/* Drawer */}
      <div className="relative ml-auto">
        <div className="h-full w-[500px] bg-white shadow-xl flex flex-col animate-slide-in">
          <div className="flex-none p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Edit Customer</h3>
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <PersonalInformation
                formData={formData}
                changedFields={changedFields}
                onFieldChange={handleFieldChange}
              />

              {/* Service Address */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Service Address</h4>
                  <div className="mt-4">
                    <AddressFields
                      address={formData.serviceAddress}
                      type="service"
                      changedFields={changedFields}
                      onFieldChange={handleFieldChange}
                    />
                  </div>
                </div>
                
                {/* Mailing Address */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Mailing Address</h4>
                    <label className={`flex items-center px-3 py-1.5 rounded-md transition-all duration-200 ${
                      changedFields.has('useServiceAddressForMail') || changedFields.has('mailingAddress')
                        ? 'bg-yellow-50 ring-2 ring-yellow-200'
                        : 'hover:bg-gray-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={formData.useServiceAddressForMail}
                        onChange={(e) => {
                          const useServiceAddress = e.target.checked;
                          handleFieldChange('useServiceAddressForMail', useServiceAddress);
                          if (useServiceAddress) {
                            handleFieldChange('mailingAddress', undefined);
                          } else {
                            handleFieldChange('mailingAddress', { ...formData.serviceAddress });
                          }
                        }}
                        className={`rounded shadow-sm transition-all duration-200 ${
                          changedFields.has('useServiceAddressForMail') || changedFields.has('mailingAddress')
                            ? 'border-yellow-400 ring-2 ring-yellow-200 text-indigo-600'
                            : 'border-gray-300 text-indigo-600 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                        }`}
                      />
                      <span className={`ml-2 text-sm ${
                        changedFields.has('useServiceAddressForMail') || changedFields.has('mailingAddress')
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-600'
                      }`}>Same as service address</span>
                    </label>
                  </div>
                  
                  {!formData.useServiceAddressForMail && formData.mailingAddress && (
                    <AddressFields
                      address={formData.mailingAddress}
                      type="mailing"
                      changedFields={changedFields}
                      onFieldChange={handleFieldChange}
                    />
                  )}
                </div>
              </div>

              {/* Subscriptions */}
              <Subscriptions
                formData={formData}
                changedFields={changedFields}
                onFieldChange={handleFieldChange}
              />
            </div>

            {/* Footer */}
            <div className="flex-none p-6 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleCancel}
                  className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md 
                    ${isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasChanges || isSaving}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md transition-colors duration-200 ${
                    hasChanges
                      ? isSaving
                        ? 'bg-indigo-600 opacity-80 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Unsaved Changes Prompt */}
      <UnsavedChangesPrompt
        isOpen={showUnsavedPrompt}
        onClose={() => setShowUnsavedPrompt(false)}
        onConfirm={handleConfirmClose}
        onCancel={() => setShowUnsavedPrompt(false)}
      />
      
      {/* Saving Overlay */}
      {isSaving && <SavingOverlay />}
      
      {/* Success Modal */}
      {showSuccess && <SuccessModal />}
      
      {/* Error Modal */}
      {saveError && (
        <ErrorModal
          error={saveError}
          onRetry={handleSubmit}
          onClose={() => setSaveError(null)}
        />
      )}
    </div>
  );
}