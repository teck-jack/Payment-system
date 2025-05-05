import React from 'react';

const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <span className="text-xl font-bold text-gray-800">Payment System</span>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('checkout')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'checkout'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Checkout
            </button>
            
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              Order History
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;