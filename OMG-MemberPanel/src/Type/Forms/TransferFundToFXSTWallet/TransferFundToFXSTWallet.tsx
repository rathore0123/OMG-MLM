export interface TransferToFXSTPayWalletFormPropsType {
    WalletType: string,
    TransferAmount: string,
    OTP:string
}
// Create initial values based on the LoginFormPropsType interface
export const TransferToFXSTPayWalletForminitialValues: TransferToFXSTPayWalletFormPropsType = {
    WalletType: "CommissionWallet",
    TransferAmount: "",
    OTP: "",
};
