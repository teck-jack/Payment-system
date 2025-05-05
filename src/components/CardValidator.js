/**
 * Validates a credit card number using the Luhn algorithm
 * @param {string} cardNumber - The credit card number to validate
 * @returns {boolean} - True if the card number is valid
 */
export const validateCardWithLuhn = (cardNumber) => {
  // Remove all non-digit characters
  const digits = cardNumber.replace(/\D/g, '');

  // Check for valid length (typically between 13 and 19 digits)
  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  // Iterate over the digits from right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  // If the total sum modulo 10 is 0, the card number is valid
  return sum % 10 === 0;
};

  
  /**
   * Returns the credit card type based on the card number
   * @param {string} cardNumber - The credit card number
   * @returns {string} - The credit card type (Visa, Mastercard, etc.)
   */
  export const getCardType = (cardNumber) => {
    // Remove any non-digit characters
    const digits = cardNumber.replace(/\D/g, '');
    
    // Check common card patterns
    if (/^4/.test(digits)) {
      return 'Visa';
    } else if (/^5[1-5]/.test(digits)) {
      return 'Mastercard';
    } else if (/^3[47]/.test(digits)) {
      return 'American Express';
    } else if (/^6(?:011|5)/.test(digits)) {
      return 'Discover';
    } else {
      return 'Unknown';
    }
  };
  
  /**
   * Masks a credit card number for display
   * @param {string} cardNumber - The credit card number to mask
   * @returns {string} - The masked credit card number
   */
  export const maskCardNumber = (cardNumber) => {
    // Remove any non-digit characters
    const digits = cardNumber.replace(/\D/g, '');
    
    if (digits.length < 4) {
      return digits;
    }
    
    // Keep first 4 and last 4 digits visible, mask the rest
    const firstFour = digits.substring(0, 4);
    const lastFour = digits.substring(digits.length - 4);
    const masked = '•'.repeat(digits.length - 8);
    
    return `${firstFour} ${masked} ${lastFour}`;
  };
  
  /**
   * Validates if expiry date is in the future
   * @param {string} month - Expiry month (1-12)
   * @param {string} year - Expiry year (YYMM format)
   * @returns {boolean} - True if the date is valid and in the future
   */
  export const validateExpiryDate = (month, year) => {
    const currentDate = new Date();
    const expiryDate = new Date();
    
    // Convert to numbers and handle two-digit year format
    const expiryMonth = parseInt(month, 10);
    let expiryYear = parseInt(year, 10);
    
    // If year is in YY format, convert to YYYY
    if (expiryYear < 100) {
      expiryYear += 2000;
    }
    
    // Set the expiry date to the last day of the expiry month
    expiryDate.setFullYear(expiryYear, expiryMonth, 0);
    
    // Card is expired if the expiry date is in the past
    return expiryDate > currentDate;
  };
  
  /**
   * Validates CVV based on card type
   * @param {string} cvv - The CVV code
   * @param {string} cardType - The credit card type
   * @returns {boolean} - True if the CVV is valid for the card type
   */
  export const validateCVV = (cvv, cardType) => {
    const cvvDigits = cvv.replace(/\D/g, '');
    
    // American Express uses 4-digit CVV, others use 3-digit
    if (cardType === 'American Express') {
      return cvvDigits.length === 4;
    }
    
    return cvvDigits.length === 3;
  };