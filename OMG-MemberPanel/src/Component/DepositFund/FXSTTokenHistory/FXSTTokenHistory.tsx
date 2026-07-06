import { Col, Container, Row, FormGroup, Input, Label } from "reactstrap";
import { Formik, Field, Form, FieldProps, ErrorMessage } from "formik";
import { P, Btn } from "../../../AbstractElements";
import { DepositFundTitle, FXSTTokenHistory } from "../../../utils/Constant";
import { FXSTTokenHistoryColumn } from "../../../Data/TableData/TableData";
import SearchTable from "../../../CommonElements/SearchTable/SearchTable";
import DatePicker from "react-datepicker";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { decryptData} from "../../../utils/helper/Crypto";

import HistoryTable from "../../../CommonElements/SearchTable/SearchTable";

interface FormValues {
  FromDate: Date | null;
  ToDate: Date | null;
}
const FXSTTokenHistoryPageContainer = () => {
  const [SeaarchData_date, setSeaarchData_date] = useState<any>(null);
  const [memberID, setmemberID] = useState(decryptData(localStorage.getItem('clientId') as string))
  const [API_Payload, setAPIPayload] =useState<any>({})
  //====== Getting first Previous month Date and Last Previous month Date
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 10);

  const initialValues: FormValues = {
    FromDate: twoDaysAgo,
    ToDate: new Date(),
  };

  useMemo(() => {
    // Default fromDate
    const formattedFromDate = format(initialValues?.FromDate!, "dd-MMMM-yyyy");
    const formattedToDate = format(initialValues?.ToDate!, "dd-MMMM-yyyy");
    setSeaarchData_date({
      FormDate: formattedFromDate,
      ToDate: formattedToDate,
    });
    setAPIPayload({
      procName:"RequestFund",
      Para:JSON.stringify({MemberId:memberID,FromDate:formattedFromDate, ToDate:formattedToDate, ActionMode:"GetTokenDepositHistory"})
    })
  }, []);

  const handleSubmit = (values: FormValues) => {
    const formattedFromDate = format(values.FromDate!, "dd-MMMM-yyyy");
    const formattedToDate = format(values.ToDate!, "dd-MMMM-yyyy");
    // setSeaarchData_date({
    //   FormDate: formattedFromDate,
    //   ToDate: formattedToDate,
    // });
    setAPIPayload({
      procName:"RequestFund",
      Para:JSON.stringify({MemberId:memberID,FromDate:formattedFromDate, ToDate:formattedToDate, ActionMode:"GetTokenDepositHistory"})
    })
  };

  return (
    <>
      <Breadcrumbs mainTitle={FXSTTokenHistory} parent={DepositFundTitle} ChildName={FXSTTokenHistory} />
      <Container fluid>
        <Col xl="12">
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
                      <Col md="4" className="d-flex align-items-center justify-content-start pb-2 pb-md-0">
                        <Btn color="primary mt-0 mt-md-3" type="submit">
                          Search
                        </Btn>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
          <SearchTable
            ColumnData={FXSTTokenHistoryColumn}
            SeaarchData_date={SeaarchData_date}
            apiPayload={API_Payload}
          />
        </Col>
      </Container>
    </>
  );
};

export default FXSTTokenHistoryPageContainer;
