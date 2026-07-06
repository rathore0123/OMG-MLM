import { Card, CardBody, Col, Container, Row } from 'reactstrap'
import { H4, Image, Btn } from '../../AbstractElements'
import { dynamicImage } from '../../Service'
import { Link } from 'react-router-dom'
import { profile, MyIdCard } from '../../utils/Constant'
import { userCardData } from '../../Data/MyID/MyID'
import {Profile_Service} from '../../Service/MyProfile/Myprofile'
import Breadcrumbs from '../../CommonElements/Breadcrumbs/Breadcrumbs'
import SvgIcon from '../../CommonElements/SVG/SvgIcon'
import { decryptData} from "../../utils/helper/Crypto";
import { useEffect, useState } from 'react'
import user from './images/user.png'
import { useRef } from 'react'

const UserCardsContainer = () => {
  const [ClientId, setClientId] = useState<any>(decryptData(localStorage.getItem("clientId") as string))
  const [memberData, setmemberData] = useState<any>([])
  const {loading, GetProfile_Details} = Profile_Service();
  const printref = useRef(null)

const FetchingUserData = async()=>{
  const param = {
    ClientId: ClientId, 
    ActionMode:"GetMember"
  };
  const obj = {
    procName: 'GetMemberData',
    Para: JSON.stringify(param),
  };
  const res = await GetProfile_Details(obj)
  if(Array.isArray(res)){
    // console.log(res);
    
    setmemberData(res)
  }
}

  useEffect(()=>{
    FetchingUserData()
  },[])

const printCard = ()=>{
     const printWindow = window.open('', '', 'height=600,width=800');
     if (printWindow) {
       printWindow.document.open();
       printWindow.document.write(`
         <html>
         <head>
           <style>
             body { font-family: Arial, sans-serif; }
             
            
              table{
                padding:20px;
              }
              
               tr:nth-child(2) td {
                padding:0 10px 0 0;
              }
            
             @media print {
               body { margin: 0; padding: 0; }
               h2{color:#000;}
               img {width:150px; height:150px;}
               .card-block{
              border:1px solid #000;
              border-radius:10px;
              min-height:400px;
              color:#fff;
              width:fit-content;
              display:flex;
              justify-content:center;
              align-items:center;
              flex-direction:column;
              background: radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 0%, #FDB931 8%, #9f7928 30%, #8A6E2F 40%, transparent 80%),
                radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%, #5d4a1f 62.5%, #5d4a1f 100%);
             }
             }
           </style>
         </head>
         <body>
            <div class="card-block">  
            <table>
              <tr> <img src='data:image/png;base64,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'/></tr>
              <tr> <h2>${memberData[0]?.FullName}</h2></tr>
              <tr><td><h7>User Id<h7></td><td>:</td><td>${memberData[0]?.UserId}</td></tr>
              <tr><td> Mobile No</td><td>:</td><td>${memberData[0]?.MobileNo}</td></tr>
              <tr><td> Email</td><td>:</td><td>${memberData[0]?.EmailId}</td></tr>
              </table>
            </div>
         </body>
         </html>
       `);
       printWindow.document.close();
       printWindow.focus();
       printWindow.print();
       printWindow.close();
     }



   };


  return (
    <>
      <Breadcrumbs mainTitle={MyIdCard} parent={profile} ChildName={MyIdCard}/>
      <Container fluid className='user-profile'>
        <Row>
          {userCardData.map((item) => (
            <Col xl="6" sm="6" xxl="6" className="col-ed-4 box-col-4" key={item.id}>
              <Card className="social-profile">
                <CardBody ref={printref}>
                  <div className="social-img-wrap">
                    <div className="social-img">
                      <Image src={dynamicImage('profile.png')} className="img-fluid" alt="user"/>
                    </div>
                    <div className="edit-icon">
                      <SvgIcon iconId="check-circle" className='feather stroke-primary' />
                    </div>
                  </div>
                  <div className="social-details">
                    <H4 className="mb-1">
                      <Link className='f-20' to={`${import.meta.env.BASE_URL}/app/socialapp`}>{memberData[0]?.FullName}{memberData[0]?.UserId}</Link>
                    </H4>
                    <span className="font-light" style={{paddingRight:'10px'}}>{memberData[0]?.EmailId}</span> | 
                    <span className="font-light" style={{paddingLeft:'10px'}}>{memberData[0]?.MobileNo}</span> |
                    <span className='badge badge-primary' style={{marginLeft:'10px'}} >{memberData[0]?.RegistrationDate}</span>
                    <div><hr style={{margin:'20px 0px'}}/>
                    <Btn color='primary' onClick={printCard}>Print ID Card </Btn>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  )
}

export default UserCardsContainer