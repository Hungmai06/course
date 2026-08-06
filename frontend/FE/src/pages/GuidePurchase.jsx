import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './GuidePurchase.css';

const steps = [
  {
    title: '1. Chọn khóa học',
    content: 'Duyệt qua danh sách các khóa học có sẵn và chọn khóa học mà bạn quan tâm.',
  },
  {
    title: '2. Thêm vào giỏ hàng',
    content: 'Nhấp vào nút “Thêm vào giỏ hàng” hoặc “Thanh toán ngay” nếu bạn muốn mua ngay khóa học đó.',
  },
  {
    title: '3. Xem giỏ hàng',
    content: 'Nhấp vào biểu tượng giỏ hàng ở góc trên bên phải màn hình để xem các khóa học đã chọn.',
  },
  {
    title: '4. Thanh toán',
    content: 'Nhấp vào nút “Thanh toán ngay” để tiến hành thanh toán.',
  },
  {
    title: '5. Điền thông tin và chọn hình thức thanh toán',
    content: 'Điền đầy đủ thông tin như họ tên, email có dạng abc@gmail.com (Phải đúng vì sai sẽ không nhận được khóa học) nhận khóa học, số điện thoại hỗ trợ. Sau đó chọn phương thức thanh toán và làm theo hướng dẫn.',
  },
  {
    title: '6. Xác nhận mua hàng',
    content: 'Sau khi thanh toán thành công, bạn sẽ được thêm vào khóa học trong vòng 1 - 5 phút và nhận được email xác nhận(Nếu chưa thấy kiểm tra trong mục spam và nếu chưa thấy thì liên hệ admin ).',
  },
  {
    title: '7. Truy cập khóa học',
    content: 'Bạn có thể truy cập khóa học qua ở thông báo gmail nếu không có thì có thể check thư rác hoặc sapm của gmail.',
  },
];

const GuidePurchase = () => {
  return (
    <div className="guide-purchase-container">
      <Navbar />
      <div className="guide-content">
        <div className="guide-header">
          <h1 className="guide-title">Hướng Dẫn Mua Khóa Học</h1>
          <p className="guide-subtitle">
            Làm theo các bước đơn giản dưới đây để sở hữu khóa học yêu thích của bạn
          </p>
        </div>

        <div className="guide-two-col">
          {/* LEFT: Steps */}
          <div className="guide-steps-col">
            <div className="steps-container">
              {steps.map((step, index) => (
                <div key={index} className="step-item">
                  <div className="step-number">{index + 1}</div>
                  <h2 className="step-title">{step.title}</h2>
                  <p className="step-content">{step.content}</p>
                </div>
              ))}
            </div>

            <div className="notice-section">
              <p className="notice-text">
                <strong>Lưu ý:</strong> Nếu có bất kỳ thắc mắc hay gặp lỗi nào về việc mua hàng, vui lòng liên hệ Khóa Học Drive MH qua Zalo: <br />{' '}
                <a
                  href="https://zalo.me/0328028026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zalo-link"
                >
                  0328 028 026
                </a>
              </p>
            </div>
          </div>

          {/* RIGHT: Video */}
          <div className="guide-video-col">
            <div className="guide-video-sticky">
              <h3 className="guide-video-title">🎬 Video Hướng Dẫn</h3>
              <div className="guide-video-wrapper">
                <iframe
                  src="https://www.youtube.com/embed/-10BdCScFUY"
                  title="Hướng dẫn mua khóa học"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="guide-video-note">Xem video để hiểu rõ hơn từng bước mua khóa học</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GuidePurchase;
