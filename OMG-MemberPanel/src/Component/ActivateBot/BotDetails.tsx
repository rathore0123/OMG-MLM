import { Card, CardBody, Col, Row } from "reactstrap";
import CardHeaderCommon from "../../CommonElements/CommonCardHeader/CardHeaderCommon";
import { BotaDetailHeading } from "../../utils/Constant";
import { H4, UL, LI, H5 } from "../../AbstractElements";

const BotDetailOverview = (props: any) => {
  return (
    <Card className="project-card">
      <CardHeaderCommon title={BotaDetailHeading} />

      <CardBody className="pt-0">
        <Row className="align-items-center">
          <Col className="d-sm-none d-md-block">
            <UL className="overview-details">
              {props?.botData.map((item: any, i: number) => (
                <LI className="d-flex align-items-center p-0 mb-3" key={i}>
                  <div className={`circle-dot-${item.color}`}>
                    <span />
                  </div>
                  <H5 className="custom-h5">
                    {item.Name}
                    <span className="font-light" style={{ float: "right" }}>
                      {item.Name === "Subscription Status" ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: item.Information }}
                        />
                      ) : (
                        <> {item.Information}</>
                      )}
                    </span>
                  </H5>
                </LI>
              ))}
            </UL>
            <div className="text-center mt-4">
              <h6 className="text-info">Subscription Note</h6>
              <p className="text-white mb-1">
                {props.subscriptionmsg}
              </p>
              
            </div>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default BotDetailOverview;
