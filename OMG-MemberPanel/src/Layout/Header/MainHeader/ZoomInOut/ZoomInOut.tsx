import { useState } from "react";
import { Maximize } from "react-feather";
import { LI } from "../../../../AbstractElements";
import { Link } from "react-router-dom";
import { Href } from "../../../../utils/Constant";
import { Image } from "../../../../AbstractElements";
import { useCompany } from "@/Context/CompanyContext";

const ZoomInOut = () => {
  const [fullScreen, setFullScreen] = useState(false);
  const fullScreenHandler = (isFullScreen: boolean) => {
    setFullScreen(isFullScreen);
    if (isFullScreen) {
      document.documentElement.requestFullscreen();
    } else {
      document?.exitFullscreen();
    }
  };
  const { company, fetchCompany, loading } = useCompany();
  const logoUrl = company?.CompanyLogo
    ? `${import.meta.env.VITE_IMAGE_PREVIEW_URL}CompanyDocs/${company.CompanyLogo}`
    : "/assets/images/logo/default.png"; // fallback

  return (
    <>
      <LI className="d-flex d-md-none">
        <img src={logoUrl} alt="logo" style={{ width: "120px" }} />
      </LI>
      <LI className="d-none d-md-flex">
        <Link onClick={() => fullScreenHandler(!fullScreen)} to={Href}>
          <Maximize className="svg-color" />
        </Link>
      </LI>
    </>
  );
};

export default ZoomInOut;
