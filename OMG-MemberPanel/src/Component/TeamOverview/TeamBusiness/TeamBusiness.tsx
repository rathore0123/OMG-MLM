
import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { P, Btn, LI, UL, H5, H4, Image, Badges } from "../../../AbstractElements";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { TeamOverViewTitle, myTeamBusiness } from '../../../utils/Constant'
import {useCommonService} from '../../../Service/CommonService/Commonservice'
import { dynamicImage } from '../../../Service'
import SvgIcon from '../../../CommonElements/SVG/SvgIcon'
import { useEffect, useState } from "react";
import {decryptData} from '../../../utils/helper/Crypto'
const TeamBusinessContainer = () => {
    const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string))
    const {loading, ApiCalling} = useCommonService()
    const [TeamData, setTeamData] =useState<any>([])

    const FetchingTeamBusiness = async ()=>{
        const param  ={
            ClientId:ClientID,
            ActionMode:'GetStrongerWeakerZone'
          }
          const obj = {
            procName:'GetStrongerWeakerZone',
            Para: JSON.stringify(param)
          }
        const res  = await ApiCalling(obj);
        if(Array.isArray(res)){
            setTeamData(res)
        }
       
    }

    useEffect(()=>{
        FetchingTeamBusiness()
    },[])
  return (
    <Container>
        <Breadcrumbs mainTitle={myTeamBusiness} parent={TeamOverViewTitle} ChildName={myTeamBusiness}/>
        <Row>
            <Col className="col-md-4">
                <button className="form-btn rounded py-2 w-100" color="primary"><P className="me-55 ">
                    Stronger Zone Business</P> ${TeamData[0]?.StrongerZoneBusiness}</button>
            </Col>
            <Col className="col-md-4">
                <button className="form-btn rounded py-2 w-100 "><P className="me-55"> Other Zone Business</P> ${TeamData[0]?.WeakerZoneBusiness}</button>
            </Col>
        </Row>
        <Row className="mt-5"> 
           {TeamData.map((Item:any, index:number)=> <Col className="col-12 col-sm-6 col-xl-4 col-xxl-3">
                <div className="social-profile card">
                    <div className="card-body">
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
                                <a className="f-20" href="/edmin/app/socialapp">${Item?.Business}</a>
                                </H4>
                                <Badges color={Item?.ZoneType === 'Stronger' ? "success" : "danger"}>
                                    <span className="px-3 py-1">{Item?.ZoneType}</span>
                                </Badges>
                                    <UL className="social-follow simple-list flex-row justify-content-center list-group">
                                    <LI className="p-0 list-group-item"> 
                                        <H5 className="mb-0 ">{Item?.Username}</H5>
                                    </LI>
                                </UL>
                            </div>
                        </div>
                    </div>
            </Col>)}
        </Row>
    </Container>
  )
}

export default TeamBusinessContainer