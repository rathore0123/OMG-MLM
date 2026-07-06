import React from "react";
import "./RewardIncome.scss";
import { Container, Row, Col } from "reactstrap";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";

const RewardIncomeContainer = () => {
  // ================================
  //  REWARD DATA ARRAY
  // ================================
  const rewardData = [
    {
      title: "Royal",
      status: "Achieved",
      subtitle: "Dear Reward customer",
      progressLabel: "Reward $100",
      teamBusiness: "$1000",
      selfPackage: "$500",
      directBusiness: "$2000",
      theme: "blue",
      icon: `${import.meta.env.BASE_URL}/assets/images/Ricon.webp`,
    },
    {
      title: "Star",
      status: "Processing",
      subtitle: "Star Reward customer",
      progressLabel: "Reward $500",
      teamBusiness: "$25000",
      selfPackage: "$1000",
      directBusiness: "$3000",
      theme: "purple",
      icon: `${import.meta.env.BASE_URL}/assets/images/Ricon2.webp`,
    },
    {
      title: "Gold",
      status: "Achieved",
      subtitle: "Gold Reward customer",
      progressLabel: "Reward $800",
      teamBusiness: "$50000",
      selfPackage: "$1500",
      directBusiness: "$4000",
      theme: "green",
      icon: `${import.meta.env.BASE_URL}/assets/images/Ricon3.webp`,
    },
    {
      title: "Platinum",
      status: "Achieved",
      subtitle: "Platinum Reward customer",
      progressLabel: "Reward $800",
      teamBusiness: "$100000",
      selfPackage: "$2000",
      directBusiness: "$4000",
      theme: "orange",
      icon: `${import.meta.env.BASE_URL}/assets/images/Ricon4.webp`,
    },
    {
      title: "Ruby",
      status: "Achieved",
      subtitle: "Ruby Reward customer",
      progressLabel: "Reward $800",
      teamBusiness: "$500000",
      selfPackage: "$2500",
      directBusiness: "$4000",
      theme: "red",
      icon: `${import.meta.env.BASE_URL}/assets/images/Ricon5.webp`,
    },
    {
      title: "Chamption",
      status: "Achieved",
      subtitle: "Chamption Reward customer",
      progressLabel: "Reward $800",
      teamBusiness: "$2500000",
      selfPackage: "$3000",
      directBusiness: "$4000",
      theme: "green2",
      icon: `${import.meta.env.BASE_URL}/assets/images/Ricon6.webp`,
    },
    {
      title: "King",
      status: "Achieved",
      subtitle: "King Reward customer",
      progressLabel: "Reward $800",
      teamBusiness: "$10000000",
      selfPackage: "$5000",
      directBusiness: "$4000",
      theme: "orange2",
      icon: `${import.meta.env.BASE_URL}/assets/images/Ricon6.webp`,
    },
    {
      title: "Diamond",
      status: "Achieved",
      subtitle: "Diamond Reward customer",
      progressLabel: "Reward $800",
      teamBusiness: "$50000000",
      selfPackage: "$10000",
      directBusiness: "$4000",
      theme: "red2",
      icon: `${import.meta.env.BASE_URL}/assets/images/Ricon8.webp`,
    },

    // 👉 Add as many cards as you want (8 total)
  ];

  return (
    <>
      <Breadcrumbs mainTitle="Reward Income" parent="Reward Income" />
      <Container fluid>
        <Row>
          <Col xl="12">
            <div className="alert alert-info p-2 mb-3" role="alert">
              <i className="bi bi-info-circle-fill me-1"></i>
              Reward status will be updated every midnight.
            </div>
          </Col>
          {/* ================================
                MAP FUNCTION FOR ALL CARDS
                ================================ */}
          {rewardData.map((item, index) => (
            <Col md="6" lg="4" xl="4">
              <div className={`reward-card theme-${item.theme}`} key={index}>
                <div className="reward-header">
                  <div className="left">
                    <h3 className="title">{item.title}</h3>
                    <span className="status">{item.status}</span>
                  </div>

                  <div className="right">
                    <img
                      src={item.icon}
                      alt="reward badge"
                      className="reward-icon"
                    />
                  </div>
                </div>

                <p className="subtitle">{item.subtitle}</p>
                <p className="label">{item.progressLabel}</p>

                <div className="progress-wrapper">
                  <div className="progress-stats">
                    <span className="progress-value">Team Business</span>
                    <span className="progress-percent">
                      {item.teamBusiness}
                    </span>
                  </div>

                  <div className="progress-stats">
                    <span className="progress-value">Self Package</span>
                    <span className="progress-percent">{item.selfPackage}</span>
                  </div>

                  <div className="progress-stats">
                    <span className="progress-value">Direct Business</span>
                    <span className="progress-percent">
                      {item.directBusiness}
                    </span>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default RewardIncomeContainer;
