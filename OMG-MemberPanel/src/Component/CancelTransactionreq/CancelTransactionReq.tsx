import React from 'react'
import Swal from 'sweetalert2';
import { useState } from 'react';
import { TableColumn, TableRow } from "react-data-table-component";
import { useSweetAlert } from '../../Context/SweetAlertContext'
import {useDispatch} from 'react-redux'
import axios from 'axios'
import { decryptData} from "../../utils/helper/Crypto";
import { refreshDataTable } from "../../ReduxToolkit/Reducers/BookmarkHeaderSlice";
const CancelTransactionReq = (props:any) => {
    const { ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert()
    const dispatch = useDispatch()
    const [reloadtable, setreloadtable] = useState(false)
    const {payload, sponsorId} = props
    const CancelRequest = async()=>{
    const result = await Swal.fire({
      title: 'Please confirm if you wish to delete request',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    });

if(result?.value){
    try {
      let res:any
       res  = await axios.post(`${import.meta.env.VITE_APP_API_URL}/ExecuteProcedure`, payload);
       if(res?.data[0]?.StatusCode === "1"){
             ShowSuccessAlert(res?.data[0]?.Msg)
       }
       dispatch(refreshDataTable(!reloadtable))
    } catch (error) {
      // console.log(error);
      console.error("Error making POST request:", error);
    }
    
    }
     
    }
  return (
    <button
            className="bg-danger border-0 rounded pb-1 px-2"
            onClick={() => sponsorId && CancelRequest()}
            >
              Cancel
              </button> 
  )
}

export default CancelTransactionReq