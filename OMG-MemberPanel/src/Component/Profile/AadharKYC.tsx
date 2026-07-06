import { Card, CardBody, Col, Row, FormGroup, Input, Label, } from "reactstrap";
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Btn } from "../../AbstractElements";
import { decryptData } from "../../utils/helper/Crypto";
import { useBotService } from '../../Service/ActivateBot/ActivateBot'
import CardHeaderCommon from "../../CommonElements/CommonCardHeader/CardHeaderCommon";
import { Formik, Field, Form, ErrorMessage, FieldProps } from "formik";
import { KYCStatus } from "../../utils/Constant";
import { H4, UL, LI, H5 } from "../../AbstractElements";
import { useSweetAlert } from '../../Context/SweetAlertContext'
import Loader from '../../CommonElements/Loader/Loader'
import { SendOTP_Service } from "../../Service/Authentication/SendOTPService";
import { KYC_documentverification } from "../../Forms/FormsVailidationSchema";

interface FormValues {
  Document_Type: string,
  Document_No: string,
  OTP: string,
}
const AadharKYC = (props: any) => {
  const navigate = useNavigate();
  const { refreshAction } = props;
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string));
  const { SendAadharOTP, FormatTime, StartTimer } = SendOTP_Service()
  const [KYCDetails, setKYCDetails] = useState<any>([])
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [timerrun, settimerrun] = useState(false)
  const [disablebtn, setdisablebtn] = useState(false);
  const [WalletBalance, setWalletBalance] = useState(0)
  const [refId, setRefId] = useState("")
  const [KYCWalletBalance, setKYCWalletBalance] = useState(0)
  const [KYCFee, setFee] = useState(0)
  const { doAadharVerification, getFXSTWalletBalance, loading } = useBotService();
  const { showAlert, ShowSuccessAlert, ShowConfirmAlert, ShowConfirmBox } = useSweetAlert();
  const initialValues: FormValues = {
    Document_Type: 'AADHAR',
    Document_No: '',
    OTP: ''
  };
  useEffect(() => {
    WalletTypeChange()
  }, [])

  // setting otp timmer logic here 

  const startTimer = (secondsLeft: number) => {
    setIsOtpSent(true)
    setOtpTimer(secondsLeft - 1); // Subtract 1 to start the timer at 59 seconds
    const intervalId = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId); // Stop timer when it reaches 0
          setIsOtpSent(false); // Reset OTP sent flag
          setdisablebtn(false);
          return 0; // Ensure it doesn't go below 0
        }
        return prev - 1; // Decrement the timer by 1 second
      });
    }, 1000);
    return () => clearInterval(intervalId);
  };

  const handleSendOTP = async (values: FormValues) => {
    const { Document_No } = values;
    if (KYCWalletBalance < KYCFee) {
      showAlert("Insufficient KYC Wallet Balance.");
      return;
    }
    if (Document_No == "") {
      showAlert("Please enter Aadhar Card No.");
      return;
    }
    setdisablebtn(true)
    const param = {
      MobileNo: Document_No
    }
    const res = await SendAadharOTP(param);
    if (res) {
      // Parse the JSON string
      const parsedResponse = JSON.parse(res);

      // Extract the ref_id
      const extractedRefId = parsedResponse?.data?.ref_id;

      // Save to state
      setRefId(extractedRefId);
      startTimer(60);
    }
  }
  const handleVerification = async (values: FormValues) => {
    const confirmed = await ShowConfirmAlert("Aadhar Verifrication", "Are you want to proceed?");
    if (confirmed) {
      const param = {
        ClientId: ClientID,
        MobileNo: values.Document_No,
        BankRefNo: refId,
        OTP: values.OTP
      }
      const res = await doAadharVerification(param);
      if (res[0].StatusCode == "1") {
        ShowSuccessAlert(res[0].Msg);
        WalletTypeChange();
      } else {
        showAlert(res[0].Msg);
      }
    } else {
      // console.log('do nothing.');
    }
  }

  const WalletTypeChange = async () => {

    const param = {
      ClientId: ClientID,
      ActionMode: "GetKYCDetail"
    }
    const obj = {
      procName: 'VerifyAadhar',
      Para: JSON.stringify(param),
    };
    const res = await getFXSTWalletBalance(obj);

    setWalletBalance(res[0]?.KYCWallet)
    setKYCWalletBalance(res[0]?.WalletBalance);
    setFee(res[0]?.VerificationFee)
    const KYCStatusData = [
      {
        color: "primary",
        Name: "Document No",
        Information: res[0]?.DocumentNo,
      },
      {
        color: "secondary",
        Name: "Name",
        Information: res[0]?.DocumentName,
      },
      {
        color: "secondary",
        Name: "DOB",
        Information: res[0]?.DocDOB,
      },
      {
        color: "tertiary",
        Name: "Verification Date",
        Information: res[0]?.KYCVerificationDate,
      },
      {
        color: "primary",
        Name: "KYC Status",
        Information: res[0]?.KYCStatus,
      },

    ];
    setKYCDetails(KYCStatusData)
    if (res[0]?.KYCVerificationDate == "--") {
      if (res[0]?.WalletBalance < res[0]?.VerificationFee) {
        const confirmed = await ShowConfirmBox("KYC Verification", "Insufficient Balance");
        if (confirmed) {
          navigate(`${import.meta.env.BASE_URL}/kycwallet`);
        }
      }
    }
    //console.log(res);

  }
  // handling form submition
  const handleSubmit = async (values: any) => {
    console.log(values);

  }


  return (
    <div className="page-body">
      {loading && <Loader />}
      <Col>
        <Row className="p-2">
          <Col md="4">
            <Card className="project-card">
              <CardHeaderCommon title={KYCStatus} />

              <CardBody className="pt-0">
                <Row className="align-items-center">
                  <Col className="d-sm-none d-md-block">
                    <UL className="overview-details">
                      {KYCDetails.map((item: any, i: number) => (
                        <LI
                          className="d-flex align-items-center p-0 mb-3"
                          key={i}
                        >
                          <div className={`circle-dot-${item.color}`}>
                            <span />
                          </div>
                          <H5 className="custom-h5">
                            {item.Name}
                            <span
                              className="font-light"
                              style={{ float: "right" }}
                            >
                              {item.Name === "KYC Status" ? (
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: item.Information,
                                  }}
                                />
                              ) : (
                                <> {item.Information}</>
                              )}
                            </span>
                          </H5>
                        </LI>
                      ))}
                    </UL>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col md="8">
            <Formik
              initialValues={initialValues}
              validationSchema={KYC_documentverification}
              onSubmit={(values, { setSubmitting }) => {
                handleVerification(values);
                setSubmitting(false);
              }}
            >
              {({ isSubmitting, setFieldValue, values }) => (
                <Form>
                  <button
                    className="btn-info py-2 pe-2"
                    color="info"
                    style={{ fontSize: "18px", textAlign: "justify" }}
                    type="button"
                  >
                    KYC Wallet Balance :
                    {loading ? (
                      <div
                        className="spinner-border text-light text-center"
                        style={{ width: "1rem", height: "1rem" }}
                        role="status"
                      ></div>
                    ) : (
                      <span> &nbsp;{WalletBalance}</span>
                    )}
                  </button>
                  <hr />
                  <Card>
                    <CardBody>
                      <Row>
                        <Col md="12">
                          <FormGroup>
                            <Label>Document Type</Label>
                            <Field
                              as="select"
                              name="Document_Type"
                              className=" form-control btn-square form-select"
                              onChange={(e: any) => setFieldValue("Document_Type", e.target.value)}
                              disabled={true}
                            >
                              <option value="AADHAR">AADHAR</option>
                            </Field>
                            <ErrorMessage name="Document_Type" component="div" className="text-danger" />
                          </FormGroup>
                          <FormGroup>
                            <Label>Doucment No</Label>
                            <Field type="text" name="Document_No" placeholder="Document No." className="form-control" />
                            <ErrorMessage name="Document_No" component="div" className="text-danger" />
                          </FormGroup>
                          <FormGroup className="position-relative">
                            <Label>OTP <span style={{color:'red',fontSize:11}}>(An OTP will be sent to your registered mobile number associated with your Aadhaar card.)</span></Label>
                            <Field type="text" name="OTP" placeholder="Enter OTP" className="form-control" />
                            <ErrorMessage name="OTP" component="div" className="text-danger" />
                            <Btn
                              className="otp-btn"
                              color="btn btn-primary"
                              onClick={() =>
                                // !isOtpSent ? startTimer(60) : null
                                handleSendOTP(values)
                              }
                              disabled={disablebtn}
                            >
                              {isOtpSent ? FormatTime(otpTimer) : "Send OTP"}
                            </Btn>
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <Btn className="form-btn rounded"
                            style={{ marginTop: "30px" }}
                            type="submit"
                          >
                            Verify
                          </Btn>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Form>
              )}
            </Formik>
          </Col>
        </Row>
      </Col>
    </div>
  );
};

export default AadharKYC;
