
export const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  
  // Format currency display
  export const formatCurrency = (amount, currency) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    });
    
    return formatter.format(amount);
  };
  
  // Mask a CVV for display
  export const maskCVV = (cvv) => {
    return '•'.repeat(cvv.length);
  };

  export const maskCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    const sanitized = cardNumber.replace(/\D/g, '');
    const lastFour = sanitized.slice(-4);
    return '**** **** **** ' + lastFour;
  };
  
  // Format card expiry date
  export const formatExpiryDate = (month, year) => {
    const formattedMonth = month.padStart(2, '0');
    return `${formattedMonth}/${year}`;
  };
  
  // Get status color for UI display
  export const getStatusColor = (status) => {
    switch (status) {
      case 'Success':
        return 'text-green-600 bg-green-100';
      case 'Failed':
        return 'text-red-600 bg-red-100';
      case 'Pending':
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };
  
  // Get available currencies for the dropdown
  export const getAvailableCurrencies = () => {
    return [
      { code: 'USD', name: 'US Dollar' },
      { code: 'EUR', name: 'Euro' },
      { code: 'GBP', name: 'British Pound' },
      { code: 'JPY', name: 'Japanese Yen' },
      { code: 'CAD', name: 'Canadian Dollar' },
      { code: 'AUD', name: 'Australian Dollar' },
    ];
  };
  
  // Format date for display
  export const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };
  
  // Check if all required fields are filled
  export const validateRequiredFields = (data, requiredFields) => {
    return requiredFields.every(field => {
      const value = data[field];
      return value !== undefined && value !== null && value.trim() !== '';
    });
  };

  export const validateCardWithLuhn = (cardNumber) => {
    const cleaned = cardNumber.replace(/\s+/g, '');
    
    // Check if it's all digits and has valid length
    if (!/^\d+$/.test(cleaned)) return false; // Added missing parenthesis here
    if (cleaned.length < 13 || cleaned.length > 19) return false;
    
    let sum = 0;
    let shouldDouble = false;
    
    // Loop from right to left
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i), 10);
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  };