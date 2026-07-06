export interface TransferToDepositFormPropsType {
    WalletType: string,
    TransferAmount: string,
}
// Create initial values based on the LoginFormPropsType interface
export const TransferToDepositForminitialValues: TransferToDepositFormPropsType = {
    WalletType: "TradingWallet",
    TransferAmount: "",
};
