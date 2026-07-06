import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Row, FormGroup, Input, Label } from "reactstrap";
import { P, H4, Btn, H5 } from "../../../AbstractElements";
import { WalletTransfer, WalletTransferDeposit } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import HistoryTable from "../../../CommonElements/SearchTable/SearchTable"
import { useSweetAlert } from '../../../Context/SweetAlertContext'
import Loader from '../../../CommonElements/Loader/Loader'
import { decryptData } from "../../../utils/helper/Crypto";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useTransferFundService } from '../../../Service/TransferFundToDepositWallet/TransferFundToDepositWallet'
import { TransferToDepositFormPropsType, TransferToDepositForminitialValues } from "../../../Type/Forms/TransferFundToDepositWallet/TransferFundToDepositWallet";
const USDTBEP20PageContainer = () => {
  useEffect(() => {
    GetWalletBalance("TradingWallet")
  }, []);
  const { getWalletBalance, doTransfer, loading } = useTransferFundService();
  const [walletBalance, setwalletBalance] = useState<number>(0);
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string))
  const { showAlert, ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert();
  // Validation schema
  const TransferSchema = Yup.object().shape({
    WalletType: Yup.string().required("Select Wallet Type"),
    TransferAmount: Yup.number()
      .min(50, 'Minimum Transfer amount is $50')
      .required('Enter Transfer Amount')
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
  const GetWalletBalance = async (walletType: string) => {
    if (walletType) {
      const param = {
        ClientId: ClientID,
        WalletType: walletType,
        ActionMode: "GetWalletAmount"
      }
      const obj = {
        procName: 'GetMemberWallet',
        Para: JSON.stringify(param),
      };
      const res = await getWalletBalance(obj);
      setwalletBalance(res[0].WalletAmount);
    } else {
      setwalletBalance(0);
    }
  }
  const handleTransfer = async (values: TransferToDepositFormPropsType) => {
    const confirmed = await ShowConfirmAlert("Transfer", "Are you sure want to transfer");
    if (confirmed) {
      // Proceed with the action
      const param = {
        ClientId: ClientID,
        FromWallet: values.WalletType,
        Amount: values.TransferAmount,
        ActionMode: "Deposit"
      }
      const obj = {
        procName: 'TransferTradProfitToDepositWallet',
        Para: JSON.stringify(param),
      };
      const res = await doTransfer(obj);
      if (res[0].StatusCode == "1") {
        ShowSuccessAlert(res[0].Msg);
      } else {
        showAlert(res[0].Msg);
      }
    } else {
      console.log('do nothing.');
    }

  };
  return (
    <>
      <Breadcrumbs mainTitle={WalletTransferDeposit} parent={WalletTransfer} ChildName={WalletTransferDeposit}/>
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
                To complete your deposit, check Wallet Balance, pay the required amount & other details to finalize the process.
              </div>
            </Col>
          </Col>
          <Col xl="8">
            <Card>
              <CardBody>
                <div className="gap-3 pills-blogger">
                  <Formik
                    initialValues={TransferToDepositForminitialValues}
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
                                <option value="TradingWallet">{'Trade Profit Wallet'}</option>
                                <option value="Wallet">{'My-Wallet'}</option>
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

export default USDTBEP20PageContainer;
