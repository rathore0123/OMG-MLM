import React, { useEffect, useState, useRef } from 'react';
import { Card, CardBody, Col, Table } from "reactstrap";
import CardHeaderCommon from "../../../../CommonElements/CommonCardHeader/CardHeaderCommon";
import { LastTransactionHeading } from "../../../../utils/Constant";
import TransactionDetails from "./TransactionDetails";
import Loader from '../../../../CommonElements/Loader/Loader'
import { decryptData } from "../../../../utils/helper/Crypto";
import { useDepositFundService } from '../../../../Service/DepositFund/DepositFundINRAED'
const CoursesHighlighted = () => {
  useEffect(() => {
    GetTransactions();
  }, []);
  const { getDepositTransactions, loading } = useDepositFundService();
  const [ClientID, setClientID] = useState(decryptData(localStorage.getItem("clientId") as string));
  const [transactionHistory, settransactionHistory] = useState<any>([]);
  const GetTransactions = async () => {
    const param = {
      MemberId: ClientID,
      CryptoType:"trc20",
      ActionMode: "GetLastKYCCryptoTransactions"
    }
    const obj = {
      procName: 'RequestFund',
      Para: JSON.stringify(param),
    };
    const res = await getDepositTransactions(obj);
    settransactionHistory(res);
  }
  return (

    <Card>
      <CardHeaderCommon headClass="pb-0" title={LastTransactionHeading} />
      <hr />
      <CardBody className="pt-0 course-table">
        <Table responsive>
          <tbody>
            {transactionHistory == "NoRecord" ? "No Transactions Found" :
              <TransactionDetails data={transactionHistory} />}
          </tbody>
        </Table>
      </CardBody>
    </Card>

  );
};

export default CoursesHighlighted;
