import { Card, CardBody, Col, Row } from 'reactstrap'
import { H2, Image, P,H4,Btn } from '../../../AbstractElements'
import { dynamicImage } from '../../../Service'


const EditMyProfile = () => {
  return (
    <Col xl="12">
      <Card>

        <CardBody>
       
            <Row className="mb-2">
              <div className="profile-title">
                <div className="d-flex">
                  <Image className="img-120 rounded-circle" alt="edit-user" src={dynamicImage("avatar/1.jpg")} />
                  <div className="flex-grow-1">
                    <H2 className="mb-1">Shivani Gupta [fx000001]
                       <Btn color="primary" style={{float:'right', marginRight:'5px',height:'55px',borderRadius:'50px'}} type="button"> <i className="fa fa-sign-out"></i></Btn>
                       <Btn color="info" style={{float:'right', marginRight:'5px',height:'55px',borderRadius:'50px'}} type="button"> <i className="fa fa-cog"></i></Btn>
                       <Btn color="danger" style={{float:'right', marginRight:'5px',height:'55px',borderRadius:'50px'}} type="button"> <i className="fa fa-share"></i></Btn>
                       </H2>
                    <H4>vanigupt237@gmail.com</H4>
                    <hr/>
                   <P className='badge badge-info f-18'>Senior Sales Manager</P>
                   
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