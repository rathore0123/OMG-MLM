import SamplePage from "../Pages/SamplePage/SamplePage";

import DashboardPage from "../Pages/Dashboard/Dashboard";

import MyProfilePage from "../Pages/MyProfile/MyProfile";
import InvestmentReport from "../Component/Investment/InvestmentHistory";

import WelcomeLetterPage from "../Pages/WelcomeLetter/WelcomeLetter";
import MyIdCardPage from "../Pages/MyIdCard/MyIdCard";

import AccountSettingPage from "../Pages/AccountSettings/AccountSettings";
import ActivateBotPage from "../Pages/ActivateBot/ActivateBot";
import BonanzaPage from "../Pages/Reward/Bonanza";
import LifeTimeRewardPage from "../Pages/Reward/LifeTimeReward";

import USSDTTRC20Page from "../Pages/DepositFund/USDTTRC20";
import USSDTBEP20Page from "../Pages/DepositFund/USDTBEP20";

import FundINRPage from "../Pages/DepositFund/FundINR";
import FxstTokenHistoryPage from "../Pages/DepositFund/FXSTTokenHistory";
import DepositHistoryPage from "../Pages/DepositFund/DepositHistory";
import DepositWalletPage from "../Pages/WalletTransfer/DepositWallet";
import FxstPayWalletPage from "../Pages/WalletTransfer/FxstPayWallet";
import FxstockWalletPage from "../Pages/WalletTransfer/FxstockWallet";
import FxWalletReport from "../Pages/WalletTransfer/FxWalletReport";

import RequestWithdrawPage from "../Pages/Withdraw/RequestWithdraw";
import WithdrawHistoryPage from "../Pages/Withdraw/WithdrawHistory";
import BotLevelIncomePage from "../Pages/Payout/BotLevelInome";
import MonthlyProfitIncome from "../Pages/Payout/MonthlyProfitIncome";
import ProfileSharingIncomePage from "../Pages/Payout/ProfitSharingIncome";
import RoyaltylogReportPage from "../Pages/Payout/RoyaltyLogIncome";
import ChashbacklevelContainer from "../Pages/Payout/CashbackLevelIncome";
import FirstActivationBonus from "../Pages/Payout/FirstActivationBonus";
import DirectIncome from "../Pages/Payout/DirectIncome";
import DailySalary from "../Pages/Payout/DailySalary";
import UplineIncome from "../Pages/Payout/UplineIncome";
import WeeklyIncome from "../Pages/Payout/WeeklyIncome";
import ManagerIncome from "../Pages/Payout/ManagerIncome";
import LuckyDrawIncome from "../Pages/Payout/LuckyDrawIncome";
import MonthlySalaryIncome from "../Pages/Payout/MonthlySalaryIncome";
import RewardIncome from "../Pages/Payout/RewardIncome";
import LevelwiseTeamList from "../Pages/TeamOverviews/LevelwiseTeamList";
// import BusinessReport from "../Pages/TeamOverviews/BusinessReport";
import GenerationTree from "../Pages/TeamOverviews/GenerationTree";
import DepositFXSTToken from "../Pages/DepositFund/DepositFXSTToken";
import SupportTicket from "../Pages/SupportTicket/SupportTicket";
import MyDirectPage from "../Pages/TeamOverviews/MyDirectReport";
import MyTeamBusinessPage from "../Pages/TeamOverviews/MyTeamBusiness";
import TeamDownline from "../Pages/TeamOverviews/Downline";
import FundReportINR from "../Pages/DepositFund/RequestfundINR";
import P2PTransferPage from "../Pages/WalletTransfer/P2PTransfer";
import P2PWalletReport from "../Pages/WalletTransfer/P2PReport";
import FxstPayWalletToCommission from "../Pages/WalletTransfer/FxstPayWalletToCommission";
import AccountStatement from "../Pages/AccountStatement/AccountStatement";
import KYC_Deposit from "../Pages/DepositFund/KYC_Deposit";
import AadharKYC from "../Component/Profile/AadharKYC";
import ConsentForm from "../Component/Profile/FxStockConsentForm";
import Investmentpage from "../Pages/Investment/Investmentpage";
import TradingHistory from "../Component/TradingHistory/Trading_History";
import RewardIncomePage from "../Pages/RewardIncome/RewardIncomePage";
import ChangePasswordPage from "../Pages/MyProfile/ChangePassword";
import ROIIncomeReport from "../Pages/Payout/ROIIncomeReport";
import ReferralIncome from "../Pages/Payout/ReferralIncome";
//report
import BinaryIncomePage from "../Pages/Payout/BinaryIncome";
import LevelIncomePage from "../Pages/Payout/LevelIncome";

