
import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Row, FormGroup, Input, Label } from "reactstrap";
import { P, H4, Btn, H5 } from "../../../AbstractElements";
import { WalletTransfer, WalletTransferFxstPay } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import HistoryTable from "../../../CommonElements/SearchTable/SearchTable"
import { useSweetAlert } from '../../../Context/SweetAlertContext'
import Loader from '../../../CommonElements/Loader/Loader'
import { decryptData } from "../../../utils/helper/Crypto";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { TransferToFXSTPayWalletFormPropsType, TransferToFXSTPayWalletForminitialValues } from "../../../Type/Forms/TransferFundToFXSTWallet/TransferFundToFXSTWallet";
import { SendOTP_Service } from '../../../Service/Authentication/SendOTPService'
import { useTransferFundService } from '../../../Service/TransferFundToDepositWallet/TransferFundToDepositWallet'
const WalletTransferFxstPayPageContainer = () => {
  useEffect(() => {
    GetWalletBalance("CommissionWallet")
  }, []);
  const { getWalletBalance, doTransfer, loading } = useTransferFundService();
  const { showAlert, ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert();
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string))
  const [walletType, setWalletType] = useState('');
  const { SendOTP, FormatTime } = SendOTP_Service()
  const [OTPtimer, setOTPtimer] = useState("TransferForm")
  const [disablebtn, setdisablebtn] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [walletBalance, setwalletBalance] = useState<number>(0);
  const [fxstwalletBalance, setfxstwalletBalance] = useState<number>(0);
  // Validation schema
  const TransferSchema = Yup.object().shape({
    WalletType: Yup.string().required("Select Wallet Type"),
    TransferAmount: Yup.number()
      .min(50, 'Minimum Transfer amount is $50')
      .required('Enter Transfer Amount'),
    OTP: Yup.string().required("Enter OTP"),
  });
  const handleWalletChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const selectedValue = event.target.value;
    setFieldValue('WalletType', selectedValue); // Update Formik's WalletType
    // console.log('Selected Wallet Type:', selectedValue);
    GetWalletBalance(selectedValue);
  };
  //============= Handling OTP 
  const handleSendOTP = async (value: any) => {
    setOTPtimer(value)
    setdisablebtn(true)
    const param = {
      ClientId: ClientID,
      ActionMode: "SendOTP"
    }
    const obj = {
      procName: 'RegistrationOTP',
      Para: JSON.stringify(param),
    };
    const res = await SendOTP(obj);
    if (res[0].StatusCode == "1") {
      setIsOtpSent(true);
      // setOtpTimer(res[0].SecondsLeft - 1)
      startTimer(res[0].SecondsLeft);
    }
  }
  //=========== Setting OTP Counter 
  const startTimer = (secondsLeft: number) => {
    setOtpTimer(secondsLeft - 1); // Subtract 1 to start the timer at 59 seconds
    const intervalId = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 0) {
          clearInterval(intervalId); // Stop timer when it reaches 0
          setIsOtpSent(false); // Reset OTP sent flag
          setdisablebtn(false)
          return 0; // Ensure it doesn't go below 0
        }
        return prev - 1; // Decrement the timer by 1 second
      });
    }, 1000);
    return () => clearInterval(intervalId);
  };
  const GetWalletBalance = async (walletType: string) => {
    if (walletType) {
      const param = {
        ClientId: ClientID,
        WalletType: walletType,
        ActionMode: "GetWalletAmount"
      }
      const obj = {
        procName: 'GetFXSTMemberWallet',
        Para: JSON.stringify(param),
      };
      const res = await getWalletBalance(obj);
      setwalletBalance(res[0].WalletAmount);
      setfxstwalletBalance(res[0].FXSTPayWallet);
    }
  }
  const handleTransfer = async (values: TransferToFXSTPayWalletFormPropsType) => {
    const confirmed = await ShowConfirmAlert("Transfer", "Are you sure want to transfer");
    if (confirmed) {
      // Proceed with the action
      const param = {
        ClientId: ClientID,
        WalletType: values.WalletType,
        TransferAmount: values.TransferAmount,
        OTP:values.OTP,
        ActionMode: "Transfer"
      }
      const obj = {
        procName: 'TransferFundToFXSTPayWallet',
        Para: JSON.stringify(param),
      };
      const res = await doTransfer(obj);
      if (res[0].StatusCode == "1") {
        ShowSuccessAlert(res[0].Msg);
      } else {
        showAlert(res[0].Msg);
      }
    } else {
      // console.log('do nothing.');
    }

  };
  return (
    <>
      <Breadcrumbs mainTitle={WalletTransferFxstPay} parent={WalletTransfer} ChildName={WalletTransferFxstPay}/>
      <Container fluid>
      {loading && <Loader />}
        <Row>
          <Col xl="4">
            <Btn color="info" style={{ fontSize: '18px', width: '100%' }} type="submit">My FXSTPAY Balance: <span><i className='fa fa-inr'></i>{fxstwalletBalance}</span></Btn>
            <hr />
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
                        <H4>Wallet Balance</H4>
                        <hr />
                        <div className="f-26">${walletBalance}</div>
                      </div>

                    </Col>

                  </Row>
                </div>
              </CardBody>
            </Card>
            <Col xl="12" style={{ display: 'flex' }}>
              <div><i className="fa fa-info-circle"></i></div><div style={{ paddingLeft: '10px' }}>
                Minimum Transfer should be $50 <br /> 5% Transaction Fee Applicable
              </div>
            </Col>
          </Col>
          <Col xl="8">
            <Card>
              <CardBody>
                <div className="gap-3 pills-blogger">
                  <Formik
                    initialValues={TransferToFXSTPayWalletForminitialValues}
                    validationSchema={TransferSchema}
                    onSubmit={(values, { setSubmitting }) => {
                      handleTransfer(values);
                      setSubmitting(false);
                    }}
                  >
                    {({ isSubmitting, setFieldValue, values }) => (
                      <Form>
                        <Row>

                          <Col md="6">
                            <FormGroup>
                              <Label>Select Wallet</Label>
                              <Field as="select" name="WalletType" className="btn-square form-select"
                                value={values.WalletType}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleWalletChange(e, setFieldValue)} >
                                <option value=''>{'Select'}</option>
                                <option value="CommissionWallet">{'My-Wallet'}</option>
                                <option value="ROIWallet">{'Trade Profit Wallet'}</option>
                              </Field>
                              <ErrorMessage name="WalletType" component="div" className="text-danger" />
                            </FormGroup>
                          </Col>
                          <Col md="6">
                            <FormGroup>
                              <Label>Transfer Amount</Label>
                              <Field type="number" name="TransferAmount" placeholder="Enter Transfer Amount" className="form-control" />
                              <ErrorMessage name="TransferAmount" component="div" className="text-danger" />

                            </FormGroup>
                          </Col>
                          <Col md="12" >
                            <FormGroup style={{ position: 'relative' }}>
                              <Label>One Time Password</Label>
                              <Field type="text" name="OTP" placeholder="One Time Password" className="form-control" />
                              <ErrorMessage name="OTP" component="div" className="text-danger" />
                              <Btn color="info"
                                onClick={() => {
                                  handleSendOTP('TransferForm')
                                }}
                                disabled={disablebtn}
                                style={{ position: 'absolute', right: '0px', top: '33px', backgroundColor: '#d0b163', borderColor: '#d0b163', color: '#000' }}>
                                {isOtpSent && OTPtimer === "TransferForm" ? FormatTime(otpTimer) : 'Send OTP'}
                              </Btn>
                            </FormGroup>
                          </Col>
                          <Col md="12">
                          <Btn color="primary" disabled={isSubmitting}>Submit</Btn>
                          </Col>

                        </Row>
                      </Form>
                    )}
                  </Formik>
                </div>
              </CardBody>
            </Card>
          </Col>

        </Row>
        <Col xl="12 mt-4" style={{ display: 'none' }}>
          <Row>
            <Col md="4">
              <FormGroup>
                <Label>From Date</Label>
                <Input type="date" placeholder="From Date" />
              </FormGroup>
            </Col>
            <Col md="4">
              <FormGroup>
                <Label>To Date</Label>
                <Input type="date" placeholder="From Date" />
              </FormGroup>
            </Col>


            <Col md="4">
              <Btn color="info mt-4 height45" type="submit">Search</Btn>
            </Col>
          </Row>
          {/* <HistoryTable /> */}
        </Col>
      </Container>
    </>
  );
};

export default WalletTransferFxstPayPageContainer;
