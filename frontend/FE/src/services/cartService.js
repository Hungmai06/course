import axios from "./axiosInstance";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/cart`;

// Remove force localStorage - use based on auth state
const FORCE_LOCAL_STORAGE = false;

// Local storage functions
const getLocalCart = () => {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    return JSON.parse(savedCart);
  }
  
  // Initialize empty cart structure
  return {
    items: [],
    totalPrice: 0
  };
};

const saveLocalCart = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

const addToLocalCart = (courseData) => {
  const cart = getLocalCart();
  const newCourseId = courseData.id;
  const existingItemIndex = cart.items.findIndex(item => {
    const isMatch = item.courseId === newCourseId;
    return isMatch;
  });
  
  
  
  if (existingItemIndex >= 0) {
   
  
    cart.items[existingItemIndex].quantity += 1;
   
  } else {
  
  
    const newItem = {
      courseId: courseData.id,
      courseName: courseData.name,
      price: courseData.newPrice || courseData.price,
      imageUrl: courseData.avatar || courseData.thumbnail,
      avatar: courseData.avatar || courseData.thumbnail,
      nameAuthor: courseData.nameAuthor || courseData.author || courseData.instructor || '',
      nameCategory: courseData.category || courseData.nameCategory || '',
      rating: courseData.rating || 4.5,
      ratingCount: courseData.ratingCount || 124,
      studentCount: courseData.studentCount || 1234,
      quantity: 1
    };
   
    cart.items.push(newItem);
  }
  
  // Recalculate total
  cart.totalPrice = calculateTotal(cart.items);

  saveLocalCart(cart);
  
  
  const event = new CustomEvent('cartUpdated', { detail: { cart: cart } });
  window.dispatchEvent(event);

};

const removeFromLocalCart = (courseId) => {
  const cart = getLocalCart();
  cart.items = cart.items.filter(item => String(item.courseId) !== String(courseId));
  cart.totalPrice = calculateTotal(cart.items);
  saveLocalCart(cart);
  
  // Dispatch event to update UI
  const event = new CustomEvent('cartUpdated', { detail: { cart: cart } });
  window.dispatchEvent(event);
};

const updateLocalCartQuantity = (courseId, quantityChange) => {
  const cart = getLocalCart();
  const itemIndex = cart.items.findIndex(item => String(item.courseId) === String(courseId));
  
  if (itemIndex >= 0) {
    cart.items[itemIndex].quantity += quantityChange;
    
    // Remove item if quantity <= 0
    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }
    
    cart.totalPrice = calculateTotal(cart.items);
    saveLocalCart(cart);
    
    // Dispatch event to update UI
    const event = new CustomEvent('cartUpdated', { detail: { cart: cart } });
    window.dispatchEvent(event);
  }
};

const getLocalCartCount = () => {
  const cart = getLocalCart();
  return cart.items.reduce((total, item) => total + item.quantity, 0);
};

// Function to clear localStorage cart when user logs in
const clearLocalCart = () => {
  localStorage.removeItem('cart');

  const event = new CustomEvent('cartUpdated', { detail: { cart: { items: [], totalPrice: 0 } } });
  window.dispatchEvent(event);
};


const isUserLoggedIn = () => {
  const accessToken = localStorage.getItem('accessToken');
  const userInfo = localStorage.getItem('userInfo');
  const result = !!(accessToken && userInfo);

  return result;
};

const getLoggedInUser = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    const user = userInfo ? JSON.parse(userInfo) : null;

    return user;
  } catch (error) {
  
    return null;
  }
};

const cartService = {
  clearLocalCart,
  addToCart: async (courseData) => {
    const isLoggedIn = isUserLoggedIn();
    if (FORCE_LOCAL_STORAGE || !isLoggedIn) {
      addToLocalCart(courseData);
      return;
    }
    if (!isLoggedIn) {
      addToLocalCart(courseData);
      return;
    }
    const user = getLoggedInUser();
    const userId = user?.id;
    const hasValidUserId = user && (userId !== null && userId !== undefined);
    if (hasValidUserId) {
      try {
        const payload = {
          courseId: courseData.id || courseData.courseId,
          quantity: courseData.quantity || 1
        };
        const response = await axios.post(`${API_URL}/${userId}`, payload);
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
      } catch (error) {
        addToLocalCart(courseData);
      }
    } else {
      addToLocalCart(courseData);
    }
  },
  getCart: async (userIdParam) => {
    const isLoggedIn = isUserLoggedIn();
    if (FORCE_LOCAL_STORAGE || !isLoggedIn) {
      return { data: { data: getLocalCart() } };
    }
    if (!isLoggedIn) {
      return { data: { data: getLocalCart() } };
    }
    const user = getLoggedInUser();
    const userId = user?.id;
    const hasValidUserId = user && (userId !== null && userId !== undefined);
    if (hasValidUserId) {
      try {
        const response = await axios.get(`${API_URL}/${userId}`);
        return response;
      } catch (error) {
        return { data: { data: getLocalCart() } };
      }
    } else {
      return { data: { data: getLocalCart() } };
    }
  },
  updateCartItem: async (userId, courseId, quantityChange) => {
    if (FORCE_LOCAL_STORAGE || !isUserLoggedIn()) {
      updateLocalCartQuantity(courseId, quantityChange);
      return;
    }
    if (!isUserLoggedIn()) {
      updateLocalCartQuantity(courseId, quantityChange);
      return;
    }
    const user = getLoggedInUser();
    const actualUserId = user?.id;
    const hasValidUserId = user && (actualUserId !== null && actualUserId !== undefined);
    if (hasValidUserId) {
      try {
        await axios.put(`${API_URL}/${actualUserId}/update/${courseId}`, null, {
          params: { quantity: quantityChange }
        });
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
      } catch (error) {
        updateLocalCartQuantity(courseId, quantityChange);
      }
    } else {
      updateLocalCartQuantity(courseId, quantityChange);
    }
  },
  removeCartItem: async (userId, courseId) => {
    if (FORCE_LOCAL_STORAGE || !isUserLoggedIn()) {
      removeFromLocalCart(courseId);
      return;
    }
    if (!isUserLoggedIn()) {
      removeFromLocalCart(courseId);
      return;
    }
    const user = getLoggedInUser();
    const actualUserId = user?.id;
    const hasValidUserId = user && (actualUserId !== null && actualUserId !== undefined);
    if (hasValidUserId) {
      try {
        await axios.delete(`${API_URL}/${actualUserId}/delete/${courseId}`);
        const event = new CustomEvent('cartUpdated');
        window.dispatchEvent(event);
      } catch (error) {
        removeFromLocalCart(courseId);
      }
    } else {
      removeFromLocalCart(courseId);
    }
  },
  getCartCount: async () => {
    if (FORCE_LOCAL_STORAGE || !isUserLoggedIn()) {
      return getLocalCartCount();
    }
    if (!isUserLoggedIn()) {
      return getLocalCartCount();
    }
    const user = getLoggedInUser();
    const actualUserId = user?.id;
    const hasValidUserId = user && (actualUserId !== null && actualUserId !== undefined);
    if (hasValidUserId) {
      try {
        const response = await axios.get(`${API_URL}/${actualUserId}`);
        const cart = response.data.data;
        return cart.items.reduce((total, item) => total + item.quantity, 0);
      } catch (error) {
        return getLocalCartCount();
      }
    } else {
      return getLocalCartCount();
    }
  }
};

export default cartService;
