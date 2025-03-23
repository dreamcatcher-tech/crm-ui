export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const weekday = d.toLocaleString('en-US', { weekday: 'short' });
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  return `${weekday} ${day}-${month}-${year}`;
}

export function parseDate(dateStr: string): Date {
  // Skip the weekday part and parse the rest
  const [_, day, month, year] = dateStr.split(/[\s-]/);
  const monthIndex = new Date(`${month} 1, 2000`).getMonth();
  return new Date(parseInt(year), monthIndex, parseInt(day));
}

export function getNextAvailableDate(): string {
  const today = new Date();
  const nextAvailable = new Date(today);
  
  // Add 2 business days to today
  let daysToAdd = 2;
  while (daysToAdd > 0) {
    nextAvailable.setDate(nextAvailable.getDate() + 1);
    // Skip weekends
    if (nextAvailable.getDay() !== 0 && nextAvailable.getDay() !== 6) {
      daysToAdd--;
    }
  }
  
  return formatDate(nextAvailable);
}

export function formatPhoneNumber(input: string): string {
  const digits = input.replace(/\D/g, '');
  
  // Handle mobile numbers (02X)
  if (digits.startsWith('02')) {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }
  
  // Handle landline numbers (0X)
  if (digits.startsWith('0')) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 9)}`;
  }
  
  return digits;
}

export function isValidPhoneNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  
  // Mobile number validation (02X XXXX XXXX)
  if (digits.startsWith('02')) {
    return digits.length === 10;
  }
  
  // Landline validation (0X XXX XXXX)
  if (digits.startsWith('0')) {
    if (digits.length !== 9) return false;
    // Valid area codes are 3,4,6,7,9
    const areaCode = digits[1];
    return ['3','4','6','7','9'].includes(areaCode);
  }
  
  return false;
}