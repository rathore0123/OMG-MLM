import React from 'react'
import {   Col, Container, Row, FormGroup, Input, Label, ButtonToggle } from "reactstrap";
import { H2, Image, P,H4,Btn } from '../../AbstractElements'
import { dynamicImage } from '../../Service'


const Datanotfound = () => {
  return (
    <Container>
        <Col className='text-center p-4'>
        <Image src={dynamicImage('Data_not_found.png')} alt="data-not-found" style={{width:"220px"}}/>
            <H2>Oops! Looks like there's nothing here to show.</H2>
        </Col>
    </Container>
  )
}

export default Datanotfound