import React from "react";
import "./FeatureHighlights.css";

const features = [
  {
    img: "/assets/uytinchatluong.png",
    title: "Uy Tín Chất Lượng",
    desc: "Được kiểm tra khóa và học thử trước khi mua"
  },
  {
    img: "/assets/kichhoatnhanhchongfooter.png",
    title: "Kích Hoạt Nhanh",
    desc: "Kích hoạt khóa học tự động trong vòng 1 - 2 phút"
  },
  {
    img: "/assets/updatelientuc.png",
    title: "Update liên tục",
    desc: "Cập nhật 7-15 khóa học mới hằng tuần"
  },
  {
    img: "/assets/hoconlinetienloi.png",
    title: "Học online tiện lợi",
    desc: "Học online bằng điện thoại hoặc máy tính"
  }
];

const FeatureHighlights = () => (
  <div className="feature-highlights-wrapper">
    <div className="feature-highlights">
      {features.map((f, i) => (
        <div className="feature-card" key={i}>
          <img src={f.img} alt={f.title} className="feature-img" loading="lazy" />
          <div className="feature-info">
            <div className="feature-title">{f.title}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default FeatureHighlights;
