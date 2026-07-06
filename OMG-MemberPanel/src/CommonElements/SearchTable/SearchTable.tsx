import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardBody, Col, Input, Label, Button, Row } from 'reactstrap';
import {Btn} from '../../AbstractElements'
import { SearchTableButton } from '../../utils/Constant';
import { cash_backLevel } from '../../../src/Data/TableData/TableData'
import { useDataTableService } from '../../Service/DataTable/DataTableService'
import { decryptData } from "../../utils/helper/Crypto";
import DataTable from "react-data-table-component";
import { formatDates, ChangeDateintoLongDate, subtractOneMonth } from '../../utils/helper/opreaton'
import { useAppDispatch, useAppSelector } from "../../ReduxToolkit/Hooks";
import { useSweetAlert } from '../../Context/SweetAlertContext'
import Datanotfound from '../../Component/PageNotFound/Datanotfound'
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { IoMdPrint } from "react-icons/io";
import * as XLSX from 'xlsx';
interface PayoutObject {
  FromDate?: string,
  ToDate?: string,
  ClientId?: string,
  ActionMode?: string,
  MemberId?: string,
  Level?: number,
  UserName?: string,
}

const ServerSideProcessing = (props: any) => {
  const { showAlert, ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert();
  const { apiObject, SeaarchData_date, PageCate, apiPayload } = props
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string))
  const [userNAME, setuserNAME] = useState(localStorage.getItem("UserName") as string)
  const [Columns, setColumns] = useState<any>([])
  const [Rows, setRows] = useState<any>([])
  const { loading, FetchDataTable, GetBulkDataforDownline } = useDataTableService();
  const { mix_layout } = useAppSelector((state) => state.themeCustomizer)
  const { refreshTable } = useAppSelector((state) => state.bookmarkHeader)
  const [filterText, setFilterText] = useState("");
  const [searchedData, setsearchedData] =useState<any>([])

  const fetchPayoutData = async () => {
    setColumns(props?.ColumnData)
    try {
      console.log(apiPayload);
      const res = await FetchDataTable(apiPayload)
      if (Array.isArray(res)) {
        setRows(res)
      } else {
        setRows([])
      }

    } catch (error) {
      console.error('Error fetching data:', error);

    }
  };

  const fetchTeamOverviewData = async (value: any) => {
    setColumns(props?.ColumnData)

    const obj = {
      procName: apiObject?.procName,
      Para: JSON.stringify(apiObject?.Para)
    }

    try {
      const res = await FetchDataTable(obj)
      if (Array.isArray(res)) {
        setRows(res)
      } else {
        setRows([])
      }

    } catch (error) {
      console.error('Error fetching data:', error);

    }
  };


  const setData = useMemo(() => {
    let SetFormDate = new Date()
    let TODATE = ChangeDateintoLongDate(SetFormDate)
    let FROMDATE = subtractOneMonth(SetFormDate)
    fetchPayoutData()
  }, [apiPayload, refreshTable])


useEffect(()=>{
  if(filterText){
    const lowerCaseTerm = filterText.toLowerCase(); 
   const result =  Rows.filter((obj:any) => {
      return Object.values(obj).some((value:any) =>
        value.toString().toLowerCase().includes(lowerCaseTerm)
      );
    });
    if(Array.isArray(result)){
      setsearchedData(result)
    }
  
  }else{
    setsearchedData(undefined)
  }

},[filterText])

  // const subHeaderComponentMemo = useCallback(() => {
  //   console.log('running');
  //   return (
  //     <div id="dataSource" className="dataTables_filter d-flex align-items-center">
  //       <Label className="me-1">{SearchTableButton}:</Label>
  //       <Input onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)} type="search" value={filterText} />
  //     </div>
  //   );
  // }, [filterText]);

// Function to strip HTML tags from each cell in the data
// const cleanDataForExport = (data: any[]) => {
//   return data.map(row => {
//     const cleanedRow: any = {};
//     for (let key in row) {
//       if (typeof row[key] === 'string') {
//         // Strip HTML tags if it's a string
//         const div = document.createElement('div');
//         div.innerHTML = row[key];
//         cleanedRow[key] = div.textContent || div.innerText || '';
//       } else {
//         // Keep value as-is if it's not a string
//          cleanedRow[key] = row[key];
//       }
//     }
//     return cleanedRow;
//   });
// }; 

const cleanDataForExport = (data: any[]) => {
  return data.map(row => {
    const cleanedRow: any = {};
    for (let key in row) {
      if (typeof row[key] === 'string') {
        const div = document.createElement('div');
        div.innerHTML = row[key];
        const inputElement = div.querySelector('input');
        if (inputElement) {
          // Get the value of the input field
          cleanedRow[key] = inputElement.value || '';
        } else {
          cleanedRow[key] = div.textContent || div.innerText || '';
        }
      } else {
        cleanedRow[key] = row[key];
      }
    }
    return cleanedRow;
  });
};



