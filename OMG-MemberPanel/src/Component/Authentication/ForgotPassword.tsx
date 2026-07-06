import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Container } from "reactstrap";
import Loader from "../../CommonElements/Loader/Loader";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { MdEmail } from "react-icons/md";
import { useResetPasswordService } from "../../Service/Authentication/ForgotPassword";
import { useSweetAlert } from "../../Context/SweetAlertContext";
import { useCompany } from "../../Context/CompanyContext";
import { Href } from "../../utils/Constant";
import BgShape from "../../../public/assets/svg/auth-card-bg-3aYfrz1R.svg";

export interface ForGotPasswordFormPropsType {
  Username: string;
}

export const ForGotPasswordForminitialValues: ForGotPasswordFormPropsType = {
  Username: "",
};

const ForGotPasswordSchema = Yup.object().shape({
  Username: Yup.string().required("Username / Email is required"),
});

const ForgotPassword = () => {
  const { doSendPassword, loading } = useResetPasswordService();
  const navigate = useNavigate();
  const { showAlert, ShowSuccessAlert } = useSweetAlert();
  const { company } = useCompany();

  const logoUrl = company?.CompanyLogo
    ? `${import.meta.env.VITE_IMAGE_PREVIEW_URL}CompanyDocs/${company.CompanyLogo}`
    : "/assets/images/logo/default.png";

  const HandleSubmit = async (values: ForGotPasswordFormPropsType) => {
    const res = await doSendPassword({ EmailId: values.Username });
    if (!res) return;
    if (res[0]?.StatusCode == "1") {
      ShowSuccessAlert(res[0].Msg);
    } else {
      toast.error(res[0]?.Msg);
    }
  };

  return (
    <Container fluid className="p-0">
      {loading && <Loader />}

      <div className="lp-page">

        {/* ══ BACKGROUND — identical to Login ══ */}
        <div className="lp-bg-dots" aria-hidden="true" />
        <img src={BgShape} className="lp-bg-svg lp-bg-svg--left" aria-hidden="true" />
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
          <h1 className="lp-title">Forgot Password? 🔑</h1>
          <p className="lp-subtitle">
            Enter your Member ID or registered email and we'll send your reset password straight to your inbox.
          </p>

          {/* Divider */}
          <div className="lp-divider"><span /></div>

          {/* Form */}
          <Formik
            initialValues={ForGotPasswordForminitialValues}
            validationSchema={ForGotPasswordSchema}
            onSubmit={(values, { setSubmitting }) => {
              HandleSubmit(values);
              setSubmitting(false);
            }}
          >
            {({ isSubmitting }) => (
              <Form className="lp-form">

                <div className="lp-field">
                  <label className="lp-label">Username / Email ID *</label>
                  <div className="lp-input-wrap">
                    <span className="lp-icon">
                      <MdEmail size={15} />
                    </span>
                    <Field
                      type="text"
                      name="Username"
                      placeholder="Enter your Username or Email"
                      className="lp-input"
                    />
                  </div>
                  <ErrorMessage name="Username" component="p" className="lp-error" />
                </div>

                <button
                  type="submit"
                  className="form-btn btn"
                  disabled={isSubmitting || loading}
                >
                  {loading ? (
                    <span className="lp-btn-inner">
                      <span className="lp-spinner" />
                      Sending…
                    </span>
                  ) : (
                    "Send Reset Password"
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

export default ForgotPassword;