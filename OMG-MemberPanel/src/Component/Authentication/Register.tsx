import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Col, Container, Label, Row } from "reactstrap";
import { Formik, Field, Form, ErrorMessage, FormikProps } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Loader from "../../CommonElements/Loader/Loader";
import CountryWithFlag from "../Authentication/CountryWithFlag";
import {
  RegistrationFormPropsType,
  RegistrationForminitialValues,
} from "../../Type/Forms/FormsType";
import { useRegisterService } from "../../Service/Authentication/RegisterationService";
import { SendOTP_Service } from "../../Service/Authentication/SendOTPService";
import { ApiService } from "../../Service/UniversalService/ApiService";
import { useSweetAlert } from "../../Context/SweetAlertContext";
import { encryptData } from "../../utils/helper/Crypto";
import { FaUser } from "react-icons/fa";
import { MdOutlinePhoneIphone, MdPin } from "react-icons/md";
import { FaGlobe } from "react-icons/fa";
import { IoMailOpen } from "react-icons/io5";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { useCompany } from "../../Context/CompanyContext";
import BgShape from "../../../public/assets/svg/auth-card-bg-3aYfrz1R.svg";
import "./Register.scss";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const RegisterWithBgImageContainer = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Extract parameters from URL
  const sponsorParam = queryParams.get("sponsor");
  const positionParam = queryParams.get("position");
  const refcodeParam = queryParams.get("refcode");

  // Use sponsor parameter first, fallback to refcode for backward compatibility
  const username = sponsorParam || refcodeParam;
  const autoPosition =
    positionParam?.toLowerCase() === "right" ? "Right" : "Left";

  const { company } = useCompany();

  const logoUrl = company?.CompanyLogo
    ? `${import.meta.env.VITE_IMAGE_PREVIEW_URL}CompanyDocs/${company.CompanyLogo}`
    : "/assets/images/logo/default.png";

  const [FormFieldData, setFormFieldData] = useState<any>(null);
  const [sponsorAvailable, setSponsorAvailable] = useState<null | boolean>(
    null,
  );
  const [CountryName, setCountryName] = useState<string>("IN");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [otploader, setotploader] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showPosition, setShowPosition] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [positionLocked, setPositionLocked] = useState(false);
  const [sponsorVerified, setSponsorVerified] = useState(false);
  const [willSpillover, setWillSpillover] = useState(false);

  const { registerMember, validateSponsor, sendOTP, loading } =
    useRegisterService();
  const { universalService } = ApiService();
  const { FormatTime } = SendOTP_Service();
  const { showAlert, ShowSuccessAlert } = useSweetAlert();
  const navigate = useNavigate();
  const formikRef = useRef<FormikProps<RegistrationFormPropsType>>(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    if (username && settingsLoaded) {
      SetReferValues();
    }
  }, [username, settingsLoaded]);

  // Fetch global settings to check plan type and placement type
  const fetchGlobalSettings = async () => {
    try {
      // Option 1: If you have an API endpoint
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/GlobalSetting/GetSettings`);
      // const data = await response.json();

      // Option 2: Get settings from localStorage or context
      const storedSettings = localStorage.getItem("globalSettings");
      if (storedSettings) {
        const data = JSON.parse(storedSettings);
        processSettings(data);
      } else {
        // Option 3: Default to show position for testing
        console.log("Using default settings for testing");
        setShowPosition(true);
        setSettingsLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      // Default to showing position for testing
      setShowPosition(true);
      setSettingsLoaded(true);
    }
  };

  const processSettings = (data: any) => {
    const planType = data.PlanType || data.planType;
    const placementType = data.PlacementType || data.placementType;

    console.log("Settings loaded:", { planType, placementType });

    // Show position selector for Binary plan with Manual placement
    if (planType === "Binary" && placementType === "Manual") {
      setShowPosition(true);
    } else {
      setShowPosition(false);
    }
    setSettingsLoaded(true);
  };

  const SetReferValues = async () => {
    if (!username) return;

    // New referral code system: ?refcode=UNIQUE_TOKEN (not a username)
    if (refcodeParam && !sponsorParam) {
      try {
        const res = await universalService({
          procName: "ValidateReferralCode",
          Para: JSON.stringify({ ReferralCode: refcodeParam }),
        });
        const result = res?.data ?? res;
        const row = Array.isArray(result) ? result[0] : result;

        if (row?.StatusCode == 1 || row?.StatusCode === "1") {
          const side = row.Side === "R" ? "Right" : "Left";
          setFormFieldData({
            SponsorUserName: row.SponsorUsername || refcodeParam,
            sponsorName: row.SponsorName || "",
            FirstName: "",
            MobileNo: "",
            EmailId: "",
            OTP: "",
            CountryId: "IN",
            Position: side,
          });
          setSponsorAvailable(true);
          setSponsorVerified(true);
          setPositionLocked(true);
          setWillSpillover(row.WillSpillover == "1" || row.WillSpillover === 1);
          toast.success(
            `Referral applied! Joining under ${row.SponsorName} on ${side} side`,
          );
        } else {
          toast.error(row?.Msg || "Invalid referral code");
          setSponsorAvailable(false);
        }
      } catch (error) {
        console.error("Error validating referral code:", error);
        toast.error("Error validating referral code");
      }
      return;
    }

    // Old system: ?sponsor=USERNAME
    try {
      const obj = {
        UserName: username,
      };
      const res = await validateSponsor(obj);
      if (res?.[0]?.StatusCode == 1) {
        const initialPosition = (showPosition && autoPosition) || "Left";

        setFormFieldData({
          SponsorUserName: username,
          sponsorName: res[0]?.Name || "",
          FirstName: "",
          MobileNo: "",
          EmailId: "",
          OTP: "",
          CountryId: "IN",
          Position: initialPosition,
        });
        setSponsorAvailable(true);
        setSponsorVerified(true);

        toast.success(
          `Referral code applied! You're joining under ${res[0]?.Name || username}`,
        );

        if (showPosition && autoPosition) {
          toast.info(`Position automatically set to ${autoPosition} side`);
          setPositionLocked(true);
        }
      } else {
        toast.error("Invalid referral code");
        setSponsorAvailable(false);
      }
    } catch (error) {
      console.error("Error validating sponsor:", error);
      toast.error("Error validating referral code");
    }
  };

  const validationSchema = Yup.object({
    SponsorUserName: Yup.string().required("Referral ID is required"),
    sponsorName: Yup.string().optional(),
    FirstName: Yup.string().required("Name is required"),
    MobileNo: Yup.string()
      .required("Mobile Number is required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Must be at least 10 digits")
      .max(15, "Must be at most 15 digits"),
    CountryId: Yup.string().optional(),
    EmailId: Yup.string()
      .email("Invalid email format")
      .required("Email is required")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"),
    OTP: Yup.string()
      .required("OTP is required")
      .matches(/^[0-9]+$/, "OTP must be digits only")
      .min(4, "OTP must be at least 4 digits")
      .max(6, "OTP must be at most 6 digits"),
    Position: Yup.string().when([], {
      condition: () => showPosition && !positionLocked,
      then: (schema) => schema.required("Please select a position"),
      otherwise: (schema) => schema.optional(),
    }),
  });

  const handleSponsorChange = async (
    event: React.FocusEvent<HTMLInputElement>,
    values: RegistrationFormPropsType,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const inputValue = event.target.value.trim();
    if (!inputValue) return;

    try {
      const obj = {
        UserName: inputValue,
      };
      const res = await validateSponsor(obj);
      if (res?.[0]?.StatusCode == 1) {
        setFieldValue("sponsorName", res[0].Name);
        setSponsorAvailable(true);
        setSponsorVerified(true);
        toast.success(`Referral verified: ${res[0].Name}`);

        // Reset position lock when manually changing sponsor
        setPositionLocked(false);
      } else {
        setFieldValue("sponsorName", "");
        setSponsorAvailable(false);
        setSponsorVerified(false);
        toast.error("Invalid Referral ID");
      }
    } catch (error) {
      console.error("Error checking sponsor:", error);
      toast.error("Error verifying referral ID");
    }
  };

  const handleSendOTP = async (values: RegistrationFormPropsType) => {
    // Validate email and mobile before sending OTP
    if (!values.EmailId) {
      toast.error("Please enter your email address");
      return;
    }
    if (!values.MobileNo) {
      toast.error("Please enter your mobile number");
      return;
    }
    if (!values.FirstName) {
      toast.error("Please enter your full name");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.EmailId)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Validate mobile number format
    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobileRegex.test(values.MobileNo)) {
      toast.error("Please enter a valid mobile number (10-15 digits)");
      return;
    }

    setotploader(true);
    const obj = {
      procName: "RegOTP",
      Para: JSON.stringify({
        MobileNo: values.MobileNo,
        Name: values.FirstName,
        EmailId: values.EmailId,
        ActionMode: "SendOTP",
      }),
    };
    try {
      const res = await sendOTP(obj);
      if (res && res[0] && res[0].StatusCode === 1) {
        setIsOtpSent(true);
        startTimer(res[0].SecondsLeft || 120);
        ShowSuccessAlert("OTP has been sent to your email.");
      } else {
        toast.error(res?.[0]?.Msg || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Error sending OTP. Please check your connection.");
    } finally {
      setotploader(false);
    }
  };

  const startTimer = (secondsLeft: number) => {
    setOtpTimer(secondsLeft - 1);
    const intervalId = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId);
          setIsOtpSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const HandleRegisterSubmit = async (values: RegistrationFormPropsType) => {
    try {
      // Validate OTP format
      if (!values.OTP || values.OTP.length < 4) {
        toast.error("Please enter a valid OTP");
        return;
      }

      // Map Position to numeric values 1 (Left) or 2 (Right)
      let selectedPosition = null;
      if (showPosition) {
        // Use locked position if available, otherwise use selected value
        const finalPosition = positionLocked ? autoPosition : values.Position;
        selectedPosition = finalPosition === "Left" ? 1 : 2;

        console.log(
          `Position: ${finalPosition} -> Numeric: ${selectedPosition}`,
        );
      }

      const payload: any = {
        SponsorUserName: values.SponsorUserName,
        FirstName: values.FirstName,
        MobileNo: values.MobileNo,
        CountryId: values.CountryId || CountryName || "IN",
        EmailId: values.EmailId,
        OTP: values.OTP,
        RegMode: "Website",
        // Only include these if showPosition is true
        ...(showPosition && {
          Position: selectedPosition,
          PlaceUnderUsername: values.SponsorUserName,
        }),
      };

      console.log("Submitting Payload:", payload);

      const res = await registerMember(payload);
      if (res && res[0] && res[0].StatusCode === "1") {
        ShowSuccessAlert(res[0].Msg);
        navigate(`${import.meta.env.BASE_URL}/registration-success`, {
          state: {
            memberName: res[0]?.MemberName,
            userName: res[0]?.UserName,
            userId: res[0]?.UserId,
            password: res[0]?.Password,
            position: showPosition
              ? selectedPosition === 1
                ? "Left"
                : "Right"
              : null,
          },
        });
      } else {
        showAlert(res?.[0]?.Msg || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        "Registration failed. Please check your details and try again.",
      );
    }
  };

  // Don't render until settings are loaded
  if (!settingsLoaded) {
    return <Loader />;
  }

  return (
    <Container fluid className="p-0">
      {loading && <Loader />}

      <div className="lp-page lp-page--register">
        <div className="lp-bg-dots" aria-hidden="true" />
        <img
          src={BgShape}
          className="lp-bg-svg lp-bg-svg--left"
          aria-hidden="true"
        />
        <img
          src={BgShape}
          className="lp-bg-svg lp-bg-svg--right"
          aria-hidden="true"
        />

        <div className="lp-card lp-card--register">
          <div className="lp-brand">
            <Link
              to={`${import.meta.env.BASE_URL}/`}
              className="lp-logo-link"
              aria-label="Home"
            >
              <img src={logoUrl} alt="logo" className="lp-logo-img" />
            </Link>
          </div>

          <h1 className="lp-title">Start Your Smart Earning Journey 🚀</h1>
          <p className="lp-subtitle">
            Join and begin your path to secure, effortless earnings — quick
            sign-up, instant access.
          </p>

          {/* Spillover notice — shown when referral slot is occupied */}
          {willSpillover && sponsorVerified && (
            <div className="lp-referral-banner" style={{ borderColor: "rgba(251,191,36,0.4)", background: "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(245,158,11,0.08) 100%)" }}>
              <div className="lp-referral-icon">⚡</div>
              <div className="lp-referral-content">
                <strong style={{ color: "#f59e0b" }}>Auto-Spillover Active</strong>
                <p>The direct slot is occupied. You will be placed under the next available position in the binary tree.</p>
              </div>
            </div>
          )}

          {/* Show referral banner if coming from referral link */}
          {/* {sponsorVerified && username && (
            <div className="lp-referral-banner">
              <div className="lp-referral-icon">🎯</div>
              <div className="lp-referral-content">
                <strong>You're joining as a referral!</strong>
                <p>Sponsor: {FormFieldData?.sponsorName || username}</p>
                {showPosition && autoPosition && (
                  <p>
                    Position:{" "}
                    <span className="lp-position-highlight">
                      {autoPosition} side
                    </span>
                  </p>
                )}
              </div>
            </div>
          )} */}

          <div className="lp-divider">
            <span />
          </div>

          <Formik
            innerRef={formikRef}
            initialValues={
              FormFieldData || {
                ...RegistrationForminitialValues,
                Position: autoPosition || "Left",
              }
            }
            validationSchema={validationSchema}
            onSubmit={HandleRegisterSubmit}
            enableReinitialize
          >
            {({ isSubmitting, values, setFieldValue, errors, touched }) => (
              <Form className="lp-form">
                {/* Row 1: Referral ID + Referral Name */}
                <div className="lp-grid-2">
                  <div className="lp-field">
                    <label className="lp-label">Referral ID *</label>
                    <div className="lp-input-wrap">
                      <span className="lp-icon">
                        <FaUser size={13} />
                      </span>
                      <Field
                        type="text"
                        name="SponsorUserName"
                        placeholder="Enter Referral ID"
                        className="lp-input"
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                          handleSponsorChange(e, values, setFieldValue)
                        }
                      />
                    </div>
                    {sponsorAvailable === true && (
                      <p className="lp-verify lp-verify--ok">✓ Verified</p>
                    )}
                    {sponsorAvailable === false && (
                      <p className="lp-verify lp-verify--err">
                        ✗ Invalid Referral ID
                      </p>
                    )}
                    <ErrorMessage
                      name="SponsorUserName"
                      component="p"
                      className="lp-error"
                    />
                  </div>

                  <div className="lp-field">
                    <label className="lp-label">Referral Name</label>
                    <div className="lp-input-wrap">
                      <span className="lp-icon">
                        <FaUser size={13} />
                      </span>
                      <Field
                        type="text"
                        name="sponsorName"
                        className="lp-input"
                        disabled
                        placeholder="Auto-filled on verify"
                      />
                    </div>
                  </div>
                </div>

                {/* Position Selection */}
                {/* Position Selection */}
                {showPosition && (
                  <div
                    className="lp-field lp-field--position"
                    style={{ marginBottom: "12px" }}
                  >
                    <label
                      className="lp-label"
                      style={{ marginBottom: "6px", fontSize: "13px" }}
                    >
                      Placement Position *
                    </label>
                    <div
                      className="lp-position-container"
                      style={{ display: "flex", gap: "12px" }}
                    >
                      <label
                        className={`lp-pos-card ${values.Position === "Left" ? "active" : ""} ${positionLocked && autoPosition === "Left" ? "locked" : ""}`}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor:
                            positionLocked && autoPosition === "Right"
                              ? "not-allowed"
                              : "pointer",
                          backgroundColor:
                            values.Position === "Left"
                              ? "rgba(59, 130, 246, 0.1)"
                              : "rgba(255, 255, 255, 0.05)",
                          border:
                            values.Position === "Left"
                              ? "1px solid #3b82f6"
                              : "1px solid rgba(255, 255, 255, 0.1)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Field
                          type="radio"
                          name="Position"
                          value="Left"
                          disabled={positionLocked && autoPosition === "Right"}
                          style={{ display: "none" }}
                        />
                        <div
                          className="lp-pos-content"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            className="lp-pos-title"
                            style={{ fontSize: "13px", fontWeight: "500" }}
                          >
                            Left Side
                          </span>
                          {positionLocked && autoPosition === "Left" && (
                            <span
                              className="lp-lock-icon"
                              style={{ fontSize: "11px" }}
                            >
                              🔒
                            </span>
                          )}
                        </div>
                      </label>

                      <label
                        className={`lp-pos-card ${values.Position === "Right" ? "active" : ""} ${positionLocked && autoPosition === "Right" ? "locked" : ""}`}
                        style={{
                          flex: 1,
                          padding: "8px 12px",
                          borderRadius: "8px",
                          cursor:
                            positionLocked && autoPosition === "Left"
                              ? "not-allowed"
                              : "pointer",
                          backgroundColor:
                            values.Position === "Right"
                              ? "rgba(34, 197, 94, 0.1)"
                              : "rgba(255, 255, 255, 0.05)",
                          border:
                            values.Position === "Right"
                              ? "1px solid #22c55e"
                              : "1px solid rgba(255, 255, 255, 0.1)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <Field
                          type="radio"
                          name="Position"
                          value="Right"
                          disabled={positionLocked && autoPosition === "Left"}
                          style={{ display: "none" }}
                        />
                        <div
                          className="lp-pos-content"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            className="lp-pos-title"
                            style={{ fontSize: "13px", fontWeight: "500" }}
                          >
                            Right Side
                          </span>
                          {positionLocked && autoPosition === "Right" && (
                            <span
                              className="lp-lock-icon"
                              style={{ fontSize: "11px" }}
                            >
                              🔒
                            </span>
                          )}
                        </div>
                      </label>
                    </div>
                    {positionLocked && (
                      <p
                        className="lp-info-text"
                        style={{
                          fontSize: "10px",
                          marginTop: "6px",
                          marginBottom: "0",
                          color: "#3b82f6",
                          textAlign: "center",
                        }}
                      >
                        ℹ️ Position automatically set from referral link
                      </p>
                    )}
                    <ErrorMessage
                      name="Position"
                      component="p"
                      className="lp-error"
                      style={{
                        fontSize: "11px",
                        marginTop: "4px",
                        marginBottom: "0",
                      }}
                    />
                  </div>
                )}

                {/* Row 2: Full Name + Mobile */}
                <div className="lp-grid-2">
                  <div className="lp-field">
                    <label className="lp-label">Full Name *</label>
                    <div className="lp-input-wrap">
                      <span className="lp-icon">
                        <FaUser size={13} />
                      </span>
                      <Field
                        type="text"
                        name="FirstName"
                        placeholder="Enter your name"
                        className="lp-input"
                      />
                    </div>
                    <ErrorMessage
                      name="FirstName"
                      component="p"
                      className="lp-error"
                    />
                  </div>

                  <div className="lp-field">
                    <label className="lp-label">Mobile No *</label>
                    <div className="lp-input-wrap">
                      <span className="lp-icon">
                        <MdOutlinePhoneIphone size={15} />
                      </span>
                      <Field
                        type="tel"
                        name="MobileNo"
                        placeholder="Enter mobile number"
                        className="lp-input"
                      />
                    </div>
                    <ErrorMessage
                      name="MobileNo"
                      component="p"
                      className="lp-error"
                    />
                  </div>
                </div>

                {/* Country Field - Full Width */}
                <div className="lp-field">
                  <label className="lp-label">Country</label>
                  <div className="lp-input-wrap lp-input-wrap--country">
                    <span className="lp-icon">
                      <FaGlobe size={13} />
                    </span>
                    <div className="lp-country-select">
                      <CountryWithFlag
                        value={values.CountryId}
                        SetCountryName={(v) => {
                          setCountryName(v);
                          setFieldValue("CountryId", v);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field - Full Width */}
                <div className="lp-field">
                  <label className="lp-label">Email Address *</label>
                  <div className="lp-input-wrap">
                    <span className="lp-icon">
                      <IoMailOpen size={15} />
                    </span>
                    <Field
                      type="email"
                      name="EmailId"
                      className="lp-input lp-input--otp-row"
                      placeholder="Enter email address"
                    />
                    <button
                      type="button"
                      className={`lp-otp-btn${isOtpSent ? " lp-otp-btn--sent" : ""}`}
                      onClick={() => handleSendOTP(values)}
                      disabled={
                        isOtpSent ||
                        otploader ||
                        !values.EmailId ||
                        !values.MobileNo ||
                        !values.FirstName
                      }
                    >
                      {isOtpSent
                        ? FormatTime(otpTimer)
                        : otploader
                          ? "Sending…"
                          : "Send OTP"}
                    </button>
                  </div>
                  <ErrorMessage
                    name="EmailId"
                    component="p"
                    className="lp-error"
                  />
                </div>

                {/* OTP Field */}
                <div className="lp-field">
                  <label className="lp-label">OTP *</label>
                  <div className="lp-input-wrap">
                    <span className="lp-icon">
                      <MdPin size={15} />
                    </span>
                    <Field
                      type={showOtp ? "text" : "password"}
                      name="OTP"
                      className="lp-input lp-input--pw"
                      placeholder="Enter OTP sent to your email"
                    />
                    <button
                      type="button"
                      className="lp-eye"
                      onClick={() => setShowOtp(!showOtp)}
                      aria-label={showOtp ? "Hide OTP" : "Show OTP"}
                    >
                      <FontAwesomeIcon
                        icon={
                          showOtp
                            ? (faEyeSlash as IconProp)
                            : (faEye as IconProp)
                        }
                      />
                    </button>
                  </div>
                  <ErrorMessage name="OTP" component="p" className="lp-error" />
                </div>

                <button
                  type="submit"
                  className="form-btn btn"
                  style={{ color: "#ffffff" }}
                  disabled={isSubmitting || loading || !sponsorVerified}
                >
                  {isSubmitting || loading ? (
                    <span className="lp-btn-inner">
                      <span className="lp-spinner" />
                      Creating Account…
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <p className="lp-register">
            Already have an account?&nbsp;
            <Link
              className="lp-register-link"
              to={`${import.meta.env.BASE_URL}/loginauth`}
            >
              Sign In
            </Link>
          </p>
        </div>

        <p className="lp-footer">© 2026 — Powered by Sysfo</p>
      </div>

      {/* Add CSS for the new elements */}
      <style>{`
        .lp-referral-banner {
          background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(34,197,94,0.1) 100%);
          border: 1px solid rgba(59,130,246,0.3);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .lp-referral-icon {
          font-size: 28px;
        }
        
        .lp-referral-content {
          flex: 1;
        }
        
        .lp-referral-content strong {
          display: block;
          color: #3b82f6;
          margin-bottom: 4px;
        }
        
        .lp-referral-content p {
          margin: 0;
          font-size: 12px;
          color: #94a3b8;
        }
        
        .lp-position-highlight {
          color: #22c55e;
          font-weight: 600;
        }
        
        .lp-pos-card.locked {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .lp-pos-card.locked .lp-pos-content {
          position: relative;
        }
        
        .lp-lock-icon {
          font-size: 12px;
          margin-left: 6px;
        }
        
        .lp-info-text {
          font-size: 11px;
          color: #3b82f6;
          margin-top: 6px;
          text-align: center;
        }
        
        .lp-verify {
          font-size: 11px;
          margin-top: 4px;
        }
        
        .lp-verify--ok {
          color: #22c55e;
        }
        
        .lp-verify--err {
          color: #ef4444;
        }
      `}</style>
    </Container>
  );
};

export default RegisterWithBgImageContainer;
