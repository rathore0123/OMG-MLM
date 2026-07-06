import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Col, Container, Label, Row } from "reactstrap";
import { Btn, H1, H2, H6, Image, P } from "../../AbstractElements";
import { dynamicImage } from "../../Service";
import Loader from "../../CommonElements/Loader/Loader";
import {
  CreateAccount,
  DoNotAccount,
  UserName,
  ForgotPassword,
  Href,
  Password,
  RememberPassword,
  SignIn,
  SignInAccount,
  SignInWith,
} from "../../utils/Constant";
import { encryptData } from "../../utils/helper/Crypto";
import {
  LoginFormPropsType,
  LoginForminitialValues,
} from "../../Type/Forms/FormsType";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useLoginService } from "../../Service/Authentication/LoginService";

// Make sure TypeScript knows about window.ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Validation schema
const LoginSchema = Yup.object().shape({
  userid: Yup.string().required("Wallet Address is required"),
});

const Login = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const username = queryParams.get("username");
  const password = queryParams.get("password");

  const [FormFieldData, setFormFieldData] = useState<any>(null);
  const { doLogin, loading } = useLoginService();
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      ProcessLogin();
    }
  }, []);

  // Wallet Connect on Load
  useEffect(() => {
    const connectWalletOnLoad = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          if (accounts && accounts.length > 0) {
            const walletAddress = accounts[0];
            setFormFieldData((prev: any) => ({
              ...prev,
              userid: walletAddress,
            }));
          }

          // Listen for account changes
          window.ethereum.on("accountsChanged", (accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              setFormFieldData((prev: any) => ({
                ...prev,
                userid: accounts[0],
              }));
              toast.info("Wallet account changed!");
            }
          });
        } catch (err) {
          toast.error("Wallet connection was denied.");
        }
      } else {
        toast.error(
          "No Web3 wallet found. Please install MetaMask or Trust Wallet."
        );
      }
    };

    connectWalletOnLoad();
  }, []);

  const SimpleLoginHandle = async (values: LoginFormPropsType) => {
    const { userid, password } = values;
    const res = await doLogin({
      procName: "SolidityLogin",
      Para: '{"UserId":"' + userid + '"}',
    });
    if (!res) return;
    if (res[0]?.StatusCode == "1") {
      localStorage.setItem("clientId", encryptData(res[0]?.UserId?.toString()));
      localStorage.setItem("userToken", encryptData(res[0]?.UserToken));
      localStorage.setItem("UserName", res[0]?.UserName);
      localStorage.setItem("refURL", res[0]?.ReferralURL);
      localStorage.setItem("MemberName", res[0]?.MemberName);
      localStorage.setItem("memberemail", res[0]?.EmailId);
      localStorage.setItem("RankName", res[0]?.RankName);
      navigate(`${import.meta.env.BASE_URL}/dashboard`);
    } else {
      toast.error(res[0]?.msg);
    }
  };

  const ProcessLogin = async () => {
    const res = await doLogin({
      procName: "SolidityLogin",
      Para: '{"UserId":"' + username + '"}',
    });
    if (!res) return;
    if (res[0]?.StatusCode == "1") {
      localStorage.setItem("clientId", encryptData(res[0]?.UserId?.toString()));
      localStorage.setItem("userToken", encryptData(res[0]?.UserToken));
      localStorage.setItem("UserName", res[0]?.UserName);
      localStorage.setItem("refURL", res[0]?.ReferralURL);
      localStorage.setItem("MemberName", res[0]?.MemberName);
      const loginformData = {
        userid: username,
        password: password,
      };
      setFormFieldData(loginformData);
      setTimeout(() => {
        navigate(`${import.meta.env.BASE_URL}/dashboard`);
      }, 1000);
    } else {
      toast.error(res[0]?.msg);
    }
  };

  return (
    <Container fluid className="p-0">
      {loading && <Loader />}
      <Row className="m-0">
        <Col xs="12" className="p-0">
          <div
            className="login-card login-dark"
            style={{ backgroundColor: "transparent" }}
          >
            <div>
              <div className="login-main">
                <div>
                  <Link className="logo text-center" to={Href}>
                  <Image
                                    className="for-dark"
                                    src={`${import.meta.env.BASE_URL}/assets/images/logo/BDG-LOGO.png`}
                                    alt="logo"
                                    style={{
                                      width: "240px",
                                      height: "auto",
                                      objectFit: "contain",
                                      display: "inline-block",
                                      margin: "-100px",
                                      padding: "0",
                                    }}
                                  />
                    {/* <Image
                      className="img-fluid for-dark"
                      src="/portal/assets/images/logo/GoldenLogo.png"
                      style={{ height: "60px", margin: "auto" }}
                      alt="darkLogo"
                    /> */}
                  </Link>
                </div>

                <Formik
                  enableReinitialize
                  initialValues={FormFieldData || LoginForminitialValues}
                  validationSchema={LoginSchema}
                  onSubmit={(values, { setSubmitting }) => {
                    SimpleLoginHandle(values);
                    setSubmitting(false);
                  }}
                >
                  {({ isSubmitting }) => (
                    <Form className="theme-form">
                      <H1 className="text-center mt-1">{SignInAccount}</H1>

                      <P className="text-center text-light">
                        {"🚀 Connect your wallet to continue"}
                      </P>

                      {FormFieldData?.userid && (
                        <div className="text-center text-success mb-2">
                          ✅ Connected: {FormFieldData.userid.slice(0, 6)}...
                          {FormFieldData.userid.slice(-4)}
                        </div>
                      )}

                      <div className="form-group">
                        <Label className="col-form-label">{UserName}</Label>
                        <Field
                          type="text"
                          name="userid"
                          readOnly
                          placeholder="Wallet Address"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="userid"
                          component="div"
                          className="text-danger"
                        />
                      </div>

                      <div className="form-group mb-0 checkbox-checked">
                        <div className="text-end mt-3">
                          <button
                            className="form-btn rounded py-2 w-100"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            {SignIn}
                          </button>
                        </div>
                      </div>
                      {/* Link to Login via Browser */}
                      <div className="text-center my-3">
                        <Link
                          to={`${import.meta.env.BASE_URL}/loginauth`}
                          className="d-inline-flex align-items-center justify-content-center px-4 py-2 rounded"
                          style={{
                            backgroundColor: "#000", // Black background
                            border: "1px solid #FFD700", // Gold border
                            color: "#FFD700", // Gold text
                            fontWeight: "600",
                            textDecoration: "none",
                            fontSize: "16px",
                            gap: "8px",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#ccb327ff";
                            e.currentTarget.style.color = "#000";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#000";
                            e.currentTarget.style.color = "#d4bb2dff";
                          }}
                        >
                          🌐 Login via Browser
                        </Link>
                      </div>
                      <div className="login-social-title">
                        <H6>{SignInWith}</H6>
                      </div>

                      <P className="mt-4 mb-0 text-center">
                        {DoNotAccount}
                        <Link
                          className="ms-2 text-decoration-underline"
                          style={{ color: "#fff" }}
                          to={`${import.meta.env.BASE_URL}/register`}
                        >
                          {CreateAccount}
                        </Link>
                      </P>
                    </Form>
                  )}
                </Formik>
              </div>

              <div className="mt-3 d-flex align-items-center justify-content-center">
                <Image
                  className="img-fluid for-dark"
                  src={dynamicImage("best-seller.png")}
                  style={{ width: "19px", marginRight: "3px" }}
                  alt="trust"
                />
                <P className="mb-0">
                  {" Your security is our priority—login with confidence."}
                </P>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
