import { Card, CardBody, Col, Container, Row } from "reactstrap";
import { P } from "../../AbstractElements";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import CommonCardHeader from "../../CommonElements/CommonCardHeader/CommonCardHeader";

const SamplePageContainer = () => {
  return (
    <>
      <Breadcrumbs mainTitle="Under Development" parent="Under Development" />
      <Container fluid>
        <Row>
          <Col xl="12">
            <Card>
              <CommonCardHeader title="" headClass="pb-0" />
              <CardBody>
                <div className="text-center">
                  <hr className="my-4" style={{ borderTop: "2px solid #ccc" }} />
                  <P className="font-primary fw-bold" style={{ fontSize: 25 }}>
                    Under Development
                  </P>
                  <hr className="my-4" style={{ borderTop: "2px solid #ccc" }} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default SamplePageContainer;
