import React from 'react'

const RequestWithdraw = () => {
  return (
    <div>
      
    </div>
  )
}

export default RequestWithdraw

// import React, { useEffect, useState } from 'react';
// import { Card, CardBody, Col, Container, Row, FormGroup, Input, Label } from "reactstrap";
// import { P, H4, Btn, H5 } from "../../../AbstractElements";
// import { WithdrawTitle, RequestWithdraw } from "../../../utils/Constant";
// import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
// import HistoryTable from "../../../CommonElements/SearchTable/SearchTable"
// import { useSweetAlert } from '../../../Context/SweetAlertContext'
// import Loader from '../../../CommonElements/Loader/Loader'
// // import { decryptData,encryptData } from "../../../utils/helper/Crypto";
// import { Formik, Field, Form, ErrorMessage } from "formik";
// import * as Yup from "yup";
// import { SendOTP_Service } from '../../../Service/Authentication/SendOTPService'
// import { useWithdrawService } from '../../../Service/Withdraw/Withdraw'
// import { WithdrawFormPropsType, WithdrawForminitialValues } from "../../../Type/Forms/FormsType";

// const WalletTransferFxstPayPageContainer = () => {
//   const { getWalletBalance, doWithdrawal, loading } = useWithdrawService();
//   const [isOtpSent, setIsOtpSent] = useState(false);
//   const [otpTimer, setOtpTimer] = useState<number>(0);
//   const [walletBalance, setwalletBalance] = useState<number>(0);
//   const [tokenRate, settokenRate] = useState<number>(0);
//   const { showAlert, ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert();
//   const [minimumWithdrawalAmount, setminimumWithdrawalAmount] = useState("");
//   const [token, setToken] = useState("");
//   const { SendOTP, FormatTime } = SendOTP_Service()
//   const [OTPtimer, setOTPtimer] = useState("WithdrawForm")
//   const [disablebtn, setdisablebtn] = useState(false);
//   // const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string))
//   // const [UserToken, setUserToken] = useState(decryptData(localStorage.getItem("userToken") as string))
//   const [walletType, setWalletType] = useState('');
//   const [showmsg, setshowmsg] = useState(false);
//   const [msgText, setmsgText] =useState('')
//   const [amount, setamount] =useState<any>(null)

//   useEffect(() => {
//     GetWalletBalance("CommissionWallet")
//   }, []);


//   // Validation schema
//   const WithdrawSchema = Yup.object().shape({
//     WalletType: Yup.string().required("Select Wallet Type"),
//     WithdrawMode: Yup.string().required("Select Withdraw Mode"),
//     WithdrawAmount: Yup.number()
//       .min(10, 'Minimum withdraw amount is $10')
//       .required('Enter Withdraw Amount'),
//     OTP: Yup.string().required("Enter OTP"),
//   });
//   const handleWalletChange = (
//     event: React.ChangeEvent<HTMLSelectElement>,
//     setFieldValue: (field: string, value: any) => void
//   ) => {
//     const selectedValue = event.target.value;
//     setFieldValue('WalletType', selectedValue); // Update Formik's WalletType
//     // console.log('Selected Wallet Type:', selectedValue);
//     GetWalletBalance(selectedValue);
//   };
//   //============= Handling OTP 
//   const handleSendOTP = async (value: any) => {
//     setOTPtimer(value)
//     setdisablebtn(true)
//     const param = {
//       ClientId: ClientID,
//       ActionMode: "SendOTP"
//     }
//     const obj = {
//       procName: 'RegistrationOTP',
//       Para: JSON.stringify(param),
//     };
//     const res = await SendOTP(obj);
//     if (res[0].StatusCode == "1") {
//       setIsOtpSent(true);
//       // setOtpTimer(res[0].SecondsLeft - 1)
//       startTimer(res[0].SecondsLeft);
//     }
//   }
//   //=========== Setting OTP Counter 
//   const startTimer = (secondsLeft: number) => {
//     setOtpTimer(secondsLeft - 1); // Subtract 1 to start the timer at 59 seconds
//     const intervalId = setInterval(() => {
//       setOtpTimer((prev) => {
//         if (prev <= 0) {
//           clearInterval(intervalId); // Stop timer when it reaches 0
//           setIsOtpSent(false); // Reset OTP sent flag
//           setdisablebtn(false)
//           return 0; // Ensure it doesn't go below 0
//         }
//         return prev - 1; // Decrement the timer by 1 second
//       });
//     }, 1000);
//     return () => clearInterval(intervalId);
//   };
//   const GetWalletBalance = async (walletType: string) => {
//     const param = {
//       ClientId: ClientID,
//       WalletType: walletType,
//       ActionMode: "GetWalletAmount"
//     }
//     const obj = {
//       procName: 'WithdrawFund',
//       Para: JSON.stringify(param),
//     };
//     const res = await getWalletBalance(obj);
//     setwalletBalance(res[0].WalletAmount);
//     setToken(res[0].Token);
//     setminimumWithdrawalAmount(res[0].ReleaseAmount);
//     settokenRate(res[0].TokenRate);
//     // localStorage.setItem("userToken", encryptData(res[0]?.Token));
//   }
  
