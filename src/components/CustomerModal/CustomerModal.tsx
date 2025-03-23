import React from 'react';
import { UserCheck, UserX, Container, ShoppingBag, Mail, Calendar, CreditCard, History, Phone, MapPin, Clock, PencilLine } from 'lucide-react';
import { Modal } from '../Modal';
import type { Customer } from '../../types';
import { EventLog } from './EventLog';
import { generateCustomerEvents } from '../../mockData';
import { getNextAvailableDate } from '../../utils';
import { EditDrawer } from '../EditDrawer';

interface CustomerModalProps {
  customer: Customer | null;
  onClose: () => void;
  onUpdate?: (updatedCustomer: Customer) => void;
}

export function CustomerModal({ customer, onClose, onUpdate }: CustomerModalProps) {
  const [showEditDrawer, setShowEditDrawer] = React.useState(false);

  const handleSave = (updatedCustomer: Customer) => {
    onUpdate?.(updatedCustomer);
  };

  return (
    <>
      <Modal
        isOpen={!!customer}
        onClose={onClose}
        title={customer?.name || ''}
        headerAction={
          <button
            onClick={() => setShowEditDrawer(true)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <PencilLine className="w-5 h-5" />
          </button>
        }
      >
      {customer && (
        <div className="h-full flex flex-col">
          {/* Header with customer info */}
          <div className="flex-none flex items-start space-x-4 pb-6 border-b border-gray-200">
            <div className="bg-indigo-100 rounded-lg p-3 mt-1">
              {customer.status === 'active' ? (
                <UserCheck className="w-6 h-6 text-indigo-600" />
              ) : (
                <UserX className="w-6 h-6 text-indigo-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center mt-2 text-gray-500">
                <Mail className="w-4 h-4 mr-2" />
                {customer.email}
              </div>
              <div className="flex items-center mt-2 text-gray-500">
                <Phone className="w-4 h-4 mr-2" />
                {customer.phone}
              </div>
              <div className="flex items-center mt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                  Customer ID: {customer.code}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  customer.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {customer.status === 'active' ? (
                  <UserCheck className="w-4 h-4 mr-1.5" />
                ) : (
                  <UserX className="w-4 h-4 mr-1.5" />
                )}
                {customer.status}
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium mt-2 ${
                  customer.balance >= 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                <CreditCard className="w-4 h-4 mr-1.5" />
                ${customer.balance.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex-none grid grid-cols-2 gap-x-8 gap-y-6 mt-6">
            {/* Service Address Section */}
            <div className="col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-500">Service Address</h4>
                {customer.useServiceAddressForMail && (
                  <span className="text-sm text-gray-500 italic">Same as Mailing Address</span>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">{customer.serviceAddress.street}</p>
                    <p className="text-gray-900">{customer.serviceAddress.suburb}</p>
                    <p className="text-gray-900">{customer.serviceAddress.city} {customer.serviceAddress.postcode}</p>
                  </div>
                </div>
              </div>
            </div>

            {!customer.useServiceAddressForMail && (
              <div className="col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Mailing Address</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      {customer.mailingAddress ? (
                        <>
                          <p className="text-gray-900">{customer.mailingAddress.street}</p>
                          <p className="text-gray-900">{customer.mailingAddress.suburb}</p>
                          <p className="text-gray-900">{customer.mailingAddress.city} {customer.mailingAddress.postcode}</p>
                        </>
                      ) : (
                        <p className="text-gray-500 italic">No mailing address specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscriptions Section */}
            <div className="col-span-2">
              <h4 className="text-sm font-medium text-gray-500 mb-4">Subscriptions</h4>
              <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-12 gap-4">
                <div className="col-span-2">
                  <span className="block text-sm font-medium text-gray-500 mb-2">Service Type</span>
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                      customer.product === 'bin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {customer.product === 'bin' ? (
                      <Container className="w-4 h-4 mr-1.5" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 mr-1.5" />
                    )}
                    {customer.product}
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="block text-sm font-medium text-gray-500 mb-2">Frequency</span>
                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {customer.frequency.replace('weekly', ' Weekly')}
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="block text-sm font-medium text-gray-500 mb-2">Per Service</span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                    <CreditCard className="w-4 h-4 mr-1.5" />
                    ${customer.product === 'bin' ? '18.00' : '28.00'}
                  </span>
                </div>
                <div className="col-span-4">
                  <span className="block text-sm font-medium text-gray-500 mb-2">Next Available</span>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800 font-mono">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {getNextAvailableDate()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Event Log */}
          <div className="flex-1 min-h-0 mt-6">
            <EventLog events={customer ? generateCustomerEvents(customer) : []} />
          </div>
        </div>)}
      </Modal>
      
      {customer && (
        <EditDrawer
          isOpen={showEditDrawer}
          onClose={() => setShowEditDrawer(false)}
          customer={customer}
          onSave={handleSave}
        />
      )}
    </>
  );
}