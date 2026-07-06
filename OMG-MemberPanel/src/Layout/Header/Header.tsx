import { Link } from "react-router-dom";
import { Image } from "../../AbstractElements";
import CloseButton from "./CloseButton/CloseButton";
import MainHeader from "./MainHeader/MainHeader";
import { useCompany } from "../../Context/CompanyContext";
import { useEffect } from "react";
import { useProfile } from "../../Context/ProfileContext";

const Header = () => {
  const { company, fetchCompany, loading } = useCompany();
  const { refreshProfile } = useProfile();

  useEffect(() => {
    if (!company) {
      fetchCompany();
      refreshProfile();
    }
  }, []);

  const logoUrl = company?.CompanyLogo
    ? `${import.meta.env.VITE_IMAGE_PREVIEW_URL}CompanyDocs/${company.CompanyLogo}`
    : "/assets/images/logo/default.png"; // fallback

  return (
    <header className="page-header row">
      <div className="logo-wrapper d-flex align-items-center col-auto">
        <Link
          to={`${import.meta.env.BASE_URL}/dashboard`}
          className="w-100 logo"
        >
          {loading ? (
            // ✅ loader instead of broken image
            <div className="logo-loader">Loading...</div>
          ) : (
            <>
              <Image
                className="for-light w-100"
                style={{ zIndex: 999999 }}
                src={logoUrl}
                alt="logo"
              />
              <Image
                className="for-dark w-100"
                style={{ zIndex: 999999 }}
                src={logoUrl}
                alt="logo"
              />
              {/* <Image className="for-light w-100" src={`${import.meta.env.BASE_URL}/assets/images/logo/MLMERP_LOGO2.png`} alt="logo"/>
          <Image className="for-dark w-100" src={`${import.meta.env.BASE_URL}/assets/images/logo/MLMERP_LOGO1.png`} alt="logo"/> */}
            </>
          )}
        </Link>
      </div>

      <MainHeader />
    </header>
  );
};

export default Header;
