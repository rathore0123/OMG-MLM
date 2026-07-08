export interface P2PPropType {
    WalletType: string,
    TransferAmount: string,
    ToUsername: string,
    OTP:string
}
// Create initial values based on the LoginFormPropsType interface
export const P2PForminitialValues: P2PPropType = {
    WalletType: "ProductWallet",
    TransferAmount: "",
    ToUsername:localStorage.getItem("UserName") as string,
    OTP: "",
};
