import React from 'react'
import {   Col, Container, Row, FormGroup, Input,  Label } from "reactstrap";
import { TeamOverViewTitle,  BusinessReport} from "../../utils/Constant";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { BusinessReportList } from '../../Data/TableData/TableData';
import { P, Btn } from "../../AbstractElements";
import HistoryTable from "../../CommonElements/SearchTable/SearchTable"
import { Formik, Field, Form, FieldProps, ErrorMessage } from "formik";
import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { decryptData} from "../../utils/helper/Crypto";
import {format} from 'date-fns'
interface FormValues {
    FromDate: Date | null;
    ToDate: Date | null;
  }
const BusinessReports = () => {

    const [SeaarchData_date, setSeaarchData_date] =useState<any>(null)
    const [memberID, setmemberID] =useState(decryptData(localStorage.getItem("clientId") as string))
      const [Formvalue, setFormValue] = useState<any>(null)
      const [API_Payload, setAPIPayload] =useState({})
    
     const twoDaysAgo = new Date();
     twoDaysAgo.setDate(twoDaysAgo.getDate() - 30);
    
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
        procName:"GetBusiness",
        Para:JSON.stringify({FromDate:formattedFromDate, ToDate:formattedToDate, MemberId:memberID,})
      })

     },[])
    
    
     const handleSubmit = (values: FormValues) => {
      // console.log(values);
      //  console.log('From Date:', values.fromDate);
      //  console.log('To Date:', values.toDate);
       const formattedFromDate = format(values.FromDate!, 'dd-MMMM-yyyy');
        const formattedToDate = format(values.ToDate!, 'dd-MMMM-yyyy');
        // console.log(formattedFromDate, formattedToDate);
        setSeaarchData_date({FormDate:formattedFromDate, ToDate:formattedToDate})
        setAPIPayload({
          procName:"GetBusiness",
          Para:JSON.stringify({FromDate:formattedFromDate, ToDate:formattedToDate, MemberId:memberID,})
        })
     };
    

  return (
    <Container>
        <Breadcrumbs mainTitle={BusinessReport} parent={TeamOverViewTitle} ChildName={BusinessReport}/>
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
          <HistoryTable  ColumnData={BusinessReportList}   apiPayload={API_Payload}/>
    </Container>
  )
}

export default BusinessReports