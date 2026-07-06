import { useState, useEffect } from "react";
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
import { P, Btn, H4 } from "../../../AbstractElements";
import { UpdateProfile } from "../../../utils/Constant";
import { TabContentProp } from "../../../Type/Profile/ProfileType";
import { Formik, Field, Form, ErrorMessage } from "formik";
import {
  ActsettingCryptoWallet,
  ActsettingBankINR,
  ActsettingBank_AED,
  ActsettingCreditCard_Details,
  USDTwalletaddrespropsType,
  Bank_INRpropsType,
  BANK_AEDpropsType,
  CreditCardDetails_propsType,
} from "../../../Type/Forms/FormsType";
import { ActSettingService } from "../../../Service/AccountSetting/ActsettingService";
import { SendOTP_Service } from "../../../Service/Authentication/SendOTPService";
import {
  CryptoWalletValidSchema,
  BankINRvalidSchema,
  BANK_AEDVailSchema,
  Cedit_Card_DetailsVailSchema,
} from "../../../Forms/FormsVailidationSchema";
import { useSweetAlert } from "../../../Context/SweetAlertContext";
import Loader from "../../../CommonElements/Loader/Loader";
import { decryptData } from "../../../utils/helper/Crypto";
import { ApiService } from "../../../Service/UniversalService/ApiService";
import Swal from "sweetalert2";

