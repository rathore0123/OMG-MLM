import React from "react";
import { Container, Row, Col, FormGroup, Input, Label } from "reactstrap";
import { useState, useEffect } from "react";
import { Btn } from "../../../AbstractElements";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { FXStockWallet, FXDepositWallet, FXstPayWallet, FXstPayToCommissionWallet} from "../../../Data/TableData/TableData";
import { Wallet_PayReport, WalletTransfer} from "../../../utils/Constant";
import { decryptData } from "../../../utils/helper/Crypto";
import HistoryTable from "../../../CommonElements/SearchTable/SearchTable";
import { Formik, Field, Form, FieldProps, ErrorMessage, } from "formik";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
interface FormValues {
  FromDate: Date | null;
  ToDate: Date | null;
}
const WalletReport = () => {
  const [ClientID, setClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string)
  );
  const [API_Payload, setAPIPayload] = useState<any>({});
  const [SeaarchData_date, setSeaarchData_date] = useState<any>({});
  const [FxStockWallet, setFxStockWallet]= useState(true)
  const [DepositWallet, setDepositWallet]= useState(false)
  const [FxstPayWallet, setFxstPayWallet]= useState(false)
  const [FxstPayToCommission, setFxstPayToCommission] = useState(false)
  const [CallApi, setCallApi] = useState(false)
  const OnemonthAgo = new Date();
  OnemonthAgo.setDate(OnemonthAgo.getDate() - 30);

  let initialValues: FormValues = {
    FromDate: OnemonthAgo, // setting one month ago date
    ToDate: new Date(), // Default fromDate
  };

  useEffect(() => {
    // console.log(SeaarchData_date);
    const formattedFromDate = format(initialValues?.FromDate!, "dd-MMMM-yyyy");
    const formattedToDate = format(initialValues?.ToDate!, "dd-MMMM-yyyy");
    setAPIPayload({
      procName: DepositWallet ? 'TransferTradProfitToDepositWallet' :FxstPayWallet ? "TransferFundToFXSTPayWallet" :FxstPayToCommission ?  "TransferFromFXSTPayWalletToCommissionWallet" : "DepositToMT5Wallet",
      Para: JSON.stringify({
        ClientId: ClientID,
        FromDate: SeaarchData_date?.FormDate ? SeaarchData_date?.FormDate : formattedFromDate,
        ToDate: formattedToDate,
        ActionMode: "History",
      }),
    });
  }, [CallApi,FxStockWallet, DepositWallet, FxstPayWallet, FxstPayToCommission]);
  

  const handleSubmit = (values: FormValues) => {
    const formattedFromDate = format(values.FromDate!, "dd-MMMM-yyyy");
    const formattedToDate = format(values.ToDate!, "dd-MMMM-yyyy");
    // console.log(formattedFromDate, formattedToDate);
    setSeaarchData_date({
      FormDate: formattedFromDate,
      ToDate: formattedToDate,
    });

    setAPIPayload({
      procName: DepositWallet ? 'TransferTradProfitToDepositWallet' :FxstPayWallet ? "TransferFundToFXSTPayWallet" :FxstPayToCommission ?  "TransferFromFXSTPayWalletToCommissionWallet" :  "DepositToMT5Wallet",
      Para: JSON.stringify({
        ClientId: ClientID,
        FromDate: formattedFromDate,
        ToDate: formattedToDate,
        ActionMode: "History",
      }),
    });
  };

  const TabHandle = (value:String) =>{
    if(value === "FxstPayWallet"){
        setFxstPayWallet(true);
        setFxStockWallet(false);
        setDepositWallet(false);
      setFxstPayToCommission(false);
        setCallApi(!CallApi)
    }else if(value === "DepositWallet"){
        setFxstPayWallet(false);
        setFxStockWallet(false)
        setDepositWallet(true);
      setFxstPayToCommission(false);

        setCallApi(!CallApi)
    }else if(value === "FxStockWallet"){
      setDepositWallet(false)
      setFxstPayWallet(false);
      setFxStockWallet(true);
      setFxstPayToCommission(false)
        setCallApi(!CallApi)
    }else if(value === "FxstPayToCommission"){
      setDepositWallet(false);
      setFxstPayWallet(false);
      setFxStockWallet(false);
      setFxstPayToCommission(true)
        setCallApi(!CallApi)
    }
  }



  return (
    <>
      <Container className="page-body" fluid>
      <Breadcrumbs parent={WalletTransfer} mainTitle={Wallet_PayReport} ChildName={Wallet_PayReport}/>
        <Row>
          <Col md="12" className="pt-2">
          <Btn color="primary" className={FxStockWallet ? `${undefined} tab_button ` : 'disable-Btn tab_button '} onClick={()=> TabHandle('FxStockWallet')}>Fxstock Wallet </Btn>
            <Btn color="primary" className={DepositWallet ? `${undefined} ms-md-2 m-2 tab_button ` : 'disable-Btn m-1 ms-md-2 tab_button'} onClick={()=> TabHandle('DepositWallet')}> Deposit Wallet </Btn>
            <Btn color="primary" className={FxstPayWallet ? `${undefined}ms-md-2 m-2 tab_button `: 'disable-Btn m-1 ms-md-2 tab_button '} onClick={()=> TabHandle('FxstPayWallet')}>  FxstPay Wallet </Btn>
            <Btn color="primary" className={FxstPayToCommission ? `${undefined}  ms-md-2 m-2 tab_button `: 'disable-Btn m-2   tab_button '} onClick={()=> TabHandle('FxstPayToCommission')}>  FxstPay To Commission Wallet </Btn>
          </Col>
          <Col md="12" className="pt-3">
            <Formik initialValues={initialValues} onSubmit={handleSubmit}>
              {({ setFieldValue, values, errors, touched }) => (
                <Form>
                  <Row>
                    <Col xl="12">
                      <Row>
                        <Col md="4">
                          <FormGroup>
                            <Label>From Date:</Label>
                            <Field name="FromDate">
                              {({ field }: FieldProps) => (
                                <DatePicker
                                  className={`form-control`}
                                  selected={values.FromDate}
                                  onChange={(date) =>
                                    setFieldValue("FromDate", date)
                                  }
                                  dateFormat="dd-MMMM-yyyy" // Yahan format set kiya gaya
                                  placeholderText="dd-MMMM-yyyy" // Placeholder
                                />
                              )}
                            </Field>
                            <ErrorMessage name="FromDate" component="div" />
                          </FormGroup>
                        </Col>
                        <Col md="4">
                          <FormGroup>
                            <Label htmlFor="ToDate">To Date:</Label>
                            <Field name="ToDate" className="form-control">
                              {({ field }: FieldProps) => (
                                <DatePicker
                                  selected={values.ToDate}
                                  className={`form-control`}
                                  onChange={(date) =>
                                    setFieldValue("ToDate", date)
                                  }
                                  dateFormat="dd-MMMM-yyyy" // Yahan format set kiya gaya
                                  placeholderText="dd-MMMM-yyyy" // Placeholder
                                />
                              )}
                            </Field>
                            <ErrorMessage name="ToDate" component="div" />
                          </FormGroup>
                        </Col>
                        <Col md="4" className="d-flex justify-content-start align-items-center">
                          <Btn color="primary mt-0 mb-3 mb-md-0 mt-md-3" type="submit">
                            Search
                          </Btn>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              )}
            </Formik>
            <HistoryTable
              ColumnData={FxStockWallet ? FXStockWallet : DepositWallet? FXDepositWallet :FxstPayToCommission ?  FXstPayToCommissionWallet : FXstPayWallet }
              SeaarchData_date={SeaarchData_date}
              apiPayload={API_Payload}
            />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default WalletReport;
