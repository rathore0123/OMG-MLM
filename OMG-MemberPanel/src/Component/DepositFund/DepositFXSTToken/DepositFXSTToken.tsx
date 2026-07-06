import React, { useEffect, useState, useRef } from 'react';
import { Card, CardBody, Col, Container, Row, FormGroup, Input } from "reactstrap";
import { Image, P, H4, Btn, H5, Badges, H2, SVG } from "../../../AbstractElements";
import { FSXTTokenTitle, DepositFundTitle } from "../../../utils/Constant";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { dynamicImage } from "../../../Service";
import { useDepositFundService } from '../../../Service/DepositFund/DepositFundINRAED'
import { decryptData } from "../../../utils/helper/Crypto";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from "react-toastify";
import QRCode from 'react-qr-code';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import 'font-awesome/css/font-awesome.min.css'; // Import font-awesome for icons
import { useLocation } from 'react-router-dom'; // Import useLocation to detect current URL

const DepositFXSTTokenPageContainer = () => {
  const location = useLocation(); // Get current URL location
  const [modalOpen, setModalOpen] = useState(false); // Modal is initially closed
  const [showModal, setShowModal] = useState(false); // To control rendering of the modal
  const { getDepositWalletBalance, getFXSTTokenAddress, loading } = useDepositFundService();
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string));
  const [walletBalance, setwalletBalance] = useState<number>(0);
  const [tokenRate, settokenRate] = useState<number>(0);
  const [fxstdepositAmount, setfxstdepositAmount] = useState<number>(0);
  const [walletAddress, setwalletAddress] = useState("");
  const closeModal = () => {
    setModalOpen(false);
  };
  const GetWalletBalance = async () => {
    const param = {
      ClientId: ClientID,
      ActionMode: "GetWalletAmount",
    };
    const obj = {
      procName: "GetFXSTWalletBalace",
      Para: JSON.stringify(param),
    };

    const res = await getDepositWalletBalance(obj);

    // Ensure res[0].FuelWallet and res[0].TokenRate are numbers before using them
    const fuelWallet = parseFloat(res[0].FuelWallet);
    const rate = parseFloat(res[0].TokenRate);

    setwalletBalance(fuelWallet);
    settokenRate(rate);

    // Ensure tokenRate is a number and calculate deposit amount safely
    if (!isNaN(rate) && rate > 0) {
      setfxstdepositAmount(parseFloat((105 / rate).toFixed(4)));
    }
  };
  const GenerateFXSTTokenDepositAddress = async () => {
    const param = {
      ClientId: ClientID
    }
    const res = await getFXSTTokenAddress(param);
    if (res) {
      // console.log(res);
      setwalletAddress(res);
    } else {

    }
  }
  const CopyCallBack = (t: any, r: any) => {
    if (r == true) {
      toast.success("Copied");
    }
  }
  useEffect(() => {
    // Call the necessary functions when the component mounts
    GenerateFXSTTokenDepositAddress();

    // Delay for showing the modal after the component has fully loaded
    const timer = setTimeout(() => {
      setShowModal(true);  // Modal content is ready to be shown
      setModalOpen(true);  // Modal is visible
    }, 2000); // Delay of 2000ms (2 seconds)

    // Cleanup timer when the component unmounts
    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this runs only on component mount

  useEffect(() => {
    let intervalId: any;

    // Run GetWalletBalance only on /fxstockapp/fxstdeposit page
    if (location.pathname === '/fxstpanel/fxstdeposit') {
      // Call GetWalletBalance immediately and set interval to run every 10 seconds
      GetWalletBalance();

      intervalId = setInterval(() => {
        GetWalletBalance();
      }, 10000); // 10 seconds interval
    }

    // Cleanup interval when component unmounts or path changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [location.pathname]); // Rerun effect when the location changes
  return (
    <>
      <Breadcrumbs mainTitle={FSXTTokenTitle} parent={DepositFundTitle} ChildName={FSXTTokenTitle}/>
      <Container fluid>
        <Row>
          <Col xl="4">
            <div className="card bg-light-primary">
              <div className="card-body">
                <div className="flex-shrink-0 border-primary" style={{ padding: '20px', textAlign: 'center' }}>
                  <svg className="svg-w-24 stroke-primary">
                    <use href="assets/svg/iconly-sprite.svg#Pie"></use>
                  </svg>
                  <H2 className="mt-2">$105</H2>
                  <hr />
                  <H4>
                    Bot Activation Fee
                  </H4>

                </div>
              </div>
            </div>
            <div className="card bg-light-warning">
              <div className="card-body">
                <div className="flex-shrink-0 border-warning" style={{ padding: '20px', textAlign: 'center' }}>
                  <svg className="svg-w-24 stroke-warning">
                    <use href="assets/svg/iconly-sprite.svg#Pie"></use>
                  </svg>
                  <H2 className="mt-2">${tokenRate}/FXST</H2>
                  <hr />
                  <H4>
                    Current FXST Rate
                  </H4>

                </div>
              </div>
            </div>
            <Col xl="12">


            </Col>
          </Col>
          <Col xl="4">
            <div className="card">
              <div className="card-body">
                <div className="blog-wrapper text-center">
                  
                    {/* <Image className="blog-img borderRadius imgCustom" src={dynamicImage(`barCode.png`)} alt="barCode" /> */}
                    <div className='QRCODE-container'>
                    <QRCode value={walletAddress} size={200} />
                    </div>
                  
                </div>
                <hr />
                <div className="blog-content">
                  <H4 style={{ textAlign: 'center' }}>FXST QR Code</H4>

                  <FormGroup >
                    <Input type="text" value={walletAddress} className="mt-3" placeholder={walletAddress} />
                    <CopyToClipboard text={walletAddress} onCopy={CopyCallBack}>
                      <Btn color="primary mt-4 postionBtn" ><i className="fa fa-copy"></i></Btn>
                    </CopyToClipboard>
                  </FormGroup>
                </div>
              </div>
            </div>
          </Col>

          <Col xl="4">
            <Image className="blog-img w-100 borderRadius" src={dynamicImage(`Scan the QR Code (1).png`)} alt="barCode" />
            <hr />
            <div className="badge badge-danger f-16">You need to deposit {fxstdepositAmount} FXST Token</div>
            <Card className="bg-primary mt-4">
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
                To complete your deposit, simply scan the QR code, pay the required amount.
              </div>
            </Col>

          </Col>

        </Row>
        {showModal && ( // Conditionally render the modal only when ready
          <Modal isOpen={modalOpen} toggle={closeModal} centered>
            <ModalHeader toggle={closeModal} className="mymodal-header">
              Important Information
            </ModalHeader>
            <ModalBody className="mymodal-body text-center">
              <div className="iconModal">
                <i className="fa fa-exclamation-triangle" style={{ fontSize: '2rem', color: 'red' }}></i>
              </div>
              <p style={{ fontSize: 17 }}>
                <b style={{ color: '#43B9B2' }}>5% Extra Cashback:</b> Deposit FXST tokens now and receive an additional 5% cashback on your deposit. After activating your bot, you will get 5% cashback on every subsequent deposit, and the extra 5% bonus will be added to your Cashback Wallet.
              </p>
              <p style={{ fontSize: 17 }}>
                <b style={{ color: '#43B9B2' }}>Fund Wallet:</b> Your deposited balance will be added to your Fund Wallet. You can easily transfer these funds to your MT5 Wallet.
              </p>
              <p style={{ fontSize: 17 }}>
                <b style={{ color: '#43B9B2' }}>Daily ROI:</b> Enjoy a daily return on investment (ROI) on your cashback amount.
              </p>
              <p style={{ fontSize: 15 }}>Don't miss out on these fantastic benefits. Start depositing FXST tokens today and maximize your rewards!</p>

              <Btn onClick={closeModal} color="primary mt-4" >Continue <i className="fa fa-long-arrow-right"></i></Btn>
            </ModalBody>
          </Modal>
        )}
      </Container >
    </>
  );
};

export default DepositFXSTTokenPageContainer;
