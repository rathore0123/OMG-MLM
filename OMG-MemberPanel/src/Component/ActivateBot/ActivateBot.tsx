import React, { useEffect, useState, useRef } from 'react';
import { Col, Container, Row } from "reactstrap";
import { ActivateBot } from "../../utils/Constant";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import BotDetails from "../ActivateBot/BotDetails";
import ActivateBotForm from "../ActivateBot/ActivateBotForm";
import { useBotService } from '../../Service/ActivateBot/ActivateBot'
import { decryptData } from "../../utils/helper/Crypto";
import { objectEntriesToArray } from '../../../src/utils/helper/opreaton'

const ActivatePageContainer = () => {
  const { getFXSTWalletBalance, doActivation, loading } = useBotService();
  const [walletBalance, setwalletBalance] = useState<number>(0);
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string));
  const [botData, setbotData] = useState<any>([]);
  const [activationStatus, setactivationStatus] = useState(false);
  const [subscriptionmessage, setMessage] = useState("");
  useEffect(() => {
    GetWalletBalance();
  }, [activationStatus]);

  const GetWalletBalance = async () => {
    const param = {
      ClientId: ClientID,
      ActionMode: "GetWalletBalance"
    }
    const obj = {
      procName: 'PurchaseToken',
      Para: JSON.stringify(param),
    };
    const res = await getFXSTWalletBalance(obj);
    setwalletBalance(res[0].FXSTWallet);
    setMessage(res[0].SubscriptionMessage);
    const BotoverviewData = [
      {
        color: "primary",
        Name: "Subscription Status",
        Information: res[0].BotStatus,
      },
      {
        color: "secondary",
        Name: "Activation Date",
        Information: res[0].ActivationDate,
      },
      {
        color: "tertiary",
        Name: "Subscription Fee",
        Information: "$25",
      },
      // {
      //   color: "tertiary",
      //   Name: "Paasword",
      //   Information: res[0].ForexPassword,
      // },
    ];

    setbotData(BotoverviewData);

  }
  return (
    <>
      <Breadcrumbs mainTitle={ActivateBot} parent={ActivateBot} />
      <Container fluid>
        <Row>
          <Col xl="4">
            <BotDetails botData={botData} subscriptionmsg={subscriptionmessage}/>
          </Col>
          <Col xl="8">
            <ActivateBotForm refreshAction={setactivationStatus}  />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ActivatePageContainer;
