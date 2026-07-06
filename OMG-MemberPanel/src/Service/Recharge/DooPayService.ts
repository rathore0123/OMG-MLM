import axios from "axios";
import { OPERATOR_CODES, CIRCLE_IDS } from "./DooPayMappings";

const DOOPAY_URL = "https://doopay.in/ws/Action/service_transaction";

export interface DooPayTxnData {
  opid: string;
  txnid: string;
  txn_status: string;
  txn_code: string;
  txn_desc: string;
  date: string;
  datetext: string;
}

export interface DooPayResponse {
  Resp_code: string;
  Resp_desc: string;
  requestid: string;
  data?: DooPayTxnData;
}

export interface RechargePayload {
  operatorId: string;  // e.g. "jio"
  circleName: string;  // e.g. "Delhi & NCR"
  mobile: string;
  amount: number;
}

const generateRequestId = () =>
  `${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export const dooPayRecharge = async (
  payload: RechargePayload
): Promise<DooPayResponse> => {
  const operatorCode = OPERATOR_CODES[payload.operatorId];
  const circleId = CIRCLE_IDS[payload.circleName];

  if (!operatorCode) throw new Error(`Unknown operator: ${payload.operatorId}`);
  if (!circleId)     throw new Error(`Unknown circle: ${payload.circleName}`);

  const { data } = await axios.get<DooPayResponse>(DOOPAY_URL, {
    params: {
      username:     import.meta.env.VITE_DOOPAY_USERNAME,
      password:     import.meta.env.VITE_DOOPAY_PASSWORD,
      requestid:    generateRequestId(),
      operator:     operatorCode,
      circleid:     circleId,
      post_mobno:   payload.mobile,
      amount:       payload.amount,
      request_type: "TRANSACT",
    },
  });

  return data;
};

export const isDooPaySuccess = (res: DooPayResponse) =>
  res.Resp_code === "RCS" && res.data?.txn_status === "SUCCESS";
