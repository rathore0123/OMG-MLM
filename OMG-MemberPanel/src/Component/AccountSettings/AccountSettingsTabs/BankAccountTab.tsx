import { useState, useEffect } from "react";
import {
  CardBody,
  FormGroup,
  Label,
  Card,
  CardFooter,
  Col,
  Row
} from "reactstrap";
import { Btn, H4 } from "../../../AbstractElements";
import { UpdateProfile } from "../../../utils/Constant";
import { Formik, Field, Form, ErrorMessage } from "formik";

import { ActsettingBankINR } from "../../../Type/Forms/FormsType";
import { ActSettingService } from "../../../Service/AccountSetting/ActsettingService";
import { SendOTP_Service } from "../../../Service/Authentication/SendOTPService";

import { BankINRvalidSchema } from "../../../Forms/FormsVailidationSchema";
import { useSweetAlert } from "../../../Context/SweetAlertContext";
import Loader from "../../../CommonElements/Loader/Loader";

import { decryptData } from "../../../utils/helper/Crypto";

const BankAccountDetails = () => {

  const { UpdateActSetting, GetProfile_Details, loading } = ActSettingService();
  const { SendOTP, FormatTime } = SendOTP_Service();
  const { showAlert, ShowSuccessAlert } = useSweetAlert();

  const [ClientID] = useState(decryptData(localStorage.getItem("clientId") as string));
  const [UserToken] = useState(decryptData(localStorage.getItem("userToken") as string));

  const [bankValues, setBankValues] = useState<any>(null);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [disablebtn, setdisablebtn] = useState(false);

  const [spinner, setspinner] = useState(false);

  useEffect(() => {
    GetProfileDetails();
  }, []);

  // ================= Get Profile
  const GetProfileDetails = async () => {
    const param = {
      ClientId: ClientID,
      UserToken: UserToken,
      ActionMode: "GetProfile"
    };

    const obj = {
      procName: "UpdateProfile",
      Para: JSON.stringify(param)
    };

    const res = await GetProfile_Details(obj);

    const BankINR_Values = {
      IFSC: res[0]?.IFSC,
      BankName: res[0]?.BankName,
      BranchName: res[0]?.BranchName,
      AccountNo: res[0]?.AccountNo,
      AccountHolderName: res[0]?.AccountHolderName,
      OTP: ""
    };

    setBankValues(BankINR_Values);
  };

  // ================= Update Bank
  const Update_BankINR = async (values: any) => {
    setspinner(true);

    const { OTP, IFSC, BankName, BranchName, AccountNo, AccountHolderName } = values;

    try {
      const param = {
        OTP,
        ClientId: ClientID,
        IFSC,
        BankName,
        BranchName,
        AccountNo,
        AccountHolderName,
        ActionMode: "UpdateBank"
      };

      const obj = {
        procName: "UpdateProfile",
        Para: JSON.stringify(param)
      };

      const res = await UpdateActSetting(obj);

      setspinner(false);

      if (res[0].StatusCode === "1") {
        ShowSuccessAlert(res[0].msg);
      } else {
        showAlert("Opps!", res[0].msg);
      }

    } catch (error) {
      console.error("Update Bank Error:", error);
    }
  };

  // ================= Send OTP
  const handleSendOTP = async () => {

    setdisablebtn(true);

    const param = {
      ClientId: ClientID,
      ActionMode: "SendOTP"
    };

    const obj = {
      procName: "RegistrationOTP",
      Para: JSON.stringify(param)
    };

    const res = await SendOTP(obj);

    if (res[0].StatusCode === "1") {

      setIsOtpSent(true);
      ShowSuccessAlert("OTP sent successfully");

      startTimer(res[0].SecondsLeft);
    }
  };

  // ================= OTP Timer
  const startTimer = (secondsLeft: number) => {

    setOtpTimer(secondsLeft - 1);

    const intervalId = setInterval(() => {

      setOtpTimer((prev) => {

        if (prev <= 0) {
          clearInterval(intervalId);
          setIsOtpSent(false);
          setdisablebtn(false);
          return 0;
        }

        return prev - 1;
      });

    }, 1000);
  };

  return (
    <>
      {loading && <Loader />}

      <H4 className="mt-4 mb-3">Bank Account Details</H4>

      <Formik
        initialValues={bankValues || ActsettingBankINR}
        validationSchema={BankINRvalidSchema}
        enableReinitialize
        onSubmit={(values, { setSubmitting }) => {
          Update_BankINR(values);
          setSubmitting(false);
        }}
      >
        {({ isSubmitting }) => (

          <Form>

            <Card>

              <CardBody>

                <Row>

                  <Col md="4">
                    <Label>IFSC Code</Label>
                    <Field
                      type="text"
                      name="IFSC"
                      className="form-control"
                      placeholder="Enter IFSC Code"
                    />
                    <ErrorMessage name="IFSC" component="div" className="text-danger" />
                  </Col>

                  <Col md="4">
                    <Label>Bank Name</Label>
                    <Field
                      type="text"
                      name="BankName"
                      className="form-control"
                      placeholder="Enter Bank Name"
                    />
                    <ErrorMessage name="BankName" component="div" className="text-danger" />
                  </Col>

                  <Col md="4">
                    <Label>Branch Name</Label>
                    <Field
                      type="text"
                      name="BranchName"
                      className="form-control"
                      placeholder="Enter Branch Name"
                    />
                    <ErrorMessage name="BranchName" component="div" className="text-danger" />
                  </Col>

                  <Col md="4">
                    <Label>Account Number</Label>
                    <Field
                      type="text"
                      name="AccountNo"
                      className="form-control"
                      placeholder="Enter Account Number"
                    />
                    <ErrorMessage name="AccountNo" component="div" className="text-danger" />
                  </Col>

                  <Col md="4">
                    <Label>Account Holder Name</Label>
                    <Field
                      type="text"
                      name="AccountHolderName"
                      className="form-control"
                      placeholder="Enter Account Holder Name"
                    />
                    <ErrorMessage name="AccountHolderName" component="div" className="text-danger" />
                  </Col>

                  <Col md="4" style={{ position: "relative" }}>
                    <Label>OTP</Label>

                    <Field
                      type="text"
                      name="OTP"
                      className="form-control"
                      placeholder="Enter OTP"
                    />

                    <Btn
                      color="info"
                      disabled={disablebtn}
                      onClick={handleSendOTP}
                      style={{
                        position: "absolute",
                        right: "0",
                        top: "33px",
                        backgroundColor: "#d0b163",
                        borderColor: "#d0b163",
                        color: "#000"
                      }}
                    >
                      {isOtpSent ? FormatTime(otpTimer) : "Send OTP"}
                    </Btn>

                    <ErrorMessage name="OTP" component="div" className="text-danger" />
                  </Col>

                </Row>

              </CardBody>

              <CardFooter className="text-end">

                <Btn
                  color="primary"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {UpdateProfile}

                  {spinner && (
                    <div className="spinner-border spinner-border-sm text-dark ms-2" />
                  )}
                </Btn>

              </CardFooter>

            </Card>

          </Form>

        )}
      </Formik>
    </>
  );
};

export default BankAccountDetails;