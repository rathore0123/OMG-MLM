import { Col, Container, Row } from "reactstrap";

import { LifeRewardTitle, RewardTitle } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import SearchTable from "../../../CommonElements/SearchTable/SearchTable";
import { LifeTimeReward } from "../../../Data/TableData/TableData";
import { decryptData } from "../../../utils/helper/Crypto";
import { useEffect, useState } from "react";

const LifeTimeRewardPageContainer = () => {
  const [ClientId, setClientId] = useState(
    decryptData(localStorage.getItem("clientId") as string)
  );
  const [API_Payload, setAPIPayload] = useState({
    procName: "FetchSalaryMatchingReward",
    Para: JSON.stringify({ ClientId: ClientId }),
  });

  return (
    <>
      <Breadcrumbs
        mainTitle={LifeRewardTitle}
        parent={RewardTitle}
        ChildName={LifeRewardTitle}
      />
      <Container fluid>
        <Row>
          <Col xl="12">
            <div className="alert alert-info p-2 mb-3" role="alert">
              <i className="bi bi-info-circle-fill me-1"></i>
              Qualification status will be updated every midnight.
            </div>

            <SearchTable ColumnData={LifeTimeReward} apiPayload={API_Payload} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default LifeTimeRewardPageContainer;
