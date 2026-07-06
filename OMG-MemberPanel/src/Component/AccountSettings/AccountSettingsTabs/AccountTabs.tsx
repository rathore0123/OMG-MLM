import { useState } from "react";
import { Card, CardBody, Col, Nav, NavItem, NavLink } from "reactstrap";
import {  CryptoWallet, BankInr, BankAED, creditcard,Href } from "../../../utils/Constant";
import BorderTabContent from "./AccountTabContent";


const BorderTabs = () => {
  const [basicTab, setBasicTab] = useState<string>("1");
  return (
    <Col lg="12">
      <Card className="form_Card">
        <CardBody>
        
          <BorderTabContent basicTab={basicTab} />
        </CardBody>
      </Card>
    </Col>
  );
};

export default BorderTabs;