import { useEffect, useState } from "react";
import { Image, H2 } from "../../AbstractElements";
import { loadTheme } from "../../Theme/loadTheme";
import { useProfile } from "../../Context/ProfileContext";

const Loader = () => {
  const [show, setShow] = useState(true);
  const { refreshProfile } = useProfile(); // 👈 context use

  useEffect(() => {
    const initApp = async () => {
      try {
        // ✅ run both in parallel (faster 🚀)
        await Promise.all([loadTheme(), refreshProfile()]);
      } catch (err) {
        console.error("Init error:", err);
      } finally {
        setShow(false); // 👈 hide only after both done
      }
    };

    initApp();
  }, []);

  if (!show) return null;

  return (
    <div className="loader-wrapper">
      <Image
        className="loader-text"
        src={`${import.meta.env.BASE_URL}/assets/images/logo/favicon.png`}
        alt="preloader"
      />
      <H2 className="LoaderName">OMG MLM</H2>
    </div>
  );
};

export default Loader;
