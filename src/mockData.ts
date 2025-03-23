import type { Customer, CustomerEvent } from './types';
import { formatDate, parseDate } from './utils';

const HAMILTON_SUBURBS = [
  'Chartwell',
  'Rototuna',
  'Flagstaff',
  'Hamilton East',
  'Hillcrest',
  'Dinsdale',
  'Nawton',
  'Pukete',
  'Fairfield',
  'Glenview'
];

const STREET_TYPES = ['Street', 'Road', 'Avenue', 'Drive', 'Place', 'Crescent', 'Way'];

const STREET_NAMES = [
  'Wairere',
  'River',
  'Victoria',
  'Peachgrove',
  'Ulster',
  'Boundary',
  'Te Rapa',
  'Hukanui',
  'Tramway',
  'Grey',
  'Lake',
  'Forest',
  'Ohaupo',
  'Kahikatea',
  'Pembroke'
];

const TODAY = new Date();

export function generateCustomerEvents(customer: Customer): CustomerEvent[] {
  const events: CustomerEvent[] = [];
  let currentBalance = customer.balance;
  let collectionCount = 0;
  
  // Generate past events (last 6 months of history)
  let currentDate = new Date(TODAY);
  currentDate.setMonth(currentDate.getMonth() - 6);
  
  while (currentDate <= TODAY) {
    collectionCount++;
    // Collection event
    const collectionCost = customer.product === 'bin' ? -18 : -28;
    currentBalance -= collectionCost;
    events.push({
      id: crypto.randomUUID(),
      date: formatDate(currentDate),
      type: 'collection',
      description: `Regular ${customer.product}`,
      amount: collectionCost,
      balance: currentBalance,
      serviceType: customer.product,
    });
    
    // 80% chance of payment after 4 collections
    if (collectionCount % 4 === 0 && Math.random() < 0.8) {
      const paymentDate = new Date(currentDate);
      paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 7));
      // Calculate total cost for 4 collections
      const totalCost = 4 * (customer.product === 'bin' ? 18 : 28);
      
      if (paymentDate <= TODAY) {
        currentBalance += totalCost;
        events.push({
          id: crypto.randomUUID(),
          date: formatDate(paymentDate),
          type: 'payment',
          description: 'Payment received',
          amount: totalCost,
          balance: currentBalance,
        });
      }
    }
    
    // Move to next collection (2-3 weeks later)
    currentDate.setDate(currentDate.getDate() + 14 + Math.floor(Math.random() * 7));
  }
  
  // Add future scheduled collections if customer is active
  if (customer.status === 'active' && customer.nextCollection) {
    const nextCollectionDate = new Date(customer.nextCollection);
    const projectedCost = customer.product === 'bin' ? -18 : -28;
    const projectedBalance = currentBalance + projectedCost;
    
    events.push({
      id: crypto.randomUUID(),
      date: customer.nextCollection!,
      type: 'scheduled',
      description: `Scheduled ${customer.product}`,
      amount: projectedCost,
      balance: projectedBalance,
      serviceType: customer.product,
    });
  }
  
  // Sort events by date, most recent first
  return events.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
}

// Generate 1000 customers for demonstration
export const MOCK_CUSTOMERS: Customer[] = Array.from({ length: 1000 }, (_, index) => {
  const names = ['Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
  const surnames = ['Johnson', 'Smith', 'Williams', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson'];
  
  const generatePhone = () => {
    // 40% chance of landline, 60% chance of mobile
    if (Math.random() < 0.4) {
      // Landline format: 0X XXX XXXX where X is the area code (3,4,6,7,9)
      const areaCodes = ['3', '4', '6', '7', '9'];
      const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];
      const middle = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      const end = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      return `0${areaCode} ${middle} ${end}`;
    } else {
      // Mobile format: 02X XXX XXXX where X is the network prefix
      const networkPrefix = String(Math.floor(Math.random() * 10));
      const middle = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
      const end = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      return `02${networkPrefix} ${middle} ${end}`;
    }
  };

  const generateDates = (isActive: boolean) => {
    // Generate last collection date (past date)
    const lastCollectionDate = new Date(TODAY);
    lastCollectionDate.setDate(lastCollectionDate.getDate() - Math.floor(Math.random() * 14) - 1); // Random day in last 2 weeks
    
    // Only generate next collection date for active customers
    let nextCollection = null;
    if (isActive) {
      const nextCollectionDate = new Date(lastCollectionDate);
      // Next collection should be 7-14 days after last collection and always in the future
      const daysToAdd = Math.floor(Math.random() * 7) + 7; // 7-14 days
      nextCollectionDate.setDate(nextCollectionDate.getDate() + daysToAdd);
      
      // Ensure next collection is always after today
      if (nextCollectionDate <= TODAY) {
        nextCollectionDate.setDate(TODAY.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days from today
      }
      
      nextCollection = formatDate(nextCollectionDate);
    }

    return {
      lastCollection: formatDate(lastCollectionDate),
      nextCollection,
    };
  };

  const name = `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
  const isActive = Math.random() > 0.3;
  const dates = generateDates(isActive);
  const phone = generatePhone();
  
  const emailDomains = [
    'gmail.com',
    'outlook.com',
    'yahoo.com',
    'hotmail.com',
    'icloud.com',
    'proton.me',
    'xtra.co.nz',
    'business.co.nz'
  ];
  const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
  
  // Generate address
  const streetNumber = Math.floor(Math.random() * 300) + 1;
  const streetName = STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)];
  const streetType = STREET_TYPES[Math.floor(Math.random() * STREET_TYPES.length)];
  const suburb = HAMILTON_SUBURBS[Math.floor(Math.random() * HAMILTON_SUBURBS.length)];
  const useServiceAddressForMail = Math.random() > 0.3; // 70% chance of using service address for mail
  
  const generateAddress = () => ({
    street: `${Math.floor(Math.random() * 300) + 1} ${
      STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)]
    } ${STREET_TYPES[Math.floor(Math.random() * STREET_TYPES.length)]}`,
    suburb: HAMILTON_SUBURBS[Math.floor(Math.random() * HAMILTON_SUBURBS.length)],
    city: 'Hamilton',
    postcode: '32' + Math.floor(Math.random() * 100).toString().padStart(2, '0'),
  });
  
  return {
    id: `${index + 1}`,
    code: String(Math.floor(index * (30000 / 1000))).padStart(5, '0'), // Spread codes evenly
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@${domain}`,
    phone,
    status: isActive ? 'active' : 'inactive',
    product: Math.random() > 0.5 ? 'bin' : 'bag',
    frequency: (() => {
      if (Math.random() > 0.5) {
        // For bins
        const frequencies = ['weekly', '2weekly', '4weekly', '8weekly'];
        return frequencies[Math.floor(Math.random() * frequencies.length)];
      } else {
        // For bags
        const frequencies = ['weekly', '2weekly', '4weekly'];
        return frequencies[Math.floor(Math.random() * frequencies.length)];
      }
    })(),
    balance: Math.floor(Math.random() * 191) - 40, // Random number between -40 and 150
    lastCollection: dates.lastCollection,
    nextCollection: dates.nextCollection,
    serviceAddress: {
      street: `${streetNumber} ${streetName} ${streetType}`,
      suburb,
      city: 'Hamilton',
      postcode: '32' + Math.floor(Math.random() * 100).toString().padStart(2, '0'),
    },
    mailingAddress: useServiceAddressForMail ? undefined : generateAddress(),
    useServiceAddressForMail,
  };
});