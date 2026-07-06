import {   Col, Container, Row, FormGroup, Input, Label } from "reactstrap";
import { P, Btn } from "../../../AbstractElements";
import { PayoutTitle,RoiIncome} from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import HistoryTable from "../../../CommonElements/SearchTable/SearchTable"
import { monthly_ProfitIncome } from '../../../Data/TableData/TableData';
import { Formik, Field, Form, FieldProps, ErrorMessage } from "formik";
import DatePicker from "react-datepicker";
import {SearchingTableData, SearchTableData_PropsType} from '../../../Type/Forms/FormsType'
import { SearchFormValid_Schema } from '../../../Forms/FormsVailidationSchema';
import {ChangeDateintoLongDate, formatDates} from '../../../utils/helper/opreaton'
import { useEffect, useMemo, useState } from "react";
import { decryptData} from "../../../utils/helper/Crypto";
import {format} from 'date-fns'
// interface MyFormValues {
//   FromDate: string;
//   ToDate: string;
// }

interface FormValues {
  FromDate: Date | null;
  ToDate: Date | null;
}



const MonthlyProfitIncome = () => {
  const [memberID, setmemberID] = useState(decryptData(localStorage.getItem('clientId') as string))
  const [API_Payload, setAPIPayload] =useState<any>({})
  const [SeaarchData_date, setSeaarchData_date] =useState<any>(null)
//   const [Formvalue, setFormValue] = useState({})

 const OnemonthAgo = new Date();
 OnemonthAgo.setDate(OnemonthAgo.getDate() - 30);

 const initialValues: FormValues = { 
  FromDate:  OnemonthAgo,     // setting one month ago date
  ToDate: new Date(), // Default fromDate 
 };

 useMemo(()=>{
   // Default fromDate 
  const formattedFromDate = format(initialValues?.FromDate!, 'dd-MMMM-yyyy');
    const formattedToDate = format(initialValues?.ToDate!, 'dd-MMMM-yyyy');
  setSeaarchData_date({FormDate:formattedFromDate, ToDate:formattedToDate})
  setAPIPayload({
    procName:"GetRoiIncome",
    Para:JSON.stringify({MemberId:memberID,FromDate:formattedFromDate, ToDate:formattedToDate, ActionMode:"GetAllRecordByMember"})
  })
 },[])


 const handleSubmit = (values: FormValues) => {
   const formattedFromDate = format(values.FromDate!, 'dd-MMMM-yyyy');
    const formattedToDate = format(values.ToDate!, 'dd-MMMM-yyyy');
    // console.log(formattedFromDate, formattedToDate);
    setSeaarchData_date({FormDate:formattedFromDate, ToDate:formattedToDate})
    setAPIPayload({
      procName:"GetRoiIncome",
      Para:JSON.stringify({MemberId:memberID,FromDate:formattedFromDate, ToDate:formattedToDate, ActionMode:"GetAllRecordByMember"})
    })
 };




  return (
    <>
      <Breadcrumbs mainTitle={RoiIncome} parent={PayoutTitle} ChildName={RoiIncome}/>
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
                  <button className="form-btn rounded py-2  mt33" type="submit">Search</button>
                    </Col>
          </Row>
          </Col>
          </Row>
        </Form>
      )}
    </Formik>
    <HistoryTable ColumnData={monthly_ProfitIncome} SeaarchData_date={SeaarchData_date} PageCate={'Payout'}  apiPayload={API_Payload}/>    
      </Container>
    </>
  );
};

export default MonthlyProfitIncome;