//   const handleWithdrawal = async (values: WithdrawFormPropsType) => {
//     const confirmed = await ShowConfirmAlert("Withdraw", "Are you sure want to withdraw");
//     if (confirmed) {
//       // Proceed with the action
//       const param = {
//         ClientId: ClientID,
//         WalletType: values.WalletType,
//         WithdrawAmount: values.WithdrawAmount,
//         OTP: values.OTP,
//         PaymentMode: values.WithdrawMode,
//         DepositToken: token,
//         ActionMode: "Withdraw"
//       }
//       const obj = {
//         procName: 'WithdrawFund',
//         Para: JSON.stringify(param),
//       };
//       const res = await doWithdrawal(obj);
//       if (res[0].StatusCode == "1") {
//         ShowSuccessAlert(res[0].Msg);
//       } else {
//         showAlert(res[0].Msg);
//       }
//     } else {
//       // console.log('do nothing.');
//     }

//   };

// // Calculating FXST Token by Dollar
// const handleWithdrawAmountBlur =(e: React.FocusEvent<HTMLInputElement>, 
//   values: { WithdrawAmount: string, WithdrawMode: string },
// )=>{
//   const amount = Number(e.target.value);
//   setamount(amount)
//   const { WithdrawMode } = values;
//   if( WithdrawMode === 'FXSTToken' && amount > 0){
//     setshowmsg(true)
//     //console.log("Withdraw Amount blurred with value:", amount, WithdrawMode, Math.floor(amount * (1/3)));
//     setmsgText(`$${amount} = ${Math.floor(amount * (1/tokenRate))} FXST [1 FXST=$${tokenRate}]`)
//   } else if(amount == 0){
//     setshowmsg(false)
//   }
// } 

// const HandlewidthDrawMode = ( event: React.ChangeEvent<HTMLSelectElement>, setFieldValue: (field: string, value: any) => void)=>{
//   const selectedValue = event.target.value;
//   if(selectedValue !== 'FXSTToken'){
//     setshowmsg(false)
//   }else if(amount !== 0){
//     // console.log(amount);
//     setshowmsg(true)
//   }
//   setFieldValue('WithdrawMode', selectedValue);
// }



//   return (

//     <>
//       <Breadcrumbs mainTitle={RequestWithdraw} parent={WithdrawTitle} ChildName={RequestWithdraw}/>
//       <Container fluid>
//         {loading && <Loader />}
//         <Row>
//           <Col xl="4">

//             <Card className="rounded-4">
//               <CardBody>
//                 <div className="gap-3 pills-blogger">
//                   <Row>
//                     <Col xl="3">
//                       <div className="blog-wrapper">
//                         <i className="fas fa-wallet f-60"></i> 
//                       </div>
//                     </Col>
//                     <Col xl="9">
//                       <div className="blog-content">
//                         <H4>Wallet Balance</H4>
//                         <hr />
//                         <div className="f-26">${walletBalance}</div>
//                       </div>

//                     </Col>

//                   </Row>
//                 </div>
//               </CardBody>
//             </Card>
//             <Col xl="12" style={{ display: 'flex' }}>
//               <div><i className="fa fa-info-circle"></i></div>
//               <div style={{ paddingLeft: '10px' }}>
//                 <h4>Withdrawal Guidelines</h4>
//                 <p>Here’s what you need to know:</p>
//                 <ul>
//                   <li><strong>Minimum Withdrawal:</strong> $50</li>
//                   <li><strong>Transaction Fee:</strong> 5% applies to all wallet types.</li>
//                 </ul>

