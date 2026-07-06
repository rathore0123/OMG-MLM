import { Container, Row } from 'reactstrap'
import AccountTabs from './AccountSettingsTabs/AccountTabs'
import Breadcrumbs from '../../CommonElements/Breadcrumbs/Breadcrumbs'
import { AccountSettings, profile } from '../../utils/Constant'


const MyProfileContainer = () => {
  return (
    <>
      <Breadcrumbs mainTitle={"Crypto Wallet Setting"} parent={AccountSettings} />
      <Container fluid className='edit-profile'>
        <Row>
          <AccountTabs/>
        </Row>
      </Container>
    </>
  )
}

export default MyProfileContainer