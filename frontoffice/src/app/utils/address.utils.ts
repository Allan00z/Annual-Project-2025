export interface AddressComponents {
  street: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface StripeAddressFormat {
  line1: string;
  postal_code: string;
  city: string;
  country: string;
}

/**
 * Parse a French address string into its components
 * @param address - The address string to parse
 * @returns An object containing the address components or null if parsing fails
 */ 
export function parseAddress(address: string): AddressComponents | null {
  if (!address || typeof address !== 'string') {
    return null;
  }

  const addressParts = address.split(', ');
  if (addressParts.length < 2) {
    return null;
  }

  const street = addressParts[0].trim();
  const cityPart = addressParts[1].trim();
  
  const postalCodeMatch = cityPart.match(/(\d{5})/);
  if (!postalCodeMatch) {
    return null;
  }
  
  const postalCode = postalCodeMatch[1];
  const city = cityPart.replace(/^\d{5}\s*/, "").trim();
  
  if (!street || !postalCode || !city) {
    return null;
  }

  return {
    street,
    postalCode,
    city,
    country: 'FR'
  };
}

/**
 * Convert address components to Stripe's address format
 * @param components - The address components to convert
 * @returns An object in Stripe's address format
 */ 
export function toStripeAddressFormat(components: AddressComponents): StripeAddressFormat {
  return {
    line1: components.street,
    postal_code: components.postalCode,
    city: components.city,
    country: components.country
  };
}

/**
 * Format an address into a human-readable string
 * @param components - The address components to format
 * @returns A formatted address string
 */ 
export function formatAddress(components: AddressComponents): string {
  return `${components.street}, ${components.postalCode} ${components.city}`;
}

/**
 * Validates if the provided address components are complete and valid
 * @param components - The address components to validate
 * @returns True if the address is valid, false otherwise
 */ 
export function isValidAddress(components: Partial<AddressComponents>): boolean {
  return !!(
    components.street?.trim() &&
    components.postalCode?.trim() &&
    components.city?.trim() &&
    components.country?.trim() &&
    /^\d{5}$/.test(components.postalCode)
  );
}

/**
 * Normalize an address string by removing extra spaces
 * @param address - The address string to normalize
 * @returns A normalized address string
 */
export function normalizeAddress(address: string): string {
  return address
    .replace(/\s+/g, ' ')
    .trim();
}
