import { useState } from "react";
import { Card, CardBody, Col, Nav, NavItem, NavLink } from "reactstrap";
import {  UpdatePassword, Personal, Href, Nominee } from "../../../utils/Constant";

import BorderTabContent from "./BorderTabContent";

import { SVG } from "../../../AbstractElements";

const BorderTabs = (props:any) => {
  const [basicTab, setBasicTab] = useState<string>("1");
  return (
    <Col lg="12">
      <Card className="form_Card">
        <CardBody className="form_Card">
       
          <BorderTabContent basicTab={basicTab} setUserData={props?.userData} />
        </CardBody>
      </Card>
    </Col>
  );
};

export default BorderTabs;