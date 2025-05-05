import React, { useState } from 'react';
import S2SCheckout from './S2SCheckout';
import IframeCheckout from './IframeCheckout';

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState('s2s');

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h2>
        
        {/* Payment Method Selection */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setPaymentMethod('s2s')}
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              paymentMethod === 's2s'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Server-to-Server Payment
          </button>
          
          <button
            onClick={() => setPaymentMethod('iframe')}
            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
              paymentMethod === 'iframe'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Iframe Payment
          </button>
        </div>
        
        {/* Payment Form Based on Selected Method */}
        <div className="mt-6">
          {paymentMethod === 's2s' ? (
            <S2SCheckout />
          ) : (
            <IframeCheckout />
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;