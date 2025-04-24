import equal from 'fast-deep-equal';
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

export interface PendingCustomer {
  id: string;
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

type XmlCustomer = {
  address1: string;
  address2: string;
  category1: string;
  category2: string;
  category3: string;
  code: string;
  colour: number;
  delivery1: string;
  delivery2: string;
  deliverypostcode: string;
  email: string;
  mobile: string;
  name: string;
  phone: string;
  postcode: string;
  salesperson: string;
  theirref: string;
}

type JsonRecord = {
  id: string;
  json: XmlCustomer;
  lastModified: number;
}

const transformCache = new Map<string, [JsonRecord, Customer]>();

export const toCustomer = (record: JsonRecord): Customer => {
  if (transformCache.has(record.id)) {
    const cached = transformCache.get(record.id);
    if (cached && equal(cached[0], record)) {
      return cached[1];
    }
  }

  const customer = {
    id: record.id,
    code: record.json.code,
    name: record.json.name || '',
    email: record.json.email || '',
    phone: record.json.phone || '',
    status: 'active',
    product: 'bin',
    frequency: 'weekly',
    balance: 7,
    nextCollection: null,
    lastCollection: '',
    mailingAddress: {
      street: record.json.address1 || '',
      suburb: record.json.address2 || '',
      city: record.json.postcode || '',
      postcode: record.json.postcode || '',
    },
    serviceAddress: {
      street: record.json.delivery1 || '',
      suburb: record.json.delivery2 || '',
      city: record.json.deliverypostcode || '',
      postcode: record.json.deliverypostcode || '',
    },
    useServiceAddressForMail: true,
  } as const

  transformCache.set(record.id, [record, customer]);

  return customer;
};

export function isCustomer(
  customer: Customer | PendingCustomer,
): customer is Customer {
  return 'code' in customer
}