const BorderTabContent: React.FC<TabContentProp> = ({ basicTab }) => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const { universalService, loading } = ApiService();
  const { SendOTP, FormatTime } = SendOTP_Service();
  const [ClientID, setClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string),
  );
  const [UserToken, setUserToken] = useState(
    decryptData(localStorage.getItem("userToken") as string),
  );
  const { showAlert, showInputAlert, ShowSuccessAlert } = useSweetAlert();
  const [cryptoWalletValues, setcryptoWalletValues] = useState<any>(null);
  const [BankINRValues, setBankINRValues] = useState<any>(null);
  const [BankAEDValues, setBankAEDValues] = useState<any>(null);
  const [creditCardValues, setcrreditCardValues] = useState<any>(null);
  const [OTPtimer, setOTPtimer] = useState("cryptoWallet");
  const [disablebtn, setdisablebtn] = useState(false);
  const [spinner, setspinner] = useState({
    FormName: "cryptoWallet",
    Action: false,
  });

  useEffect(() => {
    GetProfileDetails();
  }, []);

  // ========= Getting Actsetting Data
  const GetProfileDetails = async () => {
    const bankParam = {
      ClientId: ClientID,
      ActionMode: "GetBankDetails",
    };

    const bankObj = {
      procName: "MemberAccountSetting",
      Para: JSON.stringify(bankParam),
    };

    const bankRes = await universalService(bankObj);

    setBankINRValues({
      IFSC: bankRes[0]?.IFSC,
      BankName: bankRes[0]?.BankName,
      BranchName: bankRes[0]?.BranchName,
      AccountNo: bankRes[0]?.AccountNo,
      AccountHolderName: bankRes[0]?.AccountHolderName,
      OTP: "",
    });
  };

  //========  Updating Bank INR
  const Update_BankINR = async (values: Bank_INRpropsType) => {
    const confirmResult = await Swal.fire({
      title: "Update Bank Details?",
      text: "Are you sure you want to update bank information?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Update",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });
    if (!confirmResult.isConfirmed) return;

    setspinner({ FormName: "bankINR", Action: true });

    const { IFSC, BankName, BranchName, AccountNo, AccountHolderName } = values;

    try {
      const param = {
        ClientId: ClientID,
        IFSC,
        BankName,
        BranchName,
        AccountNo,
        AccountHolderName,
        ActionMode: "UpdateBankDetails",
      };

      const obj = {
        procName: "MemberAccountSetting",
        Para: JSON.stringify(param),
      };

      const res = await universalService(obj);

      setspinner({ FormName: "bankINR", Action: false });

      if (res[0].StatusCode == "1") {
        ShowSuccessAlert(res[0].Msg);
      } else {
        showAlert("Opps!", res[0].Msg);
      }
    } catch (error) {
      console.error("Error in update Failed: ", error);
      setspinner({ FormName: "bankINR", Action: false });
    }
  };

  return (
    <>
      {loading && <Loader />}
      <TabContent activeTab={basicTab}>
        <TabPane tabId="2">
          <Formik
            initialValues={BankINRValues || ActsettingBankINR}
            // validationSchema={BankINRvalidSchema}
            onSubmit={(values, { setSubmitting }) => {
              Update_BankINR(values);
              setSubmitting(false);
            }}
            enableReinitialize
          >
            {({ isSubmitting, values, setFieldValue, setFieldError }) => (
              <Form>
                <Row>
                  <Col md="4">
                    <Label>IFSC Code</Label>
                    <Field
                      type="text"
                      name="IFSC"
                      autoComplete="off"
                      className="form-control"
                      placeholder="IFSC Code"
                    />
                    <ErrorMessage
                      name="IFSC"
                      component="div"
                      className="text-danger"
                    />
                  </Col>
                  <Col sm="4" md="4">
                    <FormGroup>
                      <Label>Bank Name</Label>
                      <Field
                        type="text"
                        name="BankName"
                        autoComplete="off"
                        className="form-control"
                        placeholder="Bank Name"
                      />
                      <ErrorMessage
                        name="BankName"
                        component="div"
                        className="text-danger"
                      />
                    </FormGroup>
                  </Col>
                  <Col sm="4" md="4">
                    <FormGroup>
                      <Label>Branch Name</Label>
                      <Field
                        type="text"
                        name="BranchName"
                        autoComplete="off"
                        className="form-control"
                        placeholder="Branch Name"
                      />
                      <ErrorMessage
                        name="BranchName"
                        component="div"
                        className="text-danger"
                      />
                    </FormGroup>
                  </Col>
                  <Col sm="4" md="4">
                    <FormGroup>
                      <Label>Account Number</Label>
                      <Field
                        type="text"
                        name="AccountNo"
                        autoComplete="off"
                        className="form-control"
                        placeholder="Account Number"
                      />
                      <ErrorMessage
                        name="AccountNo"
                        component="div"
                        className="text-danger"
                      />
                    </FormGroup>
                  </Col>
                  <Col sm="4" md="4">
                    <FormGroup>
                      <Label>Account Holder Name</Label>
                      <Field
                        type="text"
                        name="AccountHolderName"
                        autoComplete="off"
                        className="form-control"
                        placeholder="Account Holder Name"
                      />
                      <ErrorMessage
                        name="AccountHolderName"
                        component="div"
                        className="text-danger"
                      />
                    </FormGroup>
                  </Col>
                  <Col sm="4" md="4">
                    <FormGroup style={{ position: "relative" }}>
                      <Label>One Time Password</Label>
                      <Field
                        type="text"
                        name="OTP"
                        autoComplete="off"
                        className="form-control"
                        placeholder="One Time Password"
                      />
                      <ErrorMessage
                        name="OTP"
                        component="div"
                        className="text-danger"
                      />
                      <Btn
                        className="form-btn"
                        disabled={disablebtn}
                        onClick={() => {
                          handleSendOTP("BankINR");
                        }}
                        style={{
                          position: "absolute",
                          right: "0px",
                          top: "36px",
                          background: "var(--btn-bg)",
                          color: "var(--btn-text-color)",
                        }}
                      >
                        {isOtpSent && OTPtimer === "BankINR"
                          ? FormatTime(otpTimer)
                          : "Send OTP"}
                      </Btn>
                    </FormGroup>
                  </Col>
                </Row>
                <div className="text-start">
                  <button
                    className="form-btn btn"
                    disabled={isSubmitting}
                    type="submit"
                  >
                    {"Update Account"}
                    {spinner.Action === true &&
                    spinner.FormName === "bankINR" ? (
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
              </Form>
            )}
          </Formik>
        </TabPane>
      </TabContent>
    </>
  );
};

export default BorderTabContent;