//               </div>
//             </Col>
//           </Col>
//           <Col xl="8">
//             <Card>
//               <CardBody>
//                 <div className="gap-3 pills-blogger">
//                   <Formik
//                     initialValues={WithdrawForminitialValues}
//                     validationSchema={WithdrawSchema}
//                     onSubmit={(values, { setSubmitting }) => {
//                       handleWithdrawal(values);
//                       setSubmitting(false);
//                     }}
//                   >
//                     {({ isSubmitting, setFieldValue, values }) => (
//                       <Form>
//                         <Row>

//                           <Col md="6">
//                             <FormGroup>
//                               <Label>My Wallet</Label>
//                               <Field as="select" name="WalletType" className="btn-square form-select"
//                                 value={values.WalletType}
//                                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleWalletChange(e, setFieldValue)} >
//                                 <option value=''>{'Select'}</option>
//                                 <option value="CommissionWallet">{'My Wallet'}</option>
//                                 <option value="MT5Wallet">{'FxStock Wallet'}</option>
//                                 <option value="ROIWallet">{'Trading Profit Wallet'}</option>
//                               </Field>
//                               <ErrorMessage name="WalletType" component="div" className="text-danger" />
//                             </FormGroup>
//                           </Col>
//                           <Col md="6">
//                             <FormGroup>
//                               <Label>Withdraw Mode</Label>
//                               <Field as="select" name="WithdrawMode" className="btn-square form-select"
//                                 value={values.WithdrawMode}
//                                onChange={(e:React.ChangeEvent<HTMLSelectElement>) => HandlewidthDrawMode(e, setFieldValue)}
//                               >
//                                 <option value="">{'Select'}</option>
//                                 <option value="BankAccount">{'Bank Account(INR)'}</option>
//                                 <option value="BankAccountAED">{'Bank Account(AED)'}</option>
//                                 <option value="CreditCard">{'Credit Card'}</option>
//                                 <option value="USDTAddress">{'USDT Address'}</option>
//                                 <option value="FXSTToken">{'FXST Token'}</option>
//                               </Field>
//                               <ErrorMessage name="WithdrawMode" component="div" className="text-danger" />
//                             </FormGroup>
//                           </Col>
//                           <Col md="6">
//                             <FormGroup>
//                               <Label>Withdraw Amount</Label>
//                               <Field type="number" 
//                               name="WithdrawAmount" 
//                               placeholder="Enter Withdraw Amount"
//                                className="form-control" 
//                                onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
//                                 // Your custom blur logic here
//                                 handleWithdrawAmountBlur(e, values);
//                               }}
//                                />
//                                {showmsg ? <P>{msgText} </P> : undefined}
//                               <ErrorMessage name="WithdrawAmount" component="div" className="text-danger" />
//                             </FormGroup>
//                           </Col>
//                           <Col md="6" >
//                             <FormGroup style={{ position: 'relative' }}>
//                               <Label>One Time Password</Label>
//                               <Field type="text" name="OTP" placeholder="One Time Password" className="form-control" />
//                               <ErrorMessage name="OTP" component="div" className="text-danger" />
//                               <Btn color="info"
//                                 onClick={() => {
//                                   handleSendOTP('WithdrawForm')
//                                 }}
//                                 disabled={disablebtn}
//                                 style={{ position: 'absolute', right: '0px', top: '33px', backgroundColor: '#d0b163', borderColor: '#d0b163', color: '#000' }}>
//                                 {isOtpSent && OTPtimer === "WithdrawForm" ? FormatTime(otpTimer) : 'Send OTP'}
//                               </Btn>
//                             </FormGroup>
//                           </Col>
//                           <Col md="12">
//                             <Btn color="primary" disabled={isSubmitting}>Submit</Btn>
//                           </Col>

//                         </Row>
//                       </Form>
//                     )}
//                   </Formik>
//                 </div>
//               </CardBody>
//             </Card>
//           </Col>

//         </Row>
//         <Col xl="12 mt-4" hidden>
//           <Row>
//             <Col md="4">
//               <FormGroup>
//                 <Label>From Date</Label>
//                 <Input type="date" placeholder="From Date" />
//               </FormGroup>
//             </Col>
//             <Col md="4">
//               <FormGroup>
//                 <Label>To Date</Label>
//                 <Input type="date" placeholder="From Date" />
//               </FormGroup>
//             </Col>


//             <Col md="4">
//               <Btn color="info mt-4 height45" type="submit">Search</Btn>
//             </Col>
//           </Row>
//           <HistoryTable />
//         </Col>
//       </Container>
//     </>
//   );
// };

// export default WalletTransferFxstPayPageContainer;
