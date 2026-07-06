import { totalIncomeChartData, orderChartData,deliveryChartData} from "./DashboardChartData";
import {
  newProjectChartData,
  totalClientsChartData,
} from "./DashboardChartData";

export const totalIncomeData = [
    {
        title:"Royalty Club Income",
        badgeColor:"danger",
        svgIcon:"arrow-up-right",
        percentage:"3.4%",
        amount:"12,463",
        btnColor:"primary",
        icon:"Product-discount",
        details:"20% since Last Month",
        chart:totalIncomeChartData
    },
    {
        title:"Bot Trading Income",
        badgeColor:"success",
        svgIcon:"arrow-down-right",
        percentage:"4.5%",
        amount:"51,325",
        btnColor:"secondary",
        icon:"order-product",
        details:"14% since Last Month",
        chart:orderChartData
    },
    {
        title:"Royalty Log Income",
        badgeColor:"danger",
        svgIcon:"arrow-up-right",
        percentage:"2.3%",
        amount:"32,587",
        btnColor:"tertiary",
        icon:"delivery-van",
        details:"10% since Last Month",
        chart:deliveryChartData
    },
    {
        title:"Bot Level Income",
        badgeColor:"danger",
        svgIcon:"arrow-up-right",
        percentage:"2.3%",
        amount:"32,587",
        btnColor:"tertiary",
        icon:"delivery-van",
        details:"10% since Last Month",
        chart:deliveryChartData
    },
    {
        title:"Profit Sharing Income",
        badgeColor:"danger",
        svgIcon:"arrow-up-right",
        percentage:"2.3%",
        amount:"32,587",
        btnColor:"tertiary",
        icon:"delivery-van",
        details:"10% since Last Month",
        chart:deliveryChartData
    },
    {
        title:"Cashback Level Income",
        badgeColor:"danger",
        svgIcon:"arrow-up-right",
        percentage:"2.3%",
        amount:"32,587",
        btnColor:"tertiary",
        icon:"delivery-van",
        details:"10% since Last Month",
        chart:deliveryChartData
    }

]

export const WalletData =[ 
    {
       image:"1.png",
       title:"Fxstox Wallet",
       offers:"$800",
       value:"55",
       color:"primary",
       icon:"right-3",
       percentage:"4.5%"
    },
    {
        image:"2.png",
        title:"Deposit Wallet",
        offers:"$8000",
        value:"55",
        color:"secondary",
        icon:"right-3",
        percentage:"2.4%"
     },
     {
        image:"3.png",
        title:"Trade Profit Wallet",
        offers:"$80",
        value:"55",
        color:"tertiary",
        icon:"right-3",
        percentage:"3.5%"
    },
    
     
   
]

export const AccountOverviewData = [
    {
      color: "primary",
      value: "55",
    },
    {
      color: "secondary",
      value: "60",
    },
    {
      color: "tertiary",
      value: "45",
    },
  ];
  
  export const overviewData = [
    {
      color: "primary",
      number: "5-12-2024",
      status: "Activation",
    },
    {
      color: "secondary",
      number: "25-09-2024",
      status: "Registration",
    },
    {
      color: "tertiary",
      number: "5-090-2024",
      status: "Bot Status",
    },
  ];

  export const tokenDetails = [
    {
      color: "primary",
      count: "457",
      title: "Total Withdrawal",
      class: "client",
      chartData: totalClientsChartData,
    },
  ];

  export const dailybotTradingData = [
    {
      color: "primary",
      count: "457",
      title: "Bot Daily Trading Profit",
      class: "client",
      chartData: totalClientsChartData,
    },
    {
      color: "secondary",
      count: "541",
      title: "Current Bonanza",
      class: "project",
      chartData: newProjectChartData,
    },
  ];

  export const totalInvestmentFooterData = [
    {
      title: "Total",
      amount: "34,462",
    },
    {
      title: "Monthly",
      amount: "12,463",
    },
    {
      title: "Daily",
      amount: "5000",
    },
  ];

  export const IncomeData = [
    {
      icon: "Pie",
      color: "primary",
     title:"Royalty Club Income",
      count: "32",
    },
    {
      icon: "Category",
      color: "secondary",
      title:"Bot Trading Income",
      count: "78",
    },
    {
      icon: "Document",
      color: "tertiary",
      title:"Profit Sharing Income",
      count: "54",
    },
    {
      icon: "Pie",
      color: "primary",
      title:"Cashback Level Income",
      count: "32",
    },
    {
      icon: "Category",
      color: "secondary",
      title:"Royalty Log Income",
      count: "78",
    },
    {
      icon: "Document",
      color: "tertiary",
      title:"Bot Level Income",
      count: "54",
    },
  ];

  export const LivePrice = [
    {
       color:"primary",
       icon:"dash-home",
       title:"Bot Daily Trading Profit",
       value:"$89567",
       
       imageOne:"avatar/6.jpg",
       imageTwo:"user/8.jpg",
       number:4
    },
    {
        color:"secondary",
        icon:"dash-development",
        title:"FXST Token",
        value:"$5678",
      
        imageOne:"user/6.jpg",
        imageTwo:"user/9.jpg",
        number:2
     },
   
]