// Updated exportToExcel function
const exportToExcel = (data: any) => {
  if(data.length === 0){
    showAlert('Opps!', 'No data available at the moment.');
    return
  }
  
  // Clean data to remove HTML tags
  const cleanedData = cleanDataForExport(data);
  
  // Convert cleaned data to a worksheet
  const worksheet = XLSX.utils.json_to_sheet(cleanedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, 'TableData.xlsx');
};


// Export data to CSV and print
const exportAndPrintCSV = (data: any) => {
  if (data.length === 0) {
    showAlert('Oops!', 'No data available at the moment.');
    return;
  }

  // Clean data and convert to CSV format
  const cleanedData = cleanDataForExport(data);
  const csvData = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(cleanedData));

  // Convert CSV data to an HTML table and print
  printCSVData(csvData);
};

  // Function to convert CSV to HTML table and print
  const printCSVData = (csvData: string) => {
    // Parse CSV data into rows and columns
    const rows = csvData.split('\n').map(row => row.split(','));

    // Open a new window for printing
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            td { white-space: pre-wrap; }
            @media print {
              body { margin: 0; padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${rows[0].map(cell => `<th>${cell.trim()}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.slice(1).map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell.trim()}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      console.error('Failed to open print window.');
    }
  };

// Custom sort icon
const sortIcon = (
  <span style={{ color: "#007bff", fontSize: "1.2em" }}>
    <FaSort />
  </span>
);


  
  return (
    <>
      {loading ? <Col sm='12 h-100'>
        <Card className='h-100 d-flex  '>
          <CardBody className='text-center'>
            <div className="spinner-border text-center  text-secondary ms-2" role="status"></div>
          </CardBody>
        </Card>
      </Col> : <Col sm="12">
        <Card>
          <CardBody className='pt-1'>
            <div className="table-responsive data-table">
              {/* <Button color="info" style={{position:'absolute',display:'none', zIndex:'999', top:'25px',left:'25px'}} onClick={printTable}>Print</Button> */}
              <DataTable
                theme={mix_layout}
                data={searchedData === undefined ? Rows : searchedData}
                columns={Columns}
                sortIcon={sortIcon} // Custom icon
                highlightOnHover
                striped
                pagination
                subHeader 
                subHeaderComponent={
                  <Col>
                 
                  <Row className='p-0 m-0 align-items-center justify-content-end'>
                    <Col className='col-12 col-md-8 p-0 d-flex justify-content-end align-items-center'>
                    <input className='form-control w-50' placeholder="search value" onChange={(e:any)=> setFilterText(e.target.value)}/>
                    {/* <Btn color="primary px-1 py-0 py-md-2 px-md-2" onClick={()=> exportAndPrintCSV(Rows)} style={{ margin: '10px',  cursor: 'pointer' }}>
                    <IoMdPrint size="20"/> Print
                 </Btn> */}
                  {/* <button className="form-btn rounded py-0 px-1 py-md-2 px-md-2" onClick={()=> exportToExcel(Rows)} style={{ margin: '10px',  cursor: 'pointer' }}>
                   <PiMicrosoftExcelLogoFill size="20"/> Excel
                  </button> */}
                    </Col>
                  </Row>
                  </Col>
                }
                // subHeaderComponent={}
                customStyles={{
                  table: {
                    style: {
                      // backgroundColor: mix_layout === "dark" ? "#292e37" : "#fff", // Dark background color for the table
                      backgroundColor:'trasparent',
                      fontSize: '15px',
                    }
                  },
                  headCells: {
                    style: {
                      // backgroundColor: mix_layout === "dark" ? "#292e37" : "#fff", // Darker background for table header
                      color: mix_layout === "dark" ? "#fff" : "#333", // White text color
                      backgroundColor:'transparent',
                      fontSize: '15px',
                    }
                  },
                  rows: {
                    style: {
                      // backgroundColor: mix_layout === "dark" ? "#22262c" : "#fff", // Dark background for table rows
                      color: mix_layout === "dark" ? "#fff" : "#333",// White text color
                      backgroundColor:'transprent',
                      fontSize: '15px',
                    },
                    stripedStyle: {
                      backgroundColor: '#00081f6e', // Light Gray Background for Striped Rows
                    },
                  },
                  subHeader: {
                    style: {
                      backgroundColor: 'transprent', // Set the background color for the subheader
                      color: '#fff', // Set text color for subheader
                      padding: '1px', // Optional padding
                    },
                  },
                  pagination: {
                    style: {
                      backgroundColor: 'transparent', // Dark background for pagination
                    }
                  }
                }}

                noDataComponent={<Datanotfound />}
              />
            </div>
          </CardBody>
        </Card>
      </Col>}
    </>
  )
}

export default ServerSideProcessing;
