import React, { useState, useEffect, useCallback } from 'react';
import { maskCardNumber, maskCVV, formatCurrency, formatExpiryDate, getStatusColor, formatDate } from '../utils/helpers';
import apiCacheService from '../utils/apiCacheService';

const OrderCard = ({ order, onStatusUpdate }) => {
  const {
    orderId,
    cardHolderName,
    cardNumber,
    expiryMonth,
    expiryYear,
    cardCVC,
    amount,
    currency,
    status: initialStatus,
    date
  } = order;

  // State for transaction status and message
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Format card details for display
  const maskedCardNumber = maskCardNumber(cardNumber);
  const maskedCVV = maskCVV(cardCVC);
  const formattedExpiry = formatExpiryDate(expiryMonth, expiryYear);
  const formattedAmount = formatCurrency(amount, currency);
  const statusClasses = getStatusColor(status);
  const formattedDate = formatDate(date);

  // Function to fetch transaction status from API using cache service
  const fetchTransactionStatus = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      
      // Check cache first
      const cachedStatus = apiCacheService.getCachedStatus(orderId);
      if (cachedStatus && !forceRefresh) {
        setStatus(cachedStatus.status);
        setMessage(cachedStatus.message || '');
        setIsLoading(false);
        return;
      }
      
      // Fetch from API using cache service
      const data = await apiCacheService.fetchTransactionStatus(orderId, forceRefresh);
      
      if (data && data.status) {
        // Update component state
        setStatus(data.status);
        setMessage(data.message || '');
        
        // Notify parent component if status changed
        if (data.status !== status && onStatusUpdate) {
          onStatusUpdate(orderId, data.status, data.message || '');
        }
      }
    } catch (error) {
      console.error('Error fetching transaction status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, status, onStatusUpdate]);

  // Load initial status on component mount - using cache if available
  useEffect(() => {
    fetchTransactionStatus(false);
  }, [fetchTransactionStatus]);

  // Set up polling only for pending transactions that need it
  useEffect(() => {
    let intervalId;
    
    if (status === 'Pending' && orderId && isOlderThan(30, date)) {
      intervalId = setInterval(() => {
        fetchTransactionStatus(true);
      }, 10000); // Poll every 10 seconds
    }
    
    
    // Clear interval on component unmount or when status changes
    return () => clearInterval(intervalId);
}, [status, orderId, date, fetchTransactionStatus]);

function isOlderThan(minutes, dateString) {
  const orderDate = new Date(dateString);
  const now = new Date();
  return (now - orderDate) > (minutes * 60 * 1000);
}

  // Get the last checked time from cache
  const getLastCheckedTime = () => {
    const cachedStatus = apiCacheService.getCachedStatus(orderId);
    if (cachedStatus && cachedStatus.lastUpdated) {
      const timeAgo = Math.floor((Date.now() - cachedStatus.lastUpdated) / 1000);
      if (timeAgo < 60) {
        return `${timeAgo}s ago`;
      } else if (timeAgo < 3600) {
        return `${Math.floor(timeAgo / 60)}m ago`;
      } else {
        return `${Math.floor(timeAgo / 3600)}h ago`;
      }
    }
    return '';
  };

  // Handle manual refresh
  const handleRefresh = () => fetchTransactionStatus(true);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-5 border-b border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{cardHolderName}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses}`}>
            {status}
          </span>
        </div>
        <p className="text-gray-500 text-sm">
          {formattedDate}
        </p>
      </div>
      
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Card Number</p>
            <p className="font-medium">{maskedCardNumber}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Expiry Date</p>
            <p className="font-medium">{formattedExpiry}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">CVV</p>
            <p className="font-medium">{maskedCVV}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500">Amount</p>
            <p className="font-medium">{formattedAmount}</p>
          </div>
        </div>
        
        {/* Display transaction message if available */}
        {message && (
          <div className="mt-4 pt-2">
            <p className={`text-sm ${status === 'Success' ? 'text-green-600' : status === 'Failed' ? 'text-red-600' : 'text-yellow-600'}`}>
              {message}
            </p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-xs text-gray-500">Order ID: {orderId.substring(0, 8)}...</p>
              {getLastCheckedTime() && (
                <p className="text-xs text-gray-400 mt-1">Last checked: {getLastCheckedTime()}</p>
              )}
            </div>
            
            <div className="flex items-center">
              {/* Animation for Pending status */}
              {status === 'Pending' && (
                <div className="flex items-center mr-3">
                  <span className="text-sm text-yellow-600 mr-2">Processing</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-150"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
                  </div>
                </div>
              )}
              
              {/* Refresh button for manual updates */}
              <button 
                onClick={handleRefresh} 
                disabled={isLoading}
                className={`text-blue-500 hover:text-blue-700 text-sm focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Refresh status"
              >
                {!isLoading ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                ) : (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;