import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Container } from "reactstrap";
import Loader from "../../CommonElements/Loader/Loader";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FaLock } from "react-icons/fa6";
import { useResetPasswordService } from "../../Service/Authentication/ForgotPassword";
import { useSweetAlert } from "../../Context/SweetAlertContext";
import { useCompany } from "../../Context/CompanyContext";
import { Href } from "../../utils/Constant";
import BgShape from "../../../public/assets/svg/auth-card-bg-3aYfrz1R.svg";

export interface ResetPasswordFormPropsType {
  Password: string;
  ConfirmPassword: string;
}

export const ResetPasswordForminitialValues: ResetPasswordFormPropsType = {
  Password: "",
  ConfirmPassword: "",
};

const ResetPasswordSchema = Yup.object().shape({
  Password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  ConfirmPassword: Yup.string()
    .oneOf([Yup.ref("Password")], "Passwords do not match")
    .required("Confirm Password is required"),
});

const ResetPassword = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const { doResetPassword, checkTokenValidity, loading } = useResetPasswordService();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { showAlert, ShowSuccessAlert } = useSweetAlert();
  const { company } = useCompany();

  const logoUrl = company?.CompanyLogo
    ? `${import.meta.env.VITE_IMAGE_PREVIEW_URL}CompanyDocs/${company.CompanyLogo}`
    : "/assets/images/logo/default.png";

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    if (token) {
      const res = await checkTokenValidity({
        procName: "ResetPassword",
        Para: `{"ActionMode":"CheckTokenValidity","RandomKey":"${token}"}`,
      });
      if (!res) return;
      if (res[0]?.StatusCode !== "1") {
        showAlert(res[0]?.Msg);
        setTimeout(() => navigate(`${import.meta.env.BASE_URL}/loginauth`), 2000);
      }
    } else {
      showAlert("Invalid Token, Try again");
    }
  };

  const HandleSubmit = async (values: ResetPasswordFormPropsType) => {
    if (!token) { showAlert("Invalid Token, Try again"); return; }
    const res = await doResetPassword({ Password: values.Password, Token: token });
    if (!res) return;
    if (res[0]?.StatusCode === "1") {
      ShowSuccessAlert(res[0].Msg);
      setTimeout(() => navigate(`${import.meta.env.BASE_URL}/loginauth`), 3000);
    } else {
      showAlert(res[0]?.Msg);
    }
  };

  return (
    <Container fluid className="p-0">
      {loading && <Loader />}

      <div className="lp-page">

        {/* ══ BACKGROUND — identical to Login ══ */}
        <div className="lp-bg-dots" aria-hidden="true" />
        <img src={BgShape} className="lp-bg-svg lp-bg-svg--left"  aria-hidden="true" />
        <img src={BgShape} className="lp-bg-svg lp-bg-svg--right" aria-hidden="true" />

        {/* ══ CARD ══ */}
        <div className="lp-card">

          {/* Logo */}
          <div className="lp-brand">
            <Link to={Href} className="lp-logo-link" aria-label="Home">
              <img src={logoUrl} alt="logo" className="lp-logo-img" />
            </Link>
          </div>

          {/* Heading */}
          <h1 className="lp-title">Reset Your Password 🔐</h1>
          <p className="lp-subtitle">
            Enter your new password below. Make sure it's strong and something you'll remember.
          </p>

          {/* Divider */}
          <div className="lp-divider"><span /></div>

          {/* Form */}
          <Formik
            initialValues={ResetPasswordForminitialValues}
            validationSchema={ResetPasswordSchema}
            onSubmit={(values, { setSubmitting }) => {
              HandleSubmit(values);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="lp-form">

                {/* New Password */}
                <div className="lp-field">
                  <label className="lp-label">New Password *</label>
                  <div className="lp-input-wrap">
                    <span className="lp-icon"><FaLock size={13} /></span>
                    <Field
                      type={showNew ? "text" : "password"}
                      name="Password"
                      placeholder="Enter new password"
                      className="lp-input lp-input--pw"
                    />
                    <button
                      type="button"
                      className="lp-eye"
                      onClick={() => setShowNew(!showNew)}
                      aria-label={showNew ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={showNew ? (faEyeSlash as IconProp) : (faEye as IconProp)} />
                    </button>
                  </div>
                  <ErrorMessage name="Password" component="p" className="lp-error" />
                </div>

                {/* Confirm Password */}
                <div className="lp-field">
                  <label className="lp-label">Confirm Password *</label>
                  <div className="lp-input-wrap">
                    <span className="lp-icon"><FaLock size={13} /></span>
                    <Field
                      type={showConfirm ? "text" : "password"}
                      name="ConfirmPassword"
                      placeholder="Re-enter your password"
                      className="lp-input lp-input--pw"
                    />
                    <button
                      type="button"
                      className="lp-eye"
                      onClick={() => setShowConfirm(!showConfirm)}
                      aria-label={showConfirm ? "Hide password" : "Show password"}
                    >
                      <FontAwesomeIcon icon={showConfirm ? (faEyeSlash as IconProp) : (faEye as IconProp)} />
                    </button>
                  </div>
                  <ErrorMessage name="ConfirmPassword" component="p" className="lp-error" />
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
                      Resetting…
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>

              </Form>
            )}
          </Formik>

          {/* Back to login */}
          <p className="lp-register">
            Remember your password?&nbsp;
            <Link
              className="lp-register-link"
              to={`${import.meta.env.BASE_URL}/loginauth`}
            >
              Back to Sign In
            </Link>
          </p>

        </div>
        {/* /card */}

        <p className="lp-footer">© 2026 — Powered by Sysfo</p>
      </div>
    </Container>
  );
};

export default ResetPassword;