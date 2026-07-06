import { Card, CardBody, Col, Row } from 'reactstrap'
import { H2, Image, P,H4,Btn } from '../../../AbstractElements'
import { dynamicImage } from '../../../Service'

const EditMyProfile = (props:any) => {
  
  return (
    <Col xl="12">
      <Card>
        <CardBody>
            <Row className="mb-2">
              <div className="profile-title">
                <div className="d-flex flex-wrap flex-md-nowrap justify-content-center">
                  <Image className="img-80 img-md-120 rounded-circle" alt="edit-user" src={dynamicImage("avatar/user.png")} />
                  <div className="flex-grow-1 text-center text-sm-start">
                    <H2 className="mb-1 text-center text-sm-start">{props?.user_Data[0]?.FirstName}
                       {/* <Btn color="primary" style={{float:'right', marginRight:'5px',height:'55px',borderRadius:'50px'}} type="button"> <i className="fa fa-sign-out"></i></Btn>
                       <Btn color="info" style={{float:'right', marginRight:'5px',height:'55px',borderRadius:'50px'}} type="button"> <i className="fa fa-cog"></i></Btn>
                       <Btn color="danger" style={{float:'right', marginRight:'5px',height:'55px',borderRadius:'50px'}} type="button"> <i className="fa fa-share"></i></Btn> */}
                       </H2>
                    <H4 className='text-center text-sm-start'>{props?.user_Data[0]?.EmailId}</H4>
                    <hr/>
                   <P className={props?.user_Data[0]?.RankName === "No Rank" ? 'badge badge-danger f-18' : 'badge badge-info f-18'}>{props?.user_Data[0]?.RankName}</P>
                  </div> 
                </div>
              </div>
            </Row>
        </CardBody>
      </Card>
    </Col>
  )
}

export default EditMyProfile