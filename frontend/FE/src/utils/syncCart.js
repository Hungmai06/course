import cartService from "../services/cartService";
import { getLocalCart, clearLocalCart } from "./cartLocalStorage";

export const syncLocalCartToDB = async (userId) => {
  const localCart = getLocalCart();
  if (!localCart.items || localCart.items.length === 0) return;

  try {
    for (const item of localCart.items) {
      // cartService.addToCart expects course-like object with `id` and optional `quantity`
      await cartService.addToCart({ id: item.courseId, quantity: item.quantity });
    }
    clearLocalCart();
  } catch (err) {
    // ignore sync errors for now
  }
};
