export interface LotteryPropType {
    WalletType: string,
    TransferAmount: string,
    OTP:string
}
// Create initial values based on the LoginFormPropsType interface
export const LotteryForminitialValues: LotteryPropType = {
    WalletType: "CommissionWallet",
    TransferAmount: "",
    OTP: "",
};
