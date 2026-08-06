import React, { useState, useEffect, useRef } from "react";
import {
  FaPlay,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaQrcode,
  FaCopy,
  FaExternalLinkAlt,
  FaHeart,
  FaExclamationTriangle,
  FaUsers,
  FaComments,
  FaBookReader,
  FaQuestionCircle,
  FaFacebook
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./English48Days.css";

// ----------------------------------------------------
// SETTINGS & CONSTANTS
// ----------------------------------------------------
const SHOPEE_LINK = "https://s.shopee.vn/5L9aBvPxg0"; // Thay link Shopee ủng hộ tại đây
const FULL_COURSE_LINK = "https://khoahocdrivemh.pro.vn/course/khoa-hoc-48-ngay-lay-goc-ting-anh-toan-dien-cung-co-mai-phuong"; // Thay link mua khóa học FULL tài liệu tại đây

// Bank details for the 1/3 Sidebar QR component
const SUPPORT_BANK = {
  bankName: "MB Bank (Quân Đội)",
  accountNumber: "56706042003",
  accountName: "MAI VAN HUNG",
  qrImage: "https://img.vietqr.io/image/970422-56706042003-compact.jpg?addInfo=UngHoDuAn&accountName=MAI%20VAN%20HUNG"
};

// Helper to get local date string (YYYY-MM-DD)
const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 48 Days Lesson data array
const lessonsData = [
  {
    id: 1,
    title: "Thể khẳng định và phủ định của động từ to be",
    driveUrl: "https://drive.google.com/file/d/1oJBNNZKA-T2R7b7iSFuzPz3kBZpVxbog/view"
  },
  {
    id: 2,
    title: "Thể nghi vấn của động từ to be",
    driveUrl: "https://drive.google.com/file/d/1sUK9KE0gaM1V_jrW72epRw8IVF0_D-t8/view"
  },
  {
    id: 3,
    title: "Câu hỏi Who và What với động từ to be",
    driveUrl: "https://drive.google.com/file/d/1DR9sTR8WZwVDpDFBLmJGGTmUs595TXvE/view"
  },
  {
    id: 4,
    title: "Câu hỏi Where và When với động từ to be",
    driveUrl: "https://drive.google.com/file/d/1ib_XuiqhmUItvOaBx_Qh_0Z6CqGV5i6F/view"
  },
  {
    id: 5,
    title: "Động từ thường ở hiện tại",
    driveUrl: "https://drive.google.com/file/d/1WRU4zNX8l1gIQ54n7ny5WyWwV0zQhkBt/view"
  },
  {
    id: 6,
    title: "Thể phủ định của động từ thường ở hiện tại",
    driveUrl: "https://drive.google.com/file/d/1W48l5KjL5Pj4wb82WituuCefzVKE3BTG/view"
  },
  {
    id: 7,
    title: "Thể nghi vấn của động từ thường ở hiện tại",
    driveUrl: "https://drive.google.com/file/d/155t3IHdON7Pe-pl6tjqGYgDJTDraHqH4/view"
  },
  {
    id: 8,
    title: "Thì hiện tại đơn",
    driveUrl: "https://drive.google.com/file/d/1KPiUIXsA_rq3ceJGhtghqIusuCR4KfLG/view"
  },
  {
    id: 9,
    title: "Từ loại",
    driveUrl: "https://drive.google.com/file/d/1QVHq9TkK_ouQMF-nbd5RPwBR4x5GKC7o/view"
  },
  {
    id: 10,
    title: "Thì hiện tại tiếp diễn",
    driveUrl: "https://drive.google.com/file/d/1mhr2nT_kP6yidOPPdXj-DHurNBFABVth/view"
  },
  {
    id: 11,
    title: "Phân biệt thì hiện tại đơn và hiện tại tiếp diễn",
    driveUrl: "https://drive.google.com/file/d/1rwIVppxMpL5y9z3zIAT7ASWRxrjusmtd/view"
  },
  {
    id: 12,
    title: "Thì quá khứ đơn thể khẳng định",
    driveUrl: "https://drive.google.com/file/d/1NxLnbYPvv2dvXPgqR2rO6w8PFRnvAFBo/view"
  },
  {
    id: 13,
    title: "Thì quá khứ đơn thể phủ định và nghi vấn",
    driveUrl: "https://drive.google.com/file/d/1X__-Cm92pCAErf6yKt3q8EyAFUqk8vCW/view"
  },
  {
    id: 14,
    title: "Thì quá khứ tiếp diễn",
    driveUrl: "https://drive.google.com/file/d/18NlVdyXk0zsJ9R6jp1hVoiSKiBGhvxX-/view"
  },
  {
    id: 15,
    title: "Thì hiện tại hoàn thành",
    driveUrl: "https://drive.google.com/file/d/1u0C9hYoEiEXIXoBg_ikIoXBdJcRZQV3D/view"
  },
  {
    id: 16,
    title: "Thì tương lai đơn",
    driveUrl: "https://drive.google.com/file/d/1lnyr6EbXQLpugttBeXcdyguGyrolbXnT/view"
  },
  {
    id: 17,
    title: "Thì tương lai hoàn thành",
    driveUrl: "https://drive.google.com/file/d/1WNA5JcSaQY-PRplDesjLc8iCSShOXTKN/view"
  },
  {
    id: 18,
    title: "Học ngữ âm với giáo viên nước ngoài",
    driveUrl: "https://drive.google.com/file/d/170zTXlWkwzCIpBI3FgDFa7ySCx-ax3eb/view"
  },
  {
    id: 19,
    title: "Tìm hiểu về trọng âm trong tiếng Anh",
    driveUrl: "https://drive.google.com/file/d/1fOLs-4Wv-6KKZE90W2InkNWpo_avpp_X/view"
  },
  {
    id: 20,
    title: "Các câu hỏi với từ để hỏi khác trong tiếng Anh",
    driveUrl: "https://drive.google.com/file/d/1VFiFHtW15WCnSIAotYIhD35T9Rgn-mAq/view"
  },
  {
    id: 21,
    title: "Luyện nghe số và tên",
    driveUrl: "https://drive.google.com/file/d/1b-PdiofagdykoK2jcbMp1Gb1CjeAVV3A/view"
  },
  {
    id: 22,
    title: "Động từ khuyết thiếu",
    driveUrl: "https://drive.google.com/file/d/1IHN3eO9mjnb7Yig_9nEKGAOWejt3MebK/view"
  },
  {
    id: 23,
    title: "Liên từ and, but, or, so và because",
    driveUrl: "https://drive.google.com/file/d/1vE_rN4MZvV1O2Tz49etl-rT8aLxMUsQG/view"
  },
  {
    id: 24,
    title: "Liên từ chỉ thời gian",
    driveUrl: "https://drive.google.com/file/d/1wfnc_tBYDeSBmpV2sNVrcGflW9-dkGzt/view"
  },
  {
    id: 25,
    title: "Liên từ chỉ sự đối lập",
    driveUrl: "https://drive.google.com/file/d/1NgELsIKmiPr3vMlu8MZdkfEkaQzoXuEU/view"
  },
  {
    id: 26,
    title: "Câu điều kiện loại 1",
    driveUrl: "https://drive.google.com/file/d/1_TdJQ97NVZWGmEudOK44sJOj9RpUnx-d/view"
  },
  {
    id: 27,
    title: "Câu điều kiện loại 2",
    driveUrl: "https://drive.google.com/file/d/1xPYutr1j6LxzrKMffiM5sEGHB56EI-xT/view"
  },
  {
    id: 28,
    title: "Câu điều kiện loại 3",
    driveUrl: "https://drive.google.com/file/d/1s370tdPA90FcAriLurWG3evyedvVtOKx/view"
  },
  {
    id: 29,
    title: "Luyện nghe điền từ",
    driveUrl: "https://drive.google.com/file/d/1sOICcN3ZRlVtjv1cTkmCrpDFVlQOgrP_/view"
  },
  {
    id: 30,
    title: "Luyện nghe chép chính tả",
    driveUrl: "https://drive.google.com/file/d/14QKeTCLtBf1_uMAQyoRkXCuC9VoVdXez/view"
  },
  {
    id: 31,
    title: "Luyện nghe về giờ",
    driveUrl: "https://drive.google.com/file/d/1r8GPzSwYrThghqnuI27rLdS5u7dDCs72/view"
  },
  {
    id: 32,
    title: "Luyện nghe ngày tháng",
    driveUrl: "https://drive.google.com/file/d/1z3O36LUn2G9MTJhd0Uggvl4JyPtxfR9A/view"
  },
  {
    id: 33,
    title: "Luyện nghe địa điểm",
    driveUrl: "https://drive.google.com/file/d/1PrXMldECJPslOkPuQl3IG58Ryl_NeAq9/view"
  },
  {
    id: 34,
    title: "Luyện nghe về tiền bạc",
    driveUrl: "https://drive.google.com/file/d/1d3ph3SUuwpnbWN1BHe1q5_fblMuytY9p/view"
  },
  {
    id: 35,
    title: "Đại từ phản thân",
    driveUrl: "https://drive.google.com/file/d/1c5C6rWyqyccmlzNarL4uSnlwRLRSVNLo/view"
  },
  {
    id: 36,
    title: "Sự hòa hợp về thì",
    driveUrl: "https://drive.google.com/file/d/1MG-RIywkgcJPmLt0Om7psq7pnqnVbhzt/view"
  },
  {
    id: 37,
    title: "Tiếng Anh giao tiếp (1)",
    driveUrl: "https://drive.google.com/file/d/1jDF9cqijS2TNsf3uXunX356uafe3J7Tp/view"
  },
  {
    id: 38,
    title: "Liên từ tương hỗ",
    driveUrl: "https://drive.google.com/file/d/1i4iguvchE9wyo5K6TU9eyLwZVpVM_Qu1/view"
  },
  {
    id: 39,
    title: "Luyện nghe về các quốc gia và châu lục",
    driveUrl: "https://drive.google.com/file/d/19PjfvjmNfqQtAhg77bkdAmNvG5-O1VWb/view"
  },
  {
    id: 40,
    title: "Luyện nghe về sở thích",
    driveUrl: "https://drive.google.com/file/d/1FAgStA-y74Fn_ZYXtYlOq6fhoUHNQ8eu/view"
  },
  {
    id: 41,
    title: "Luyện nghe về phương tiện giao thông",
    driveUrl: "https://drive.google.com/file/d/1WtbsZnjCIldCNgYErITqClFiV54qqX1o/view"
  },
  {
    id: 42,
    title: "Luyện nghe về thể thao",
    driveUrl: "https://drive.google.com/file/d/1KcsxdV3pgIQhjVV9Fb-KRFFvMz9GVZLz/view"
  },
  {
    id: 43,
    title: "Luyện nghe về nghề nghiệp",
    driveUrl: "https://drive.google.com/file/d/1tEqmHnk7n3eor9JoO_I9flWGij_oa9fN/view"
  },
  {
    id: 44,
    title: "Luyện nghe về công nghệ",
    driveUrl: "https://drive.google.com/file/d/1xUzKTNXOW5XI83UKplGAH0dnMEXZrl-P/view"
  },
  {
    id: 45,
    title: "Tiếng Anh giao tiếp (2)",
    driveUrl: "https://drive.google.com/file/d/1IdT7QAmdO2UsfCyBc4yQl-Zz9NsoB_hv/view"
  },
  {
    id: 46,
    title: "Kỹ năng Note taking",
    driveUrl: "https://drive.google.com/file/d/1EmNVkGBKuOiqXXUlSX0s9D9y6He63aev/view"
  },
  {
    id: 47,
    title: "Kỹ năng Paraphrasing",
    driveUrl: "https://drive.google.com/file/d/1DH-qd5tfqdsA19s-AWrl8zqqsPZoUcp6/view"
  },
  {
    id: 48,
    title: "Tự tin giới thiệu bản thân và thuyết trình bằng tiếng Anh",
    driveUrl: "https://drive.google.com/file/d/1jsQOxivs9z4gpcXgz5UaZAoNHhdIvpvW/view"
  }
];
const English48Days = () => {
  // ----------------------------------------------------
  // STATES
  // ----------------------------------------------------
  const [lessons, setLessons] = useState(lessonsData);
  const [progress, setProgress] = useState({});
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [showSponsorPopup, setShowSponsorPopup] = useState(false);
  const [hasClickedShopee, setHasClickedShopee] = useState(false);
  const [showAnnouncementPopup, setShowAnnouncementPopup] = useState(false);

  // Copy Account Number button state
  const [isCopied, setIsCopied] = useState(false);

  // Page-wide skeleton loading state (simulated on mount)
  const [isPageLoading, setIsPageLoading] = useState(true);
  // Video area skeleton loading state when changing lessons
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Mobile check state (mobile phone < 768px vs desktop/tablet >= 768px)
  const [isMobile, setIsMobile] = useState(false);

  // Active tab state ("lessons" or "community")
  const [activeTab, setActiveTab] = useState("lessons");

  const gridContainerRef = useRef(null);

  // Monitor screen size for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ----------------------------------------------------
  // INITIAL DATA & LOCALSTORAGE LOAD
  // ----------------------------------------------------
  useEffect(() => {
    // 1. Xóa key cũ của Shopee nếu còn tồn tại
    localStorage.removeItem("english_48days_sponsor_closed_date");
    const announcementClosed = sessionStorage.getItem("english_48days_v2_announcement_closed");
    if (announcementClosed !== "1") {
      // Chưa xem thông báo → hiện Shopee trước
      setShowSponsorPopup(true);
    }

    // 2. Check Course Progress Status
    const savedProgress = localStorage.getItem("english_48days_progress");
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress));
      } catch (e) {
        initializeProgress();
      }
    } else {
      initializeProgress();
    }

    // 3. Simulate Page Skeleton Loading for premium feel
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // Initialize progress mapping (id -> status)
  const initializeProgress = () => {
    const initialProgress = {};
    lessonsData.forEach((lesson) => {
      initialProgress[lesson.id] = "not_started"; // Values: not_started, in_progress, completed
    });
    setProgress(initialProgress);
    localStorage.setItem("english_48days_progress", JSON.stringify(initialProgress));
  };

  // ----------------------------------------------------
  // INTERSECTION OBSERVER FOR FADE-IN ON SCROLL
  // ----------------------------------------------------
  useEffect(() => {
    if (isPageLoading || currentLessonId !== null) return;

    // Small delay to allow DOM nodes to mount fully
    const observerTimer = setTimeout(() => {
      const cards = document.querySelectorAll(".day-card");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
            }
          });
        },
        { threshold: 0.1 }
      );

      cards.forEach((card) => observer.observe(card));

      return () => {
        cards.forEach((card) => observer.unobserve(card));
      };
    }, 100);

    return () => clearTimeout(observerTimer);
  }, [isPageLoading, currentLessonId]);

  // ----------------------------------------------------
  // PROGRESS CALCULATIONS
  // ----------------------------------------------------
  const getCompletedCount = () => {
    return Object.values(progress).filter((status) => status === "completed").length;
  };

  const completedCount = getCompletedCount();
  const progressPercent = Math.round((completedCount / 48) * 100) || 0;

  // ----------------------------------------------------
  // HELPER FUNCTIONS
  // ----------------------------------------------------
  // Extract YouTube or Google Drive video URL & return embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const trimmed = String(url).trim();
      // Check if Google Drive link
      if (trimmed.includes("drive.google.com")) {
        const fileIdMatch = trimmed.match(/\/file\/d\/([^/?#]+)/);
        if (fileIdMatch) {
          return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
        }
        const folderIdMatch = trimmed.match(/\/folders\/([^/?#]+)/);
        if (folderIdMatch) {
          return `https://drive.google.com/embeddedfolderview?id=${folderIdMatch[1]}#list`;
        }
        return trimmed;
      }

      // Check if YouTube link
      let videoId = "";
      if (trimmed.includes("youtu.be/")) {
        videoId = trimmed.split("youtu.be/")[1]?.split(/[?#]/)[0];
      } else if (trimmed.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(trimmed).search);
        videoId = urlParams.get("v");
      } else if (trimmed.includes("youtube.com/embed/")) {
        videoId = trimmed.split("youtube.com/embed/")[1]?.split(/[?#]/)[0];
      }
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (err) {
      console.error("Lỗi parse link: ", err);
    }
    return url;
  };

  // Copy bank/momo number to clipboard
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  // ----------------------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------------------
  // Save progress directly
  const updateLessonStatus = (id, status) => {
    const updated = { ...progress, [id]: status };
    setProgress(updated);
    localStorage.setItem("english_48days_progress", JSON.stringify(updated));
  };

  // Khi click link Shopee
  const handleShopeeClick = () => {
    setHasClickedShopee(true);
  };

  // Đóng Shopee → hiện Announcement
  const handleCloseSponsor = () => {
    setShowSponsorPopup(false);
    setShowAnnouncementPopup(true);
  };

  // Close Announcement Popup
  const handleCloseAnnouncement = () => {
    sessionStorage.setItem("english_48days_v2_announcement_closed", "1");
    setShowAnnouncementPopup(false);
  };

  // Launch detailed lesson study
  const startLesson = (id) => {
    // If not started, auto set to "Đang học"
    if (progress[id] === "not_started") {
      updateLessonStatus(id, "in_progress");
    }
    setIsVideoLoading(true);
    setCurrentLessonId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      setIsVideoLoading(false);
    }, 450);
  };

  // Toggle completed status inside Detail page
  const toggleComplete = (id) => {
    const currentStatus = progress[id];
    const nextStatus = currentStatus === "completed" ? "in_progress" : "completed";
    updateLessonStatus(id, nextStatus);
  };

  // Next / Prev actions
  const handlePrevLesson = () => {
    if (currentLessonId > 1) {
      startLesson(currentLessonId - 1);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonId < 48) {
      startLesson(currentLessonId + 1);
    }
  };

  const currentLesson = lessons.find((l) => l.id === currentLessonId);

  return (
    <div style={{ backgroundColor: "#F8F9FA", minHeight: "100vh" }}>
      {/* 1. Header Navbar */}
      <Navbar />

      {/* 2. Sponsor Popup - hiện trước */}
      {showSponsorPopup && (
        <div className="sponsor-popup-overlay">
          <div className="sponsor-popup-box">
            <span className="sponsor-popup-heart">❤️</span>
            <h2 className="sponsor-popup-title">Ủng Hộ Dự Án</h2>
            <p className="sponsor-popup-text">
              Để duy trì thêm kinh phí bạn hãy ủng hộ chúng tôi tại link dưới đây! Không bắt buộc mua đâu nhé chỉ cần click link thui ạ!
            </p>
            <div className="sponsor-popup-actions">
              <a
                href={SHOPEE_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="sponsor-btn-shopee"
                style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}
                onClick={handleShopeeClick}
              >
                📖 Xem Sách Tiếng Anh Bổ Trợ
              </a>
              <button
                className="sponsor-btn-close"
                onClick={handleCloseSponsor}
                disabled={!hasClickedShopee}
              >
                {hasClickedShopee ? "Đóng & Vào Học Ngay" : "Vui lòng click link ủng hộ phía trên trước 🔒"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Announcement Popup - hiện sau khi đóng Shopee */}
      {showAnnouncementPopup && (
        <div className="announcement-popup-overlay">
          <div className="announcement-popup-box">
            <div className="announcement-popup-accent" />

            <div className="announcement-popup-icon-wrap">
              <span className="announcement-popup-icon">📢</span>
            </div>

            <h2 className="announcement-popup-title">Thông Báo Quan Trọng</h2>

            <div className="announcement-popup-body">
              <p className="announcement-popup-main">
                🎉 Mình xin phép <strong>gỡ khóa toàn bộ 48 ngày</strong> để mọi người có thể học miễn phí!
              </p>
              <p className="announcement-popup-sub">
                Sau đó mình sẽ quay lại với <strong>một khóa học mới hoàn toàn miễn phí</strong> giúp mọi người học tiếng Anh hiệu quả hơn. 🚀
              </p>

              <div className="announcement-divider" />

              <p className="announcement-popup-cta-text">
                💬 Nếu bạn muốn học <strong>từ vựng</strong> hay <strong>ngữ pháp</strong>, hãy vào group đóng góp để mình xây dựng hệ thống mới cho mọi người học nhé!
              </p>
            </div>

            <div className="announcement-popup-actions">
              <a
                href="https://www.facebook.com/share/g/15uHQHwSqj4/"
                target="_blank"
                rel="noopener noreferrer"
                className="announcement-btn-join"
                onClick={handleCloseAnnouncement}
              >
                <FaFacebook style={{ fontSize: '1.1rem' }} />
                Tham Gia Cộng Đồng Ngay
              </a>
              <button
                className="announcement-btn-close"
                onClick={handleCloseAnnouncement}
              >
                Đã Hiểu, Vào Học Ngay →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div className={`days-course-container ${(showSponsorPopup || showAnnouncementPopup) ? "blurred-content" : ""}`}>

        {/* ========================================================
           HEADER & PROGRESS CARD
           ======================================================== */}
        <section className="announce-section">
          {/* Top gradient accent */}
          <div className="announce-accent-bar" />

          <div className="announce-body">
            {/* Icon */}
            <div className="announce-icon-ring">
              <span>📢</span>
            </div>

            {/* Badge */}
            <span className="announce-badge">THÔNG BÁO QUAN TRỌNG</span>

            {/* Title */}
            <h1 className="announce-title">
              Mình Xin Phép Gỡ Khóa <span className="announce-title-highlight">48 Ngày</span> 🎉
            </h1>

            {/* Cards row */}
            <div className="announce-cards-row">
              <div className="announce-card announce-card-blue">
                <span className="announce-card-icon">🎉</span>
                <p>Mình xin phép <strong>gỡ khóa toàn bộ 48 ngày</strong> để mọi người có thể học miễn phí!</p>
              </div>
              <div className="announce-card announce-card-purple">
                <span className="announce-card-icon">🚀</span>
                <p>Mình sẽ quay lại với <strong>một khóa học mới hoàn toàn miễn phí</strong> giúp học tiếng Anh hiệu quả hơn!</p>
              </div>
              <div className="announce-card announce-card-red">
                <span className="announce-card-icon">💬</span>
                <p>Muốn học <strong>từ vựng</strong> hay <strong>ngữ pháp</strong>? Vào group đóng góp để mình xây dựng hệ thống mới nhé!</p>
              </div>
            </div>

            {/* CTA Button */}
            <a
              href="https://www.facebook.com/share/g/15uHQHwSqj4/"
              target="_blank"
              rel="noopener noreferrer"
              className="announce-btn-join"
            >
              <FaFacebook style={{ fontSize: '1.2rem' }} />
              Tham Gia Cộng Đồng Ngay
            </a>

            <p className="announce-footnote">
              ✨ Hoàn toàn miễn phí · Không cần đăng ký · Hỗ trợ 24/7
            </p>
          </div>
        </section>

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default English48Days;
