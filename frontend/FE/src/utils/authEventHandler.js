// authEventHandler.js - Handle authentication events
import cartService from '../services/cartService';

// Function to handle user login - clear localStorage cart and switch to database
export const handleUserLogin = () => {
  //
  
  // Clear localStorage cart as requested
  cartService.clearLocalCart();
  
  // Dispatch event to update cart UI
  const event = new CustomEvent('cartUpdated');
  window.dispatchEvent(event);
  
  //
};

// Function to handle user logout - switch back to localStorage
export const handleUserLogout = () => {
  //
  
  // Dispatch event to update cart UI
  const event = new CustomEvent('cartUpdated');
  window.dispatchEvent(event);
  
  //
};

// Initialize auth event listeners
export const initAuthEvents = () => {
  // Listen for login events
  window.addEventListener('userLoggedIn', handleUserLogin);
  
  // Listen for logout events
  window.addEventListener('userLoggedOut', handleUserLogout);
  
  //
};

// Cleanup auth event listeners
export const cleanupAuthEvents = () => {
  window.removeEventListener('userLoggedIn', handleUserLogin);
  window.removeEventListener('userLoggedOut', handleUserLogout);
  
  //
};
