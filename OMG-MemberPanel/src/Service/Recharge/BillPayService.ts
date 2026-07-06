import axios from "axios";

const BASE = import.meta.env.VITE_BILLPAY_URL;

export type ServiceType =
  | "ELECTRICITY" | "GAS" | "FASTAG" | "INSURANCE"
  | "MOBILE" | "DTH" | "BROADBAND" | "WATER";

export interface ServiceParam {
  param_name: string;
  param_type: string;
  param_order: string;
  full_regex: string;
  start_regex: string;
  general_regex: string;
  param_code: string;
}

export interface BillService {
  service_name: string;
  service_code: string;
  service_type: string;
  status: string;
  params: Record<string, ServiceParam>;
}

export interface BillPayResp<T = any> {
  Resp_code: string;
  Resp_desc: string;
  data: T;
}

const parse = <T>(raw: any): BillPayResp<T> =>
  typeof raw === "string" ? JSON.parse(raw) : raw;

export const isSuccess = (r: BillPayResp) => r?.Resp_code === "RCS";

export const getServices = (serviceType: ServiceType) =>
  axios
    .post(`${BASE}/services`, {
      ProviderType: "DOOPAY",
      ServiceType: serviceType,
    })
    .then((r) => parse<
    BillService[]>(r.data));

export const fetchBill = (p: {
  serviceType: ServiceType;
  operatorCode: string;
  accountNo: string;
  mobileNo: string;
  clientId: string | number;
  policyParams?: Record<string, string> | null;
}) =>
  axios
    .post(`${BASE}/fetchbill`, {
      ProviderType: "DOOPAY",
      ServiceType: p.serviceType,
      OpratorCode: p.operatorCode,
      AccountNo: p.accountNo,
      MobileNo: p.mobileNo,
      ClientId: String(p.clientId),
      PolicyParams: p.policyParams ?? null,
    })
    .then((r) => parse(r.data));

export const payBill = (p: {
  clientId: string | number;
  mobileNo: string;
  pin: string;
  amount: string;
  billerName: string;
  serviceTypeId: ServiceType;
  serviceId: string;
  dob?: string | null;
  cardType?: string | null;
}) =>
  axios
    .post(`${BASE}/pay`, {
      ClientId:      String(p.clientId),
      ProviderType: "DOOPAY",
      MobileNo:      p.mobileNo,
      PIN:           p.pin,
      Amount:        p.amount,
      BillerName:    p.billerName,
      ServiceTypeId: p.serviceTypeId,
      ServiceId:     p.serviceId,
      DOB:           p.dob ?? null,
      CardType:      p.cardType ?? null,
      ActionMode:    "ProceedToRecharge",
    })
    .then((r) => parse(r.data));
