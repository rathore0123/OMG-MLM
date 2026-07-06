import React from "react";
import { Fragment } from "react";
import { P, H5, Image } from "../../AbstractElements";
import CardHeaderCommon from "../../CommonElements/CommonCardHeader/CardHeaderCommon";
import { Progressbar } from "../../AbstractElements";
import { ProfitBarHeading } from "../../utils/Constant";
import { Col, Row } from "reactstrap";
import { Card, CardBody } from "reactstrap";
import { dynamicImage } from "../../Service";
import DonutChart from "../Dashboard/Investing/Donut";
const ProfitBar = (props: any) => {
  const { profitTracker } = props;

  const customProgressList = [
    {
      title: "Remaining Profit:",
      color: "primary",
      EarnedPercentage: profitTracker[5]?.value,
      text: `${profitTracker[5]?.value}`,
      RAmount: profitTracker[2]?.value,
      EarnedTillDate: profitTracker[3]?.value,
      TitleRight: "Earned Till Date:",
      Invested: profitTracker[0]?.value,
      TimesAmount: profitTracker[1]?.value,
      Times: profitTracker[4]?.value,
      // Profit: dynamicImage("Profit3x.png"),
    },
  ];
  console.log(customProgressList);
  return (
    <>
      <Col xl="12" md="12" lg="12">
        <Card
         
        >
          

          <CardBody className="walletCard mb-0 p-3">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexWrap: "nowrap",
                flexDirection: "column",
              }}
            >
              {/* LEFT SIDE - Labels and Values */}
              <div style={{ flex: "1", paddingRight: "30px" }}>
                
                <div
                  style={{ fontSize: "15px", fontWeight: 500, color: "#ccc" }}
                >
                  {[
                    {
                      label: "Investment:",
                      value: customProgressList[0].Invested,
                    },
                    {
                      label: "Earning:",
                      value: customProgressList[0].EarnedTillDate,
                    },
                    { label: "Times:", value: customProgressList[0].Times },
                    {
                      label: "Remaining:",
                      value: customProgressList[0].RAmount,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: i === 3 ? 0 : "12px",
                      }}
                    >
                      <span style={{ minWidth: "120px" }}>{item.label}</span>
                      <span style={{ color: "#0dd6f7", fontWeight: 600 }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE - Donut Chart */}
              <div
                style={{
                  flex: "1 1 160px",
                  maxWidth: "200px",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingTop: "10px",
                  // NEW: shift left slightly
                  transform: "translateX(-15px)",
                }}
              >
                <DonutChart
                  earning={customProgressList[0].EarnedTillDate}
                  goal={customProgressList[0].TimesAmount}
                />
              </div>
            </div>

            {/* Message for earning limit */}
            {parseFloat(
              (customProgressList?.[0]?.Invested ?? "0")
                .toString()
                .replace(/[^0-9.-]+/g, "")
            ) > 0 &&
              parseFloat(
                (customProgressList?.[0]?.RAmount ?? "0")
                  .toString()
                  .replace(/[^0-9.-]+/g, "")
              ) <= 0 && (
                <div
                  style={{
                    color: "#ff4d4f",
                    fontSize: "0.95rem",
                    marginTop: "15px",
                    textAlign: "center",
                  }}
                >
                  You've reached your earning limit.{" "}
                  <span style={{ color: "#fff" }}>
                    Please <strong>top up</strong> your investment to continue
                    earning.
                  </span>
                </div>
              )}
          </CardBody>
        </Card>
      </Col>
    </>
  );
};

export default ProfitBar;
