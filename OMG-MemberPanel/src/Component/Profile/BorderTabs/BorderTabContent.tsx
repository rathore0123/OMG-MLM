import React, { useEffect } from "react";
import { useState } from "react";
import {
  CardBody,
  FormGroup,
  Input,
  Label,
  TabContent,
  TabPane,
  Card,
  CardFooter,
  Col,
  Row,
} from "reactstrap";
import { P, Btn, Image } from "../../../AbstractElements";
import {
  EmailAddress,
  Address,
  DOB,
  Fathername,
  MaritalStatus,
  EmailId,
  Title,
  Name,
  MobileNo,
  UpdateProfile,
  Gender,
  telephone,
  State,
  Country,
  chooseCity,
  choosePincode,
  NomineeRelation,
  NomineeName,
} from "../../../utils/Constant";
import { TabContentProp } from "../../../Type/Profile/ProfileType";
import { Formik, Field, Form, ErrorMessage } from "formik";
import {
  Personal_Details,
  Nominee_Details,
  Change_Password,
  Personal_Details_propsType,
  Nominee_Details_propsType,
  Password_Change_PropsType,
} from "../../../Type/Forms/FormsType";
import {
  Personal_DetailsValid_Schema,
  Nominee_DetailsValid_Schema,
  Change_PasswordValid_Schema,
} from "../../../Forms/FormsVailidationSchema";
// import { decryptData } from "../../../utils/helper/Crypto";
import { useSweetAlert } from "../../../Context/SweetAlertContext";
import { Profile_Service } from "../../../Service/MyProfile/Myprofile";
import { IoEyeOffOutline } from "react-icons/io5";
import { FaRegEye } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import moment from "moment";
import { format } from "date-fns";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css";
import { DatePickerField } from "../../../CommonElements/DatePicker/DatePicker";
import Loader from "../../../CommonElements/Loader/Loader";
import { ChangeDateintoLongDate } from "../../../utils/helper/opreaton";
import { dynamicImage } from "../../../Service";
import { decryptData } from "../../../utils/helper/Crypto";
import { ApiService } from "../../../Service/UniversalService/ApiService";
import Swal from "sweetalert2";

interface ExtendedpropsType extends TabContentProp {
  setUserData: any;
}

type ValuePiece = Date | null;

