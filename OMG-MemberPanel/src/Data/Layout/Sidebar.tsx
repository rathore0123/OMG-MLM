import { MenuItem } from "../../Type/Layout/Sidebar";

export const MenuList: MenuItem[] = [
  {
    title: "",
    Items: [
      {
        icon: "Home",
        id: 1,
        active: false,
        title: "Dashboard",
        path: `${import.meta.env.BASE_URL}/dashboard`,
        type: "link",
        menu_type: "single",
      },
      {
        icon: "Profile",
        id: 2,
        active: false,
        title: "My Profile",
        path: `${import.meta.env.BASE_URL}/my-profile`,
        type: "link",
        menu_type: "single",
      },
      // {
      //   icon: "Profile",
      //   id: 1,
      //   active: false,
      //   title: "Profile",
      //   children: [
      //     { path: `${import.meta.env.BASE_URL}/myprofile`, title: "My Profile", type: "link" },
      // { path: `${import.meta.env.BASE_URL}/consentform`, title: "Exit Company ", type: "link" },
      // { path: `${import.meta.env.BASE_URL}/docverification`, title: "Profile KYC", type: "link" },
      // { path: `${import.meta.env.BASE_URL}/Welcomeletter`, title: "Welcome Letter", type: "link" },
      // { path: `${import.meta.env.BASE_URL}/myidcard`, title: "My ID-Card", type: "link" },
      //   ],

      // },

      {
        icon: "Profile",
        id: 11,
        active: false,
        title: "My Team",
        children: [
          // { path: `${import.meta.env.BASE_URL}/myteambusiness`, title: "Team Business", type: "link" },
          // { path: `${import.meta.env.BASE_URL}/teamdownline`, title: "Team Downline", type: "link" },
          {
            path: `${import.meta.env.BASE_URL}/tree`,
            title: "Sponsor Tree",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/sponsorlist`,
            title: "My Referrals",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/levelwiseteamlist`,
            title: "Levelwise Team",
            type: "link",
          },
          // { path: `${import.meta.env.BASE_URL}/businessreport`, title: "Business Report", type: "link" },
        ],
      },
      {
        icon: "Star",
        id: 5,
        active: false,
        title: "Reward",
        children: [
          {
            path: `${import.meta.env.BASE_URL}/bonanza`,
            title: "Reward Chart",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/rewardincomenew`,
            title: "Reward Income",
            type: "link",
          },
        ],
      },

      {
        icon: "Paper",
        id: 7,
        active: false,
        title: "Investment",
        children: [
          {
            path: `${import.meta.env.BASE_URL}/investment`,
            title: "Make Invetment",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/investmentreport`,
            title: "Investment Report",
            type: "link",
          },
        ],
      },
      // {
      //   icon: "Wallet",
      //   id: 1,
      //   active: false,
      //   title: "Wallet Transfer",
      //   menu_type:'single',
      //   children: [

      // { path: `${import.meta.env.BASE_URL}/FxstockWallet`, title: "Fxstock Wallet", type: "link" },
      // { path: `${import.meta.env.BASE_URL}/fxstpaytocommission`, title: "FXST Pay Transfer", type: "link" },
      // { path: `${import.meta.env.BASE_URL}/FxstPayWallet`, title: "FXST Pay Wallet", type: "link" },
      // { path: `${import.meta.env.BASE_URL}/fxstockwalletreport`, title: "Wallet Report", type: "link" },
      //     { path: `${import.meta.env.BASE_URL}/p2ptransfer`, title: "P2P Transfer", type: "link" },
      //     { path: `${import.meta.env.BASE_URL}/p2pwalletreport`, title: "P2P Report", type: "link" },
      //   ],
      // },
      // {
      //   icon: "Ticket",
      //   id: 1,
      //   active: false,
      //   title: "Lottery",
      //   children: [
      //     { path: `${import.meta.env.BASE_URL}/transfer`, title: "Wallet Transfer", type: "link" },
      //     { path: `${import.meta.env.BASE_URL}/transferlog`, title: "Transfer Report", type: "link" },
      //   ],
      // },
      {
        icon: "Paper",
        id: 8,
        active: false,
        title: "Account Statement",
        menu_type: "single",
        path: `${import.meta.env.BASE_URL}/accountstatement`,
      },

      {
        icon: "Filter",
        id: 9,
        active: false,
        title: "Withdraw",
        children: [
          {
            path: `${import.meta.env.BASE_URL}/RequestWithdraw`,
            title: "Request Withdraw",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/WithdrawHistory`,
            title: "Withdraw Report",
            type: "link",
          },
        ],
      },
      {
        icon: "Activity",
        id: 10,
        active: false,
        title: "Payout Income",
        children: [
          {
            path: `${import.meta.env.BASE_URL}/monthlyprofitincome`,
            title: "Trade Profit Income",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/profitsharing`,
            title: "Level Income",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/firstactivationbonus`,
            title: "First Activation Bonus",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/directincome`,
            title: "Direct Income",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/dailysalary`,
            title: "Daily Salary",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/uplineincome`,
            title: "Upline Income",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/weeklyincome`,
            title: "Weekly Income",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/managerincome`,
            title: "Manager Income",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/luckydrawincome`,
            title: "Luckydraw Income",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/monthlysalaryincome`,
            title: "Monthly Salary Income",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/rewardincome`,
            title: "Reward Income",
            type: "link",
          },
          {
            path: `${import.meta.env.BASE_URL}/bdgexchangepartnershipincome`,
            title: "BDG Exchange Partnership Income",
            type: "link",
          },

          // {
          //   path: `${import.meta.env.BASE_URL}/sponsorincome`,
          //   title: "Direct Income",
          //   type: "link",
          // },
          // { path: `${import.meta.env.BASE_URL}/chashbacklevel`, title: "Cashback Level", type: "link" },
        ],
      },
      {
        icon: "Work",
        id: 1,
        title: "Business Plan",
        path: `http://122.160.25.202/BDGCoin/bdg-business-plan-2025.pdf`,
        type: "link",
        rel: "noopener noreferrer",
      },
      {
        icon: "Ticket",
        id: 12,
        title: "Support",
        path: `#`,
        type: "link",
      },
    ],
  },
];
