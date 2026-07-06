import { Card, CardBody, Col, Container, Row,FormGroup,Label,Input,  } from "reactstrap";
import { Formik, Field, Form, FieldProps, ErrorMessage } from "formik";
import { Btn} from "../../../AbstractElements";
import { RewardTitle, BonanzaPage } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import SearchTable from "../../../CommonElements/SearchTable/SearchTable";
import { Bonanza_Report } from '../../../Data/TableData/TableData';
import {useDataTableService} from '../../../Service/DataTable/DataTableService'
import { useEffect, useMemo, useState } from "react";
import { decryptData} from "../../../utils/helper/Crypto";

interface DateOption {
  SearchDateVal: string;
  SearchDateView: string;
}

const BonanzaPageContainer = () => {
  const [SeaarchData_date, setSeaarchData_date] =useState<any>(null)
  const {loading, FetchDataTable} = useDataTableService();
  const [DateOptions, setDateOptions] = useState<DateOption[]>([]);
  const [FormValue, setFormValue] = useState<any>(null)
  const [MemberID, setMemebrID] = useState(decryptData(localStorage.getItem('clientId') as string))
  const [API_Payload, setAPIPayload] =useState({})

  const initialValues ={
    Date : ''
  }
  
   useEffect(()=>{
    SettingValues();
   },[])
  
  

  
   const SettingValues =  () => {
    setAPIPayload({
      procName: 'FetchRewardProgramStatus',
      Para:JSON.stringify({ClientId:MemberID})
    })
   };


  return (
    <>
      <Breadcrumbs mainTitle={BonanzaPage} parent={RewardTitle} ChildName={BonanzaPage}/>
      <Container fluid>
        <Row>
          <Col xl="12">
          <div className="alert alert-info p-2 mb-3" role="alert">
              <i className="bi bi-info-circle-fill me-1"></i>
              Reward status will be updated every midnight.
            </div>
            <div style={{ overflowX: 'auto' }}>
            <SearchTable
              ColumnData={Bonanza_Report}
              SeaarchData_date={SeaarchData_date}
              apiPayload={API_Payload}
            />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default BonanzaPageContainer;
