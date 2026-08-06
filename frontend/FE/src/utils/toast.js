import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function showToast(message, type) {
  let t = type;
  if (!t) {
    if (typeof message === 'string') {
      const msg = message.toLowerCase();
      if (msg.startsWith('✅') || msg.includes('thành công')) t = 'success';
      else if (msg.startsWith('❌') || msg.includes('lỗi') || msg.includes('không thể')) t = 'error';
      else if (msg.startsWith('⚠') || msg.includes('cảnh báo')) t = 'warning';
      else t = 'info';
    } else {
      t = 'info';
    }
  }

  switch (t) {
    case 'success':
      toast.success(String(message));
      break;
    case 'error':
      toast.error(String(message));
      break;
    case 'warning':
      toast.warn(String(message));
      break;
    default:
      toast.info(String(message));
  }
}
