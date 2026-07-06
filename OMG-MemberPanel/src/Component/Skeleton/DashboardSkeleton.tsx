import React from 'react'
import { Container, Row, Col, Card, CardBody } from "reactstrap";
import Skeleton from 'react-loading-skeleton'
import { useAppDispatch, useAppSelector } from "../../ReduxToolkit/Hooks";

const DashboardSkeleton = () => {

  
  return (
    <>
        <Row>
          <Col lg="4">
            <Card>
              <CardBody className='skeleton'>
              <Skeleton height={30} count={3}/>
              </CardBody>
            </Card>
          </Col>
          <Col lg="3">
            <Card>
              <CardBody className='skeleton'>
              <Skeleton height={30} count={3}/>
              </CardBody>
            </Card>
          </Col>
          <Col lg="2">
            <Card>
              <CardBody className='skeleton'>
              <Skeleton height={30} count={1}/>
              </CardBody>
            </Card>
            <Card>
              <CardBody className='skeleton pb-2'>
              <Skeleton height={30} count={1}/>
              </CardBody>
            </Card>
          </Col>
          <Col lg="3">
            <Card>
              <CardBody className='skeleton'>
              <Skeleton height={30} count={3}/>
              </CardBody>
            </Card>
          </Col>
        </Row> 
        <Row>
          <Col lg="6">
            <Card>
              <CardBody className='skeleton'>
              <Skeleton height={30} count={5}/>
              </CardBody>
            </Card>
          </Col>
          <Col lg="3">
            <Card>
              <CardBody className='skeleton'>
              <Skeleton height={30} count={1}/>
              <div className='rounded-circle d-flex justify-content-center'>
              <Skeleton circle={true} height={130} width={130} count={1}/>
              </div>
              <div className='d-flex justify-content-center gap-3'>
              <Skeleton height={30} width={50} count={1}/>
              <Skeleton height={30} width={50} count={1}/>
              <Skeleton height={30} width={50} count={1}/>
              </div>
              </CardBody>
            </Card>
          </Col>
          <Col lg="3">
            <Card>
              <CardBody className='skeleton'>
              <Skeleton height={30} count={5}/>
              </CardBody>
            </Card>
          </Col>
        </Row> 
        <Row>
        <Col lg="5">
            <Card>
              <CardBody className='skeleton'>
              <Skeleton height={30} count={1}/>
              <Row>
                <Col lg="8"> 
                <Skeleton height={20} width='100%'  count={1}/>
                <Row>
                <Col>
                <Skeleton height={100} width='100%'  count={1}/>
                </Col>
                <Col>
                <Skeleton height={100} width='100%'  count={1}/>
                </Col>
                <Col>
                <Skeleton height={100} width='100%'  count={1}/>
                </Col>
                </Row>
                </Col>
                <Col lg="4">
                <Skeleton height={20} width='100%'  count={1}/>
                <Col>
                <Skeleton height={100} width='100%'  count={1}/>

                </Col>
                </Col>

              </Row>
             
              </CardBody>
            </Card>
          </Col>       
          <Col lg="4">
            <Card>
              <CardBody className='skeleton py-4'>
              <Skeleton height={30} count={1}/>
              <div className='d-flex justify-content-between gap-3'>
              <Skeleton height={30} width={150} count={1}/>
              <Skeleton height={30} width={150} count={1}/>
              </div>
              <div className='d-flex justify-content-between gap-3'>
              <Skeleton height={30} width={150} count={1}/>
              <Skeleton height={30} width={150} count={1}/>
              </div>
              <div className='d-flex justify-content-between gap-3'>
              <Skeleton height={30} width={150} count={1}/>    
              </div>
              </CardBody>
            </Card>    
          </Col>
          <Col lg="3">
            <Card>
              <CardBody className='skeleton pb-1'>
              <Skeleton height={30} count={3}/>
              <Skeleton height={60} count={1}/>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
        <Col lg="2">
        <Card>
              <CardBody className='skeleton'>
                <Skeleton height={20} width='100%'  count={1}/>
                <Skeleton height={60} width='100%'  count={1}/>
              </CardBody>
            </Card>
            <Card>
              <CardBody className='skeleton'>
                <Skeleton height={20} width='100%'  count={1}/>
                <Skeleton height={20} width='100%'  count={1}/>
                <Skeleton height={60} width='100%'  count={1}/>
              </CardBody>
            </Card>
          </Col>       
          <Col lg="6">
            <Card>
              <CardBody className='skeleton py-4'>
              <Skeleton height={20} count={1}/>
              <Skeleton height={120} count={1}/>
              <Skeleton height={20} count={1}/>
              <Skeleton height={15} count={3}/>
              </CardBody>
            </Card>    
          </Col>
          <Col lg="4">
            <Card>
              <CardBody className='skeleton py-4'>
              <Skeleton height={20} count={1}/>
              <Skeleton height={120} count={1}/>
              <Skeleton height={20} count={1}/>
              <Skeleton height={15} count={3}/>
              </CardBody>
            </Card>
          </Col>
        </Row>
    </>
  )
}

export default DashboardSkeleton