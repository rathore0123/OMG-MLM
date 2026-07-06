import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import { HiSpeakerWave } from "react-icons/hi2";
// import { ApiService } from "../../../Service/UniversalService/ApiService";

/**
 * WalletProfileCard component displays wallet profile information with banners and notice bar
 * Contains a banner slider section and a scrolling notice bar
 */
const WalletProfileCard = () => {
  const IMAGE_PREVIEW_URL = import.meta.env.VITE_IMAGE_PREVIEW_URL ?? "";
  // const { universalService } = ApiService();
  // const { universalService } = ApiService(); // Commented out API service
  // State to store banner URLs

  /* Fetch banners — original logic preserved */
  const fetchBanners = async () => {
    try {
      // const res = await universalService({
      //   procName: "ManageMemberBannerImages",
      //   Para: JSON.stringify({ ActionMode: "GetActiveBanner" }),
      // });
      // const data = res?.data || res || [];
      // const bannerUrls = data.map((item: any) => `${IMAGE_PREVIEW_URL}${item.ImagePath}`);
      // setBanners(bannerUrls);

      /* ── placeholder so the slider is visible in dev ── */
      setBanners([
        "https://via.placeholder.com/900x220/7c5cfc/fff?text=MLM+ERP+Banner+1",
        "https://via.placeholder.com/900x220/22c55e/fff?text=MLM+ERP+Banner+2",
        "https://via.placeholder.com/900x220/3b82f6/fff?text=MLM+ERP+Banner+3",
      ]);
    } catch (e) {
      console.error("Banner fetch error:", e);
    }
  };

  useEffect(() => { fetchBanners(); }, []);

  return (
    <div className="profile-banner-wrap mb-3">
      {/* ── Dynamic Banner Slider (PRESERVED) ── */}
      {/* {banners.length > 0 && (
        <div className="banner-slider-shell">
          <Swiper
            spaceBetween={0}
            loop={true}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            modules={[Pagination, Autoplay]}
            className="dash-banner-swiper"
          >
            {banners.map((url, i) => (
              <SwiperSlide key={i}>
                <div className="banner-slide">
                  <img src={url} alt={`banner-${i}`} className="banner-img" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )} */}

      {/* ── Scrolling Notice Bar ── */}
      <div className="notice-bar">
        <span className="notice-bar__icon"><HiSpeakerWave /></span>
        <div className="notice-bar__track">
          <span className="notice-bar__text">
            Please fill in the correct bank card information. The platform will
            process withdrawals within 1–24 hours or more. &nbsp;&nbsp;·&nbsp;&nbsp;
            Please fill in the correct bank card information. The platform will
            process withdrawals within 1–24 hours or more.
          </span>
        </div>
        <button className="notice-bar__btn">Detail</button>
      </div>
    </div>
  );
};

export default WalletProfileCard;
