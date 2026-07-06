import { Container, Row } from 'reactstrap'
import AccountTabs from './BankAccountSettingsTabs/AccountTabs'
import Breadcrumbs from '../../CommonElements/Breadcrumbs/Breadcrumbs'
import { AccountSettings, profile } from '../../utils/Constant'


const BankAccountSetting = () => {
  return (
    <>
      <Breadcrumbs mainTitle={"Bank Account Setting"} parent={"Bank Account Setting"} />
      <Container fluid className='edit-profile'>
        <Row>
          <AccountTabs/>
        </Row>
      </Container>
    </>
  )
}

export default BankAccountSetting