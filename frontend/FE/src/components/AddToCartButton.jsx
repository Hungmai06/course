import React from "react";
import cartService from "../services/cartService";
import { addToLocalCart } from "../utils/cartLocalStorage";
import { showToast } from '../utils/toast';

function AddToCartButton({ user, course }) {
  const handleAdd = async () => {
    const payload = {
      courseId: course.id,
      quantity: 1,
      avatar: course.avatar,
      name: course.name,
      price: course.newPrice
    };

    if (user) {
        try {
        await cartService.addToCart(user.id, payload);
        showToast("Đã thêm vào giỏ hàng!", 'success');
      } catch (err) {
        showToast(`Lỗi thêm giỏ hàng: ${err?.message || err}`, 'error');
      }
    } else {
      addToLocalCart(payload);
      showToast("Đã lưu giỏ hàng cục bộ!", 'success');
    }
  };

  return <button onClick={handleAdd}>Thêm vào giỏ hàng</button>;
}

export default AddToCartButton;
