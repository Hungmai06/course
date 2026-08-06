
import React, { useRef } from "react";
import "./FloatingSocialButtons.css";

const BUTTONS = [
  {
    id: "facebook-vr",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61566711116017",
    icon: (
      <img
        src="/assets/facebook.png"
        alt="Facebook"
        width={30}
        height={30}
        style={{display: 'block'}}
        draggable="false"
      />
    ),
    circleClass: "fb",
    imgCircleClass: "fb",
    style: { bottom: 110, right: 32, zIndex: 999 },
    rippleBg: "rgba(255, 193, 7, 0.32)",
    mainBg: "#1877F3"
  },
  {
    id: "zalo-vr",
    label: "Zalo",
    href: "https://zalo.me/0328028026",
    icon: (
      <img
        src="/assets/zalo.png"
        alt="Zalo"
        width={30}
        height={30}
        style={{display: 'block'}}
        draggable="false"
      />
    ),
    circleClass: "zalo",
    imgCircleClass: "zalo",
    style: { bottom: 20, right: 32, zIndex: 999 },
    rippleBg: "rgba(33, 150, 243, 0.22)",
    mainBg: "#2196F3"
  }
];

const FloatingSocialButtons = () => {
  // refs cho từng button
  const btnRefs = useRef([]);

  const handleClick = (idx) => {
    const btn = btnRefs.current[idx];
    btn.classList.remove('pop-animate');
    void btn.offsetWidth;
    btn.classList.add('pop-animate');
  };
  const handleMouseEnter = (idx) => {
    btnRefs.current[idx].classList.add('no-shake');
  };
  const handleMouseLeave = (idx) => {
    btnRefs.current[idx].classList.remove('no-shake');
  };

  return (
    <>
      {BUTTONS.map((btn, idx) => (
        <div
          key={btn.id}
          id={btn.id}
          className="button-contact"
          style={btn.style}
        >
          <div className="phone-vr">
            {/* Multi-ripple effect */}
            <div className={`phone-vr-circle-fill ${btn.circleClass}`} />
            <div className={`ripple r1 ${btn.circleClass}`}></div>
            <div className={`ripple r2 ${btn.circleClass}`}></div>
            <div className={`ripple r3 ${btn.circleClass}`}></div>
            <div className={`phone-vr-img-circle ${btn.imgCircleClass}`}
              style={{ background: btn.mainBg }}
            >
              <a
                href={btn.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={btn.label}
                ref={el => btnRefs.current[idx] = el}
                onClick={() => handleClick(idx)}
                onMouseEnter={() => handleMouseEnter(idx)}
                onMouseLeave={() => handleMouseLeave(idx)}
              >
                {btn.icon}
              </a>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default FloatingSocialButtons;
