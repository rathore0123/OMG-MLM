import { Col, Card, CardBody } from "reactstrap";
import KYCDocumentPage from "./BorderTabContent";

const BorderTabs = (props: any) => {
  return (
    <Col lg="12">
      <Card className="form_Card">
        <CardBody>
          <KYCDocumentPage />
        </CardBody>
      </Card>
    </Col>
  );
};

export default BorderTabs;
