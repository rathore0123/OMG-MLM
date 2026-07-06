import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Container,
  Row,
  FormGroup,
  Input,
} from "reactstrap";
import QRCode from "react-qr-code";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-toastify";
import { decryptData } from "../../../utils/helper/Crypto";
import { useDepositFundService } from "../../../Service/DepositFund/DepositFundINRAED";
import Loader from "../../../CommonElements/Loader/Loader";
import Breadcrumbs from "../../../CommonElements/Breadcrumbs/Breadcrumbs";
import { FaWallet } from "react-icons/fa6";
import { useCurrency } from "../../../Context/CurrencyContext";

const MultiChainDepositFinal = () => {
  const thStyle = {
    padding: "12px",
    fontSize: "13px",
    color: "#f5f7fb",
    fontWeight: "600",
  };

  const tdStyle = {
    padding: "12px",
  };
  const [chains, setChains] = useState([]);
  const [activeChain, setActiveChain] = useState(null);
  const [wallets, setWallets] = useState({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const { currency } = useCurrency();
  const [ClientID] = useState(decryptData(localStorage.getItem("clientId")));

  const { getDepositWalletBalance, getTRC20Address, loading } =
    useDepositFundService();

  const copyHandler = () => toast.success("Copied!");

  // ✅ GET WALLET BALANCE
  const GetWalletBalance = async () => {
    try {
      const obj = {
        procName: "GetMemberWalletAmount",
        Para: JSON.stringify({
          MemberId: ClientID,
          ActionMode: "Get",
        }),
      };

      const res = await getDepositWalletBalance(obj);
      if (res && res.length > 0) {
        setWalletBalance(res[0].ProductWallet);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ GET CHAINS
  const GetChains = async () => {
    try {
      const obj = {
        procName: "GetActiveDepositWalletTypes",
        Para: JSON.stringify({ ActionMode: "Get" }),
      };

      const res = await getDepositWalletBalance(obj);

      if (!res || !Array.isArray(res)) return;

      const formatted = res.map((item) => ({
        key: item.Chain,
        label: `${item.Name} (${item.Chain})`,
        walletTypeId: item.WalletTypeId,
        color: "var(--primary-start)", // ✅ use CSS variable for color
      }));

      setChains(formatted);

      if (formatted.length > 0) {
        setActiveChain(formatted[0]); // ✅ store full object
      }
    } catch (e) {
      console.error(e);
    }
  };

  const GetTransactionReport = async () => {
    try {
      const obj = {
        procName: "DepositReportAdmin",
        Para: JSON.stringify({
          ActionMode: "GetLatestTransactions",
          ClientId: ClientID,
        }),
      };

      const res = await getDepositWalletBalance(obj);

      if (!res || !Array.isArray(res)) return;

      setTransactions(res);
    } catch (e) {
      console.error(e);
    }
  };

  // ✅ GENERATE WALLET
  const GenerateWallet = async (chain) => {
    try {
      const obj = {
        ClientId: ClientID,
        WalletTypeId: chain.walletTypeId,
      };

      const res = await getTRC20Address(obj);

      if (res && res.length > 0) {
        setWallets((prev) => ({
          ...prev,
          [chain.key]: res[0].WalletAddress,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    GetWalletBalance();
    GetChains();
    GetTransactionReport();
  }, []);

  useEffect(() => {
    if (activeChain) {
      GenerateWallet(activeChain);
    }
  }, [activeChain]);

  return (
    <>
      <Breadcrumbs
        mainTitle={"Add Fund Crypto"}
        parent={"Deposit"}
        ChildName={"Add Fund Crypto"}
      />
      <Container fluid>
        {loading && <Loader />}
        {/* HEADER */}

        {/* <CardBody style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Wallet Balance</h4>
          <h4>${walletBalance}</h4>
        </CardBody> */}

        <Row className="justify-content-center">
          <Col md="12" className="mb-3">
            <div className="wallet-pro-card">
              <div className="wallet-glow" />
              <div className="wallet-glow wallet-glow--2" />
              <div className="wallet-particles" id="walletParticles" />

              {/* LEFT */}
              <div className="wallet-left">
                <div className="wallet-icon-ring">
                  <svg className="ring-svg" viewBox="0 0 54 54" fill="none">
                    <circle
                      cx="27"
                      cy="27"
                      r="25"
                      stroke="rgba(0,212,255,0.3)"
                      strokeWidth="1"
                      strokeDasharray="6 4"
                    />
                    <circle
                      cx="27"
                      cy="2"
                      r="2.5"
                      fill="#00d4ff"
                      opacity="0.8"
                    />
                  </svg>
                  <div className="wallet-icon">
                    <FaWallet />
                  </div>
                </div>

                <div className="wallet-info">
                  <p>Wallet Balance</p>
                  <h3>
                    {(() => {
                      const amount = walletBalance || 0;

                      const formatted = amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      });

                      return currency.symbol.length === 1
                        ? `${currency.symbol}${formatted}` // ₹100
                        : `${formatted} ${currency.symbol}`; // 100 USDT
                    })()}
                  </h3>
                  <span className="wallet-active-badge">
                    <span className="dot" /> Active
                  </span>
                </div>
              </div>

              {/* RIGHT */}
              <div className="wallet-right">
                <div className="wallet-divider" />
                <div className="wallet-tagline">
                  <strong>Secure &amp; Instant</strong>
                  Transactions ready. Minimum deposit required.
                </div>
              </div>
            </div>

         
          </Col>
        </Row>

        <Row>
          {/* SIDEBAR */}
          <Col xl="3">
            {chains.map((chain) => {
              const isActive = activeChain?.key === chain.key;

              return (
                <div
                  key={chain.key}
                  onClick={() => setActiveChain(chain)}
                  style={{
                    padding: "14px",
                    borderRadius: "12px",
                    marginBottom: "10px",
                    cursor: "pointer",
                    // background: isActive ? "#eef2ff" : "#fff",
                    border: isActive
                      ? `1px solid ${chain.color}`
                      : "1px solid #ddd",
                  }}
                >
                  <b>{chain.label}</b>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {chain.key} Network
                  </div>
                </div>
              );
            })}
          </Col>

          {/* CONTENT */}
          <Col xl="9">
            {/* DEPOSIT */}
            <Card className="shadow-sm">
              <CardBody>
                <Row className="align-items-center">
                  {/* QR Code Section with Enhanced Border */}
                  <Col md="4" className="text-center">
                    <div
                      style={{
                        display: "inline-block",
                        padding: "15px",
                        border: "1px solid #e0e0e0",
                        borderRadius: "12px",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      }}
                    >
                      <QRCode
                        value={wallets[activeChain?.key] || ""}
                        size={160}
                        level={"H"}
                      />
                    </div>
                  </Col>

                  {/* Details Section */}
                  <Col md="8">
                    <h4 className="mb-3">
                      {activeChain?.label} Deposit Address
                    </h4>

                    <FormGroup>
                      <Input
                        value={wallets[activeChain?.key] || ""}
                        readOnly
                        // className="bg-light font-monospace"
                        style={{ fontSize: "0.9rem" }}
                      />

                      <CopyToClipboard
                        text={wallets[activeChain?.key] || ""}
                        onCopy={copyHandler}
                      >
                        <button
                          style={{ marginTop: "12px" }}
                          className="form-btn btn"
                        >
                          Copy Address
                        </button>
                      </CopyToClipboard>
                    </FormGroup>

                    {/* Enhanced Content/Warning Section */}
                    <div
                      className="mt-4 p-3 rounded"
                      style={{
                        backgroundColor: "#fff9e6",
                        borderLeft: "4px solid #ffc107",
                      }}
                    >
                      <p
                        className="mb-1"
                        style={{ fontSize: "0.9rem", color: "#856404" }}
                      >
                        <strong>Important Notice:</strong>
                      </p>
                      <p
                        className="mb-0"
                        style={{ fontSize: "0.85rem", color: "#555" }}
                      >
                        Send only <b>USDT</b> via the{" "}
                        <b>{activeChain?.key?.toUpperCase()}</b> network to this
                        address. Sending any other asset or using a different
                        network may result in the <b>permanent loss</b> of your
                        funds.
                      </p>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>

            {/* TRANSACTION HISTORY */}
            <Card
              style={{
                marginTop: "25px",
                borderRadius: "16px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                border: "none",
              }}
            >
              <CardBody>
                <h5
                  style={{
                    fontWeight: "600",
                    marginBottom: "18px",
                    color: "#ffffff",
                  }}
                >
                  Transaction History
                </h5>

                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "14px",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#424243",
                          textAlign: "left",
                          borderBottom: "1px solid #38393a",
                        }}
                      >
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Network</th>
                        <th style={thStyle}>Amount</th>
                        <th style={thStyle}>Hash</th>
                        <th style={thStyle}>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {transactions.map((tx, i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: "1px solid #282626",
                            transition: "0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#56585a")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          {/* Date */}
                          <td style={tdStyle}>{tx.TransactionDate}</td>

                          {/* Network Badge */}
                          <td style={tdStyle}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "500",
                                background:
                                  tx.Network === "BEP20"
                                    ? "#fef3c7"
                                    : tx.Network === "TRC20"
                                      ? "#fee2e2"
                                      : "#e0f2fe",
                                color:
                                  tx.Network === "BEP20"
                                    ? "#b45309"
                                    : tx.Network === "TRC20"
                                      ? "#dc2626"
                                      : "#0284c7",
                              }}
                            >
                              {tx.Network}
                            </span>
                          </td>

                          {/* Amount */}
                          <td
                            style={{
                              ...tdStyle,
                              fontWeight: "600",
                              color: "#07e424",
                            }}
                          >
                            ${tx.Amount}
                          </td>

                          {/* Hash */}
                          <td style={tdStyle}>
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontSize: "13px",
                                color: "#bfc7d5",
                              }}
                            >
                              {tx.TxnHash?.substring(0, 10)}...
                            </span>

                            <CopyToClipboard
                              text={tx.TxnHash}
                              onCopy={copyHandler}
                            >
                              <span
                                style={{
                                  marginLeft: "8px",
                                  cursor: "pointer",
                                  color: "#c2c6cc",
                                  fontWeight: "bold",
                                }}
                              >
                                📋
                              </span>
                            </CopyToClipboard>
                          </td>

                          {/* Status Badge */}
                          <td style={tdStyle}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "12px",
                                fontWeight: "600",
                                textTransform: "capitalize",

                                color:
                                  tx.Status === "Success"
                                    ? "#16a34a"
                                    : tx.Status === "Pending"
                                      ? "#f59e0b"
                                      : tx.Status === "Rejected" ||
                                          tx.Status === "Failed"
                                        ? "#dc2626"
                                        : "#6b7280",

                                backgroundColor:
                                  tx.Status === "Success"
                                    ? "rgba(22, 163, 74, 0.15)"
                                    : tx.Status === "Pending"
                                      ? "rgba(245, 158, 11, 0.15)"
                                      : tx.Status === "Rejected" ||
                                          tx.Status === "Failed"
                                        ? "rgba(220, 38, 38, 0.15)"
                                        : "#f3f4f6",

                                border:
                                  tx.Status === "Success"
                                    ? "1px solid rgba(22, 163, 74, 0.3)"
                                    : tx.Status === "Pending"
                                      ? "1px solid rgba(245, 158, 11, 0.3)"
                                      : tx.Status === "Rejected" ||
                                          tx.Status === "Failed"
                                        ? "1px solid rgba(220, 38, 38, 0.3)"
                                        : "1px solid #e5e7eb",
                              }}
                            >
                              {tx.Status === "Failed" ? "Rejected" : tx.Status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MultiChainDepositFinal;