const BorderTabContent: React.FC<ExtendedpropsType> = (props) => {
  const { basicTab, setUserData } = props;
  const [ClientID, setClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );
  const [UserToken, setUserToken] = useState(
    decryptData(localStorage.getItem("userToken") as string),
  );
  const [profileInfo, setProfileInfo] = useState<any>({});
  const [P_Details, set_P_Details] = useState<any>(null);
  const [N_Details, setN_Details] = useState<any>(null);
  const [spinner, setspinner] = useState({
    FormName: "Myprofile",
    Action: false,
  });
  const { universalService } = ApiService();
  const { GetProfile_Details, UpdateUser_Profile, loading } = Profile_Service();
  const { showAlert, showInputAlert, ShowSuccessAlert } = useSweetAlert();
  const [startDate, setStartDate] = useState(null);
  registerLocale("es", es);
  const [eyeIcon, setEyeIcon] = useState<any[]>([
    { btnName: "OldPassword", action: false },
    { btnName: "NewPassword", action: false },
    { btnName: "ConfirmPassword", action: false },
  ]);

  useEffect(() => {
    Get_MyProfileData();
  }, []);

  //========== Getting MyProfile Data
  const Get_MyProfileData = async () => {
    const param = {
      ClientId: ClientID,
      ActionMode: "GetProfile",
    };

    const obj = {
      procName: "MemberProfile",
      Para: JSON.stringify(param),
    };
    const res = await universalService(obj);
    setUserData(res);
    setProfileInfo(res[0]);
    const ProfileValues = {
      FirstName: res[0]?.FirstName,
      LastName: res[0]?.LastName,
      MobileNo: res[0]?.ContactNo,
      EmailId: res[0]?.EmailId,
      DateofBirth: res[0]?.DOB ? new Date(res[0]?.DOB) : null,
      CountryName: res[0]?.CountryName,
    };

    const Nominee_Values = {
      NomineeName: res[0]?.NomineeName,
      NomineeRelation: res[0]?.NomineeRelation,
      NomineeDOB: res[0]?.NomineeDOB,
      NomineeNationalId: res[0]?.NomineeNationalId,
      NomineeDrivingLicence: res[0]?.NomineeDrivingLicence,
      NomineePassportNumber: res[0]?.NomineePassportNumber,
    };
    set_P_Details(ProfileValues);
    setN_Details(Nominee_Values);
  };

  //======== Updating Profile Personal Details
  const Update_PersonalDetails = async (values: Personal_Details_propsType) => {
    setspinner({ FormName: "Myprofile", Action: true });

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
        FirstName: FirstName,
        LastName: LastName,
        ContactNo: MobileNo,
        EmailId: EmailId,
        DOB: DateofBirth ? format(new Date(DateofBirth), "yyyy-MM-dd") : null,
        CountryName: CountryName,
      };

      const obj = {
        procName: "MemberProfile",
        Para: JSON.stringify(param),
      };

      const res = await universalService(obj);

      if (res[0].StatusCode == "1") {
        ShowSuccessAlert(res[0]?.Msg);
      } else {
        showAlert("Opps!", res[0].Msg);
      }
    } catch (error) {
      console.error("Error in update Failed: ", error);
    }

    setspinner({ FormName: "Myprofile", Action: false });
  };

  return (
    <TabContent activeTab={basicTab}>
      <TabPane tabId="1" className="mt-2">
        <Formik
          initialValues={P_Details || Personal_Details}
          validationSchema={Personal_DetailsValid_Schema}
          enableReinitialize
          onSubmit={async (values: any, { setSubmitting }) => {
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

            if (result.isConfirmed) {
              await Update_PersonalDetails(values);
            }

            setSubmitting(false);
          }}
        >
          {({
            values,
            handleChange,
            touched,
            handleBlur,
            setFieldValue,
            setFieldError,
            errors,
          }) => (
            <Form>
              <div className="form_Card">
                <div>
                  <Row>
                    <Col md="12" lg="4" xl="4" className="text-center">
                      {/* <Image src={dynamicImage('Profile_IMG.png')} alt="Profile" style={{height:'300px', width:'300px'}}/> */}
                      <div className="profile-card">
                        <Image
                          src={`${import.meta.env.BASE_URL}/assets/images/logo/BDG-fav.png`}
                          alt="User profile avatar"
                          className="profile-card__avatar"
                        />

                        <div className="profile-card__info">
                          <p className="profile-card__name">
                            {`${profileInfo?.FirstName || ""} ${profileInfo?.LastName || ""}` ||
                              "User"}
                          </p>

                          <p className="profile-card__uid">
                            UID: {profileInfo?.ClientId || "-"}
                          </p>

                          <time
                            className="profile-card__last-login"
                            dateTime={new Date().toISOString()}
                          >
                            Last Login: {new Date().toLocaleTimeString()}
                          </time>
                        </div>
                      </div>
                    </Col>
                    <Col
                      md="12"
                      xl="8"
                      lg="8"
                      style={{ borderLeft: "1px solid #e5e5e5" }}
                    >
                      <div className="ps-lg-4 ps-0">
                        {/* ===== PERSONAL DETAILS ===== */}
                        <h5 className="fw-bold mb-3">Personal Details</h5>

                        <Row className="g-3">
                          {/* FIRST NAME */}
                          <Col md="6">
                            <Label className="fw-semibold">First Name</Label>
                            <FormGroup>
                              <Field
                                className="form-control rounded-3"
                                name="FirstName"
                                placeholder="Enter First Name"
                              />
                              <ErrorMessage
                                name="FirstName"
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </FormGroup>
                          </Col>

                          {/* LAST NAME */}
                          <Col md="6">
                            <Label className="fw-semibold">Last Name</Label>
                            <FormGroup>
                              <Field
                                className="form-control rounded-3"
                                name="LastName"
                                placeholder="Enter Last Name"
                              />
                              <ErrorMessage
                                name="LastName"
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </FormGroup>
                          </Col>

                          {/* MOBILE */}
                          <Col md="6">
                            <Label className="fw-semibold">{MobileNo}</Label>
                            <FormGroup>
                              <Field
                                className="form-control rounded-3"
                                type="text"
                                name="MobileNo"
                                placeholder="Enter Mobile Number"
                              />
                              <ErrorMessage
                                name="MobileNo"
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </FormGroup>
                          </Col>

                          {/* DOB */}
                          <Col md="6">
                            <Label className="fw-semibold">{DOB}</Label>
                            <FormGroup>
                              <Field name="DateofBirth">
                                {({ field }: any) => (
                                  <DatePicker
                                    className={`form-control rounded-3 ${
                                      errors.DateofBirth && touched.DateofBirth
                                        ? "is-invalid"
                                        : ""
                                    }`}
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
                              <ErrorMessage
                                name="DateofBirth"
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </FormGroup>
                          </Col>

                          {/* EMAIL */}
                          <Col md="6">
                            <Label className="fw-semibold">{EmailId}</Label>
                            <FormGroup>
                              <Field
                                className="form-control rounded-3 bg-light"
                                type="text"
                                name="EmailId"
                                placeholder="Email Address"
                                disabled
                              />
                              <ErrorMessage
                                name="EmailId"
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </FormGroup>
                          </Col>

                          {/* COUNTRY */}
                          <Col md="6">
                            <Label className="fw-semibold">{Country}</Label>
                            <FormGroup>
                              <Field
                                className="form-control rounded-3"
                                type="text"
                                name="CountryName"
                                placeholder="Enter Country"
                              />
                              <ErrorMessage
                                name="CountryName"
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="text-start bg-transparent border-0">
                  <button className="btn form-btn" type="submit">
                    {UpdateProfile}
                    {spinner.Action === true &&
                    spinner.FormName === "Myprofile" ? (
                      <div
                        className="spinner-border spinner-border-sm text-dark ms-2"
                        role="status"
                      >
                        <span className="sr-only">Loading...</span>
                      </div>
                    ) : (
                      ""
                    )}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </TabPane>
    </TabContent>
  );
};


export default BorderTabContent;
