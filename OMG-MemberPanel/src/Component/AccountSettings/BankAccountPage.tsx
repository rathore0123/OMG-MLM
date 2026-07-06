import { useState, useEffect } from "react";
import { Container } from "reactstrap";
import { Formik, Field, Form, ErrorMessage } from "formik";
import {
  ActsettingBankINR,
  Bank_INRpropsType,
} from "../../Type/Forms/FormsType";
import { ActSettingService } from "../../Service/AccountSetting/ActsettingService";
import { SendOTP_Service } from "../../Service/Authentication/SendOTPService";
import { useSweetAlert } from "../../Context/SweetAlertContext";
import Loader from "../../CommonElements/Loader/Loader";
import { decryptData } from "../../utils/helper/Crypto";
import { ApiService } from "../../Service/UniversalService/ApiService";
import Swal from "sweetalert2";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import "./BankAccountPage.scss";
import {
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiHash,
  FiHome,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";

const BorderTabContent = () => {
  const navigate = useNavigate();

  // ── OTP State ──────────────────────────────────────────────────────────────
  const [isOtpSent, setIsOtpSent]   = useState(false);
  const [otpTimer, setOtpTimer]     = useState<number>(0);
  const [disablebtn, setDisablebtn] = useState(false);

  // ── Services ───────────────────────────────────────────────────────────────
  const { universalService, loading } = ApiService();
  const { FormatTime }                = SendOTP_Service();
  const { showAlert, ShowSuccessAlert } = useSweetAlert();

  // ── Auth ───────────────────────────────────────────────────────────────────
  const [ClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string)
  );

  // ── UI State ───────────────────────────────────────────────────────────────
  const [BankINRValues, setBankINRValues]       = useState<any>(null);
  const [profileInfo, setProfileInfo]           = useState<any>({});
  const [imagePreview, setImagePreview]         = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [spinner, setSpinner] = useState({ FormName: "bankINR", Action: false });

  // ── Validation Schema ──────────────────────────────────────────────────────
  const Bank_Details_Valid_Schema = Yup.object({
    BankName: Yup.string()
      .required("Bank Name is required")
      .min(3, "Bank Name must be at least 3 characters"),
    IFSC: Yup.string()
      .required("IFSC Code is required")
      .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC Code"),
    AccountNo: Yup.string()
      .required("Account Number is required")
      .matches(/^\d{9,18}$/, "Account Number must be 9-18 digits"),
    BranchName: Yup.string()
      .required("Branch Name is required")
      .min(2, "Branch Name is too short"),
    AccountHolderName: Yup.string()
      .required("Account Holder Name is required")
      .min(2, "Name must be at least 2 characters"),
    OTP: Yup.string()
      .required("OTP is required")
      .matches(/^\d{6}$/, "OTP must be 6 digits"),
  });

  // ── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    GetBankDetails();
    Get_MyProfileData();
  }, []);

  const GetBankDetails = async () => {
    const param = { ClientId: ClientID, ActionMode: "GetBankDetails" };
    const obj   = { procName: "MemberAccountSetting", Para: JSON.stringify(param) };
    const res   = await universalService(obj);
    setBankINRValues({
      IFSC:              res[0]?.IFSC              ?? "",
      BankName:          res[0]?.BankName          ?? "",
      BranchName:        res[0]?.BranchName        ?? "",
      AccountNo:         res[0]?.AccountNo         ?? "",
      AccountHolderName: res[0]?.AccountHolderName ?? "",
      OTP:               "",
    });
  };

  const Get_MyProfileData = async () => {
    const param = { ClientId: ClientID, ActionMode: "GetProfile" };
    const obj   = { procName: "MemberProfile", Para: JSON.stringify(param) };
    const res   = await universalService(obj);
    const data  = res?.[0] ?? {};
    setProfileInfo(data);
    if (data?.ClientLogo) {
      setImagePreview(
        `${import.meta.env.VITE_IMAGE_PREVIEW_URL}ClientImages/${data.ClientLogo}`
      );
      setUploadedFileName(data.ClientLogo);
    }
  };

  // ── Derived profile display values ─────────────────────────────────────────
  const fullName    = [profileInfo?.FirstName, profileInfo?.LastName].filter(Boolean).join(" ") || "User";
  const uid         = profileInfo?.Username   ?? "—";
  const memberSince = profileInfo?.MemberSince ?? "—";
  const lastLogin   = profileInfo?.LastLogin
    ? new Date(profileInfo.LastLogin).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      })
    : new Date().toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
      });
  const email  = profileInfo?.EmailId   ?? "—";
  const phone  = profileInfo?.ContactNo ?? "—";
  const status = profileInfo?.MemberStatus ?? "—";

  // ── OTP Handlers ───────────────────────────────────────────────────────────

  /**
   * Checks whether all bank fields are filled before allowing OTP send.
   * Returns true if the form is ready, false (+ shows alert) otherwise.
   */
  const isFormReadyForOTP = (values: any): boolean => {
    const { BankName, IFSC, AccountNo, BranchName } = values;

    if (!BankName?.trim()) {
      showAlert("Oops!", "Please enter the Bank Name before requesting OTP.");
      return false;
    }
    if (!IFSC?.trim()) {
      showAlert("Oops!", "Please enter the IFSC Code before requesting OTP.");
      return false;
    }
    if (!AccountNo?.trim()) {
      showAlert("Oops!", "Please enter the Account Number before requesting OTP.");
      return false;
    }
    if (!BranchName?.trim()) {
      showAlert("Oops!", "Please enter the Branch Name before requesting OTP.");
      return false;
    }

    // Pattern-level checks (mirrors Yup schema, so the user gets instant feedback)
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(IFSC.trim())) {
      showAlert("Oops!", "Please enter a valid IFSC Code (e.g. SBIN0001234).");
      return false;
    }
    if (!/^\d{9,18}$/.test(AccountNo.trim())) {
      showAlert("Oops!", "Account Number must be 9-18 digits.");
      return false;
    }

    return true;
  };

  const startTimer = (secondsLeft: number) => {
    setOtpTimer(secondsLeft - 1);
    const id = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 0) {
          clearInterval(id);
          setIsOtpSent(false);
          setDisablebtn(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOTP = async (values: any) => {
    // Guard: form must be complete and valid before sending OTP
    if (!isFormReadyForOTP(values)) return;

    setDisablebtn(true);

    try {
      const res = await universalService({
        procName: "SendOTP",
        Para: JSON.stringify({ ClientId: ClientID }),
      });

      if (res[0].StatusCode == 1) {
        setIsOtpSent(true);
        ShowSuccessAlert("OTP sent to your registered email Id");
        startTimer(res[0].SecondsLeft);
      } else {
        // Re-enable button so user can retry
        setDisablebtn(false);
        showAlert("Oops!", res[0].Msg ?? "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("OTP send error:", error);
      setDisablebtn(false);
      showAlert("Oops!", "Something went wrong while sending OTP.");
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const resetOtpState = (setFieldValue: (f: string, v: string) => void) => {
    setIsOtpSent(false);
    setOtpTimer(0);
    setDisablebtn(false);
    setFieldValue("OTP", "");
  };

  const Update_BankINR = async (values: Bank_INRpropsType, setFieldValue: (f: string, v: string) => void) => {
    const confirmResult = await Swal.fire({
      title:             "Update Bank Details?",
      text:              "Are you sure you want to update bank information?",
      icon:              "question",
      showCancelButton:  true,
      confirmButtonText: "Yes, Update",
      cancelButtonText:  "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor:  "#d33",
    });
    if (!confirmResult.isConfirmed) return;

    setSpinner({ FormName: "bankINR", Action: true });
    const { IFSC, BankName, BranchName, AccountNo, AccountHolderName, OTP } = values;

    if (!OTP?.trim()) {
      showAlert("Oops!", "Please enter the OTP sent to your email before updating.");
      return;
    }

    try {
      const param = {
        ClientId: ClientID,
        IFSC,
        BankName,
        BranchName,
        AccountNo,
        AccountHolderName,
        OTP,
        ActionMode: "UpdateBankDetails",
      };
      const obj = { procName: "MemberAccountSetting", Para: JSON.stringify(param) };
      const res = await universalService(obj);

      setSpinner({ FormName: "bankINR", Action: false });

      if (res[0].StatusCode == "1") {
        resetOtpState(setFieldValue);
        ShowSuccessAlert(res[0].Msg);
      } else {
        showAlert("Oops!", res[0].Msg);
      }
    } catch (error) {
      console.error("Bank update error:", error);
      setSpinner({ FormName: "bankINR", Action: false });
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {loading && <Loader />}
      <Breadcrumbs mainTitle="Bank Account" parent="Account Settings" />

      <Container fluid>
        <div className="bank-page-wrapper">
          <div className="row g-4 align-items-start">

            {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
            <div className="col-lg-4">
              <div className="bank-left-card">
                <div className="bank-left-top">
                  <div className="bank-avatar-wrapper">
                    <img
                      src={imagePreview || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt="avatar"
                      className="bank-avatar-img"
                    />
                  </div>
                </div>

                <div className="bank-left-body">
                  <h4 className="bank-user-name">{fullName}</h4>
                  <p className="bank-user-uid">{uid}</p>

                  <span className={`bank-status-badge ${status === "Paid" ? "paid" : "unpaid"}`}>
                    {status}
                  </span>

                  <div className="bank-stats">
                    <div className="bank-stat-item">
                      <div className="bank-stat-icon"><FiCalendar size={16} /></div>
                      <div>
                        <p className="bank-stat-label">Registration Date</p>
                        <p className="bank-stat-value">{memberSince}</p>
                      </div>
                    </div>
                    <div className="bank-stat-item">
                      <div className="bank-stat-icon"><FiUser size={16} /></div>
                      <div>
                        <p className="bank-stat-label">User ID</p>
                        <p className="bank-stat-value">{uid}</p>
                      </div>
                    </div>
                    <div className="bank-stat-item">
                      <div className="bank-stat-icon"><FiClock size={16} /></div>
                      <div>
                        <p className="bank-stat-label">Last Login</p>
                        <p className="bank-stat-value">{lastLogin}</p>
                      </div>
                    </div>
                    <div className="bank-stat-item">
                      <div className="bank-stat-icon"><FiMail size={16} /></div>
                      <div>
                        <p className="bank-stat-label">Email</p>
                        <p className="bank-stat-value">{email}</p>
                      </div>
                    </div>
                    <div className="bank-stat-item">
                      <div className="bank-stat-icon"><FiPhone size={16} /></div>
                      <div>
                        <p className="bank-stat-label">Phone</p>
                        <p className="bank-stat-value">{phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bank-help-box">
                    <div className="bank-help-icon">🎧</div>
                    <div>
                      <p className="bank-help-title">Need Help?</p>
                      <p className="bank-help-desc">
                        Contact our support team if you need assistance updating your profile.
                      </p>
                      <span
                        className="bank-help-link"
                        onClick={() => navigate("/portal/supportticket")}
                      >
                        Support Ticket
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
            <div className="col-lg-8">
              <div className="bank-right-card">
                <h5 className="bank-form-title">Bank Details</h5>
                <p className="bank-form-subtitle">
                  Please enter your bank account details carefully. These details
                  will be used for withdrawals and payouts.
                </p>

                <Formik
                  initialValues={BankINRValues || ActsettingBankINR}
                  validationSchema={Bank_Details_Valid_Schema}
                  onSubmit={(values, { setSubmitting, setFieldValue }) => {
                    Update_BankINR(values, setFieldValue);
                    setSubmitting(false);
                  }}
                  enableReinitialize
                >
                  {({ isSubmitting, values }) => (
                    <Form>

                      {/* Row 1: Bank Name + IFSC */}
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="bank-field-label">Bank Name</label>
                          <div className="bank-input-wrap">
                            <span className="bank-input-icon"><FiHome /></span>
                            <Field
                              type="text"
                              name="BankName"
                              autoComplete="off"
                              className="bank-input st-filter-input"
                              placeholder="Enter Bank Name"
                            />
                          </div>
                          <ErrorMessage name="BankName" component="div" className="bank-error" />
                        </div>

                        <div className="col-md-6">
                          <label className="bank-field-label">IFSC Code</label>
                          <div className="bank-input-wrap">
                            <span className="bank-input-icon"><FiHash /></span>
                            <Field
                              type="text"
                              name="IFSC"
                              autoComplete="off"
                              className="bank-input st-filter-input"
                              placeholder="Enter IFSC Code"
                            />
                          </div>
                          <ErrorMessage name="IFSC" component="div" className="bank-error" />
                        </div>
                      </div>

                      {/* Row 2: Account No + Branch Name */}
                      <div className="row g-3 mb-3">
                        <div className="col-md-6">
                          <label className="bank-field-label">Account Number</label>
                          <div className="bank-input-wrap">
                            <span className="bank-input-icon"><FiCreditCard /></span>
                            <Field
                              type="text"
                              name="AccountNo"
                              autoComplete="off"
                              className="bank-input st-filter-input"
                              placeholder="Enter Account Number"
                            />
                          </div>
                          <ErrorMessage name="AccountNo" component="div" className="bank-error" />
                        </div>

                        <div className="col-md-6">
                          <label className="bank-field-label">Branch Name</label>
                          <div className="bank-input-wrap">
                            <span className="bank-input-icon"><FiMapPin /></span>
                            <Field
                              type="text"
                              name="BranchName"
                              autoComplete="off"
                              className="bank-input st-filter-input"
                              placeholder="Enter Branch Name"
                            />
                          </div>
                          <ErrorMessage name="BranchName" component="div" className="bank-error" />
                        </div>
                      </div>

                      {/* Row 3: Account Holder Name */}
                      <div className="row g-3 mb-3">
                        <div className="col-md-12">
                          <label className="bank-field-label">Account Holder Name</label>
                          <div className="bank-input-wrap">
                            <span className="bank-input-icon"><FiUser /></span>
                            <Field
                              type="text"
                              name="AccountHolderName"
                              autoComplete="off"
                              className="bank-input st-filter-input"
                              placeholder="Enter Account Holder Name"
                            />
                          </div>
                          <ErrorMessage name="AccountHolderName" component="div" className="bank-error" />
                        </div>
                      </div>

                      <hr className="bank-divider" />

                      {/* Verification Notice */}
                      <div className="bank-verify-box">
                        <span className="bank-verify-icon"><FiShield /></span>
                        <div>
                          <p className="bank-verify-title">Verification Required</p>
                          <p className="bank-verify-desc">
                            An OTP will be sent to your registered email to verify
                            this update. Please fill all fields above before
                            requesting OTP.
                          </p>
                        </div>
                      </div>

                      {/* OTP Field */}
                      <div className="mb-3">
                        <label className="bank-field-label">OTP</label>
                        <div className="bank-input-wrap">
                          <span className="bank-input-icon"><FiLock /></span>
                          <Field
                            type="text"
                            name="OTP"
                            autoComplete="off"
                            className="bank-input st-filter-input"
                            placeholder="Enter 6 Digit OTP"
                            maxLength={6}
                          />
                          <button
                            type="button"
                            className="bank-send-otp-btn"
                            // Disabled when: timer is running OR form fields are empty/invalid
                            disabled={
                              disablebtn ||
                              !values.BankName?.trim() ||
                              !values.IFSC?.trim() ||
                              !values.AccountNo?.trim() ||
                              !values.BranchName?.trim() ||
                              !values.AccountHolderName?.trim() ||
                              !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(values.IFSC?.trim() ?? "") ||
                              !/^\d{9,18}$/.test(values.AccountNo?.trim() ?? "")
                            }
                            onClick={() => handleSendOTP(values)}
                          >
                            {isOtpSent ? FormatTime(otpTimer) : "Send OTP"}
                          </button>
                        </div>
                        <ErrorMessage name="OTP" component="div" className="bank-error" />

                        {/* Helper text when fields are incomplete */}
                        {(!values.BankName?.trim() ||
                          !values.IFSC?.trim() ||
                          !values.AccountNo?.trim() ||
                          !values.BranchName?.trim() ||
                          !values.AccountHolderName?.trim()) && (
                          <p className="bank-otp-hint">
                            ⚠️ Fill all bank details above to enable OTP.
                          </p>
                        )}

                        {/* Countdown once OTP is sent */}
                        {isOtpSent && (
                          <p className="bank-otp-timer">
                            🕐 OTP will expire in <strong>{FormatTime(otpTimer)}</strong>
                          </p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="bank-form-actions">
                        <button
                          type="submit"
                          className="form-btn btn"
                          disabled={isSubmitting}
                        >
                          🖊 Update Bank Details
                          {spinner.Action && spinner.FormName === "bankINR" && (
                            <div className="spinner-border spinner-border-sm ms-2" role="status">
                              <span className="sr-only">Loading...</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>

              {/* Secure Footer */}
              <div className="bank-secure-box">
                <span className="bank-secure-icon">🔒</span>
                <div>
                  <p className="bank-secure-title">Secure &amp; Safe</p>
                  <p className="bank-secure-desc">
                    Your bank details are encrypted and secured. We never share
                    your banking information with anyone.
                  </p>
                </div>
                <span className="bank-secure-check">✅</span>
              </div>
            </div>

          </div>
        </div>
      </Container>
    </>
  );
};

export default BorderTabContent;