import {   Col, Container, Row, FormGroup, Input, Label } from "reactstrap";
import { P, Btn } from "../../../AbstractElements";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import HistoryTable from "../../../CommonElements/SearchTable/SearchTable"
import { profitSharingReport } from '../../../Data/TableData/TableData';
import { Formik, Field, Form, FieldProps, ErrorMessage } from "formik";
import DatePicker from "react-datepicker";
import { PayoutTitle, ProfitSharingIncome } from "../../../utils/Constant";
import {SearchingTableData, SearchTableData_PropsType} from '../../../Type/Forms/FormsType'
import { SearchFormValid_Schema } from '../../../Forms/FormsVailidationSchema';
import {ChangeDateintoLongDate, formatDates} from '../../../utils/helper/opreaton'
import { useEffect, useMemo, useState } from "react";
import { decryptData} from "../../../utils/helper/Crypto";
import {format} from 'date-fns'

interface FormValues {
  FromDate: Date | null;
  ToDate: Date | null;
}



const ProfitSharingReport = () => {
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem('clientId') as string))
  const [API_Payload, setAPIPayload] =useState<any>({})
  const [SeaarchData_date, setSeaarchData_date] =useState<any>(null)
//   const [Formvalue, setFormValue] = useState({})

 const twoDaysAgo = new Date();
 twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);

 const initialValues: FormValues = { 
  FromDate:  twoDaysAgo,     // Default toDate ko 2 din pehle ki tareekh se initialize kiya gaya
  ToDate: new Date(), // Default fromDate 
 };

 useMemo(()=>{
   // Default fromDate 
  const formattedFromDate = format(initialValues?.FromDate!, 'dd-MMMM-yyyy');
    const formattedToDate = format(initialValues?.ToDate!, 'dd-MMMM-yyyy');
  setSeaarchData_date({FormDate:formattedFromDate, ToDate:formattedToDate})
  setAPIPayload({
    procName:"LevelIncome",
    Para:JSON.stringify({ClientId:ClientID, FromDate:formattedFromDate, ToDate:formattedToDate, ActionMode:"ProfitSharingIncomeReportMemberPanel"})
  })
 },[])


 const handleSubmit = (values: FormValues) => {
   const formattedFromDate = format(values.FromDate!, 'dd-MMMM-yyyy');
    const formattedToDate = format(values.ToDate!, 'dd-MMMM-yyyy');
    console.log(formattedFromDate, formattedToDate);
    setAPIPayload({
      procName:"LevelIncome",
      Para:JSON.stringify({ClientId:ClientID, FromDate:formattedFromDate, ToDate:formattedToDate, ActionMode:"ProfitSharingIncomeReportMemberPanel"})
    })
 };




  return (
    <>
      <Breadcrumbs mainTitle={ProfitSharingIncome} parent={PayoutTitle} ChildName={ProfitSharingIncome}/>
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
    <HistoryTable ColumnData={profitSharingReport} SeaarchData_date={SeaarchData_date}   apiPayload={API_Payload}/>
      </Container>
    </>
  );
};

export default ProfitSharingReport;
