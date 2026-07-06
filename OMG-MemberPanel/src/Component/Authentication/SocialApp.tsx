import { Link } from "react-router-dom";
import { LI, UL } from "../../AbstractElements";

const SocialApp = () => {
  return (
    <div className="form-group">
      <UL className="login-social simple-list flex-row">
        <LI>
          <Link to="https://www.linkedin.com/login" target="_blank">
            <i className="icon-linkedin" />
          </Link>
        </LI>
        <LI>
          <Link to="https://twitter.com/login?lang=en" target="_blank">
            <i className="icon-twitter" />
          </Link>
        </LI>
        <LI>
          <Link to="https://www.facebook.com/" target="_blank">
            <i className="icon-facebook" />
          </Link>
        </LI>
        <LI>
          <Link to="https://www.instagram.com/" target="_blank">
            <i className="icon-instagram" />
          </Link>
        </LI>
      </UL>
    </div>
  );
};

export default SocialApp;
