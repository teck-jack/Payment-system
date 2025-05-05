import React, { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const IframePayment = () => {
  const iframeRef = useRef(null);
  const [orderId, setOrderId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate a new order ID when component mounts
  useEffect(() => {
    setOrderId(`order_${uuidv4()}`);
  }, []);

  // Send payment data to iframe when ready
  const sendPaymentData = useCallback((data) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        orderId: orderId,
        cardholder: data.cardholder || '',
        cardNumber: data.cardNumber || '',
        expiryDate: data.expiryDate || '',
        cvc: data.cvc || '',
        amount: data.amount || '',
        currency: data.currency || 'USD',
        showForm: 1
      }, 'https://celalios.com');
    }
  }, [orderId]);

  // Handle messages from iframe
  const handleMessage = useCallback((event) => {
    // Security check - verify message origin
    if (event.origin !== 'https://celalios.com') return;

    const data = event.data;
    
    if (data.type === 'iframeReady') {
      // Iframe is loaded and ready to receive data
      setIsLoading(false);
    } 
    else if (data.type === 'paymentProcessing') {
      // Payment submission received
      setIsLoading(true);
      setPaymentStatus('processing');
      setError(null);
    }
    else if (data.type === 'paymentStatus') {
      // Final payment status update
      setIsLoading(false);
      setPaymentStatus(data.status);
      
      if (data.status === 'failed') {
        setError(data.message || 'Payment failed. Please try again.');
      }
    }
    else if (data.type === 'validationError') {
      setError(data.message || 'Invalid payment details');
    }
  }, []);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  // Initialize payment when iframe loads
  const handleIframeLoad = () => {
    setIsLoading(true);
    // Send empty data to show the form
    sendPaymentData({});
  };

  // Retry payment handler
  const handleRetry = () => {
    setPaymentStatus(null);
    setError(null);
    setOrderId(`order_${uuidv4()}`);
    iframeRef.current.src = iframeRef.current.src; // Reload iframe
  };

  return (
    <div className="payment-container">
      <h2>Secure Payment</h2>
      
      {paymentStatus === 'success' ? (
        <div className="success-message">
          <h3>Payment Successful!</h3>
          <p>Order ID: {orderId}</p>
          <button onClick={() => window.location.reload()}>Make Another Payment</button>
        </div>
      ) : (
        <>
          {error && (
            <div className="error-message">
              {error}
              {paymentStatus !== 'processing' && (
                <button onClick={handleRetry}>Try Again</button>
              )}
            </div>
          )}

          {isLoading && paymentStatus !== 'processing' && (
            <div className="loading">Loading payment form...</div>
          )}

          {paymentStatus === 'processing' && (
            <div className="processing-message">
              Processing your payment...
              <div className="spinner"></div>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src="https://celalios.com/"
            title="Payment Form"
            className={`payment-iframe ${isLoading ? 'loading' : ''}`}
            sandbox="allow-forms allow-scripts allow-same-origin"
            onLoad={handleIframeLoad}
            style={{
              width: "100%",
              height: "50vh",
              minHeight: "400px",
              border: "1px solid #e1e1e1",
              borderRadius: "8px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              display: paymentStatus ? "none" : "block"
            }}
          />
        </>
      )}
    </div>
  );
};

export default IframePayment;