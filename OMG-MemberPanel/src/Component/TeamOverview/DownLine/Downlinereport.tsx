import React, { useEffect, useState } from 'react'
import {   Col, Container, Row, FormGroup, Input,  Label } from "reactstrap";
import { P, Btn } from "../../../AbstractElements";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { TeamOverViewTitle, DownlineTitle } from "../../../utils/Constant";
import DownlineTable from "../../../CommonElements/SearchTable/DownlineTable"
import { Formik, Field, Form, FieldProps, ErrorMessage } from "formik";
import { decryptData} from "../../../utils/helper/Crypto";
import {useCommonService} from '../../../Service/CommonService/Commonservice'
const Downlinereport = () => {
    const [MemmebID, setMemberID] = useState(decryptData(localStorage.getItem('clientId') as string))
    const [API_Payload, setAPIPayload] =useState({})
    useEffect(()=>{
        setAPIPayload({
            procName:"SponsorPrintView",
            Para:JSON.stringify({MemberId:MemmebID})
          })
    },[])
  return (
    <>
        <Breadcrumbs mainTitle={DownlineTitle} parent={TeamOverViewTitle} ChildName={DownlineTitle}/>
        <Container fluid>
          <Row>
          <Col xl="12">
          <Row>
          <Col md="4">
        
          </Col>
          <Col md="4">
          
          </Col>
          </Row>
          </Col>
          </Row>
          <DownlineTable  PageCate={'TeamDownline'} apiPayload={API_Payload}/>
      </Container>

    </>
  )
}

export default Downlinereport