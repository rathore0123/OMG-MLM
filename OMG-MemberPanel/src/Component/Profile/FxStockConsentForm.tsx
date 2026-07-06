import { Card, CardBody, Col, Container, Row, FormGroup, Input, Label, } from "reactstrap";
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Btn } from "../../AbstractElements";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { decryptData } from "../../utils/helper/Crypto";
import { useBotService } from '../../Service/ActivateBot/ActivateBot'
import CardHeaderCommon from "../../CommonElements/CommonCardHeader/CardHeaderCommon";
import { Formik, Field, Form, ErrorMessage, FieldProps } from "formik";
import { MemberSummary } from "../../utils/Constant";
import { H4, UL, LI, H5 } from "../../AbstractElements";
import { useSweetAlert } from '../../Context/SweetAlertContext'
import Loader from '../../CommonElements/Loader/Loader'
import { SendOTP_Service } from "../../Service/Authentication/SendOTPService";
import { KYC_documentverification } from "../../Forms/FormsVailidationSchema";
import { useDepositFundService } from '../../Service/DepositFund/DepositFundINRAED'
import { date } from "yup";
import { Italic } from "react-feather";
import QRCode from 'react-qr-code';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from "react-toastify";
interface FormValues {
  Document_Type: string,
  Document_No: string,
  OTP: string,
}
const ConsentForm = (props: any) => {
  const navigate = useNavigate();
  const { refreshAction } = props;
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    // console.log("Checkbox is now:", e.target.checked);
  };
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string));
  const { getBEP20AddressFee } = useDepositFundService();
  const { SendAadharOTP, FormatTime, StartTimer } = SendOTP_Service()
  const [KYCDetails, setKYCDetails] = useState<any>([])
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [timerrun, settimerrun] = useState(false)
  const [disablebtn, setdisablebtn] = useState(false);
  const [WalletBalance, setWalletBalance] = useState(0)
  const [walletAddress, setwalletAddress] = useState("");
  const [refId, setRefId] = useState("")
  const [KYCWalletBalance, setKYCWalletBalance] = useState(0)
  const [FeeBalance, setFeeBalance] = useState(0)
  const [KYCFee, setFee] = useState(0)
  const { doWithdrawal, getFXSTWalletBalance, loading } = useBotService();
  const { showAlert, ShowSuccessAlert, ShowConfirmAlert, ShowConfirmBox } = useSweetAlert();
  const initialValues: FormValues = {
    Document_Type: 'AADHAR',
    Document_No: '',
    OTP: ''
  };
  useEffect(() => {
    WalletTypeChange();
    GenerateTRC20AddressFee();
  }, [])
  const GenerateTRC20AddressFee = async () => {
    const param = {
      ClientId: ClientID
    }
    const res = await getBEP20AddressFee(param);
    if (res[0].StatusCode == "1") {
      console.log(res);
      setwalletAddress(res[0].Msg);
    } else {

    }
  }
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
    // if (FeeBalance < KYCFee) {
    //   showAlert("Insufficient Fee Wallet Balance.");
    //   return;
    // }
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
      if (parsedResponse.Resp_code == "ERR") {
        showAlert(parsedResponse.Resp_desc);
        return;
      }
      // Extract the ref_id
      const extractedRefId = parsedResponse?.data?.ref_id;

      // Save to state
      setRefId(extractedRefId);
      startTimer(60);
    }
  }
  const handleVerification = async (values: FormValues) => {
    if (!isChecked) {
      showAlert('Please agree to the terms and conditions before proceeding.');
      return;
    }
    const confirmed = await ShowConfirmAlert("Proceed", "Are you sure want to proceed?");
    if (confirmed) {
      const param = {
        ClientId: ClientID,
        MobileNo: values.Document_No,
        BankRefNo: refId,
        OTP: values.OTP
      }
      const res = await doWithdrawal(param);
      if (res == "Error" || res == "") {
        showAlert("Something went wrong,Please try again later");
      }
      else {
        if (res[0].StatusCode == "1") {
          ShowSuccessAlert(res[0].Msg);
          WalletTypeChange();
        } else {
          showAlert(res[0].Msg);
        }
      }
    } else {
      // console.log('do nothing.');
    }
  }

  const WalletTypeChange = async () => {

    const param = {
      ClientId: ClientID,
      ActionMode: "GetMemberDetail"
    }
    const obj = {
      procName: 'VerifyAadhar',
      Para: JSON.stringify(param),
    };
    const res = await getFXSTWalletBalance(obj);


    setKYCWalletBalance(res[0]?.BalanceToPay);
    setWalletBalance(res[0]?.FeeWalletDisplay);
    setFeeBalance(res[0]?.FeeWallet);
    setFee(res[0]?.FeeAmount);
    const KYCStatusData = [
      {
        color: "secondary",
        Name: "Name",
        Information: localStorage.getItem("MemberName"),
      },
      {
        color: "primary",
        Name: "Registration Date",
        Information: res[0]?.RegistrationDate,
      },

      {
        color: "tertiary",
        Name: "Activation Date",
        Information: res[0]?.ActivationDate,
      },
      {
        color: "primary",
        Name: "Total Deposit Amount",
        Information: res[0]?.DepositedAmount,
      },
      {
        color: "primary",
        Name: "Total Withdrawal Amount",
        Information: res[0]?.WithdrawalAmount,
      }
    ];
    setKYCDetails(KYCStatusData)


  }
  // handling form submition
  const handleSubmit = async (values: any) => {
    console.log(values);

  }
  const CopyCallBack = (t: any, r: any) => {
    if (r == true) {
      toast.success("Copied");
    }
  }
  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = today.getFullYear();

    return `${day}/${month}/${year}`;
  };
  return (
    <>
      <Breadcrumbs mainTitle='Principal Settlement' parent='Profile ' ChildName='Principal Settlement' />

      <div className="page-body">
        {loading && <Loader />}
        <Col>
          <Row className="p-2">
            <Col md="4">
              <Card className="project-card">
                <CardHeaderCommon title={MemberSummary} />

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
                    <p style={{ fontSize: 12, color: '#E0C981' }}>"To initiate your exit process from FXSTOCK Corporation, completing the mandatory KYC verification is required. This ensures compliance with legal and regulatory standards and confirms your identity as part of our standard procedure."</p>
                  </Row>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="gap-3 pills-blogger">
                    <Row>
                      <Col xl="12" style={{ display: "flex" }}>
                        <div>
                          <i className="fa fa-info-circle"></i>
                        </div>
                        <div style={{ paddingLeft: "10px" }}>
                          To complete your deposit, simply scan the QR code, pay the
                          required amount.<br />
                          <span style={{ color: '#E6B855' }}>Fee Amount: 100 USDT.</span>
                        </div>

                      </Col>
                      <Col xl="12 text-center">
                        <div className="blog-wrapper QR_Code_container">
                          <QRCode value={walletAddress} size={180} />
                        </div>
                      </Col>

                      <Col xl="12">
                        <div className="blog-content mt-4">
                          <H4>Deposit by scanning this QR Code</H4>
                          <hr />
                          <FormGroup>
                            <Input type="text" value={walletAddress} readOnly />
                            <CopyToClipboard
                              text={walletAddress}
                              onCopy={CopyCallBack}
                            >
                              <Btn color="info mt-4">
                                <i className="fa fa-copy"></i>&nbsp;COPY
                              </Btn>
                            </CopyToClipboard>
                          </FormGroup>
                        </div>
                      </Col>
                    </Row>
                  </div>
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
                      className="btn-success py-2 pe-2"
                      color="info"
                      style={{ fontSize: "18px", textAlign: "justify" }}
                      type="button"
                    >
                      Payable Balance :
                      {loading ? (
                        <div
                          className="spinner-border text-light text-center"
                          style={{ width: "1rem", height: "1rem" }}
                          role="status"
                        ></div>
                      ) : (
                        <span> &nbsp;${KYCWalletBalance}</span>
                      )}
                    </button>
                    &nbsp;&nbsp;
                    <button
                      className="btn-info py-2 pe-2 mt-3"
                      color="info"
                      style={{ fontSize: "18px", textAlign: "justify" }}
                      type="button"
                    >
                      Fee Wallet Balance :
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

                            <FormGroup hidden>
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
                              <Label>AADHAR No.</Label>
                              <Field type="text" name="Document_No" placeholder="Enter your AADHAR No." className="form-control" />
                              <ErrorMessage name="Document_No" component="div" className="text-danger" />
                            </FormGroup>
                            <FormGroup className="position-relative">
                              <Label>OTP <span style={{ color: 'red', fontSize: 11 }}>(An OTP will be sent to your registered mobile number associated with your Aadhaar card.)</span></Label>
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

                          <Col md="12">
                            <h3>Terms and Conditions for FXSTOCK Corporation Platform Exit</h3>
                            <div style={{ height: 355, overflowY: 'scroll' }}>
                              <UL>
                                <LI><span>1.</span> Acknowledgment of Deposited Amount <p style={{ color: '#E0C981' }}>By signing this agreement, I, the undersigned depositor, hereby confirm that I am over 18 years of age and have made the decision to deposit funds on the FXSTOCK Corporation platform of my own free will. No individual or entity has coerced, influenced, or pressured me into making this deposit.</p></LI>
                                <LI><span>2.</span> Consent to Exit <p style={{ color: '#E0C981' }}>I voluntarily choose to terminate my deposit and withdraw from the FXSTOCK Corporation platform. This decision is made solely at my discretion and without any external influence.</p></LI>
                                <LI><span>3.</span> Refund of Balance Amount <p style={{ color: '#E0C981' }}>Upon my request to exit, FXSTOCK Corporation agrees to refund the remaining balance of my deposited amount after any applicable charges or fees, if any. The remaining balance will be paid in installments as per the company’s policy. No further returns on investment (ROI) or profits will be generated or paid following this withdrawal request.</p></LI>
                                <LI><span>4.</span> No Future Claims or Blame <p style={{ color: '#E0C981' }}>I hereby acknowledge and agree that my decision to exit the platform is final and binding. I unconditionally release FXSTOCK Corporation from any future claims, disputes, or liabilities arising out of or related to my deposit(s) or the termination of my account.</p></LI>
                                <LI><span>5.</span> Waiver of ROI and Other Benefits <p style={{ color: '#E0C981' }}>By opting to exit, I forfeit all rights to any potential future earnings, including but not limited to ROI, bonuses, or other benefits associated with my deposited amount on the platform.</p></LI>
                                <LI><span>6.</span> I Consent <p style={{ color: '#E0C981' }}>I consent to the terms and conditions outlined above. This agreement reflects my intention to withdraw from FXSTOCK Corporation without any future blame or liability to the company.</p></LI>
                                Name: {localStorage.getItem("MemberName")}<br />
                                Date: {getCurrentDate()}
                              </UL>
                            </div>
                          </Col>
                          <p style={{ fontSize: 14 }} className="mt-4">
                            By clicking "I Agree," you acknowledge that you have read, understood, and agree to the terms and conditions
                            outlined above. Please check the box below to proceed.
                          </p>
                          <div
                            style={{
                              margin: '20px 0',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={handleCheckboxChange}
                              style={{
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                marginRight: '10px'
                              }}
                            />
                            <label
                              style={{
                                fontSize: '16px',
                                cursor: 'pointer',
                                margin: 0
                              }}
                            >
                              I agree to the terms and conditions.
                            </label>
                          </div>
                          <Col md="4">
                            <Btn
                              color="primary"
                              style={{ marginTop: "30px" }}
                              type="submit"
                            >
                              Confirm
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

    </>
  );
};

export default ConsentForm;
