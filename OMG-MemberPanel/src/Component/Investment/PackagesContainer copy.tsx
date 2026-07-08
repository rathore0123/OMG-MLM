import React, { useEffect, useState } from "react";
import "./Package.scss";
import Breadcrumbs from "../../CommonElements/Breadcrumbs/Breadcrumbs";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup"; // Import Yup
import { Col, Container, Row } from "reactstrap";
import { dynamicImage } from "../../Service";
import { useCommonService } from "../../Service/CommonService/Commonservice";
import { decryptData, encryptData } from "../../utils/helper/Crypto";
import { useSweetAlert } from "../../Context/SweetAlertContext";
import { useBotService } from "../../Service/ActivateBot/ActivateBot";
import { Loader } from "react-feather";
import { ethers } from "ethers";
const PackageContainer = () => {
  const [ClientID, setClientID] = useState(
    decryptData(localStorage.getItem("clientId") as string)
  );
  const [packageData, setpackageData] = useState<any>([]);
  const { showAlert, ShowSuccessAlert, ShowConfirmAlert } = useSweetAlert();
  const [token, settoken] = useState("");
  const [WalletBalance, setWalletBalance] = useState("0");
  const [PackageName, setPackageName] = useState("");
  const { ApiCalling, loading } = useCommonService();
  const { buyPackage } = useBotService();

  // Yup Validation Schema
  const validationSchema = Yup.object().shape({
    Amount: Yup.number().required("Enter Amount"),
  });
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [pageloading, setPageLoading] = useState(false);
  const [gmxtBalance, setGmxtBalance] = useState<string>("0");
  const [orexAmounts, setOrexAmounts] = useState<{ [key: number]: string }>({});
  const [orexPrice, setOrexPrice] = useState<number>(0.0058); // default fallback value
  // Your GMXT contract address and ABI
  const GMXT_CONTRACT_ADDRESS = "0x55a3b65063b67D926b6903591FB30EeccEc586F7";
  const GMXT_ABI = [
    {
      inputs: [
        { internalType: "string", name: "name", type: "string" },
        { internalType: "string", name: "symbol", type: "string" },
        { internalType: "uint8", name: "decimals", type: "uint8" },
        { internalType: "uint256", name: "supply", type: "uint256" },
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "feeWallet", type: "address" },
        { internalType: "string", name: "_metadata_ipfs_hash", type: "string" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "string",
          name: "metadata_ipfs_hash",
          type: "string",
        },
      ],
      name: "MetadataUpdated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "TeamFinanceTokenMint",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "account", type: "address" }],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "subtractedValue", type: "uint256" },
      ],
      name: "decreaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "addedValue", type: "uint256" },
      ],
      name: "increaseAllowance",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "metadata",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "metadata_ipfs_hash",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "address", name: "recipient", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  const connectWalletAndFetchBalance = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or use a Web3-enabled browser.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      const { chainId } = await provider.getNetwork();
      if (Number(chainId) !== 56) {
        return;
      }

      const gmxtContract = new ethers.Contract(
        GMXT_CONTRACT_ADDRESS,
        GMXT_ABI,
        signer
      );

      const [balanceRaw, decimals] = await Promise.all([
        gmxtContract.balanceOf(address),
        gmxtContract.decimals(),
      ]);

      const formattedBalance = ethers.formatUnits(balanceRaw, decimals);
      setGmxtBalance(formattedBalance);
    } catch (error) {
      console.error("Error connecting wallet or fetching balance:", error);
    }
  };

  const FetchOrexPrice = async () => {
    const param = {
      para: JSON.stringify({ ActionMode: "GetOrexPrice" }),
      procName: "PurchaseToken",
    };
    const result = await ApiCalling(param);
    const priceFromDb = parseFloat(result[0]?.OrexPrice || "0.0058"); // fallback if null
    setOrexPrice(priceFromDb);
  };
  // Fetching Packages
  const FetchPackages = async () => {
    setPageLoading(true);
    const OBJ = {
      para: JSON.stringify({ ClientId: ClientID, ActionMode: "GetTopPackage" }),
      procName: "PurchaseToken",
    };
    const result = await ApiCalling(OBJ);
    const Data = JSON.parse(result[0]?.Result);
    setpackageData(Data?.Packages);
    setWalletBalance(Data?.WalletBalance);
    settoken(Data?.token);
    localStorage.setItem("userToken", encryptData(Data?.token));
    setPageLoading(false);
  };

  // Submitting form
  const handleWithdrawal = async (
    walletAddress: any,
    txnHash: any,
    packageAmount: any,
    clientId: any,
    packageId: any
  ) => {
    const param = {
      Amount: packageAmount,
      PackageId: packageId,
      ClientId: clientId,
      TxnHash: txnHash,
      WalletAddress: walletAddress,
      ActionMode: "PurchaseToken",
    };
    const res = await buyPackage(param);
    if (res.split("|")[0].toString() == "Success") {
      ShowSuccessAlert(res.split("|")[1].toString());
    } else {
      showAlert(res.split("|")[1].toString());
    }
  };

  useEffect(() => {
    FetchPackages();
    FetchOrexPrice();
    connectWalletAndFetchBalance(); // ← Connect & fetch token balance
  }, []);

  const BSC_RPC_URL = "https://bsc-dataseed.binance.org"; // Reliable BSC RPC
  const MIN_BNB_REQUIRED = ethers.parseEther("0.005"); // For gas

  const handleBuyNowClick = async (
    values: any,
    item: any,
    PackageId: string
  ) => {
    let orexAmount = 0;
    let RECEIVER_ADDRESS = "";
    setPageLoading(true); // ✅ show loader

    try {
      // 1. Fetch OREX amount and receiver address from backend
      const OBJ = {
        para: JSON.stringify({
          PackageId: PackageId,
          PackageAmount: values.Amount,
          ActionMode: "GetPayableOrexPrice",
        }),
        procName: "PurchaseToken",
      };

      const result = await ApiCalling(OBJ);
      if (result[0].StatusCode == "1") {
        orexAmount = parseFloat(result[0]?.OREXPackageAmount);
        RECEIVER_ADDRESS = result[0]?.ReceivingAddress;
      } else {
        showAlert(result[0]?.Msg);
        setPageLoading(false);
        return;
      }

      // 2. MetaMask check
      if (!window.ethereum) {
        showAlert("Please install MetaMask.");
        return;
      }

      // 3. Connect to MetaMask
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const userAddress = await signer.getAddress();

      // 4. Load token contract
      const token = new ethers.Contract(
        GMXT_CONTRACT_ADDRESS,
        GMXT_ABI,
        signer
      );
      // ✅ BNB gas check (simple balance check)
      const bnbBalance = await browserProvider.getBalance(userAddress);
      const minGasFee = ethers.parseEther("0.002");
      if (bnbBalance < minGasFee) {
        showAlert(
          "You need at least 0.002 BNB in your wallet to cover gas fees."
        );
        setPageLoading(false);
        return;
      }
      const decimals = await token.decimals();
      const amountToSend = ethers.parseUnits(orexAmount.toString(), decimals);

      // 5. Check OREX token balance
      const userOrexBalance = await token.balanceOf(userAddress);
      if (userOrexBalance < amountToSend) {
        showAlert(
          "You do not have enough OREX tokens to complete this transaction."
        );
        return;
      }

      // 6. Estimate gas using stable provider
      const stableProvider = new ethers.JsonRpcProvider(BSC_RPC_URL);
      const feeData = await stableProvider.getFeeData();
      const gasPrice = feeData.gasPrice ?? ethers.parseUnits("5", "gwei");

      const txData = {
        to: GMXT_CONTRACT_ADDRESS,
        from: userAddress,
        data: token.interface.encodeFunctionData("transfer", [
          RECEIVER_ADDRESS,
          amountToSend,
        ]),
      };

      let estimatedGas;
      try {
        estimatedGas = await stableProvider.estimateGas(txData);
      } catch (error) {
        console.error("Gas estimation error:", error);
        showAlert("Failed to estimate gas fee.");
        return;
      }

      const estimatedFee = estimatedGas * gasPrice;
      const estimatedFeeInBNB = ethers.formatEther(estimatedFee);

      // 7. Check user's BNB balance
      let nativeBalance;
      try {
        nativeBalance = await stableProvider.getBalance(userAddress);
      } catch (err) {
        showAlert(
          "Could not fetch BNB balance due to RPC error. Try again later."
        );
        return;
      }

      if (nativeBalance < estimatedFee) {
        showAlert(`You need at least ${estimatedFeeInBNB} BNB for gas fees.`);
        return;
      }

      // 8. Send transaction
      const tx = await token.transfer(RECEIVER_ADDRESS, amountToSend);
      await tx.wait();
      console.log("Tx Hash:", tx.hash);
      // 9. Notify backend
      await handleWithdrawal(
        userAddress,
        tx.hash,
        values.Amount,
        ClientID,
        PackageId
      );
    } catch (err: any) {
      console.error("Transaction error:", err);
      showAlert("Transaction failed: " + (err?.message || "Unknown error."));
    } finally {
      setPageLoading(false);
    }
  };

  return (
    <>
      <Breadcrumbs mainTitle={"Buy Package"} parent={"Buy Package"} />

      <Container fluid>
        {pageloading && (
          <div className="overlay-loader">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        )}
        <Row className="justify-content-center">
          <Col
            md="6"
            className="mb-4"
            style={{
              background: "linear-gradient(135deg, #000, #0f1722ff)",
              borderRadius: "12px",
              padding: "1.25rem 1.5rem",
              color: "#fff",
              boxShadow: "0 2px 12px rgba(190, 101, 101, 0.15)",
              fontFamily: "'Segoe UI', sans-serif",
              textAlign: "center",
            }}
          >
            <h6
              style={{
                fontWeight: 600,
                fontSize: "1rem",
                marginBottom: "0.25rem",
              }}
            >
              💼 Wallet Address
            </h6>
            <div
              style={{
                fontSize: "0.85rem",
                wordBreak: "break-word",
                marginBottom: "0.75rem",
                color: "#e0e0e0",
              }}
            >
              {walletAddress || "Not connected"}
            </div>

            <hr style={{ borderColor: "#ffffff22", margin: "0.75rem 0" }} />

            <h6
              style={{
                fontWeight: 600,
                fontSize: "1rem",
                marginBottom: "0.25rem",
              }}
            >
              💰 Balance
            </h6>
            <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
              {gmxtBalance} OREX
            </div>
          </Col>
        </Row>

        <Row className="justify-content-center">
          {packageData?.map((plan: any, index: number) => (
            <Col sm="6" md="4" lg="4" xl="4" xxl="3" key={index}>
              <div className="pricing-box">
                <div className="icon">
                  <img
                    src="/assets/images/packagelogo.png"
                    alt={plan.PackageImage}
                  />
                </div>
                <h2 className="price">
                  {plan?.MinAmount}-{plan?.MaxAmount}
                </h2>
                <p className="package-name">{plan.PackageName}</p>
                <p className="package-name">{plan.Description}</p>
                <p className="package-name">{plan.TotalProfit}</p>
                <p className="discount">{plan.RoiPercentage}</p>

                <Formik
                  initialValues={{ Amount: "" }}
                  validationSchema={validationSchema} // Apply validation schema
                  onSubmit={(values, { resetForm }) => {
                    handleBuyNowClick(values, plan, plan.PackageId);
                    resetForm();
                  }}
                >
                  {({ resetForm, setFieldValue }) => (
                    <Form>
                      <Field
                        type="number"
                        className="enterAmount"
                        name="Amount"
                        placeholder="Enter Amount"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const value = e.target.value;
                          const numericValue = parseFloat(value);
                          const orex =
                            numericValue && numericValue > 0
                              ? (numericValue / orexPrice).toFixed(2)
                              : "";
                          setOrexAmounts((prev) => ({
                            ...prev,
                            [index]: orex,
                          }));
                          setFieldValue("Amount", value);
                        }}
                      />

                      <ErrorMessage
                        name="Amount"
                        component="div"
                        className="text-danger"
                      />
                      {orexAmounts[index] && (
                        <div
                          className="text-success"
                          style={{ fontSize: "15px", marginTop: "-2px" }}
                        >
                          You need to pay:{" "}
                          <strong>{orexAmounts[index]} OREX</strong>
                        </div>
                      )}
                      <button className="buy-now" type="submit">
                        Buy Now{" "}
                        {loading && PackageName === plan.PackageName ? (
                          <div
                            className="spinner-border spinner-border-sm"
                            role="status"
                          >
                            <span className="sr-only">Loading...</span>
                          </div>
                        ) : null}
                      </button>
                    </Form>
                  )}
                </Formik>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default PackageContainer;