import KYC from "../Pages/MyProfile/KYC";
import BankAccountSettingsPage from "../Pages/AccountSettings/BankAccountSetting";
import TransactionLogPage from "../Pages/TransactionalLog/TransactionalLog";
import GenealogyBinary from "../Pages/TeamOverviews/Geneaology";
import Promotional from "../Pages/PromotionalTool/Promotional";

import TeamBusinesspage from "../Pages/BusinessStatistics/TeamBusiness";
import BusinessReport from "../Pages/BusinessStatistics/BusinessReport";
import MobileRecharge from "../Component/Recharge/MobileRecharge/MobileRecharge";
import RechargeAllPage from "../Pages/Recharge/RechargeAll";
import BillPaymentPage from "../Pages/Recharge/BillPayment";

const routes = [
  {
    path: `${import.meta.env.BASE_URL}/dashboard/tradehistory`,
    Component: <TradingHistory />,
  },
  // Sample Page
  { path: `${import.meta.env.BASE_URL}/samplepage`, Component: <SamplePage /> },
  // Dashboard Page
  {
    path: `${import.meta.env.BASE_URL}/dashboard`,
    Component: <DashboardPage />,
  },

  {
    path: `${import.meta.env.BASE_URL}/my-profile`,
    Component: <MyProfilePage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/change-password`,
    Component: <ChangePasswordPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/docverification`,
    Component: <AadharKYC />,
  },
  {
    path: `${import.meta.env.BASE_URL}/consentform`,
    Component: <ConsentForm />,
  },

  {
    path: `${import.meta.env.BASE_URL}/welcomeletter`,
    Component: <WelcomeLetterPage />,
  },

  { path: `${import.meta.env.BASE_URL}/myidcard`, Component: <MyIdCardPage /> },
  {
    path: `${import.meta.env.BASE_URL}/crypto-wallet`,
    Component: <AccountSettingPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/bank-account`,
    Component: <BankAccountSettingsPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/activatebot`,
    Component: <ActivateBotPage />,
  },
  { path: `${import.meta.env.BASE_URL}/bonanza`, Component: <BonanzaPage /> },
  {
    path: `${import.meta.env.BASE_URL}/LifeTimeReward`,
    Component: <LifeTimeRewardPage />,
  },
  { path: `${import.meta.env.BASE_URL}/trc20`, Component: <USSDTTRC20Page /> },
  {
    path: `${import.meta.env.BASE_URL}/add-fund-inr`,
    Component: <FundINRPage />,
  },
  { path: `${import.meta.env.BASE_URL}/bep20`, Component: <USSDTBEP20Page /> },
  {
    path: `${import.meta.env.BASE_URL}/dashboard/bep20`,
    Component: <USSDTBEP20Page />,
  },
  {
    path: `${import.meta.env.BASE_URL}/requestfund`,
    Component: <FundINRPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/requestfund`,
    Component: <FundINRPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/FxstTokenHistory`,
    Component: <FxstTokenHistoryPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/deposit-history`,
    Component: <DepositHistoryPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/addfund-inr-report`,
    Component: <FundReportINR />,
  },

  {
    path: `${import.meta.env.BASE_URL}/promotional-tool`,
    Component: <Promotional />,
  },

  {
    path: `${import.meta.env.BASE_URL}/DepositWallet`,
    Component: <DepositWalletPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/FxstPayWallet`,
    Component: <FxstPayWalletPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/p2p-transfer`,
    Component: <P2PTransferPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/FxstockWallet`,
    Component: <FxstockWalletPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/fxstockwalletreport`,
    Component: <FxWalletReport />,
  },
  {
    path: `${import.meta.env.BASE_URL}/fxstpaytocommission`,
    Component: <FxstPayWalletToCommission />,
  },
  {
    path: `${import.meta.env.BASE_URL}/p2p-report`,
    Component: <P2PWalletReport />,
  },
  { path: `${import.meta.env.BASE_URL}/kycwallet`, Component: <KYC_Deposit /> },

  {
    path: `${import.meta.env.BASE_URL}/RequestWithdraw`,
    Component: <RequestWithdrawPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/WithdrawHistory`,
    Component: <WithdrawHistoryPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/sponsorincome`,
    Component: <BotLevelIncomePage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/monthlyprofitincome`,
    Component: <MonthlyProfitIncome />,
  },
  {
    path: `${import.meta.env.BASE_URL}/firstactivationbonus`,
    Component: <FirstActivationBonus />,
  },
  {
    path: `${import.meta.env.BASE_URL}/sponsor-income`,
    Component: <DirectIncome />,
  },
  {
    path: `${import.meta.env.BASE_URL}/referral-income`,
    Component: <ReferralIncome />,
  },
  {
    path: `${import.meta.env.BASE_URL}/dailysalary`,
    Component: <DailySalary />,
  },
  {
    path: `${import.meta.env.BASE_URL}/uplineincome`,
    Component: <UplineIncome />,
  },
  {
    path: `${import.meta.env.BASE_URL}/weeklyincome`,
    Component: <WeeklyIncome />,
  },
  {
    path: `${import.meta.env.BASE_URL}/managerincome`,
    Component: <ManagerIncome />,
  },
  {
    path: `${import.meta.env.BASE_URL}/luckydrawincome`,
    Component: <LuckyDrawIncome />,
  },
  {
    path: `${import.meta.env.BASE_URL}/monthlysalaryincome`,
    Component: <MonthlySalaryIncome />,
  },
  {
    path: `${import.meta.env.BASE_URL}/rewardincome`,
    Component: <RewardIncome />,
  },

  {
    path: `${import.meta.env.BASE_URL}/profitsharing`,
    Component: <ProfileSharingIncomePage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/chashbacklevel`,
    Component: <ChashbacklevelContainer />,
  },
  {
    path: `${import.meta.env.BASE_URL}/royaltylog`,
    Component: <RoyaltylogReportPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/supportticket`,
    Component: <SupportTicket />,
  },

  {
    path: `${import.meta.env.BASE_URL}/level-wise-team`,
    Component: <LevelwiseTeamList />,
  },
  {
    path: `${import.meta.env.BASE_URL}/business-report`,
    Component: <BusinessReport />,
  },
  {
    path: `${import.meta.env.BASE_URL}/teamdownline`,
    Component: <TeamDownline />,
  },
  { path: `${import.meta.env.BASE_URL}/tree`, Component: <GenerationTree /> },
  {
    path: `${import.meta.env.BASE_URL}/mydirect`,
    Component: <MyDirectPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/myteambusiness`,
    Component: <MyTeamBusinessPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/fxstdeposit`,
    Component: <DepositFXSTToken />,
  },
  {
    path: `${import.meta.env.BASE_URL}/accountstatement`,
    Component: <AccountStatement />,
  },
  {
    path: `${import.meta.env.BASE_URL}/buy-package`,
    Component: <Investmentpage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/my-package`,
    Component: <InvestmentReport />,
  },
  {
    path: `${import.meta.env.BASE_URL}/transaction-log`,
    Component: <TransactionLogPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/roi-income`,
    Component: <ROIIncomeReport />,
  },
  {
    path: `${import.meta.env.BASE_URL}/binary-income`,
    Component: <BinaryIncomePage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/level-income`,
    Component: <LevelIncomePage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/rewardincomenew`,
    Component: <RewardIncomePage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/kyc`,
    Component: <KYC />,
  },
  {
    path: `${import.meta.env.BASE_URL}/genealogy-binary`,
    Component: <GenealogyBinary />,
  },
  {
    path: `${import.meta.env.BASE_URL}/team-business`,
    Component: <TeamBusinesspage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/recharge/mobile`,
    Component: <MobileRecharge />,
  },
  {
    path: `${import.meta.env.BASE_URL}/recharge`,
    Component: <RechargeAllPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/bills/:serviceType`,
    Component: <BillPaymentPage />,
  },
  {
    path: `${import.meta.env.BASE_URL}/buy-package`,
    Component: <Investmentpage />,
  },
];

export default routes;
