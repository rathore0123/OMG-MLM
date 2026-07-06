
import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Row, FormGroup, Input, Label } from "reactstrap";
import { P, H4, Btn, H5 } from "../../../AbstractElements";
import { WalletTransfer, WalletTransferFxstPayToCommission } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import HistoryTable from "../../../CommonElements/SearchTable/SearchTable"
import { useSweetAlert } from '../../../Context/SweetAlertContext'
import Loader from '../../../CommonElements/Loader/Loader'
import { decryptData } from "../../../utils/helper/Crypto";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { TransferFXSTPayWalletToCommissionFormPropsType, TransferFXSTPayWalletToCommissionForminitialValues } from "../../../Type/Forms/TransferFXSTWalletToCommission/TransferFXSTWalletToCommission";
import { SendOTP_Service } from '../../../Service/Authentication/SendOTPService'
import { useTransferFundService } from '../../../Service/TransferFundToDepositWallet/TransferFundToDepositWallet'
const FxstPayWalletToCommissionContainer = () => {
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
  const [showmsg, setshowmsg] = useState(false);
  const [msgText, setmsgText] =useState('')
  const [amount, setamount] =useState<any>(null)
  // Validation schema
  const TransferSchema = Yup.object().shape({
    TransferAmount: Yup.number()
      .min(100, 'Minimum Transfer amount is Rs.100')
      .required('Enter Transfer Amount'),
    OTP: Yup.string().required("Enter OTP"),
  });
  
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
        WalletType: "CommissionWallet",
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
  const handleTransfer = async (values: TransferFXSTPayWalletToCommissionFormPropsType) => {
    const confirmed = await ShowConfirmAlert("Transfer", "Are you sure want to transfer");
    if (confirmed) {
      // Proceed with the action
      const param = {
        ClientId: ClientID,
        TransferAmount: values.TransferAmount,
        WalletType: "CommissionWallet",
        OTP:values.OTP,
        ActionMode: "Transfer"
      }
      const obj = {
        procName: 'TransferFromFXSTPayWalletToCommissionWallet',
        Para: JSON.stringify(param),
      };
      const res = await doTransfer(obj);
      if (res[0].StatusCode == "1") {
        ShowSuccessAlert(res[0].Msg);
        GetWalletBalance("CommissionWallet");
      } else {
        showAlert(res[0].Msg);
      }
    } else {
      // console.log('do nothing.');
    }

  };
  const handleWithdrawAmountBlur =(e: React.FocusEvent<HTMLInputElement>, 
    values: { TransferAmount: string},
  )=>{
    const amount = Number(e.target.value);
    setamount(amount)

    if(amount > 0){
      setshowmsg(true)
      //console.log("Withdraw Amount blurred with value:", amount, WithdrawMode, Math.floor(amount * (1/3)));
      setmsgText(`You will get $ ${(amount /85).toFixed(2)}`)
    } else if(amount == 0){
      setshowmsg(false)
    }
  } 
  return (
    <>
      <Breadcrumbs mainTitle={WalletTransferFxstPayToCommission} parent={WalletTransfer} ChildName={WalletTransferFxstPayToCommission}/>
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
                Minimum Transfer should be Rs.100 <br /> No Transaction Fee Applicable
              </div>
            </Col>
          </Col>
          <Col xl="8">
            <Card>
              <CardBody>
                <div className="gap-3 pills-blogger">
                  <Formik
                    initialValues={TransferFXSTPayWalletToCommissionForminitialValues}
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
                              <Label>Transfer Amount</Label>
                              <Field type="number" name="TransferAmount" placeholder="Enter Transfer Amount" 
                              onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                // Your custom blur logic here
                                handleWithdrawAmountBlur(e, values);
                              }}
                              className="form-control" />
                              {showmsg ? <P>{msgText} </P> : undefined}
                              <ErrorMessage name="TransferAmount" component="div" className="text-danger" />

                            </FormGroup>
                          </Col>
                          <Col md="6" >
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

export default FxstPayWalletToCommissionContainer;
