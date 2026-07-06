import React from 'react'
import { H1, H2, Image, P, Btn } from '../../AbstractElements'
import { dynamicImage } from '../../Service'
import { Col, Container, Row } from 'reactstrap'
import { useNavigate } from 'react-router-dom'

const Pagenotfound = () => {
  const navigate = useNavigate()
  return (
    <div className='page-body'>
        <Container>
          <Row>
            <Col md="8" className='pagenotFound-Container offset-md-2'>
            <Image src={dynamicImage('pagenotfound.svg')} alt="page not found"/>
            </Col>
            <Col md="12" className='text-center pagenotfound-content'>
              <h1>Page not Found</h1>
              <P className='px-md-4 fs-5'>The page you are attempting to reach is currently not available. This may be because the page does not exist or has been moved.</P>
              <Btn className='btn btn-primary f-14 my-2 text-black' onClick={()=> navigate(`${import.meta.env.BASE_URL}/dashboard`)}>
                Back to Home Page
              </Btn>
            </Col>
          </Row>
        </Container>
    </div>
  )
}

export default Pagenotfound