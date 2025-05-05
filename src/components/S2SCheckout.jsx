import React, { useState } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { initiatePayment } from '../services/api';
import { validateCardWithLuhn, validateExpiryDate } from './CardValidator';
import { generateUUID, getAvailableCurrencies } from '../utils/helpers';

const S2SCheckout = () => {
  const { addOrder } = useOrders();
  const [isLoading, setIsLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cardCVC: '',
    amount: '',
    currency: 'USD'
  });
  
  // Form validation errors
  const [errors, setErrors] = useState({});
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces for better readability
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\D/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim();
      
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear the specific error when the field is being edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    // Validate required fields
    if (!formData.cardHolderName.trim()) {
      newErrors.cardHolderName = 'Cardholder name is required';
    }
    
    // Validate card number with Luhn algorithm
    const cardNumberDigits = formData.cardNumber.replace(/\D/g, '');
    if (!cardNumberDigits) {
      newErrors.cardNumber = 'Card number is required';
    } else if (!validateCardWithLuhn(cardNumberDigits)) {
      newErrors.cardNumber = 'Invalid card number';
    }
    
    // Validate expiry date
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'Expiry month is required';
    } else if (isNaN(formData.expiryMonth) || parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) {
      newErrors.expiryMonth = 'Invalid month';
    }
    
    if (!formData.expiryYear) {
      newErrors.expiryYear = 'Expiry year is required';
    } else if (isNaN(formData.expiryYear) || formData.expiryYear.length !== 4) {
      newErrors.expiryYear = 'Enter 4-digit year';
    }
    
    if (formData.expiryMonth && formData.expiryYear && !validateExpiryDate(formData.expiryMonth, formData.expiryYear)) {
      newErrors.expiryYear = 'Card has expired';
    }
    
    // Validate CVV
    if (!formData.cardCVC) {
      newErrors.cardCVC = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cardCVC)) {
      newErrors.cardCVC = 'Invalid CVV';
    }
    
    // Validate amount
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate a unique order ID
      const orderId = generateUUID();
      
      // Prepare payment data
      const paymentData = {
        orderId,
        cardHolderName: formData.cardHolderName,
        cardNumber: formData.cardNumber.replace(/\D/g, ''),
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cardCVC: formData.cardCVC,
        amount: parseFloat(formData.amount),
        currency: formData.currency
      };
      
      // Add order to context with initial Pending status
      addOrder({
        ...paymentData,
        status: 'Pending',
        date: new Date().toISOString()
      });
      
      // Send payment request to API
      const response = await initiatePayment(paymentData);
      
      if (response.redirect_url) {
        setRedirectUrl(response.redirect_url);
        
        // Simulate redirect and response
        setTimeout(async () => {
          try {
            // In a real app, this would be the response from the redirect
            const statusResponse = { message: "Payment processed", status: "Success" };
            setPaymentStatus(statusResponse.status);
          } catch (error) {
            console.error('Error checking payment status:', error);
            setPaymentStatus('Failed');
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setErrors({ submission: 'Payment processing failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset the form
  const resetForm = () => {
    setFormData({
      cardHolderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cardCVC: '',
      amount: '',
      currency: 'USD'
    });
    setErrors({});
    setRedirectUrl(null);
    setPaymentStatus(null);
  };
  
  // Available currencies
  const currencies = getAvailableCurrencies();
  if (redirectUrl) {
    return (
      <div className="text-center py-8">
        {!paymentStatus ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Processing Payment</h3>
            <p className="text-gray-600">Please wait while we process your payment...</p>
          </>
        ) : (
          <div className="py-8">
            <div
              className={`mb-6 p-4 rounded-lg flex items-center justify-center ${
                paymentStatus === 'Success' ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              {paymentStatus === 'Success' ? (
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
              <span
                className={`ml-2 text-lg font-medium ${
                  paymentStatus === 'Success' ? 'text-green-700' : 'text-red-700'
                }`}
              >
                Payment {paymentStatus === 'Success' ? 'Successful' : 'Failed'}
              </span>
            </div>
  
            <p className="text-gray-600 mb-6">
              {paymentStatus === 'Success'
                ? 'Your payment has been successfully processed.'
                : 'There was an issue processing your payment. Please try again.'}
            </p>
  
            <button
              onClick={resetForm}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              Make Another Payment
            </button>
          </div>
        )}
      </div>
    );
  }
  

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submission && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
          {errors.submission}
        </div>
      )}
      
      {/* Card Holder Name */}
      <div>
        <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name
        </label>
        <input
          type="text"
          id="cardHolderName"
          name="cardHolderName"
          value={formData.cardHolderName}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            errors.cardHolderName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="John Doe"
        />
        {errors.cardHolderName && (
          <p className="mt-1 text-sm text-red-600">{errors.cardHolderName}</p>
        )}
      </div>
      
      {/* Card Number */}
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Card Number
        </label>
        <input
          type="text"
          id="cardNumber"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
            errors.cardNumber ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="4111 1111 1111 1111"
          maxLength="19"
        />
        {errors.cardNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
        )}
      </div>
      
      {/* Expiry Date and CVV */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Month
          </label>
          <select
            id="expiryMonth"
            name="expiryMonth"
            value={formData.expiryMonth}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Month</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {month.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
          {errors.expiryMonth && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryMonth}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Year
          </label>
          <input
            type="text"
            id="expiryYear"
            name="expiryYear"
            value={formData.expiryYear}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.expiryYear ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="2025"
            maxLength="4"
          />
          {errors.expiryYear && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryYear}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="cardCVC" className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            type="password"
            id="cardCVC"
            name="cardCVC"
            value={formData.cardCVC}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.cardCVC ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="123"
            maxLength="4"
          />
          {errors.cardCVC && (
            <p className="mt-1 text-sm text-red-600">{errors.cardCVC}</p>
          )}
        </div>
      </div>
      
      {/* Amount and Currency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
              errors.amount ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="100.00"
            step="0.01"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.name} ({currency.code})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 transition-colors'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            'Pay Now'
          )}
        </button>
      </div>
    </form>
  );

};

export default S2SCheckout;