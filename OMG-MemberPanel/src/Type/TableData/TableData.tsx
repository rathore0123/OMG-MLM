// export interface CustomCellInterFaces {
//   FromMember:any,
//   LevelNo:any,
//   Amount:any,
//   Percentage:any,
//   Income:any,
//   IncomeDate:any,
//   color: string;
// }

// export interface HtmlColumnsInterface {
//   name: string;
//   position: string;
//   salary: string;
//   office: string;
//   cv: JSX.Element;
//   email: string;
//   color: string;
//   badge: string;
//   id: number;
// }

// export interface AjaxSourcedColumnsInterface {
//   name: string;
//   position: string;
//   office: string;
//   date: string;
//   extends: string;
//   salary: string;
// }

export interface ServerSideProcessingColumnsInterface {
  name: any;
  sortable: boolean;
  center: boolean;
  date: any;
  salary: any;
  FromMember:string;
}

export interface MonthlyProfitIncomeInterface {
  name:any,
  sortable: boolean;
  center: boolean;
}

export interface ProfitSharingInterface {
  name:any,
  sortable: boolean;
  center: boolean;
  FromMember:string;
}

export interface CashbackLevelInterface {
  name:any,
  sortable: boolean;
  center: boolean;
  FromMember:string;
}

export interface RoyalityLogInterface {
  name:any,
  sortable: boolean;
  center: boolean;
}

export interface BonanzaReportInterface {
  name:any,
  sortable: boolean;
  center: boolean;
  Status:string;
  RewardName:string;
}

export interface LifeTimeRewardInterface {
  name:any,
  sortable: boolean;
  center: boolean;
  RewardStatus:string;
  PaidStatus:string;
  PaidAmount:string;
  Rank:string,
'Achievement Date': string
}


export interface DepositHistoryInterface{
  name:any,
  sortable: boolean;
  center: boolean;
  Deposited :string;
  TransactionNo:string;
  Status:string;
}

export interface FXSTTokenHistoryInterface{
  name:any,
  sortable: boolean;
  center: boolean;
  Txnhash:string;
  Status:string;
}

export interface LevelWiseTeamListInterface{
  name:any,
  sortable: boolean;
  center: boolean;
  Name:string,
  Level:string;
  RoyalityAchiever:string;
  PaidStatus:string;
}

export interface BusinessListInterface{
  name:any,
  sortable: boolean;
  center: boolean;
}

export interface SponsorListInterface {
  name:any,
  sortable: boolean;
  center: boolean;
  Status:string;
  BotStatus:string;
}
export interface WithDrawReportInterface {
  name:any,
  sortable: boolean;
  center: boolean;
  Status:string;
  Remarks:string,
  'Withdraw Amount':string;
  'Withdraw Date':string;
 'Payment Mode':string;
  WalletType:string;
  Action:string

}

export interface DownlineReportInterface {
  name:any,
  sortable: boolean;
  center: boolean;
  'ACTIVATION DATE':string;
  NAME:string,
  ACTION:string;

}

export interface INRFundReportInterface {
  name:any,
  sortable: boolean;
  center: boolean;
  'Payment Mode':string;
  'Net Amt.':string;
  Status:string;
  Action:string;

}

export interface SupportTicketInterface {
  name:any,
  sortable: boolean;
  center: boolean;
  Action:string;
  ReplyStatus:string;

}

export interface FXStockWalletInterface{
  name:any,
  sortable: boolean;
  center: boolean;
  Status:string;
  Name:string;
}
export interface FXDepositWalletInterface{
  name:any,
  sortable: boolean;
  center: boolean;
  Status:string;
}

export interface FXstPayWalletInterface{
  name:any,
  sortable: boolean;
  center: boolean;
  Status:string;
  Charges:string;
}

export interface FXstPayToCommissionWalletInterface{
  name:any,
  sortable: boolean;
  center: boolean;
  Status:string;
  Charges:string;
}

export interface P2PWalletReportInterface{
  name:any,
  sortable: boolean;
  center: boolean;
  Status:string;
  Charges:string;
  FromMember:string,
  ToMember:string
}

export interface KingMakerzWalletReportInterface{
  name:any,
  sortable: boolean;
  center: boolean;
  Status:string;
}

