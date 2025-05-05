
// Initialize the payment via server-to-server integration
export const initiatePayment = async (paymentData) => {
    try {
      const response = await fetch('https://api.vancipay.com/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });
  
      if (!response.ok) {
        throw new Error(`Payment initiation failed: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error initiating payment:', error);
      throw error;
    }
  };
  
    // Check payment status from redirect URL

  export const checkPaymentStatus = async () => {
    try {
      const response = await fetch('https://api.vancipay.com/redirect');
      
      if (!response.ok) {
        throw new Error(`Payment status check failed: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  };
  
  // Mock function to simulate real-time status updates
  // In a real application, this would likely use WebSockets or polling
  export const monitorPaymentStatus = (orderId, onStatusChange) => {
    const statusCheckDelay = 3000; 
 
    let currentStatus = 'Pending';
    onStatusChange(currentStatus);
    
    // Simulate a payment processing flow

    const statusTimer = setTimeout(async () => {
      try {
         
        // In a real app, you would call an API endpoint with the orderId
        const response = await checkPaymentStatus();
        
        if (response && response.status) {
          currentStatus = response.status;
          onStatusChange(currentStatus);
        }
      } catch (error) {

          // If there's an error, mark as failed

        currentStatus = 'Failed';
        onStatusChange(currentStatus);
      }
    }, statusCheckDelay);
    
     
    // Return a cleanup function to cancel the timer if needed
    return () => {
      clearTimeout(statusTimer);
    };
  };


