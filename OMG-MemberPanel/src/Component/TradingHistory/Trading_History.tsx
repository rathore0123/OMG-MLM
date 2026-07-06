import React, { useEffect, useMemo, useRef, useState } from "react";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import HistoryTable from "../../CommonElements/SearchTable/SearchTable"
import { Col, Container, Row } from "reactstrap";
import { Tradingreport_column } from "../../Data/TableData/TableData";
import moment from "moment";
import { Btn } from "../../AbstractElements";

declare global {
  interface Window {
    TradingView: any;
  }
}

const Trading_History: React.FC = () => {

    const [API_Payload, setAPIPayload] =useState<any>({})



   useMemo(()=>{
    setAPIPayload({
      procName:"FetchLatestTradeOrders",
      Para:JSON.stringify({})
    })
   },[])
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          width: "100%",
          height: 500,
          symbol: "BINANCE:BTCUSD",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          container_id: "tradingview_chart_container",
        });
      }
    };

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
  }, []);

  return  <>
      <Breadcrumbs mainTitle={"Trading History"} parent={"Trading History"}/>
      <Container>
        <Row>
            <Col className="mb-4">
                <div id="tradingview_chart_container" ref={containerRef}></div>
            </Col>
        </Row>
        <Row>
          <Btn color="primary">Trade History</Btn>
          <Btn color="primary my-2">Position</Btn>
               <HistoryTable ColumnData={Tradingreport_column}  apiPayload={API_Payload}/>
        </Row>
      </Container>
  </>
};

export default Trading_History;
