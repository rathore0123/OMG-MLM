import React, { useEffect, useState } from "react";
import "./profile.scss";
import { Camera } from "react-feather";
import { Card } from "reactstrap";
import { Formik, Field, Form, ErrorMessage } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import {
  EditProfile,
  profile,
  UpdateProfile,
  MobileNo,
  DOB,
  EmailId,
  Country,
} from "../../utils/Constant";
import { FiCalendar, FiUser, FiClock, FiMail, FiPhone } from "react-icons/fi";
import { Personal_Details } from "../../Type/Forms/FormsType";
import { Personal_DetailsValid_Schema } from "../../Forms/FormsVailidationSchema";
import { useSweetAlert } from "../../Context/SweetAlertContext";
import { ApiService } from "../../Service/UniversalService/ApiService";
import { PostService } from "../../Service/PostService/PostService";
import { decryptData } from "../../utils/helper/Crypto";
import Loader from "../../CommonElements/Loader/Loader";
import Swal from "sweetalert2";
import CountryWithFlag from "../../Component/Authentication/CountryWithFlag";
import { useNavigate } from "react-router-dom";
import CropperModal from "../../CommonElements/Cropper/Cropper";
import { useProfile } from "../../Context/ProfileContext";
// ← context

const ProfilePage: React.FC = () => {
  const [ClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );
  const navigate = useNavigate();

  /* ── Context ── */
  const { profile, profileLoading, avatarUrl, setAvatarUrl, refreshProfile } =
    useProfile();

  /* ── Cropper state ── */
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState("");

  /* ── Local upload state ── */
  const [uploadedFileName, setUploadedFileName] = useState(
    profile?.ClientLogo ?? "",
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [spinner, setSpinner] = useState({
    FormName: "Myprofile",
    Action: false,
  });

  /* ── Services ── */
  const { universalService } = ApiService();
  const { postDocument } = PostService();
  const { showAlert, ShowSuccessAlert } = useSweetAlert();

  const lastLogin = new Date().toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  /* ── Formik initial values derived from context ── */
  const formInitialValues = profile
    ? {
        FirstName: profile.FirstName,
        LastName: profile.LastName,
        MobileNo: profile.ContactNo,
        EmailId: profile.EmailId,
        DateofBirth: profile.DOB ? new Date(profile.DOB) : null,
        CountryName: profile.CountryName,
      }
    : Personal_Details;

  /* ── Step 1: file chosen → read → open cropper ── */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const reader = new FileReader();
    reader.onloadend = () => {
      setRawImageSrc(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  /* ── Step 2: cropped base64 → preview (instant) + server upload ── */
  const handleCropDone = async (croppedDataUrl: string) => {
    setAvatarUrl(croppedDataUrl); // instant update in ALL components via context

    const blob = await fetch(croppedDataUrl).then((r) => r.blob());
    const file = new File([blob], "profile.png", { type: "image/png" });

    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("UploadedImage", file);
      fd.append("pagename", "ClientImages");

      const res = await postDocument(fd);
      const fileName = res?.fileName || res?.Message;

      if (!fileName) {
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: "Could not upload the image.",
        });
        setAvatarUrl(profile?.AvatarUrl ?? ""); // revert on fail
        return;
      }

      setUploadedFileName(fileName);
    } catch (err) {
      console.error("Image upload error:", err);
      Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: "Something went wrong.",
      });
      setAvatarUrl(profile?.AvatarUrl ?? "");
    } finally {
      setImageUploading(false);
    }
  };

  /* ── Update profile ── */
  const Update_PersonalDetails = async (values: any) => {
    setSpinner({ FormName: "Myprofile", Action: true });
    try {
      const {
        FirstName,
        LastName,
        MobileNo,
        EmailId,
        DateofBirth,
        CountryName,
      } = values;

      const param = {
        ActionMode: "UpdateProfile",
        ClientId: ClientID,
        FirstName,
        LastName,
        ContactNo: MobileNo,
        EmailId,
        DOB: DateofBirth ? format(new Date(DateofBirth), "yyyy-MM-dd") : null,
        CountryName,
        ClientLogo: uploadedFileName || profile?.ClientLogo || "",
      };

      const res = await universalService({
        procName: "MemberProfile",
        Para: JSON.stringify(param),
      });

      if (res?.[0]?.StatusCode === "1") {
        ShowSuccessAlert(res[0]?.Msg);
        await refreshProfile(); // ← re-fetches and updates context everywhere
      } else {
        showAlert("Oops!", res?.[0]?.Msg ?? "Something went wrong.");
      }
    } catch (err) {
      console.error("Profile update failed:", err);
    }
    setSpinner({ FormName: "Myprofile", Action: false });
  };
  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <div className="mlm-profile-page">
      {profileLoading && <Loader />}

      {/* Cropper modal */}
      <CropperModal
        open={cropperOpen}
        image={rawImageSrc}
        aspectRatio={1}
        onCrop={handleCropDone}
        onClose={() => setCropperOpen(false)}
      />

      <Breadcrumbs
        mainTitle={EditProfile}
        parent={"Profile"}
        ChildName={"My Profile"}
      />

      <div className="container-fluid">
        <div className="row g-4 align-items-start">
          {/* ══ LEFT PANEL ══════════════════════════════════════════════ */}
          <div className="col-lg-4">
            <Card className="left-panel-card">
              <div className="bank-left-top">
                <div className="bank-avatar-wrapper">
                  <img
                    src={avatarUrl} // ← always from context
                    alt="avatar"
                    className="bank-avatar-img"
                  />

                  {imageUploading && (
                    <div className="avatar-uploading-overlay">
                      <div
                        className="spinner-border spinner-border-sm text-light"
                        role="status"
                      />
                    </div>
                  )}

                  <label
                    className={`bank-avatar-edit avatar-edit-btn${imageUploading ? " disabled" : ""}`}
                    title="Change photo"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={imageUploading}
                      hidden
                    />
                    <Camera size={14} />
                  </label>
                </div>
              </div>

              <div className="card-body">
                <div className="avatar-section">
                  {imageUploading && (
                    <p className="upload-hint">Uploading image…</p>
                  )}

                  <h4 className="user-name">{profile?.FullName ?? "—"}</h4>
                  <p className="user-uid">{profile?.Username ?? "—"}</p>
                  <span
                    className={`status-badge ${profile?.MemberStatus === "Paid" ? "paid" : "unpaid"}`}
                  >
                    {profile?.MemberStatus ?? "—"}
                  </span>
                </div>

                <div className="stats-list">
                  <div className="stat-item">
                    <div className="stat-icon">
                      <FiCalendar size={16} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Registration Date</p>
                      <p className="stat-value">
                        {profile?.MemberSince ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <FiUser size={16} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">User ID</p>
                      <p className="stat-value">{profile?.Username ?? "—"}</p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <FiClock size={16} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Last Login</p>
                      <p className="stat-value">{lastLogin}</p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <FiMail size={16} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Email</p>
                      <p className="stat-value email-val">
                        {profile?.EmailId ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon">
                      <FiPhone size={16} />
                    </div>
                    <div className="stat-content">
                      <p className="stat-label">Phone</p>
                      <p className="stat-value">{profile?.ContactNo ?? "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="help-box">
                  <div className="help-icon">🎧</div>
                  <div>
                    <p className="help-title">Need Help?</p>
                    <p className="help-desc">
                      Contact our support team if you need assistance updating
                      your profile.
                    </p>
                    <span
                      className="help-link"
                      onClick={() => navigate("/portal/supportticket")}
                    >
                      Support Ticket
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ══ RIGHT PANEL ═════════════════════════════════════════════ */}
          <div className="col-lg-8">
            <Card className="right-panel-card">
              <div className="card-body">
                <h5 className="form-section-title">Personal Information</h5>
                <p className="form-section-sub">
                  Please update your details below. Make sure all information is
                  correct.
                </p>

                <Formik
                  initialValues={formInitialValues}
                  validationSchema={Personal_DetailsValid_Schema}
                  enableReinitialize
                  onSubmit={async (values, { setSubmitting }) => {
                    if (imageUploading) {
                      Swal.fire({
                        icon: "info",
                        title: "Please wait",
                        text: "Image is still uploading.",
                      });
                      setSubmitting(false);
                      return;
                    }
                    const result = await Swal.fire({
                      title: "Are you sure?",
                      text: "Do you want to update your profile?",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonText: "Yes, Update",
                      cancelButtonText: "Cancel",
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#d33",
                    });
                    if (result.isConfirmed)
                      await Update_PersonalDetails(values);
                    setSubmitting(false);
                  }}
                >
                  {({
                    errors,
                    touched,
                    setFieldValue,
                    values,
                    isSubmitting,
                  }) => (
                    <Form>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="form-field">
                            <label>First Name</label>
                            <div className="input-icon-wrap">
                              <span className="input-icon">
                                <FiUser size={14} />
                              </span>
                              <Field
                                name="FirstName"
                                type="text"
                                className="st-filter-input profile-input with-icon"
                                placeholder="Enter First Name"
                              />
                            </div>
                            <ErrorMessage
                              name="FirstName"
                              component="div"
                              className="field-error"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-field">
                            <label>Last Name</label>
                            <div className="input-icon-wrap">
                              <span className="input-icon">
                                <FiUser size={14} />
                              </span>
                              <Field
                                name="LastName"
                                type="text"
                                className="st-filter-input profile-input with-icon"
                                placeholder="Enter Last Name"
                              />
                            </div>
                            <ErrorMessage
                              name="LastName"
                              component="div"
                              className="field-error"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-field">
                            <label>{MobileNo}</label>
                            <div className="input-icon-wrap">
                              <span className="input-icon">
                                <FiPhone size={14} />
                              </span>
                              <Field
                                disabled
                                name="MobileNo"
                                type="text"
                                className="profile-input st-filter-input with-icon"
                                placeholder="Enter Mobile Number"
                              />
                            </div>
                            <ErrorMessage
                              name="MobileNo"
                              component="div"
                              className="field-error"
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="form-field">
                            <label>{DOB}</label>
                            <div className="input-icon-wrap">
                              <span className="input-icon">
                                <FiCalendar size={14} />
                              </span>
                              <Field name="DateofBirth">
                                {({ field }: any) => (
                                  <DatePicker
                                    className={`profile-input st-filter-input with-icon${errors.DateofBirth && touched.DateofBirth ? " input-error" : ""}`}
                                    dateFormat="dd-MMMM-yyyy"
                                    selected={
                                      field.value ? new Date(field.value) : null
                                    }
                                    onChange={(date: Date | null) =>
                                      setFieldValue("DateofBirth", date)
                                    }
                                    placeholderText="Select Date of Birth"
                                  />
                                )}
                              </Field>
                            </div>
                            <ErrorMessage
                              name="DateofBirth"
                              component="div"
                              className="field-error"
                            />
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="form-field">
                            <label>{EmailId}</label>
                            <div className="input-icon-wrap">
                              <span className="input-icon">
                                <FiMail size={14} />
                              </span>
                              <Field
                                name="EmailId"
                                type="email"
                                disabled
                                className="profile-input st-filter-input with-icon"
                                placeholder="Email Address"
                              />
                            </div>
                            <ErrorMessage
                              name="EmailId"
                              component="div"
                              className="field-error"
                            />
                          </div>
                        </div>

                        <div className="col-md-12">
                          <div className="form-field">
                            <label>{Country}</label>
                            <div className="input-icon-wrap CountryWithFlag">
                              <CountryWithFlag
                                value={values.CountryName}
                                SetCountryName={(country) =>
                                  setFieldValue("CountryName", country)
                                }
                              />
                            </div>
                            <ErrorMessage
                              name="CountryName"
                              component="div"
                              className="field-error"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="notice-box">
                        <span className="notice-icon">ℹ️</span>
                        <p>
                          <strong>Important:</strong> Please ensure your email
                          and phone number are correct. These will be used for
                          account verification and important notifications.
                        </p>
                      </div>

                      <div className="form-actions">
                        <button
                          type="submit"
                          className="form-btn btn"
                          disabled={isSubmitting || imageUploading}
                          title={
                            imageUploading
                              ? "Please wait for image upload to complete"
                              : ""
                          }
                        >
                          🖊 {UpdateProfile}
                          {((spinner.Action &&
                            spinner.FormName === "Myprofile") ||
                            imageUploading) && (
                            <div
                              className="spinner-border spinner-border-sm ms-2"
                              role="status"
                            >
                              <span className="sr-only">Loading…</span>
                            </div>
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
