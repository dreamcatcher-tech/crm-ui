export interface Address {
  street: string;
  suburb: string;
  city: string;
  postcode: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  product: 'bin' | 'bag';
  frequency: 'weekly' | '2weekly' | '4weekly' | '8weekly';
  balance: number;
  nextCollection: string | null;
  lastCollection: string;
  serviceAddress: Address;
  mailingAddress?: Address;
  useServiceAddressForMail: boolean;
}

export type EventType = 'payment' | 'collection' | 'scheduled';

export interface CustomerEvent {
  id: string;
  date: string;
  type: EventType;
  description: string;
  amount: number;
  balance: number;
  serviceType?: 'bin' | 'bag';
}