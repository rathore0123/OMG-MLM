
import { DepositFundTitle, KYC_Deposit, ScrollingModalHeading } from '../../../utils/Constant'
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardBody, Col, Container, Row, FormGroup, Input, Label } from "reactstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { decryptData, encryptData } from "../../../utils/helper/Crypto";
import { Formik, Field, Form, ErrorMessage, FieldProps } from "formik";
import { Image, P, H4, Btn, H5 } from "../../../AbstractElements";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { dynamicImage } from "../../../Service";
import Loader from '../../../CommonElements/Loader/Loader'
import LastTransaction from "./LastTransaction/LastTransactionKYC"
import { useDepositFundService } from '../../../Service/DepositFund/DepositFundINRAED'
import { useSweetAlert } from '../../../Context/SweetAlertContext'
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { format } from "date-fns";
import { toast } from "react-toastify";
import QRCode from 'react-qr-code';
import { useWithdrawService } from '../../../Service/Withdraw/Withdraw';
import { KYC_WalletForm_Schema } from '../../../Forms/FormsVailidationSchema';
import CommonModal from '../FundINR/CommonModal';

interface FormValues {
  Payment_Amount: string,
  Payment_Date: Date | null,
  UTR_NO: string,
}


const KYC_Deposit_Wallet = () => {
  const [scrollingModal, setScrollingModal] = useState(false);
  const scrollModalToggle = () => setScrollingModal(!scrollingModal);
  const [banks, setBanks] = useState<any>([]);
  const {getTRC20AddressKYC, verifyUTR, getBankByCurrency, getBEP20AddressKYC, loading } = useDepositFundService();
  const { getWalletBalance, } = useWithdrawService();
  const { showAlert, ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert();
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string));
  const [walletBalance, setwalletBalance] = useState<number>(0);
  const [minimumWithdrawalAmount, setminimumWithdrawalAmount] = useState("");
  const [token, setToken] = useState("");
  const [walletAddress, setwalletAddress] = useState("");
  const [walletAddresstrc20, setTRc20walletAddress] = useState("");
  const [Formloader, setFormloader] = useState(false);
  const [TabName, setTabName] = useState('USDT')
  const [back, setBack] = useState('#EE1A3B');
  const [fore, setFore] = useState('#000');
  const [size, setSize] = useState(150);


  const initialValues: FormValues = {
    Payment_Amount: '',
    Payment_Date: null,
    UTR_NO: ''
  };
  const GetDepsitBanks = async () => {
    const param = {
      MemberId: ClientID,
      Currency: "INR",
      ActionMode: "GetKYCCompanyBankDetails"
    }
    const obj = {
      procName: 'RequestFundINR',
      Para: JSON.stringify(param),
    };
    const res = await getBankByCurrency(obj);
    setBanks(res || []); // Set fetched banks
  }
  const GetWalletBalance = async (walletType: string) => {
    const param = {
      ClientId: ClientID,
      WalletType: walletType,
      ActionMode: "GetWalletAmount"
    }
    const obj = {
      procName: 'WithdrawFund',
      Para: JSON.stringify(param),
    };
    const res = await getWalletBalance(obj);
    setwalletBalance(res[0].WalletAmount);
    setToken(res[0].Token);
    localStorage.setItem("userToken", encryptData(res[0]?.Token));
  }

  const GenerateTRC20AddressKYC = async () => {
    const param = {
      ClientId: ClientID
    }
    const res = await getBEP20AddressKYC(param);
    if (res[0].StatusCode == "1") {
      console.log(res);
      setwalletAddress(res[0].Msg);
    } else {

    }
  }
  const GenerateAddressKYC = async () => {
    const param = {
      ClientId: ClientID
    }
    const res = await getTRC20AddressKYC(param);
    if (res[0].StatusCode == "1") {
      console.log(res);
      setTRc20walletAddress(res[0].Msg);
    } else {

    }
  }
  const CopyCallBack = (t: any, r: any) => {
    if (r == true) {
      toast.success("Copied");
    }
  }
  useEffect(() => {
    GetWalletBalance('KYCWallet');
    GenerateTRC20AddressKYC();
    GenerateAddressKYC();
    //GetDepsitBanks();
  }, []);




  const handleSubmit = async (values: any) => {
    setFormloader(true)
    const { Payment_Amount, Payment_Date, UTR_NO } = values
    const ConvertPaymentDate = format(Payment_Date, "dd-MMMM-yyyy");
    const Obj = {
      ClientId: ClientID,
      Token: token,
      PaymentDate: ConvertPaymentDate,
      Amount: Payment_Amount,
      UTR: UTR_NO
    }
    try {
      const res = await verifyUTR(Obj)
      if (res[0]?.StatusCode === "1") {
        ShowSuccessAlert(res[0]?.Msg)
        setFormloader(false)
      } else {
        showAlert(res[0]?.Msg)
        setFormloader(false)
      }

    } catch (error) {
      setFormloader(false)
      showAlert("Something Wents Wrong")
    }

  }


  return (
    <>
      <Breadcrumbs
        mainTitle={KYC_Deposit}
        parent={DepositFundTitle}
        ChildName={KYC_Deposit}
      />
      <Container fluid>
        {loading && <Loader />}
        <Row>
          <Col xl="4">
            <Card className="bg-primary">
              <CardBody>
                <div className="gap-3 pills-blogger">
                  <Row>
                    <Col xl="3">
                      <div className="blog-wrapper">
                        <i className="icon-wallet f-60"></i>
                      </div>
                    </Col>
                    <Col xl="9">
                      <div className="blog-content">
                        <H4>KYC Wallet Balance</H4>
                        <hr />
                        <div className="f-26">${walletBalance}</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
            <Col xl="12" style={{ display: "flex" }}>
              <div>
                <i className="fa fa-info-circle"></i>
              </div>
              <div style={{ paddingLeft: "10px" }}>
                To complete your deposit, simply scan the QR code, pay the
                required amount.<br/>
                <span style={{color:'#E6B855'}}>KYC Verification Amount: 100 USDT.</span>
              </div>
              
            </Col>
          </Col>
          <Col xl="8">
            <Col md="12 mb-2" className="bg-dark">
              <Row>
                <Col md="4" className="d-flex gap-1">
                  <Btn
                    color="btn btn-primary"
                    className={
                      TabName === "INR"
                        ? "rounded-0 w-60 bg-dark deActive-Btn"
                        : "rounded-0 w-60"
                    }
                    onClick={() => setTabName("USDT")}
                  >
                    USDT[BEP20]
                  </Btn>
                  {/* <Btn
                    color="btn btn-primary"
                    className={
                      TabName === "USDT"
                        ? "rounded-0 w-60 bg-dark deActive-Btn"
                        : "rounded-0 w-60"
                    }
                    onClick={() => setTabName("INR")}
                  >
                    USDT[TRC20]
                  </Btn> */}
                </Col>
              </Row>
            </Col>
            {/* {TabName === "INR" ? (
              <Col>
                <Col md="4" className=" d-flex ms-3">
                  <Btn color="btn btn-primary" onClick={scrollModalToggle} className="element">
                  Our Bank Details <i className='fa fa-hand-pointer-o'></i>
                  </Btn>
                </Col>
              </Col>
            ) : null} */}
            {TabName === "USDT" ? (
              <Card>
                <CardBody>
                  <div className="gap-3 pills-blogger">
                    <Row>
                      <Col xl="4 text-center">
                        <div className="blog-wrapper QR_Code_container">
                          <QRCode value={walletAddress} size={180} />
                        </div>
                      </Col>
                      <Col xl="8">
                        <div className="blog-content">
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
            ) : (
              <Card>
                <CardBody>
                  <div className="gap-3 pills-blogger">
                    <Row>
                      <Col xl="4 text-center">
                        <div className="blog-wrapper QR_Code_container">
                          <QRCode value={walletAddresstrc20} size={180} />
                        </div>
                      </Col>
                      <Col xl="8">
                        <div className="blog-content">
                          <H4>Deposit by scanning this QR Code</H4>
                          <hr />
                          <FormGroup>
                            <Input type="text" value={walletAddresstrc20} readOnly />
                            <CopyToClipboard
                              text={walletAddresstrc20}
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
              // <Card>
              //   <CardBody>
              //     <div className="gap-3 pills-blogger">
              //       <Row>
              //         <Formik
              //           initialValues={initialValues}
              //           validationSchema={KYC_WalletForm_Schema}
              //           onSubmit={(values, { setSubmitting }) => {
              //             handleSubmit(values);
              //             setSubmitting(false);
              //           }}
              //         >
              //           {({ isSubmitting, setFieldValue, values }) => (
              //             <Form>
              //               <Row>
              //                 <Col md="6">
              //                   <FormGroup>
              //                     <Label>Payment Amount</Label>
              //                     <Field
              //                       type="number"
              //                       name="Payment_Amount"
              //                       placeholder="Payment Amount"
              //                       className="form-control"
              //                     />
              //                     <ErrorMessage
              //                       name="Payment_Amount"
              //                       component="div"
              //                       className="text-danger"
              //                     />
              //                   </FormGroup>
              //                 </Col>
              //                 <Col md="6">
              //                   <FormGroup>
              //                     <Label>Payment Date:</Label>
              //                     <Field name="Payment_Date">
              //                       {({ field }: FieldProps) => (
              //                         <DatePicker
              //                           className={`form-control`}
              //                           selected={values.Payment_Date}
              //                           onChange={(date) =>
              //                             setFieldValue("Payment_Date", date)
              //                           }
              //                           dateFormat="dd-MMMM-yyyy" // Yahan format set kiya gaya
              //                           placeholderText="DD-MMMM-YYYY" // Placeholder
              //                         />
              //                       )}
              //                     </Field>
              //                     <ErrorMessage
              //                       className="text-danger"
              //                       name="Payment_Date"
              //                       component="div"
              //                     />
              //                   </FormGroup>
              //                 </Col>
              //                 <Col md="6">
              //                   <FormGroup>
              //                     <Label>UTR No</Label>
              //                     <Field
              //                       name="UTR_NO"
              //                       placeholder="UTR No"
              //                       className="form-control"
              //                     />
              //                     <ErrorMessage
              //                       name="UTR_NO"
              //                       component="div"
              //                       className="text-danger"
              //                     />
              //                   </FormGroup>
              //                 </Col>
              //                 <Col md="12">
              //                   <Btn color="primary" disabled={isSubmitting}>
              //                     Submit
              //                     {Formloader ? <div className="spinner-border spinner-border-sm ms-2" role="status">
              //                       <span className="sr-only">Loading...</span></div> : null}
              //                   </Btn>
              //                 </Col>
              //               </Row>
              //             </Form>
              //           )}
              //         </Formik>
              //       </Row>
              //     </div>
              //   </CardBody>
              // </Card>
            )}
            <CommonModal size="lg" isOpen={scrollingModal} toggle={scrollModalToggle} title={ScrollingModalHeading}>
              {banks.map((bank: any, i: number) => (
                <Card className="primaryCard">
                  <CardBody>
                    <Row>
                      <Col md="9">
                        <Row>
                          <Col md="8">
                            <div className="text-info">{bank.AccountHolderName}</div>
                          </Col>
                          <Col md="4">
                            <div className="badge badge-info">
                              {bank.BankName}
                            </div>
                          </Col>
                        </Row>
                        <hr />
                        <div>
                          <Row>
                            <Col md="4">
                              <div><small className="HeadBlue">ACCOUNT NUMBER</small></div>
                              <div>{bank.AccountNo}
                                 &nbsp;<CopyToClipboard
                                  text={bank.AccountNo}
                                  onCopy={CopyCallBack}
                                >
                                  <i className="fa fa-copy"></i>
                                </CopyToClipboard></div>

                            </Col>
                            <Col md="4">
                              <div><small className="HeadBlue">IFSC CODE</small></div>
                              <div>{bank.IFSC}
                              &nbsp;<CopyToClipboard
                                  text={bank.IFSC}
                                  onCopy={CopyCallBack}
                                >
                                  <i className="fa fa-copy"></i>
                                </CopyToClipboard>
                              </div>
                            </Col>
                            {/* <Col md="4">
                              <div><small className="HeadBlue">UPI ID</small></div>
                              <div>{bank.UPIId}</div>
                            </Col> */}
                          </Row>
                        </div>
                      </Col>
                      {/* <Col md="3">
                        <div style={{ textAlign: 'center' }}>
                          <img src={import.meta.env.VITE_APP_QR_URL + bank.QRCode} style={{ height: "120px", width: "120px" }}></img>
                        </div>
                      </Col> */}
                    </Row>
                  </CardBody>
                </Card>
              ))}
            </CommonModal>
          </Col>
          <Col xl="12">
            <LastTransaction />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default KYC_Deposit_Wallet;
