import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Col, Container, Row } from "reactstrap";
import Loader from "../../CommonElements/Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  CreateAccount,
  DoNotAccount,
  UserName,
  ForgotPassword,
  Href,
  Password,
  RememberPassword,
  SignIn,
  SignInAccount,
} from "../../utils/Constant";
import {
  LoginFormPropsType,
  LoginForminitialValues,
} from "../../Type/Forms/FormsType";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { FaLock } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { encryptData } from "../../utils/helper/Crypto";
import { useCompany } from "../../Context/CompanyContext";
import BgShape from "../../../public/assets/svg/auth-card-bg-3aYfrz1R.svg";
// import "./login.scss";

/* ── Validation ── */
const LoginSchema = Yup.object().shape({
  userid: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { company } = useCompany();

  const logoUrl = company?.CompanyLogo
    ? `${import.meta.env.VITE_IMAGE_PREVIEW_URL}CompanyDocs/${company.CompanyLogo}`
    : "/assets/images/logo/default.png";
  const loginUrl = import.meta.env.VITE_MEMBER_LOGIN_URL;

  const queryParams = new URLSearchParams(location.search);
  const urlUser = queryParams.get("username");
  const urlPass = queryParams.get("password");

  const [FormFieldData, setFormFieldData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (urlUser && urlPass) ProcessLogin(urlUser, urlPass);
  }, []);

  /* ── Login logic — UNCHANGED ── */
  const SimpleLoginHandle = async (values: LoginFormPropsType) => {
    try {
      setLoading(true);
      const response = await axios.post(loginUrl, {
        Username: values.userid,
        Password: values.password,
      });
      const result = response.data;

      if (result?.StatusCode === 1) {
        toast.success(result.Msg || "Login successful!");
        localStorage.setItem("member_authtoken", encryptData(result.Token));

        if (result.Client) {
          const c = result.Client;
          localStorage.setItem("ClientDetails", encryptData(JSON.stringify(c)));
          localStorage.setItem("clientId", encryptData(c.UserId.toString()));
          localStorage.setItem("userToken", encryptData(result.Token));
          localStorage.setItem("UserId", encryptData(c.UserId.toString()));
          localStorage.setItem("UserName", c.UserName || "");
          localStorage.setItem("UID", encryptData(c.UID || ""));
          localStorage.setItem("MemberName", c.MemberName || "");
          localStorage.setItem("EmailId", encryptData(c.EmailId || ""));
          localStorage.setItem("MobileNo", encryptData(c.MobileNo || ""));
          localStorage.setItem("ProfilePic", encryptData(c.ProfilePic || ""));
        }
        navigate(`${import.meta.env.BASE_URL}/dashboard`, { replace: true });
      } else {
        toast.error(result?.Msg || "Invalid username or password");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const ProcessLogin = (u: string, p: string) =>
    SimpleLoginHandle({ userid: u, password: p } as any);

  return (
    <Container fluid className="p-0">
      {loading && <Loader />}
      <div className="lp-page">
        {/* ══ BACKGROUND ══ */}
        <div className="lp-bg-dots" aria-hidden="true" />
        {/* 👇 ADD HERE */}
        <img src={BgShape} className="lp-bg-svg lp-bg-svg--left" />
        <img src={BgShape} className="lp-bg-svg lp-bg-svg--right" />

        {/* ══ CARD ══ */}
        <div className="lp-card">
          {/* Logo + Brand */}
          <div className="lp-brand">
            <Link to={Href} className="lp-logo-link" aria-label="Home">
              <img src={logoUrl} alt="logo" className="lp-logo-img" />
            </Link>
          </div>

          {/* Heading */}
          <h1 className="lp-title">Great to see you here 👋</h1>
          <p className="lp-subtitle">Let’s get you signed in. Enter your email and password to continue.</p>

          {/* Social buttons
          <div className="lp-social-row">
            <button type="button" className="lp-social-btn">
              <svg width="17" height="17" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Sign in with Google
            </button>

            <button type="button" className="lp-social-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              Sign in with GitHub
            </button>
          </div> */}

          {/* Divider */}
          <div className="lp-divider">
            <span />
          </div>

          {/* Form */}
          <Formik
            enableReinitialize
            initialValues={FormFieldData || LoginForminitialValues}
            validationSchema={LoginSchema}
            onSubmit={(values, { setSubmitting }) => {
              SimpleLoginHandle(values);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="lp-form">
                {/* Username */}
                <div className="lp-field">
                  <label className="lp-label">{UserName}*</label>
                  <div className="lp-input-wrap">
                    <span className="lp-icon">
                      <MdEmail size={15} />
                    </span>
                    <Field
                      type="text"
                      name="userid"
                      placeholder="Enter your User ID"
                      className="lp-input"
                    />
                  </div>
                  <ErrorMessage
                    name="userid"
                    component="p"
                    className="lp-error"
                  />
                </div>

                {/* Password */}
                <div className="lp-field">
                  <label className="lp-label">{Password}*</label>
                  <div className="lp-input-wrap">
                    <span className="lp-icon">
                      <FaLock size={13} />
                    </span>
                    <Field
                      type={show ? "text" : "password"}
                      name="password"
                      placeholder="••••••••••"
                      className="lp-input lp-input--pw"
                    />
                    <button
                      type="button"
                      className="lp-eye"
                      onClick={() => setShow(!show)}
                      aria-label={show ? "Hide" : "Show"}
                    >
                      <FontAwesomeIcon
                        icon={
                          show ? (faEyeSlash as IconProp) : (faEye as IconProp)
                        }
                      />
                    </button>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="p"
                    className="lp-error"
                  />
                </div>

                {/* Remember + Forgot */}
                <div className="lp-options">
                  <label className="lp-remember">
                    <Field
                      type="checkbox"
                      name="rememberPassword"
                      className="lp-checkbox"
                    />
                    <span>{RememberPassword}</span>
                  </label>
                  <Link
                    className="lp-forgot"
                    to={`${import.meta.env.BASE_URL}/forgotpassword`}
                  >
                    {ForgotPassword}
                  </Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="form-btn btn"
                  disabled={isSubmitting || loading}
                >
                  {loading ? (
                    <span className="lp-btn-inner">
                      <span className="lp-spinner" />
                      Signing In…
                    </span>
                  ) : (
                    SignIn
                  )}
                </button>
              </Form>
            )}
          </Formik>

          {/* Register */}
          <p className="lp-register">
            {DoNotAccount}&nbsp;
            <Link
              className="lp-register-link"
              to={`${import.meta.env.BASE_URL}/register`}
            >
              {CreateAccount}
            </Link>
          </p>
        </div>
        {/* /card */}

        {/* Page footer */}
        <p className="lp-footer">© 2026 — Powered by Sysfo</p>
      </div>
    </Container>
  );
};

export default Login;
