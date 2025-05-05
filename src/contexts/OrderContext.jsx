


import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const OrderContext = createContext();

// Custom hook to use the context
export const useOrders = () => useContext(OrderContext);

// Provider component
export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders from API on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('your-api-endpoint/orders');
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Function to update order status
  const updateOrderStatus = (orderId, newStatus, message) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.orderId === orderId 
          ? { ...order, status: newStatus, message: message } 
          : order
      )
    );
  };

  // Function to add a new order
  const addOrder = (newOrder) => {
    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  // Value to be provided
  const value = {
    orders,
    loading,
    error,
    updateOrderStatus,
    addOrder
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;