import { Container, Row } from 'reactstrap'
//import EditMyProfile from './EditMyProfile/EditMyProfile'

import ProfileInformation from './ProfileInformation/ProfileInformation'
import BorderTabs from './KYCBorderTabs/BorderTabs'
import Breadcrumbs from '../../CommonElements/Breadcrumbs/Breadcrumbs'
import { EditProfile, profile } from '../../utils/Constant'
import { useState } from 'react'


const MyProfileContainer = () => {
  const [userData, setuserData] = useState<any>([])  
  return (
    <>
      <Breadcrumbs mainTitle={"KYC Update"} parent={profile} />
      <Container fluid className='edit-profile'>
        {/* <Row>
         <ProfileInformation user_Data={userData}/>
        </Row> */}
        <Row>
          <BorderTabs userData={setuserData}/>
        </Row>
      </Container>
    </>
  )
}

export default MyProfileContainer