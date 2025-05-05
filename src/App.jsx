import React, { useState } from 'react';
import { OrderProvider } from './contexts/OrderContext';
import Navbar from './components/Navbar';
import Checkout from './components/Checkout';
import OrderHistory from './components/OrderHistory';

function App() {
  const [activeTab, setActiveTab] = useState('checkout');

  return (
    <OrderProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="container mx-auto px-4 py-8">
          {activeTab === 'checkout' ? (
            <Checkout />
          ) : (
            <OrderHistory />
          )}
        </main>
      </div>
    </OrderProvider>
  );
}

export default App;