export const AllIncomeTableBodyData = [
  
  {
   
    image: "11.jpg",
    name: "Bot Trading Monthly Income",
    amount: "$6589.36",
    color: "tertiary",
    status: "View",
  },
  {
   
    image: "11.jpg",
    name: "Royalty Club Income",
    amount: "$6589.36",
    color: "tertiary",
    status: "View",
  },
  {
   
    image: "11.jpg",
    name: "Bot Level Income",
    amount: "$6589.36",
    color: "tertiary",
    status: "View",
  },
  {
   
    image: "11.jpg",
    name: "Profit Sharing Income",
    amount: "$6589.36",
    color: "tertiary",
    status: "View",
  },
  {
   
    image: "11.jpg",
    name: "Royality Log Income",
    amount: "$6589.36",
    color: "tertiary",
    status: "View",
  },
  {
   
    image: "11.jpg",
    name: "Royality Income",
    amount: "$6589.36",
    color: "tertiary",
    status: "View",
  },
];

export const manageWalletData = [
  {
      image:"2.jpg",
      walletName:"My Wallet",
      amount:"$254.23",
     
  },
  {
    image:"2.jpg",
    walletName:"Deposit Wallet",
    amount:"$254.23",
   
},
{
  image:"2.jpg",
  walletName:"Fxstox Wallet",
  amount:"$254.23",
 
},
{
  image:"2.jpg",
  walletName:"Trade Profit Wallet",
  amount:"$254.23",
 
},
{
  image:"2.jpg",
  walletName:"FXST Pay Wallet",
  amount:"$254.23",
 
},
{
  image:"2.jpg",
  walletName:"Cashback Wallet",
  amount:"$254.23",
 
},
   
    
]
export const taskSummaryLeftData = [
  {
    icon: "Pie",
    color: "primary",
    title: "Total",
    count: "32",
  },
  {
    icon: "Category",
    color: "secondary",
    title: "Team",
    count: "78",
  },
  {
    icon: "Document",
    color: "tertiary",
    title: "Direct",
    count: "54",
  },
];

export const notificationsData = [
  {
    class: "bg-light",
    image: "10.jpg",
    notification: "Polly edited Contact page",
    time: "18 mins ago . Craftwork design",
    dot: true,
  },
  {
    name: "KP",
    color: "secondary",
    notification: "James left a comment on ACME 2.1",
    time: "3 hours ago . ACME",
  },
  {
    image: "4.jpg",
    notification: "Mary shared the file isometric 2.0",
    time: "4 hours ago . Craftwork Design",
    buttons: true,
  },
  
  {
    image: "12.jpg",
    notification: "James created changelog page",
    time: "3 hours ago . Blank",
  },
];

export const totalVisitCardData = [
  {
    color: "primary",
    
    amount: "$5000",
  },
  
];
export const scheduleTimeTabData = [
  {
    id: "mon-tab",
    day: "Mo",
    date: "01",
  },
  {
    id: "tue-tab",
    day: "Tu",
    date: "02",
  },
  {
    id: "wed-tab",
    day: "We",
    date: "03",
  },
  {
    id: "thu-tab",
    day: "Th",
    date: "04",
  },
  {
    id: "frd-tab",
    day: "Fr",
    date: "05",
  },
  {
    id: "sat-tab",
    day: "St",
    date: "06",
  },
];

export const downloadappContent = [
  {
    id:"mon-tab",
    TabContentData: [
      {
        color: "primary",
        title: "FXstock App",
        path:'https://fxstockcorp.com/MemberPanel/FxStock.apk',
        comment: "Hannah",
        image: "11.jpg",
      },
      {
        color: "primary",
        title: "Trading App",
        path:'https://fxstockcorp.com/MemberPanel/FxStockTrade.apk',
        comment: "Hannah",
        image: "11.jpg",
      },
      {
        color: "primary",
        title: "FXST Pay App",
        path:'https://fxstockcorp.com/MemberPanel/FXSTPay.apk',
        comment: "Hannah",
        image: "11.jpg",
      },
     
      
    ],
  },

  
];
export const coursesHighlightedBodyData = [
  {
    image: "01.jpg",
    course: "Civil engineering",
    time: "20h 10m",
    amount: "$150",
    study: "UX/UI Design",
    status: "Done",
    color: "primary",
  },
  {
    image: "02.jpg",
    course: "Web development",
    time: "12h 05m",
    amount: "$156",
    study: "Illustration",
    status: "Pending",
    color: "tertiary",
  },
  {
    image: "03.jpg",
    course: "Computer science",
    time: "06h 15m",
    amount: "$695",
    study: "UX/UI Design",
    status: "Done",
    color: "primary",
  },
  {
    image: "04.jpg",
    course: "Web designer",
    time: "04h 30m",
    amount: "$364",
    study: "Leadership",
    status: "Done",
    color: "tertiary",
  },
];

export const taskSummaryRightData = ["13", "6", "3"];
export const BusinessOverviewDetailsData = [
  {
      category:"Today Business",
      count:"$8000",
      color:"primary"
  },
  
  {
    category:"Total Business",
    count:"$9000",
    color:"secondary"
},
  
]
export const LegBusinessData = [
  {
      category:"Strong Leg ID",
      count:"3976",
      color:"primary"
  },
  {
      category:"Strong Leg",
      count:"$800",
      color:"secondary"
  },
  {
    category:"Other Leg",
    count:"$9000",
    color:"secondary"
},
  
]