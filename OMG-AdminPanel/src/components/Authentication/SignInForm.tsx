import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { useCurrency } from "../../modules/SuperAdmin/context/CurrencyContext";
import { useAuth } from "../../context/AuthContext";
import DarkThemeLogo from "../../../public/images/MLM-ERP.png";
import LightThemeLogo from "../../../public/images/MLM-ERP-White.png";

const IMAGE_PREVIEW_URL = import.meta.env.VITE_IMAGE_PREVIEW_URL_2;
const loginUrl = import.meta.env.VITE_LOGIN_URL;

const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");

  const { setCurrency } = useCurrency();
  const { login, userProfile } = useAuth();

  const initialValues = { adminId: "", password: "" };

  const validationSchema = Yup.object({
    adminId: Yup.string().required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const onSubmit = async (values: any, { setSubmitting }: any) => {
    setApiError("");
    try {
      const response = await axios.post(loginUrl, {
        Username: values.adminId,
        Password: values.password,
      });
      const result = response.data;

      if (result?.StatusCode === 1) {
        toast.success(result.Msg || "Login successful!");
        if (result.Employee) {
          // setCurrency({
          //   code: result.Employee.CurrencyName,
          //   symbol: result.Employee.CurrencyCode,
          //   rate: result.Employee.Rate || 1,
          // });
          setCurrency({
            code: "INR",
            symbol: "₹",
            rate: result.Employee.Rate || 1,
          });
        }
        login(result.Employee, result.Token, result.PanelSetting);
        setTimeout(() => navigate("/superadmin"), 800);
      } else {
        const msg = result?.Msg || "Invalid Email or Password!";
        setApiError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = "Network error. Please check your connection.";
      setApiError(msg);
      toast.error(msg);
    }
    setSubmitting(false);
  };

  return (
    <>
      <ToastContainer />

      <div className="fixed inset-0 z-50 flex">
        {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col items-center justify-center bg-primary-button-bg">
          {/* Decorative blobs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -right-20 w-[420px] h-[420px] rounded-full bg-white/10" />
          <div className="absolute top-1/3 right-10 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute bottom-1/4 left-10 w-20 h-20 rounded-full bg-white/5" />

          {/* Decorative grid dots */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center text-white px-14 max-w-[480px]">
            {/* White logo */}
            <img
              src={LightThemeLogo}
              alt="logo"
              className="h-14 object-contain mb-8 drop-shadow-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = LightThemeLogo;
              }}
            />

            <h2 className="text-4xl font-bold leading-tight mb-3 drop-shadow">
              Manage Smarter,
              <br />
              Grow Faster
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-10">
              Your all-in-one admin panel for managing clients, commissions,
              pools, and network analytics.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 justify-center">
              {[
                "Generation Tree",
                "Pool Management",
                "VX Income",
                "Sponsor Income",
                "Member Login",
              ].map((f) => (
                <span
                  key={f}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 text-white/90 backdrop-blur-sm border border-white/20"
                >
                  {f}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="mt-10 grid grid-cols-3 gap-4 w-full">
              {[
                { val: "99.9%", lbl: "Uptime" },
                { val: "24/7", lbl: "Support" },
                { val: "100+", lbl: "Features" },
              ].map(({ val, lbl }) => (
                <div
                  key={lbl}
                  className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10"
                >
                  <div className="text-2xl font-bold">{val}</div>
                  <div className="text-white/60 text-[10px] uppercase tracking-widest mt-1">
                    {lbl}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 bg-white dark:bg-[#0a0e19]">
          <div className="w-full max-w-[420px]">
            {/* Logo */}
            <div className="mb-7">
              <img
                src={
                  userProfile?.LightThemeLogo
                    ? `${IMAGE_PREVIEW_URL}/CompanyDocs/${userProfile.LightThemeLogo}`
                    : DarkThemeLogo
                }
                alt="logo"
                className="object-contain inline-block dark:hidden"
                style={{ height: 56 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = DarkThemeLogo;
                }}
              />
              <img
                src={
                  userProfile?.DarkThemeLogo
                    ? `${IMAGE_PREVIEW_URL}/CompanyDocs/${userProfile.DarkThemeLogo}`
                    : LightThemeLogo
                }
                alt="logo"
                className="object-contain hidden dark:inline-block"
                style={{ height: 56 }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = LightThemeLogo;
                }}
              />
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                Welcome back!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign in to your admin account to continue
              </p>
            </div>

            {/* API error */}
            {apiError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 border border-red-200 rounded-xl p-3 text-sm mb-5">
                <i className="material-symbols-outlined text-[18px] flex-shrink-0">
                  error
                </i>
                {apiError}
              </div>
            )}

            {/* Form */}
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  {/* EMAIL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Email Address
                    </label>
                    <Field
                      type="text"
                      name="adminId"
                      placeholder="info@example.com"
                      className="h-[50px] w-full rounded-xl border border-gray-200 dark:border-[#172036] bg-gray-50 dark:bg-[#0c1427] px-4 text-sm text-black dark:text-white outline-none focus:border-primary-button-bg focus:bg-white dark:focus:bg-[#0c1427] transition-all"
                    />
                    <ErrorMessage
                      name="adminId"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* PASSWORD */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Enter your password"
                        className="h-[50px] w-full rounded-xl border border-gray-200 dark:border-[#172036] bg-gray-50 dark:bg-[#0c1427] px-4 pr-11 text-sm text-black dark:text-white outline-none focus:border-primary-button-bg focus:bg-white dark:focus:bg-[#0c1427] transition-all"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <FaEyeSlash size={16} />
                        ) : (
                          <FaEye size={16} />
                        )}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-red-500 text-xs mt-1"
                    />
                  </div>

                  {/* FORGOT */}
                  <div className="flex justify-end">
                    <Link
                      to="/authentication/forgot-password"
                      className="text-sm font-medium text-primary-button-bg hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  {/* SUBMIT */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[50px] rounded-xl font-semibold text-sm text-white bg-primary-button-bg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Signing in...
                      </>
                    ) : (
                      <>
                        <i className="material-symbols-outlined text-[20px]">
                          login
                        </i>{" "}
                        Sign In
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Don't have an account?{" "}
              <Link
                to="/authentication/sign-up"
                className="text-primary-button-bg font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
