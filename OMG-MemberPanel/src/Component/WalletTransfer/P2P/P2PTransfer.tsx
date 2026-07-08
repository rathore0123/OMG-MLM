import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  FormGroup,
  Input,
  Label,
} from "reactstrap";
import { P, H4, Btn, H5, Image } from "../../../AbstractElements";
import { WalletTransfer, P2P } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import HistoryTable from "../../../CommonElements/SearchTable/SearchTable";
import { useSweetAlert } from "../../../Context/SweetAlertContext";
import Loader from "../../../CommonElements/Loader/Loader";
import { decryptData } from "../../../utils/helper/Crypto";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  P2PPropType,
  P2PForminitialValues,
} from "../../../Type/Forms/P2PTransfer/P2P";
import { SendOTP_Service } from "../../../Service/Authentication/SendOTPService";
import { useTransferFundService } from "../../../Service/TransferFundToDepositWallet/TransferFundToDepositWallet";
import { IoWalletOutline } from "react-icons/io5";
import "./P2PTransfer.scss";
import { FiCreditCard, FiKey, FiUser } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa6";

const P2PTransfer = () => {
  useEffect(() => {
    GetWithdrawalEntityType();
    GetTransferSettings();
    setUsername(localStorage.getItem("MemberName") as string);
  }, []);
  const { getWalletBalance, doTransfer, loading, validateSponsor } =
    useTransferFundService();
  const { showAlert, ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert();
  const [ClientID, setClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );
  const [walletType, setWalletType] = useState("");
  const { FormatTime } = SendOTP_Service();
  const [OTPtimer, setOTPtimer] = useState("TransferForm");
  const [disablebtn, setdisablebtn] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [walletBalance, setwalletBalance] = useState<number>(0);
  const [fxstwalletBalance, setfxstwalletBalance] = useState<number>(0);
  const [username, setUsername] = useState("");
  const [wallets, setwalletType] = useState<any>([]);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [transferSettings, setTransferSettings] = useState({
    MinimumTransferAmount: 0,
    MaximumTransferAmount: 0,
    TransferCharge: 0,
    TransferStatus: true,
  });
  // Validation schema
  const TransferSchema = Yup.object().shape({
    WalletType: Yup.string().required("Select Wallet Type"),
    TransferAmount: Yup.number()
      .min(
        transferSettings.MinimumTransferAmount || 1,
        `Minimum Transfer amount is Rs.${transferSettings.MinimumTransferAmount || 1}`,
      )
      .max(
        transferSettings.MaximumTransferAmount || Number.MAX_SAFE_INTEGER,
        `Maximum Transfer amount is Rs.${transferSettings.MaximumTransferAmount}`,
      )
      .required("Enter Transfer Amount"),
    ToUsername: Yup.string().required("Enter To Username"),
    OTP: Yup.string().required("Enter OTP"),
  });
  const handleWalletChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const selectedValue = event.target.value;

    // Formik update
    setFieldValue("WalletType", selectedValue);

    // Local state update
    setWalletType(selectedValue);

    // Find selected wallet
    const wallet = wallets.find((w: any) => w.WalletValue === selectedValue);

    // Set balance
    setwalletBalance(wallet ? wallet.Balance : 0);
  };
  //============= Handling OTP
  const handleSendOTP = async (value: any) => {
    setOTPtimer(value);
    setdisablebtn(true);
    const param = {
      ClientId: ClientID,
    };
    const obj = {
      procName: "SendOTP",
      Para: JSON.stringify(param),
    };
    const res = await getWalletBalance(obj);
    if (res[0].StatusCode == "1") {
      setIsOtpSent(true);
      // setOtpTimer(res[0].SecondsLeft - 1)
      startTimer(res[0].SecondsLeft);
    }
  };
  //=========== Setting OTP Counter
  const startTimer = (secondsLeft: number) => {
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
  const handleSponsorChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    values: P2PPropType,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const { ToUsername } = values;
    const param = {
      UserName: ToUsername,
    };

    const obj = {
      procName: "CheckSponsor",
      Para: JSON.stringify(param),
    };
    const res = await validateSponsor(obj);
    if (res[0].StatusCode == "1") {
      setUsername(res[0].Name);
    } else {
      setUsername("Not Available");
    }
  };
  const handleTransfer = async (values: P2PPropType) => {
    const confirmed = await ShowConfirmAlert(
      "Transfer",
      "Are you sure want to transfer",
    );
    if (confirmed) {
      // Proceed with the action
      const param = {
        ClientId: ClientID,
        WalletType: values.WalletType,
        Username: values.ToUsername,
        TransferAmount: values.TransferAmount,
        OTP: values.OTP,
        ActionMode: "Transfer",
      };
      const obj = {
        procName: "P2PTransfer",
        Para: JSON.stringify(param),
      };
      const res = await doTransfer(obj);
      if (res[0].StatusCode == "1") {
        ShowSuccessAlert(res[0].Msg);
      } else {
        showAlert(res[0].Msg);
      }
    } else {
      console.log("do nothing.");
    }
  };
  const GetWithdrawalEntityType = async () => {
    const param = {
      ClientId: ClientID,
      ActionMode: "GetP2PWallets",
    };
    const obj = {
      procName: "P2PTransfer",
      Para: JSON.stringify(param),
    };
    const res = await getWalletBalance(obj);
    setwalletType(res);
    const defaultWallet =
      res.find((w: any) => w.WalletValue === P2PForminitialValues.WalletType) ||
      res[0];
    if (defaultWallet) {
      setWalletType(defaultWallet.WalletValue);
      setwalletBalance(defaultWallet.Balance);
    }
  };
  const GetTransferSettings = async () => {
    const param = {
      ActionMode: "GetTransferSettings",
    };
    const obj = {
      procName: "P2PTransfer",
      Para: JSON.stringify(param),
    };
    const res = await getWalletBalance(obj);
    if (res && res[0]) {
      setTransferSettings({
        MinimumTransferAmount: Number(res[0].MinimumTransferAmount) || 0,
        MaximumTransferAmount: Number(res[0].MaximumTransferAmount) || 0,
        TransferCharge: Number(res[0].TransferCharge) || 0,
        TransferStatus: !!res[0].TransferStatus,
      });
    }
    setSettingsLoaded(true);
  };
  return (
    <>
      <Breadcrumbs mainTitle={P2P} parent={"P2P"} ChildName={P2P} />
      <Container fluid>
        {loading && <Loader />}
        <Row>
          <Col xl="4">
            <Card className="wallet-card">
              <CardBody>
                {/* Header */}
                <div className="wallet-header">
                  <div className="d-flex align-items-center gap-2">
                    <div className="wallet-icon">
                      <IoWalletOutline />
                    </div>
                    <div>
                      <h5>Available Balance</h5>
                      <p>Your current wallet balance</p>
                    </div>
                  </div>
                  <div className="wallet-balance">Rs.{walletBalance}</div>
                </div>

                {/* Balance */}

                {/* Info */}
                <div className="wallet-info">
                  <p>
                    • Minimum transfer amount: Rs.
                    {transferSettings.MinimumTransferAmount}
                  </p>
                  <p>
                    • Maximum transfer amount: Rs.
                    {transferSettings.MaximumTransferAmount}
                  </p>
                  <p>• {transferSettings.TransferCharge}% transaction fee</p>
                  <p>• Instant transfer</p>
                </div>

                {settingsLoaded && !transferSettings.TransferStatus && (
                  <div className="username-error mt-2">
                    ⚠️ P2P Transfer is currently disabled by Admin
                  </div>
                )}

                {/* Highlight */}
                <div className="wallet-highlight">
                  🔒 100% secure & instant transactions
                </div>
              </CardBody>
            </Card>
            <div className="mt-3 text-center">
              <Image
                src="./assets/images/forms/P2PTransfer.png"
                alt="Wallet"
                className="wallet-image"
              />
            </div>
          </Col>
          <Col xl="8">
            <Card>
              <CardBody className="p2p-transfer-card">
                <div className="p2p-header mb-4">
                  <h3>Send Money Instantly</h3>
                  <p>Transfer funds securely to another member's Deposit Wallet</p>
                </div>

                <div className="gap-3 pills-blogger">
                  <Formik
                    initialValues={P2PForminitialValues}
                    validationSchema={TransferSchema}
                    onSubmit={(values, { setSubmitting }) => {
                      handleTransfer(values);
                      setSubmitting(false);
                    }}
                  >
                    {({ isSubmitting, setFieldValue, values }) => (
                      <Form>
                        <Row>
                          {/* Wallet */}
                          <Col md="6" className="mb-3">
                            <div className="form-field">
                              <Label>Select Wallet</Label>
                              <div className="input-icon-wrap">
                                <span className="input-icon">
                                  <FiCreditCard size={14} />
                                </span>
                                <Field
                                  as="select"
                                  name="WalletType"
                                  className="st-filter-select modern-input"
                                  value={values.WalletType}
                                  onChange={(e: any) =>
                                    handleWalletChange(e, setFieldValue)
                                  }
                                >
                                  <option value="">{"Select"}</option>
                                  {wallets.map((option: any, index: number) => (
                                    <option
                                      key={index}
                                      value={option.WalletValue}
                                    >
                                      {option.WalletDisplayName}
                                    </option>
                                  ))}
                                </Field>
                              </div>
                            </div>
                          </Col>

                          {/* Amount */}
                          <Col md="6" className="mb-3">
                            <div className="form-field">
                              <Label>Transfer Amount</Label>
                              <div className="input-icon-wrap">
                                <span className="input-icon">
                                  <FaRupeeSign size={14} />
                                </span>
                                <Field
                                  type="number"
                                  name="TransferAmount"
                                  placeholder={`Min Rs.${transferSettings.MinimumTransferAmount} - Max Rs.${transferSettings.MaximumTransferAmount}`}
                                  className="st-filter-input modern-input"
                                />
                              </div>
                            </div>
                          </Col>

                          {/* Username */}
                          <Col md="6" className="mb-3">
                            <div className="form-field">
                              <Label>Recipient Username</Label>
                              <div className="input-icon-wrap">
                                <span className="input-icon">
                                  <FiUser size={14} />
                                </span>
                                <Field
                                  type="text"
                                  name="ToUsername"
                                  className="st-filter-input modern-input"
                                  placeholder="Enter username"
                                  onBlur={(e: any) => {
                                    setFieldValue("ToUsername", e.target.value);
                                    handleSponsorChange(
                                      e,
                                      values,
                                      setFieldValue,
                                    );
                                  }}
                                />
                              </div>

                              {/* Username Status */}
                              {username === "Not Available" ? (
                                <div className="username-error">
                                  ⚠️ Username not found
                                </div>
                              ) : (
                                <div className="username-success">
                                  ✅ {username}
                                </div>
                              )}
                            </div>
                          </Col>

                          {/* OTP */}
                          <Col md="6" className="mb-3">
                            <div className="form-field otp-group">
                              <Label>OTP Verification</Label>
                              <div className="input-icon-wrap">
                                <span className="input-icon">
                                  <FiKey size={14} />
                                </span>
                                <Field
                                  type="text"
                                  name="OTP"
                                  placeholder="Enter OTP"
                                  className="st-filter-input modern-input"
                                />

                                <button
                                  type="button"
                                  className="btn otp-btn"
                                  onClick={() => handleSendOTP("TransferForm")}
                                  disabled={disablebtn}
                                >
                                  {isOtpSent && OTPtimer === "TransferForm"
                                    ? FormatTime(otpTimer)
                                    : "Send OTP"}
                                </button>
                              </div>
                            </div>
                          </Col>

                          {/* Transfer Summary */}
                          <Col md="12">
                            <div className="transfer-summary">
                              <h5>Transfer Summary</h5>
                              <div className="summary-row">
                                <span>Amount:</span>
                                <strong>Rs.{values.TransferAmount || 0}</strong>
                              </div>
                              <div className="summary-row">
                                <span>To:</span>
                                <strong>{values.ToUsername || "-"}</strong>
                              </div>
                              <div className="summary-row">
                                <span>Fee ({transferSettings.TransferCharge}%):</span>
                                <strong>
                                  Rs.
                                  {(
                                    Math.round(
                                      (((Number(values.TransferAmount) || 0) *
                                        transferSettings.TransferCharge) /
                                        100) *
                                        100,
                                    ) / 100
                                  ).toFixed(2)}
                                </strong>
                              </div>
                              <div className="summary-row">
                                <span>You'll Receive:</span>
                                <strong>
                                  Rs.
                                  {(
                                    (Number(values.TransferAmount) || 0) -
                                    Math.round(
                                      (((Number(values.TransferAmount) || 0) *
                                        transferSettings.TransferCharge) /
                                        100) *
                                        100,
                                    ) /
                                      100
                                  ).toFixed(2)}
                                </strong>
                              </div>
                            </div>
                          </Col>

                          {/* Submit */}
                          <div className="mt-3 d-flex justify-content-end">
                            <button
                              className="btn submit-btn"
                              disabled={
                                isSubmitting ||
                                (settingsLoaded && !transferSettings.TransferStatus)
                              }
                            >
                              Transfer Now
                            </button>
                          </div>
                        </Row>
                      </Form>
                    )}
                  </Formik>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default P2PTransfer;
