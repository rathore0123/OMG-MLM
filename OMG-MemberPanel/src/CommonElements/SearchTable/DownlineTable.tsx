
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardBody, Col, Input, Label, Button, Row ,} from 'reactstrap';
import { P, Btn } from "../../AbstractElements";
import {useDataTableService} from '../../Service/DataTable/DataTableService'
import { decryptData} from "../../utils/helper/Crypto";
import DataTable from "react-data-table-component";
import { TableColumn, TableRow } from "react-data-table-component";
import {  DownlineReportInterface } from "../../Type/TableData/TableData";
import {formatDates, ChangeDateintoLongDate, subtractOneMonth} from '../../utils/helper/opreaton'
interface PayoutObject {
  FromDate?:string,
  ToDate?:string,
  ClientId?:string,
  ActionMode?:string,
  MemberId?:string,
  Level?:number,
  UserName?:string,
}

const DownlineTable = (props:any) => {
    const {apiObject, SeaarchData_date, PageCate, apiPayload} = props
    const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string))
    const [Columns, setColumns] = useState<any>([])
    const [Rows, setRows] = useState<any>([])
    const [UserData, setUserData] =useState<any>({})
    const {loading, GetBulkDataforDownline} = useDataTableService();
    const [MemeberID, setMemberId] =useState(null)

    const GetSponsorData = (data:any)=>{
    const obj ={
        procName:"SponsorPrintView",
        Para:JSON.stringify({MemberId:data})
    }
    fetchDownlineData(obj)
    }

    const DownlineReport : TableColumn <DownlineReportInterface> []=[
        {
          name: "SNO",
          selector: (row:any) => row['SNO'],
          sortable: true,
          center: false,
          width:'100px'
        },
        {
          name: "ID",
          selector: (row:any) => row['ID'],
          sortable: true,
          center: false,
          width:'150px'
        },
        {
          name: "NAME",
          selector: (row:any) => row['NAME'],
          sortable: true,
          center: false,
          width:'200px',
          cell: row => (
            <div style={{ 
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              wordWrap: 'break-word',
            }}>
              {row.NAME}
            </div>
          ),
        },
        {
          name: "REGISTRATION DATE",
          selector: (row:any) => row['REGISTRATION DATE'],
          sortable: true,
          center: false,
        },
        {
          name: "ACTIVATION DATE",
          selector: (row:any) => row['ACTIVATION DATE'],
          sortable: true,
          center: false,
          cell: row => (
            <div
              dangerouslySetInnerHTML={{ __html: row['ACTIVATION DATE'] }}
            />
          )
        },
        {
          name: "JoiningAmount",
          selector: (row:any) => row['JoiningAmount'],
          sortable: true,
          center: false,     
        },
    
        {
          name: "ACTION",
          selector: (row:any) => row['ACTION'],
          sortable: true,
          center: false,
          cell: (row) => {
            // Extract the ID from the ACTION string using regex
            const match = row['ACTION'].match(/GetSponsorData\((\d+)\)/);
            const sponsorId = match ? match[1] : null;
        
            return (
              <button
                onClick={() => sponsorId && GetSponsorData(sponsorId)}
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '5px 10px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Downline Team
              </button>
            );
          },
        },
    
      ]

    const fetchDownlineData = async (Payload:any) => {
      setColumns(DownlineReport)
          try {
            const res = await GetBulkDataforDownline(Payload) 
            // console.log(res?.Table1);
            const TableData = res?.Table1
            setUserData({name:res?.Table[0]?.Name, UserName:res?.Table[0]?.UserName})
            setRows(TableData)
          } catch (error) {
            console.error('Error fetching data:', error);
            
          }
        };

  const setData = useMemo(()=>{
    fetchDownlineData(apiPayload)
  },[props])

   

    return (
      <>
        {loading ? <Col sm='12 h-100 '>
          <Card className='h-100 d-flex  '>
          <CardBody className='text-center'>
                    <div className="spinner-border text-center  text-secondary ms-2" role="status"></div>
            </CardBody> 
            </Card>
        </Col>:  
        <Col sm="12">
        <Card>
          <CardBody>
            <div className="table-responsive data-table">
                <Row className='py-2'>
                    <Col xl-4>
                    <Col>Name</Col>
                    {UserData?.name}
                    </Col>
                    <Col xl-4>
                    <Col>UserName</Col>
                    {UserData?.UserName}
                    </Col>
                    <Col xl-4>
                        <button className='form-btn rounded py-2' onClick={()=> GetSponsorData(ClientID)}>Reload</button>
                    </Col>
                </Row>
            {/* <Button color="info" style={{position:'absolute',display:'none', zIndex:'999', top:'25px',left:'25px'}} onClick={printTable}>Print</Button> */}
              <DataTable 
              theme="dark"
                data={Rows}
                columns={Columns} 
                highlightOnHover 
                pagination 
               
                // subHeaderComponent={subHeaderComponentMemo}
                customStyles={{
                  table: {
                    style: {
                      backgroundColor: '#333', // Dark background color for the table
                    }
                  },
                  headCells: {
                    style: {
                      backgroundColor: '#222', // Darker background for table header
                      color: '#fff', // White text color
                    }
                  },
                  rows: {
                    style: {
                      backgroundColor: '#333', // Dark background for table rows
                      color: '#fff', // White text color
                    }
                  },
                  pagination: {
                    style: {
                      backgroundColor: '#222', // Dark background for pagination
                    }
                  }
                }}
              />
            </div>
          </CardBody>
        </Card>
      </Col>}
      </>
              )
}


export default DownlineTable