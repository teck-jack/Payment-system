
const responseCache = {};
const pendingRequests = {};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Cache status tracking for orders - only poll if necessary
const orderStatusCache = {
  // Track final statuses that don't need polling
  finalStatuses: ['Success', 'Failed']
};

const apiCacheService = {
  /**
   * Make a cached API request
   * 
   * @param {string} url - The API URL to fetch
   * @param {Object} options - Fetch options
   * @param {boolean} forceRefresh - Force a fresh request ignoring cache
   * @param {number} cacheTime - Custom cache time in milliseconds
   * @returns {Promise<Object>} - API response
   */
  fetchWithCache: async (url, options = {}, forceRefresh = false, cacheTime = CACHE_EXPIRATION) => {
    const cacheKey = url + JSON.stringify(options);
    
    // Return cached response if available and not forcing refresh
    if (!forceRefresh && responseCache[cacheKey] && responseCache[cacheKey].expiry > Date.now()) {
      return responseCache[cacheKey].data;
    }
    
    // Return pending request if one is already in progress for this URL
    if (pendingRequests[cacheKey]) {
      return pendingRequests[cacheKey];
    }
    
    // Make new request and store as pending
    pendingRequests[cacheKey] = fetch(url, options)
      .then(response => response.json())
      .then(data => {
        // Cache the response
        responseCache[cacheKey] = {
          data,
          expiry: Date.now() + cacheTime
        };
        
        // Remove from pending requests
        delete pendingRequests[cacheKey];
        return data;
      })
      .catch(error => {
        // Remove from pending requests on error
        delete pendingRequests[cacheKey];
        throw error;
      });
    
    return pendingRequests[cacheKey];
  },

  /**
   * Fetch transaction status with caching
   * 
   * @param {string} orderId - The order ID to fetch status for
   * @param {boolean} forceRefresh - Force refresh ignoring cache
   * @returns {Promise<Object>} - Status response
   */
  fetchTransactionStatus: async (orderId, forceRefresh = false) => {
    const apiUrl = `https://api.vancipay.com/redirect?orderId=${orderId}`;
    
    // Special handling for transaction status
    const response = await apiCacheService.fetchWithCache(
      apiUrl, 
      {}, 
      forceRefresh,
      // Use shorter cache time for pending statuses
      orderStatusCache[orderId]?.status === 'Pending' ? 5000 : CACHE_EXPIRATION
    );
    
    // Update status cache
    if (response && response.status) {
      orderStatusCache[orderId] = {
        status: response.status,
        message: response.message || '',
        lastUpdated: Date.now(),
        // Flag if this is a final status
        isFinal: orderStatusCache.finalStatuses.includes(response.status)
      };
    }
    
    return response;
  },
  
  /**
   * Check if an order needs polling
   * 
   * @param {string} orderId - The order ID to check
   * @returns {boolean} - Whether polling is needed
   */
  shouldPollStatus: (orderId) => {
    const orderCache = orderStatusCache[orderId];
    
    // Always poll if we don't have cached data
    if (!orderCache) return true;
    
    // Don't poll if we already have a final status
    if (orderCache.isFinal) return false;
    
    // Don't poll if the status is not 'Pending'
    if (orderCache.status !== 'Pending') return false;
    
    return true;
  },
  
  /**
   * Get cached status for an order
   * 
   * @param {string} orderId - The order ID to get status for
   * @returns {Object|null} - Cached status or null
   */
  getCachedStatus: (orderId) => {
    return orderStatusCache[orderId] || null;
  },
  
  /**
   * Clear cache for a specific order
   * 
   * @param {string} orderId - Order ID to clear cache for
   */
  clearOrderCache: (orderId) => {
    const apiUrl = `https://api.vancipay.com/redirect?orderId=${orderId}`;
    const cacheKey = apiUrl + JSON.stringify({});
    
    delete responseCache[cacheKey];
    delete orderStatusCache[orderId];
  },
  
  /**
   * Clear entire cache
   */
  clearAllCache: () => {
    Object.keys(responseCache).forEach(key => delete responseCache[key]);
    Object.keys(orderStatusCache).forEach(key => {
      if (key !== 'finalStatuses') delete orderStatusCache[key];
    });
  }
};

export default apiCacheService;