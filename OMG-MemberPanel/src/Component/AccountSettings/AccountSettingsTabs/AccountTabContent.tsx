import { useState, useEffect } from "react";
import {
  CardBody,
  Label,
  TabContent,
  TabPane,
  Card,
  CardFooter,
  Col,
  Row,
} from "reactstrap";
import { H4 } from "../../../AbstractElements";
import { TabContentProp } from "../../../Type/Profile/ProfileType";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { USDTwalletaddrespropsType } from "../../../Type/Forms/FormsType";
import { SendOTP_Service } from "../../../Service/Authentication/SendOTPService";
import { CryptoWalletValidSchema } from "../../../Forms/FormsVailidationSchema";
import { useSweetAlert } from "../../../Context/SweetAlertContext";
import Loader from "../../../CommonElements/Loader/Loader";
import { decryptData } from "../../../utils/helper/Crypto";
import { ApiService } from "../../../Service/UniversalService/ApiService";

const BorderTabContent: React.FC<TabContentProp> = ({ basicTab }) => {
  const { universalService, loading } = ApiService();
  const { SendOTP, FormatTime } = SendOTP_Service();
  const { showAlert, ShowSuccessAlert } = useSweetAlert();
  const [ClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );
  const [cryptoWalletValues, setcryptoWalletValues] = useState<any>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [disablebtn, setdisablebtn] = useState(false);
  const [spinner, setspinner] = useState({
    FormName: "cryptoWallet",
    Action: false,
  });

  useEffect(() => {
    GetProfileDetails();
  }, []);

  // ✅ GET CRYPTO DETAILS
  const GetProfileDetails = async () => {
    try {
      const param = {
        ClientId: ClientID,
        ActionMode: "GetCryptoDetails",
      };

      const obj = {
        procName: "MemberAccountSetting",
        Para: JSON.stringify(param),
      };

      const res = await universalService(obj);

      setcryptoWalletValues({
        WalletAddress: res[0]?.WalletAddress || "",
        OTP: "",
      });
    } catch (error) {
      console.error("Error fetching crypto details:", error);
    }
  };

  // ✅ UPDATE CRYPTO WALLET
  const Update_CryptoWallet = async (values: USDTwalletaddrespropsType) => {
    setspinner({ FormName: "cryptoWallet", Action: true });

    try {
      const { WalletAddress } = values;

      const param = {
        ClientId: ClientID,
        WalletAddress,
        ActionMode: "UpdateCryptoDetails",
      };

      const obj = {
        procName: "MemberAccountSetting",
        Para: JSON.stringify(param),
      };

      const res = await universalService(obj);

      setspinner({ FormName: "cryptoWallet", Action: false });

      if (res[0]?.StatusCode === "1") {
        ShowSuccessAlert(res[0]?.Msg);
      } else {
        showAlert("Oops!", res[0]?.Msg);
      }
    } catch (error) {
      console.error("Update Error:", error);
      setspinner({ FormName: "cryptoWallet", Action: false });
    }
  };

  // ✅ SEND OTP
  const handleSendOTP = async () => {
    setdisablebtn(true);

    const param = {
      ClientId: ClientID,
      ActionMode: "SendOTP",
    };

    const obj = {
      procName: "RegistrationOTP",
      Para: JSON.stringify(param),
    };

    const res = await SendOTP(obj);

    if (res[0].StatusCode === "1") {
      setIsOtpSent(true);
      ShowSuccessAlert("OTP sent successfully");
      startTimer(res[0].SecondsLeft);
    }
  };

  // ✅ TIMER
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

      <TabContent activeTab={basicTab}>
        <TabPane tabId="1">
          <Formik
            initialValues={
              cryptoWalletValues || {
                WalletAddress: "",
                OTP: "",
              }
            }
            validationSchema={CryptoWalletValidSchema}
            enableReinitialize
            onSubmit={(values) => {
              Update_CryptoWallet(values);
            }}
          >
            {() => (
              <Form>
                <Row className="g-4">
                  <Col md="6">
                    <Label className="fw-semibold">
                      Wallet Address (BEP20)
                    </Label>
                    <Field
                      type="text"
                      name="WalletAddress"
                      className="form-control"
                      placeholder="Enter Wallet Address"
                    />
                    <ErrorMessage
                      name="WalletAddress"
                      component="div"
                      className="text-danger small"
                    />
                  </Col>

                  <Col md="6" className="position-relative">
                    <Label className="fw-semibold">OTP</Label>

                    <Field
                      type="text"
                      name="OTP"
                      className="form-control"
                      placeholder="Enter OTP"
                    />

                    <ErrorMessage
                      name="OTP"
                      component="div"
                      className="text-danger small"
                    />

                    {/* ✅ FIXED BUTTON */}
                    <button
                      type="button"
                      className="form-btn btn"
                      onClick={handleSendOTP}
                      disabled={disablebtn}
                      style={{
                        position: "absolute",
                        right: "16px",
                        top: "36px",
                      }}
                    >
                      {isOtpSent ? FormatTime(otpTimer) : "Send OTP"}
                    </button>
                  </Col>
                </Row>

                <div className="text-start mt-4 bg-transparent border-0">
                  <button className="form-btn btn" type="submit">
                    Update Wallet
                    {spinner.Action && spinner.FormName === "cryptoWallet" && (
                      <span className="spinner-border spinner-border-sm ms-2" />
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </TabPane>
      </TabContent>
    </>
  );
};

export default BorderTabContent;
