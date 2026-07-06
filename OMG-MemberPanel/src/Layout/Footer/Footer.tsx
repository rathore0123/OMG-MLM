import { Col, Container, Row } from "reactstrap";
import { P, SVG } from "../../AbstractElements";
import BottomNavBar from "./BottomNavBar";
import { Link } from "react-bootstrap/lib/Navbar";
import { Image } from "../../AbstractElements";
const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid>
        <Row>
          <Col
            md="12 text-center"
            className="footer-copyright d-none d-md-block"
          >
            <P className="mb-0">
              Copyright 2025-26 ©OMG Foundation. All Rights Reserved
            </P>
          </Col>
          <Col md="12" className="d-md-none p-0 p-md-3 d-block">
            <BottomNavBar />
          </Col>
        </Row>
        {/* <div className="spinWheel">
          <Image
            src={`${
              import.meta.env.BASE_URL
            }/assets/images/spin.png`}
            alt="wallet"
          />{" "}
        </div>
        <div className="chatSupport">
          <Image
            src={`${
              import.meta.env.BASE_URL
            }/assets/images/chat.png`}
            alt="wallet"
          />{" "}
        </div> */}
      </Container>
    </footer>
  );
};

export default Footer;
