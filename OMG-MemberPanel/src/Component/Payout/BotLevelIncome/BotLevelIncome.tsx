import {   Col, Container, Row, FormGroup, Input,  Label } from "reactstrap";
import { P, Btn } from "../../../AbstractElements";
import { PayoutTitle, BotLevelIncome } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import HistoryTable from "../../../CommonElements/SearchTable/SearchTable"
import { Formik, Field, Form, FieldProps, ErrorMessage } from "formik";
import { serverColumn } from '../../../Data/TableData/TableData';
import DatePicker from "react-datepicker";
import {SearchingTableData, SearchTableData_PropsType} from '../../../Type/Forms/FormsType'
import { SearchFormValid_Schema } from '../../../Forms/FormsVailidationSchema';
import { useState, useEffect, useMemo } from "react";
import { decryptData} from "../../../utils/helper/Crypto";
import moment  from "moment";
interface FormValues {
  FromDate: Date | null;
  ToDate: Date | null;
}
const BotLevelIncomePageContainer = () => {
  const [memberID, setmemberID] = useState(decryptData(localStorage.getItem('clientId') as string))
  const [API_Payload, setAPIPayload] =useState<any>({})
  const [SeaarchData_date, setSeaarchData_date] =useState<any>(null)
//   const [Formvalue, setFormValue] = useState({})

 const twoDaysAgo = new Date();
 twoDaysAgo.setDate(twoDaysAgo.getDate() - 30);

 const initialValues: FormValues = { 
  FromDate:  twoDaysAgo,     // Default toDate 
  ToDate: new Date(), // Default fromDate 
 };

 useMemo(()=>{
   // Default fromDate 
  const formattedFromDate = moment(initialValues?.FromDate).format('DD-MMMM-YYYY');
    const formattedToDate = moment(initialValues?.ToDate).format('DD-MMMM-YYYY');
  setSeaarchData_date({FormDate:formattedFromDate, ToDate:formattedToDate})
  setAPIPayload({
    procName:"LevelIncome",
    Para:JSON.stringify({ClientId:memberID,FromDate:formattedFromDate, ToDate:formattedToDate, ActionMode:"BotLevelIncomeReportMemberPanel"})
  })
 },[])


 const handleSubmit = (values: FormValues) => {
   const formattedFromDate = moment(values.FromDate).format('DD-MMMM-YYYY');
    const formattedToDate = moment(values.ToDate).format('DD-MMMM-YYYY');
    console.log(formattedFromDate, formattedToDate);
    setSeaarchData_date({FormDate:formattedFromDate, ToDate:formattedToDate})
    setAPIPayload({
      procName:"LevelIncome",
      Para:JSON.stringify({ClientId:memberID,FromDate:formattedFromDate, ToDate:formattedToDate, ActionMode:"BotLevelIncomeReportMemberPanel"})
    })
 };


  return (
    <>
      <Breadcrumbs mainTitle={BotLevelIncome} parent={PayoutTitle} ChildName={BotLevelIncome}/>
      <Container fluid>
      <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {({ setFieldValue, values, errors, touched }) => (
        <Form>
          <Row>
          <Col xl="12">
          <Row>
          <Col md="4">
          <FormGroup>
          
            <Label>From Date:</Label>
            <Field name="FromDate">
              {({ field }:FieldProps) => (
                <DatePicker
                className={`form-control`}
                  selected={values.FromDate}
                  onChange={(date) => setFieldValue('FromDate', date)}
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
              {({field}: FieldProps) => (
                <DatePicker
                  selected={values.ToDate}
                  className={`form-control`}
                  onChange={(date) => setFieldValue('ToDate', date)}
                  dateFormat="dd-MMMM-yyyy" // Yahan format set kiya gaya
                  placeholderText="dd-MMMM-yyyy" // Placeholder
                />
              )}
            </Field>
            <ErrorMessage name="ToDate" component="div" />
          </FormGroup>
          </Col>
          <Col md="4">
          <button className="form-btn rounded py-2 mt33" type="submit">Search</button>
            </Col>
          </Row>
          </Col>
          </Row>
        </Form>
      )}
    </Formik>
          <HistoryTable ColumnData={serverColumn} SeaarchData_date={SeaarchData_date} apiPayload={API_Payload}/>
      </Container>
    </>
  );
};

export default BotLevelIncomePageContainer;
