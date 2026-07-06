import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Container, Row, FormGroup, Input, Label } from "reactstrap";
import { P, H4, Btn, H5 } from "../../../AbstractElements";
import { WalletTransfer, WalletTransferFxstock } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import HistoryTable from "../../../CommonElements/SearchTable/SearchTable"
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useSweetAlert } from '../../../Context/SweetAlertContext'
import Loader from '../../../CommonElements/Loader/Loader'
import { decryptData } from "../../../utils/helper/Crypto";
import { useTransferFxstockService } from '../../../Service/TransferToFxStockWallet/TransferToFxStockWallet'
import { TransferToFxStockWallet, TransferToFxStockWalletInitialValues } from "../../../Type/Forms/TransferToFxStockWallet/TransferToFxStockWallet";
const FxstockWalletPageContainer = () => {
  useEffect(() => {
    GetWalletBalance();

  }, []);
  const { showAlert, ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert();
  const [walletBalance, setwalletBalance] = useState<number>(0);
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string));
  const { getWalletBalance, doTransfer, loading } = useTransferFxstockService();
  // Validation schema
  const TransferSchema = Yup.object().shape({
    TransferAmount: Yup.number()
      .min(1, 'Minimum Transfer amount is $1')
      .required('Enter Transfer Amount')
  });
  const GetWalletBalance = async () => {
    const param = {
      MemberId: ClientID,
      ActionMode: "Get"
    }
    const obj = {
      procName: 'GetMemberWalletAmount',
      Para: JSON.stringify(param),
    };
    const res = await getWalletBalance(obj);
    setwalletBalance(res[0].ProductWallet);
  }
  const handleTransfer = async (values: TransferToFxStockWallet) => {
    const confirmed = await ShowConfirmAlert("Transfer", "Are you sure want to Transfer");
    if (confirmed) {
      if (confirmed) {
        // Proceed with the action
        const param = {
          ClientId: ClientID,
          Amount: values.TransferAmount,
          ActionMode: "Deposit"
        }
        const obj = {
          procName: 'DepositToMT5Wallet',
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
  }
  return (
    <>
      <Breadcrumbs mainTitle={WalletTransferFxstock} parent={WalletTransfer} ChildName={WalletTransferFxstock}/>
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
                        <H4>Fund Wallet Balance</H4>
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
                    initialValues={TransferToFxStockWalletInitialValues}
                    validationSchema={TransferSchema}
                    onSubmit={(values, { setSubmitting }) => {
                      handleTransfer(values);
                      setSubmitting(false);
                    }}
                  >
                    {({ isSubmitting, setFieldValue, values }) => (
                      <Form>
                        <Row>


                          <Col md="8">
                            <FormGroup>
                              <Label>Transfer Amount</Label>
                              <Field type="number" name="TransferAmount" placeholder="Enter Transfer Amount" className="form-control" />
                              <ErrorMessage name="TransferAmount" component="div" className="text-danger" />

                            </FormGroup>
                          </Col>

                          <Col md="4">
                            <Btn color="primary mt-4 height40" disabled={isSubmitting}>Submit</Btn>
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

export default FxstockWalletPageContainer;
