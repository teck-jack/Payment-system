import { useEffect } from 'react';
import { useOrders } from '../contexts/OrderContext';
import { monitorPaymentStatus } from '../services/api';

/**
 * Custom hook to monitor and update order status in real-time
 * @param {string} orderId - The ID of the order to monitor
 * @returns {object} - The current order with its status
 */
const useOrderStatus = (orderId) => {
  const { getOrderById, updateOrderStatus } = useOrders();
  
  useEffect(() => {
    if (!orderId) return;
    
    // Start monitoring the payment status
    const cleanupMonitor = monitorPaymentStatus(orderId, (newStatus) => {
      // Update the order status in our context when it changes
      updateOrderStatus(orderId, newStatus);
    });
    
    // Clean up the monitoring when component unmounts
    return cleanupMonitor;
  }, [orderId, updateOrderStatus]);
  
  // Return the current order with its up-to-date status
  return getOrderById(orderId);
};

export default useOrderStatus;