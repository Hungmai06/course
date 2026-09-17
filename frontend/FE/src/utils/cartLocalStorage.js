
const CART_KEY = 'cart';

export function clearLocalCart() {
  localStorage.removeItem(CART_KEY);
  const event = new CustomEvent('cartUpdated', { detail: { cart: { items: [], totalPrice: 0 } } });
  window.dispatchEvent(event);
}

export const clearCart = clearLocalCart;

export const getLocalCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { items: [], totalPrice: 0 };
    const cart = JSON.parse(raw);
    if (cart && typeof cart === 'object' && Array.isArray(cart.items)) {
      return cart;
    }
    return { items: [], totalPrice: 0 };
  } catch {
    return { items: [], totalPrice: 0 };
  }
};

export const saveLocalCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const event = new CustomEvent('cartUpdated', { detail: { cart } });
  window.dispatchEvent(event);
};

export const addToLocalCart = (course) => {
  const cart = getLocalCart();
  const courseId = course.id || course.courseId;
  const isFullCourse = Boolean(course.isFullCourse || String(courseId) === '-1' || String(courseId) === '854');
  const existing = cart.items.find(item => 
    String(item.courseId) === String(courseId) || 
    (isFullCourse && (item.isFullCourse || String(item.courseId) === '-1' || String(item.courseId) === '854'))
  );
  const freshPrice = course.newPrice || course.price || 0;
  if (existing) {
    existing.quantity = (existing.quantity || 0) + (course.quantity || 1);
    if (freshPrice > 0) existing.price = freshPrice;
    if (course.name || course.courseName) existing.courseName = course.name || course.courseName;
    existing.isFullCourse = isFullCourse;
  } else {
    cart.items.push({
      courseId,
      courseName: course.name || course.courseName || '',
      price: freshPrice,
      imageUrl: course.avatar || course.thumbnail || '',
      quantity: course.quantity || 1,
      isFullCourse
    });
  }
  cart.totalPrice = (cart.items || []).reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);
  saveLocalCart(cart);
};

