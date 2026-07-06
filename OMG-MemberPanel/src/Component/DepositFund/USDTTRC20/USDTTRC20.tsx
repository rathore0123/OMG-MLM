import React, { useEffect, useState, useRef } from 'react';
import { Card, CardBody, Col, Container, Row, FormGroup, Input } from "reactstrap";
import { Image, P, H4, Btn, H5 } from "../../../AbstractElements";
import { UsdtTRCTitle, DepositFundTitle, SampleCards } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { dynamicImage } from "../../../Service";
import Loader from '../../../CommonElements/Loader/Loader'
import LastTransaction from "./LastTransaction/LastTransaction"
import { useDepositFundService } from '../../../Service/DepositFund/DepositFundINRAED'
import { decryptData } from "../../../utils/helper/Crypto";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from "react-toastify";
import QRCode from 'react-qr-code';
const USDTTRC20PageContainer = () => {
  const { getDepositWalletBalance, getTRC20Address, loading } = useDepositFundService();
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string));
  const [walletBalance, setwalletBalance] = useState<number>(0);
  const [walletAddress, setwalletAddress] = useState("");
  const [back, setBack] = useState('#EE1A3B');
  const [fore, setFore] = useState('#000');
  const [size, setSize] = useState(150);
  const GetWalletBalance = async () => {
    const param = {
      MemberId: ClientID,
      ActionMode: "Get"
    }
    const obj = {
      procName: 'GetMemberWalletAmount',
      Para: JSON.stringify(param),
    };
    const res = await getDepositWalletBalance(obj);
    setwalletBalance(res[0].ProductWallet);
  }
  const GenerateTRC20Address = async () => {
    const param = {
      ClientId: ClientID
    }
    const res = await getTRC20Address(param);
    if (res[0].StatusCode == "1") {
      console.log(res);
      setwalletAddress(res[0].Msg);
    } else {

    }
  }
  const CopyCallBack = (t: any, r: any) => {
    if (r == true) {
      toast.success("Copied");
    }
  }
  useEffect(() => {
    GetWalletBalance();
    GenerateTRC20Address();
  }, []);
  return (
    <>
      <Breadcrumbs mainTitle={UsdtTRCTitle} parent={DepositFundTitle} ChildName={UsdtTRCTitle}/>
      <Container fluid>
        {loading && <Loader />}
        <Row>
          <Col xl="4">
            <Card className="bg-primary">
              <CardBody>
                <div className="gap-3 pills-blogger">
                  <Row>
                    <Col xl="3">
                      <div className="blog-wrapper">
                        <i className="icon-wallet f-60"></i>
                      </div>
                    </Col>
                    <Col xl="9">
                      <div className="blog-content">
                        <H4>Wallet Balance</H4>
                        <hr />
                        <div className="f-26">${walletBalance}</div>
                      </div>
                    </Col>

                  </Row>
                </div>
              </CardBody>
            </Card>
            <Col xl="12" style={{ display: 'flex' }}>
              <div><i className="fa fa-info-circle"></i></div><div style={{ paddingLeft: '10px' }}>
                To complete your deposit, simply scan the QR code, pay the required amount, then fill in the form with your transaction ID and other details to finalize the process.
              </div>
            </Col>
          </Col>
          <Col xl="8">
            <Card>
              <CardBody>
                <div className="gap-3 pills-blogger">
                  <Row>
                    <Col xl="4 text-center">
                      <div className="blog-wrapper QR_Code_container">

                        <QRCode value={walletAddress} size={180} />

                      </div>
                    </Col>
                    <Col xl="8">
                      <div className="blog-content">
                        <H4>Deposit by scanning this QR Code</H4>
                        <hr />
                        <FormGroup >
                          <Input type="text" value={walletAddress} />
                          <CopyToClipboard text={walletAddress} onCopy={CopyCallBack}>
                            <Btn color="info mt-4" ><i className="fa fa-copy"></i>&nbsp;COPY</Btn>
                          </CopyToClipboard>
                        </FormGroup>
                      </div>
                    </Col>
                  </Row>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="12">
            <LastTransaction /></Col>
        </Row>
      </Container>
    </>
  );
};

export default USDTTRC20PageContainer;
