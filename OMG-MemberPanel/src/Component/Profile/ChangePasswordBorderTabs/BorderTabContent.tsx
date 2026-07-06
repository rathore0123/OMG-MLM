import React, { useState } from "react";
import { Card, CardBody, Row, Col, FormGroup, Label } from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FaRegEye } from "react-icons/fa6";
import { IoEyeOffOutline } from "react-icons/io5";
import * as Yup from "yup";
import { ApiService } from "../../../Service/UniversalService/ApiService";
import { useSweetAlert } from "../../../Context/SweetAlertContext";
import { decryptData } from "../../../utils/helper/Crypto";
import Swal from "sweetalert2";
import { FiLock, FiUser } from "react-icons/fi";

// ✅ Validation Schema
const ChangePasswordSchema = Yup.object().shape({
  OldPassword: Yup.string().required("Old Password is required"),
  NewPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New Password is required"),
  ConfirmPassword: Yup.string()
    .oneOf([Yup.ref("NewPassword")], "Passwords must match")
    .required("Confirm Password is required"),
});

const ChangePasswordPage = () => {
  const { universalService } = ApiService();
  const [ClientID, setClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const { showAlert, showInputAlert, ShowSuccessAlert } = useSweetAlert();
  const [loading, setLoading] = useState(false);

  const toggle = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChangePassword = async (values, { resetForm }) => {
    try {
      setLoading(true);

      const res = await universalService({
        procName: "MemberProfile",
        Para: JSON.stringify({
          ActionMode: "ChangePassword",
          ClientId: ClientID,
          CurrentPassword: values.OldPassword,
          NewPassword: values.NewPassword,
          ConfirmPassword: values.ConfirmPassword,
        }),
      });

      const result = res?.[0] || res?.data?.[0];

      if (result?.StatusCode === "1") {
        ShowSuccessAlert(result?.Msg || "Password changed successfully");
        resetForm();
      } else {
        showAlert("Error", result?.Msg || "Password change failed");
      }
    } catch (err) {
      console.error("Change Password Error", err);
      showAlert("Error", "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* RIGHT SIDE (FORM) */}
      <Col md="4">
        {/* <h3 className="fw-bold mb-4">🔐 Change Password</h3> */}
        <Card className="form_Card">
          <CardBody className="form_Card">
            <Formik
              initialValues={{
                OldPassword: "",
                NewPassword: "",
                ConfirmPassword: "",
              }}
              validationSchema={ChangePasswordSchema}
              onSubmit={async (values, { resetForm, setSubmitting }) => {
                const result = await Swal.fire({
                  title: "Are you sure?",
                  text: "Do you want to change your password?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonText: "Yes, Change",
                  cancelButtonText: "Cancel",
                  confirmButtonColor: "#3085d6",
                  cancelButtonColor: "#d33",
                });

                if (result.isConfirmed) {
                  await handleChangePassword(values, { resetForm });
                }

                setSubmitting(false);
              }}
            >
              {() => (
                <Form>
                  {/* OLD PASSWORD */}

                  <div className="form-field position-relative mb-3">
                    <label>Old Password</label>
                    <div className="input-icon-wrap">
                      <span className="input-icon">
                        <FiLock size={14} />
                      </span>
                      <Field
                        type={showPassword.old ? "text" : "password"}
                        name="OldPassword"
                        className="st-filter-input profile-input  with-icon"
                        placeholder="Enter old password"
                      />
                    </div>
                    <span
                     className="passwordEYE"
                      onClick={() => toggle("old")}
                    >
                      {showPassword.old ? (
                        <IoEyeOffOutline size={18} />
                      ) : (
                        <FaRegEye size={18} />
                      )}
                    </span>

                    <ErrorMessage
                      name="OldPassword"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </div>

                  {/* NEW PASSWORD */}
                  <div className="form-field position-relative mb-3">
                    <label>New Password</label>
                    <div className="input-icon-wrap">
                      <span className="input-icon">
                        <FiLock size={14} />
                      </span>
                      <Field
                        type={showPassword.new ? "text" : "password"}
                        name="NewPassword"
                        className="st-filter-input  profile-input  with-icon"
                        placeholder="Enter new password"
                      />
                    </div>
                    <span
                     className="passwordEYE"
                      onClick={() => toggle("new")}
                    >
                      {showPassword.new ? (
                        <IoEyeOffOutline size={18} />
                      ) : (
                        <FaRegEye size={18} />
                      )}
                    </span>

                    <ErrorMessage
                      name="NewPassword"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </div>

                  {/* CONFIRM PASSWORD */}
                  <div className="form-field position-relative mb-3">
                    <label>Confirm Password</label>
                    <div className="input-icon-wrap">
                      <span className="input-icon">
                        <FiLock size={14} />
                      </span>
                      <Field
                        type={showPassword.confirm ? "text" : "password"}
                        name="ConfirmPassword"
                        className="st-filter-input profile-input  with-icon"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <span
                      className="passwordEYE"
                      onClick={() => toggle("confirm")}
                    >
                      {showPassword.confirm ? (
                        <IoEyeOffOutline size={18} />
                      ) : (
                        <FaRegEye size={18} />
                      )}
                    </span>

                    <ErrorMessage
                      name="ConfirmPassword"
                      component="div"
                      className="text-danger small mt-1"
                    />
                  </div>

                  <div className="w-100 d-flex justify-content-end">
                    {/* SUBMIT BUTTON */}
                    <button
                      type="submit"
                      className="btn form-btn"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Change Password"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </CardBody>
        </Card>
      </Col>
      {/* LEFT SIDE (IMAGE / INFO) */}
      <Col
        md="8"
        className="text-center d-md-block d-none mb-4 mb-md-0 change-pass-left"
      >
        <Card className="form_Card">
          <CardBody className="form_Card">
            <div className="change-pass-card">
              {/* RIGHT CONTENT */}
              <div className="card-right">
                <h4>Change Password</h4>

                <p>
                  Keep your account secure by updating your password regularly.
                </p>

                <ul>
                  <li>Use a strong & unique password</li>
                  <li>Never share your credentials</li>
                  <li>Update your password regularly</li>
                  <li>Avoid using common or easy passwords</li>
                  <li>Enable additional security if available</li>
                  <li>Keep your login details private</li>
                </ul>
              </div>
              {/* LEFT ICON / IMAGE */}
              <div className="card-left">
                <img
                  src="./assets/images/forms/changePas.png"
                  alt="Change Password"
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </>
  );
};

export default ChangePasswordPage;
