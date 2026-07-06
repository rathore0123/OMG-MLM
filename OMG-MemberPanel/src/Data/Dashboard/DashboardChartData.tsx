import { ApexOptions } from "apexcharts";

const primary = "#43B9B2";
const secondary = "#c280d2";
export const totalClientsChartData: ApexOptions = {
  series: [
    {
      data: [
        40, 50, 50, 50, 25, 25, 25, 60, 60, 60, 60, 45, 45, 45, 45, 25, 25, 25,
        25, 25, 60,
      ],
    },
  ],
  chart: {
    type: "line",
    height: 85,
    sparkline: {
      enabled: true,
    },
    dropShadow: {
      enabled: true,
      top: 8,
      left: 3,
      blur: 2,
      color: primary,
      opacity: 0.4,
    },
  },
  stroke: {
    curve: "stepline",
    width: 2,
  },
  colors: [primary],
  fill: {
    opacity: [0.5, 0.25, 1],
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  markers: {
    hover: {
      sizeOffset: 4,
    },
    discrete: [
      {
        seriesIndex: 0,
        dataPointIndex: 1,
        fillColor: "#fff",
        strokeColor: primary,
        size: 3,
        shape: "circle",
      },
      {
        seriesIndex: 0,
        dataPointIndex: 4,
        fillColor: "#fff",
        strokeColor: primary,
        size: 3,
        shape: "circle",
      },
      {
        seriesIndex: 0,
        dataPointIndex: 7,
        fillColor: "#fff",
        strokeColor: primary,
        size: 3,
        shape: "circle",
      },
      {
        seriesIndex: 0,
        dataPointIndex: 11,
        fillColor: "#fff",
        strokeColor: primary,
        size: 3,
        shape: "circle",
      },
      {
        seriesIndex: 0,
        dataPointIndex: 15,
        fillColor: "#fff",
        strokeColor: primary,
        size: 3,
        shape: "circle",
      },
      {
        seriesIndex: 0,
        dataPointIndex: 20,
        fillColor: "#fff",
        strokeColor: primary,
        size: 3,
        shape: "circle",
      },
    ],
  },
  responsive: [
    {
      breakpoint: 1400,
      options: {
        chart: {
          height: 75,
        },
      },
    },
    {
      breakpoint: 1236,
      options: {
        chart: {
          height: 80,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        chart: {
          height: 85,
        },
      },
    },
  ],
};

export const newProjectChartData: ApexOptions = {
  series: [
    {
      name: "series1",
      data: [25, 30, 45, 25, 20, 22, 18, 19, 14],
    },
  ],
  colors: [
    secondary,
    "#f6ecf8",
    secondary,
    "#f6ecf8",
    secondary,
    "#f6ecf8",
    secondary,
    "#f6ecf8",
  ],
  chart: {
    height: 85,
    type: "bar",
    sparkline: {
      enabled: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
  },
  plotOptions: {
    bar: {
      borderRadius: 3,
      distributed: true,
      columnWidth: "55%",
    },
  },
  responsive: [
    {
      breakpoint: 1701,
      options: {
        chart: {
          height: 78,
        },
      },
    },
    {
      breakpoint: 1236,
      options: {
        chart: {
          height: 80,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        chart: {
          height: 85,
        },
      },
    },
  ],
};

export const investingChartData: ApexOptions = {
  series: [
    {
      name: "Earning",
      data: [
        200, 120, 280, 80, 200, 220, 120, 300, 195, 100, 30, 200, 110, 100, 210,
        230,
      ],
    },
    {
      name: "Earning",
      data: [100, 25, 10, 12, 13, 15, 10, 15, 10, 12, 14, 10],
    },
  ],
  chart: {
    type: "bar",
    toolbar: {
      show: false,
    },
    height: 208,
    stacked: true,
  },
  states: {
    hover: {
      filter: {
        type: "darken",
        value: 1,
      },
    },
  },

  plotOptions: {
    bar: {
      horizontal: false,
      // endingShape: "rounded",
      // startingShape: "rounded",
      borderRadius: 2,
      columnWidth: "50%",
    },
  },
  dataLabels: {
    enabled: false,
  },
  grid: {
    show: true,
    strokeDashArray: 3,
    borderColor: "rgba(106, 113, 133, 0.30)",
  },
  xaxis: {
    categories: [
      "Sun",
      "",
      "Mon",
      "",
      "",
      "Tue",
      "",
      "",
      "Wed",
      "",
      "",
      "Thu",
      "",
      "Fri",
      "",
      "Sat",
    ],
    offsetX: 0,
    offsetY: 0,
    axisBorder: {
      offsetX: 0,
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      formatter: function (val) {
        return "$" + val;
      },
    },
  },
  fill: {
    opacity: 1,
    colors: [primary, "#F4F5F8"],
  },
  tooltip: {
    enabled: true,
  },
  legend: {
    show: false,
  },
  responsive: [
    {
      breakpoint: 1500,
      options: {
        yaxis: {
          labels: {
            show: false,
          },
        },
      },
    },
    {
      breakpoint: 1400,
      options: {
        chart: {
          height: 195,
        },
      },
    },
    {
      breakpoint: 1236,
      options: {
        chart: {
          height: 210,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        yaxis: {
          labels: {
            show: true,
          },
        },
      },
    },
  ],
};

export const totalInvestmentChart: ApexOptions = {
  series: [14, 23, 21, 17, 15, 10, 12, 17, 21],
  chart: {
    type: "polarArea",
    height: 237,
  },
  stroke: {
    colors: ["#fff"],
  },
  colors: ["#FD7E40", secondary, primary],
  fill: {
    opacity: 0.9,
  },
  grid: {
    show: true,
    borderColor: "#000000",
  },
  legend: {
    show: false,
  },
  plotOptions: {
    polarArea: {
      rings: {
        strokeColor: "#fdfeff",
      },
      spokes: {
        connectorColors: "#fdfeff",
      },
    },
  },
  yaxis: {
    show: false,
    labels: {
      formatter: function (val) {
        return "$ " + val;
      },
    },
  },
  tooltip: {
    y: {
      formatter: function (val) {
        return "$ " + val;
      },
    },
  },
  responsive: [
    {
      breakpoint: 1400,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1217,
      options: {
        chart: {
          height: 250,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        chart: {
          height: 235,
        },
      },
    },
  ],
};

export const monthlyOverviewChartData: ApexOptions = {
  series: [
    {
      name: "Cash Flow",
      data: [
        -66, 50, 150, 66, 50, 150, -79, -50, -136, -54, -40, -140, 79, 49, -150,
        -70, 50, 140, 60, 44, 130, -66, -30, -130, -70, -50,
      ],
    },
  ],
  chart: {
    type: "bar",
    height: 290,
    offsetX: 0,
    offsetY: 0,
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      colors: {
        ranges: [
          {
            from: -150,
            to: -81,
            color: primary,
          },
          {
            from: -80,
            to: -51,
            color: secondary,
          },
          {
            from: -50,
            to: 0,
            color: "rgba(253, 126, 64, 0.85)",
          },
          {
            from: 0,
            to: 50,
            color: "rgba(253, 126, 64, 0.85)",
          },
          {
            from: 51,
            to: 80,
            color: secondary,
          },
          {
            from: 81,
            to: 150,
            color: primary,
          },
        ],
      },
      columnWidth: "70%",
      borderRadius: 2,
    },
  },

  colors: [primary],
  dataLabels: {
    enabled: false,
  },
  yaxis: {
    labels: {
      formatter: function (y) {
        return y.toFixed(0) + "%";
      },
    },
  },

  grid: {
    show: true,
    strokeDashArray: 3,
    borderColor: "rgba(106, 113, 133, 0.30)",
  },
  xaxis: {
    categories: [
      "Jan",
      "",
      "Feb",
      "",
      "Mar",
      "",
      "Apr",
      "",
      "",
      "May",
      "",
      "",
      "Jun",
      "",
      "",
      "Jul",
      "",
      "Aug",
      "",
      "Sep",
      "",
      "Oct",
      "",
      "Nov",
      "",
      "Dec",
    ],
    labels: {
      rotate: -90,
    },
    axisBorder: {
      offsetX: 0,
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1600,
      options: {
        chart: {
          height: 270,
        },
      },
    },
    {
      breakpoint: 380,
      options: {
        yaxis: {
          labels: {
            show: false,
          },
        },
      },
    },
  ],
};

export const taskSummaryChartData: ApexOptions = {
  series: [
    {
      name: "team 1",
      data: [10, 10, 6, 6, 12, 12, 16, 16, 16],
    },
  ],
  chart: {
    height: 70,
    type: "line",
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      top: 2,
      left: 3,
      blur: 2,
      color: "rgb(253, 126, 64)",
      opacity: 0.2,
    },
  },
  grid: {
    yaxis: {
      lines: {
        show: false,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  fill: {
    opacity: [0.5, 0.25, 1],
  },
  stroke: {
    width: [3, 3],
    curve: "straight",
  },
  annotations: {
    points: [
      {
        x: 40,
        y: 10,
        marker: {
          size: 6,
          fillColor: "#fe8a7d",
          strokeColor: "#fff",
          strokeWidth: 3,
          shape: "circle",
          // radius: 2,
        },
      },
    ],
  },
  xaxis: {
    offsetX: 0,
    offsetY: 0,
    labels: {
      offsetX: 0,
      show: false,
    },
    axisBorder: {
      offsetX: 0,
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  legend: {
    show: false,
  },
  yaxis: {
    show: false,
  },
  tooltip: {
    enabled: false,
    x: {
      format: "MM",
    },
  },
  colors: ["#fe8a7d"],
  responsive: [
    {
      breakpoint: 1530,
      options: {
        chart: {
          height: 90,
        },
      },
    },
  ],
};

export const totalVisitCardChatData: ApexOptions = {
  series: [
    {
      name: "series1",
      data: [340, 20, 320, 40, 300, 20],
    },
    {
      name: "series2",
      data: [260, 300, 60, 220, 40, 320],
    },
  ],
  chart: {
    height: 80,
    type: "line",
    dropShadow: {
      enabled: true,
      top: 3,
      left: 1,
      blur: 3,
      opacity: 0.4,
    },
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  stroke: {
    curve: "smooth",
    width: 2,
  },
  colors: [primary, secondary],
  grid: {
    show: false,
  },
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
  },
  yaxis: {
    show: false,
  },
  legend: {
    show: false,
  },
};

export const totalEarningChartData: ApexOptions = {
  series: [
    {
      data: [12, 10, 6, 14],
    },
  ],
  chart: {
    height: 125,
    type: "bar",
    offsetX: -10,
    toolbar: {
      show: false,
    },
    events: {
      click: function (chart, w, e) {},
    },
  },
  colors: [
    "rgba(244, 245, 248, 0.85)",
    "rgba(244, 245, 248, 0.85)",
    "rgba(244, 245, 248, 0.85)",
    primary,
  ],
  plotOptions: {
    bar: {
      columnWidth: "45%",
      distributed: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  tooltip: {
    enabled: false,
  },
  grid: {
    show: true,
    strokeDashArray: 3,
    borderColor: "rgba(106, 113, 133, 0.30)",
  },
  legend: {
    show: false,
  },
  xaxis: {
    categories: ["21/11", "22/11", "23/11", "24/11"],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      style: {
        colors: [
          "rgba(244, 245, 248, 0.85)",
          "rgba(244, 245, 248, 0.85)",
          "rgba(244, 245, 248, 0.85)",
          primary,
        ],
        fontSize: "12px",
      },
    },
  },
  yaxis: {
    labels: {
      formatter: function (val) {
        return val + "K";
      },
    },
  },
  responsive: [
    {
      breakpoint: 1800,
      options: {
        yaxis: {
          labels: {
            show: false,
          },
        },
      },
    },
    {
      breakpoint: 1600,
      options: {
        chart: {
          height: 110,
        },
        xaxis: {
          labels: {
            style: {
              fontSize: "5px",
            },
          },
        },
      },
    },
    {
      breakpoint: 1530,
      options: {
        xaxis: {
          labels: {
            show: false,
          },
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        xaxis: {
          labels: {
            show: true,
          },
        },
        yaxis: {
          labels: {
            show: true,
          },
        },
      },
    },
    {
      breakpoint: 500,
      options: {
        xaxis: {
          labels: {
            show: false,
          },
        },
      },
    },
    {
      breakpoint: 400,
      options: {
        yaxis: {
          labels: {
            show: false,
          },
        },
      },
    },
  ],
};

export const totalIncomeChartData: ApexOptions = {
  series: [
    {
      data: [30, 20, 25, 15, 35, 38, 49, 38, 45, 35, 55, 57],
    },
  ],
  chart: {
    width: 180,
    height: 120,
    type: "line",
    toolbar: {
      show: false,
    },
    offsetY: 10,
    dropShadow: {
      enabled: false,
    },
  },
  grid: {
    show: false,
  },
  colors: [primary],
  stroke: {
    width: 2,
    curve: "smooth",
  },
  labels: [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ],
  markers: {
    size: 0,
  },
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  yaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
  },
  legend: {
    show: false,
  },
  tooltip: {
    marker: {
      show: false,
    },
    x: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1790,
      options: {
        chart: {
          width: 150,
        },
      },
    },
    {
      breakpoint: 1660,
      options: {
        chart: {
          width: 120,
        },
      },
    },
    {
      breakpoint: 1520,
      options: {
        chart: {
          width: 100,
        },
      },
    },
    {
      breakpoint: 1500,
      options: {
        chart: {
          width: 200,
          height: 130,
          offsetX: 20,
          offsetY: 20,
        },
      },
    },
    {
      breakpoint: 1340,
      options: {
        chart: {
          width: 170,
          height: 120,
        },
      },
    },
    {
      breakpoint: 1270,
      options: {
        chart: {
          width: 170,
          height: 100,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        chart: {
          width: 180,
          height: 120,
          offsetX: -10,
        },
      },
    },
    {
      breakpoint: 992,
      options: {
        chart: {
          width: 130,
          height: 120,
          offsetX: 10,
        },
      },
    },
    {
      breakpoint: 976,
      options: {
        chart: {
          width: 180,
          height: 120,
          offsetX: 40,
        },
      },
    },
    {
      breakpoint: 768,
      options: {
        chart: {
          width: 180,
          height: 120,
          offsetX: 0,
        },
      },
    },
    {
      breakpoint: 380,
      options: {
        chart: {
          width: 110,
          height: 120,
          offsetX: 0,
        },
      },
    },
  ],
};

export const orderChartData: ApexOptions = {
  series: [
    {
      data: [30, 20, 28, 20, 28, 17, 50, 45, 63, 52, 66, 30],
    },
  ],
  chart: {
    width: 180,
    height: 120,
    type: "line",
    toolbar: {
      show: false,
    },
    offsetY: 10,
    dropShadow: {
      enabled: false,
    },
  },
  grid: {
    show: false,
  },
  colors: [secondary],
  stroke: {
    width: 2,
    curve: "smooth",
  },
  labels: [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ],
  markers: {
    size: 0,
  },
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  yaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
  },
  legend: {
    show: false,
  },
  tooltip: {
    marker: {
      show: false,
    },
    x: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1790,
      options: {
        chart: {
          width: 150,
        },
      },
    },
    {
      breakpoint: 1660,
      options: {
        chart: {
          width: 120,
        },
      },
    },
    {
      breakpoint: 1520,
      options: {
        chart: {
          width: 100,
        },
      },
    },
    {
      breakpoint: 1500,
      options: {
        chart: {
          width: 200,
          height: 130,
          offsetX: 20,
          offsetY: 20,
        },
      },
    },
    {
      breakpoint: 1340,
      options: {
        chart: {
          width: 170,
          height: 120,
        },
      },
    },
    {
      breakpoint: 1270,
      options: {
        chart: {
          width: 170,
          height: 100,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        chart: {
          width: 180,
          height: 120,
          offsetX: -10,
        },
      },
    },
    {
      breakpoint: 992,
      options: {
        chart: {
          width: 130,
          height: 120,
          offsetX: 10,
        },
      },
    },
    {
      breakpoint: 976,
      options: {
        chart: {
          width: 180,
          height: 120,
          offsetX: 40,
        },
      },
    },
    {
      breakpoint: 768,
      options: {
        chart: {
          width: 180,
          height: 120,
          offsetX: 0,
        },
      },
    },
    {
      breakpoint: 380,
      options: {
        chart: {
          width: 110,
          height: 120,
          offsetX: 0,
        },
      },
    },
  ],
};

export const deliveryChartData: ApexOptions = {
  series: [
    {
      data: [55, 30, 40, 35, 50, 35, 32, 10, 60, 15, 20, 30],
    },
  ],
  chart: {
    width: 180,
    height: 120,
    type: "line",
    toolbar: {
      show: false,
    },
    offsetY: 10,
    dropShadow: {
      enabled: false,
    },
  },
  grid: {
    show: false,
  },
  colors: ["#FD7E40"],
  stroke: {
    width: 2,
    curve: "smooth",
  },
  labels: [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ],
  markers: {
    size: 0,
  },
  xaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  yaxis: {
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
    labels: {
      show: false,
    },
  },
  legend: {
    show: false,
  },
  tooltip: {
    marker: {
      show: false,
    },
    x: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1790,
      options: {
        chart: {
          width: 150,
        },
      },
    },
    {
      breakpoint: 1660,
      options: {
        chart: {
          width: 120,
        },
      },
    },
    {
      breakpoint: 1520,
      options: {
        chart: {
          width: 100,
        },
      },
    },
    {
      breakpoint: 1500,
      options: {
        chart: {
          width: 200,
          height: 130,
          offsetX: 20,
          offsetY: 20,
        },
      },
    },
    {
      breakpoint: 1340,
      options: {
        chart: {
          width: 170,
          height: 120,
        },
      },
    },
    {
      breakpoint: 1270,
      options: {
        chart: {
          width: 170,
          height: 100,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        chart: {
          width: 180,
          height: 120,
          offsetX: -10,
        },
      },
    },
    {
      breakpoint: 992,
      options: {
        chart: {
          width: 130,
          height: 120,
          offsetX: 10,
        },
      },
    },
    {
      breakpoint: 976,
      options: {
        chart: {
          width: 180,
          height: 120,
          offsetX: 40,
        },
      },
    },
    {
      breakpoint: 768,
      options: {
        chart: {
          width: 180,
          height: 120,
          offsetX: 0,
        },
      },
    },
    {
      breakpoint: 380,
      options: {
        chart: {
          width: 110,
          height: 120,
          offsetX: 0,
        },
      },
    },
  ],
};

export const categoryOverviewChart: ApexOptions = {
  chart: {
    height: 287,
    type: "radialBar",
    offsetX: -8,
    offsetY: -10,
  },
  plotOptions: {
    radialBar: {
      startAngle: 90,
      endAngle: -320,
      hollow: {
        margin: 5,
        size: "50%",
        background: "#FDFDFF",
        image: undefined,
        imageWidth: 150,
        imageHeight: 150,
        imageOffsetX: 0,
        imageOffsetY: 0,
        imageClipped: true,
        position: "front",
        dropShadow: {
          enabled: false,
          top: 1,
          left: 1,
          blur: 3,
          opacity: 0.1,
        },
      },
      dataLabels: {
        show: true,
        value: {
          color: "#3D3D47",
          fontSize: "22px",
          fontFamily: "Montserrat",
          fontWeight: "500",
        },
        total: {
          show: true,
          label: "Total",
          color: "var(--light-font)",
          fontSize: "13px",
          fontFamily: "Montserrat",
          fontWeight: "400",
          formatter: function (w) {
            return "68%";
          },
        },
      },
      track: {
        background: "var(--light-color)",
        strokeWidth: "90%",
        startAngle: -100,
        endAngle: 100,
      },
    },
  },
  colors: [primary, secondary, "rgba(253, 126, 64, 0.85)"],
  stroke: {
    lineCap: "round",
  },
  series: [70, 55, 40],
  responsive: [
    {
      breakpoint: 1830,
      options: {
        chart: {
          height: 260,
          offsetX: 2,
          offsetY: 10,
        },
      },
    },
    {
      breakpoint: 1700,
      options: {
        chart: {
          height: 240,
        },
      },
    },
    {
      breakpoint: 1630,
      options: {
        chart: {
          height: 220,
        },
      },
    },
    {
      breakpoint: 1530,
      options: {
        chart: {
          height: 200,
        },
      },
    },
    {
      breakpoint: 1500,
      options: {
        chart: {
          height: 273,
          offsetX: 0,
          offsetY: 0,
        },
      },
    },
    {
      breakpoint: 1340,
      options: {
        chart: {
          height: 300,
          offsetX: 0,
          offsetY: 0,
        },
      },
    },
    {
      breakpoint: 1270,
      options: {
        chart: {
          height: 245,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        chart: {
          height: 280,
        },
      },
    },
    {
      breakpoint: 992,
      options: {
        chart: {
          height: 290,
        },
      },
    },
    {
      breakpoint: 500,
      options: {
        chart: {
          height: 250,
        },
        plotOptions: {
          radar: {
            size: 50,
          },
        },
      },
    },
    {
      breakpoint: 375,
      options: {
        chart: {
          height: 220,
        },
      },
    },
  ],
};

export const orderOverviewChartData: ApexOptions = {
  series: [
    {
      name: "Earning",
      type: "area",
      data: [
        13, 18, 23, 28, 33, 38, 43, 48, 43, 38, 33, 28, 23, 18, 13, 20, 27, 34,
        41, 48, 55, 62, 69, 76, 69, 62, 55, 48, 41, 34, 27, 20, 18, 16, 14, 12,
        10, 8, 16, 24, 32, 40, 32, 24, 16,
      ],
    },
    {
      name: "Refunds",
      type: "area",
      data: [
        48, 43, 38, 33, 28, 23, 18, 13, 18, 23, 28, 33, 38, 43, 48, 43, 38, 33,
        28, 23, 18, 13, 8, 3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 43, 38, 33, 28,
        23, 20, 18, 16, 14, 12, 10,
      ],
    },
  ],
  chart: {
    height: 268,
    type: "line",
    offsetY: 10,
    stacked: false,
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      enabledOnSeries: [0, 0],
      top: 5,
      left: 0,
      blur: 10,
      opacity: 0.4,
    },
  },
  stroke: {
    width: [2, 2],
    curve: "straight",
    dashArray: [0, 3],
  },
  grid: {
    show: true,
    strokeDashArray: 2,
    position: "back",
    borderColor: "rgba(106, 113, 133, 0.30)",
  },
  plotOptions: {
    bar: {
      columnWidth: "50%",
    },
  },
  colors: [primary, secondary],
  fill: {
    type: "gradient",
    gradient: {
      shade: "light",
      type: "vertical",
      opacityFrom: 0.4,
      opacityTo: 0,
      stops: [0, 0],
    },
  },
  labels: [
    "Jan",
    "",
    "",
    "Feb",
    "",
    "",
    "",
    "Mar",
    "",
    "",
    "",
    "Apr",
    "",
    "",
    "May",
    "",
    "",
    "",
    "Jun",
    "",
    "",
    "",
    "",
    "Jul",
    "",
    "",
    "",
    "Aug",
    "",
    "",
    "",
    "Sept",
    "",
    "",
    "Oct",
    "",
    "",
    "Nov",
    "",
    "",
    "",
    "Dec",
    "",
    "",
  ],
  annotations: {
    points: [
      {
        x: "Jan",
        y: 13,
        marker: {
          size: 5,
          fillColor: primary,
          strokeWidth: 0,
        },
      },
      {
        x: "Mar",
        y: 48,
        marker: {
          size: 5,
          fillColor: primary,
          strokeWidth: 0,
        },
      },
      {
        x: "May",
        y: 13,
        marker: {
          size: 5,
          fillColor: primary,
          strokeWidth: 0,
        },
      },
      {
        x: "Jul",
        y: 76,
        marker: {
          size: 5,
          fillColor: primary,
          strokeWidth: 0,
        },
      },
      {
        x: "Sept",
        y: 20,
        marker: {
          size: 5,
          fillColor: primary,
          strokeWidth: 0,
        },
      },
      {
        x: "Nov",
        y: 8,
        marker: {
          size: 5,
          fillColor: primary,
          strokeWidth: 0,
        },
      },
      {
        x: "Dec",
        y: 40,
        marker: {
          size: 5,
          fillColor: primary,
          strokeWidth: 0,
        },
      },
    ],
  },
  xaxis: {
    axisBorder: {
      offsetX: 0,
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  legend: {
    show: false,
  },
  yaxis: {
    min: 0,
    tickAmount: 6,
  },
  tooltip: {
    shared: false,
    intersect: false,
  },
  responsive: [
    {
      breakpoint: 1380,
      options: {
        chart: {
          height: 310,
        },
      },
    },
    {
      breakpoint: 1200,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
};

export const salesSummaryChartData: ApexOptions = {
  series: [
    {
      name: "Revenue",
      data: [
        23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 23, 11, 22, 27, 13, 22, 37,
        21, 44, 22, 30, 23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 23, 11, 22,
        27, 13, 22, 37, 21, 44, 22, 30,
      ],
    },
  ],
  chart: {
    type: "bar",
    height: 270,
    toolbar: {
      show: false,
    },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "65%",
    },
  },
  colors: ["#F4F5F8"],
  grid: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    show: true,
    width: 1,
    colors: ["transparent"],
  },
  xaxis: {
    categories: [
      "Jan",
      "",
      "",
      "Feb",
      "",
      "",
      "",
      "Mar",
      "",
      "",
      "",
      "Apr",
      "",
      "",
      "May",
      "",
      "",
      "",
      "Jun",
      "",
      "",
      "",
      "",
      "Jul",
      "",
      "",
      "",
      "Aug",
      "",
      "",
      "",
      "Sept",
      "",
      "",
      "Oct",
      "",
      "",
      "Nov",
      "",
      "",
      "",
      "Dec",
      "",
      "",
    ],
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  fill: {
    opacity: 0.7,
  },
  tooltip: {
    enabled: false,
  },
  states: {
    normal: {
      filter: {
        type: "none",
      },
    },
    hover: {
      filter: {
        type: "none",
      },
    },
    active: {
      allowMultipleDataPointsSelection: false,
      filter: {
        type: "none",
      },
    },
  },
  responsive: [
    {
      breakpoint: 405,
    },
  ],
};

export const totalProjectChartData: ApexOptions = {
  series: [65, 55, 40, 30],
  chart: {
    type: "donut",
    height: 260,
  },
  plotOptions: {
    pie: {
      expandOnClick: false,
      startAngle: -90,
      endAngle: 90,
      offsetY: 10,
      donut: {
        size: "75%",
        labels: {
          show: true,
          name: {
            offsetY: -10,
          },
          value: {
            offsetY: -50,
          },
          total: {
            show: true,
            fontSize: "14px",
            fontFamily: "Montserrat",
            fontWeight: 400,
            label: "Total",
            color: "#9B9B9B",
            formatter: (w) => "45.764",
          },
        },
      },
      customScale: 1,
      offsetX: 0,
    },
  },
  grid: {
    padding: {
      bottom: -120,
    },
  },
  legend: {
    show: false,
  },
  dataLabels: {
    enabled: false,
  },
  colors: [primary, secondary, "rgb(253, 126, 64)", "#F4F5F8"],
  responsive: [
    {
      breakpoint: 1870,
      options: {
        chart: {
          height: 250,
        },
      },
    },
    {
      breakpoint: 1780,
      options: {
        chart: {
          height: 240,
        },
      },
    },
    {
      breakpoint: 1740,
      options: {
        plotOptions: {
          pie: {
            expandOnClick: false,
            startAngle: -90,
            endAngle: 90,
            offsetY: 10,
            donut: {
              size: "70%",
              labels: {
                show: true,
                name: {
                  offsetY: -50,
                },
                value: {
                  offsetY: -30,
                },
              },
            },
          },
        },
      },
    },
  ],
};

export const totalRevenueChartData: ApexOptions = {
  series: [
    {
      name: "Desktops",
      data: [
        4, 3, 10, 9, 29, 19, 25, 9, 12, 7, 19, 5, 13, 9, 17, 2, 7, 29, 28, 20,
      ],
    },
  ],
  chart: {
    height: 150,
    type: "area",
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.5,
      opacityTo: 0.5,
      stops: [0, 100, 100],
    },
  },
  annotations: {
    xaxis: [
      {
        x: 300,
        borderWidth:2,
        fillColor:primary,
        strokeDashArray: 4,
      },
    ],
    points: [
      {
        x: 300,
        y: 13,
        marker: {
          size: 5,
          fillColor: primary, // Change the color to your desired color
          strokeColor: primary, // Change the color to your desired color
          // radius: 5,
        },
        label: {
          borderWidth: 2,
          borderColor: primary,
          text: "$8700.00",
          position: "bottom",
          offsetX: 0,
          offsetY: -40,
          style: {
            fontSize: "14px",
            fontWeight: "600",
            fontFamily: "Montserrat",
          },
        },
      },
    ],
  },

  colors: [primary],
  dataLabels: {
    enabled: false,
  },
  stroke: {
    width: [2, 2],
    curve: "straight",
  },
  grid: {
    show: false,
  },
  xaxis: {
    labels: {
      offsetX: 0,
      show: false,
    },
    axisBorder: {
      offsetX: 0,
      show: false,
    },
    axisTicks: {
      show: false,
    },
    categories: [
      "Jan",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "oct",
      "nov",
      "dec",
    ],
  },
  yaxis: {
    labels: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1200,
      options: {
        chart: {
          height: 136,
        },
      },
    },
  ],
};

export const totalClientChartData:ApexOptions = {
  series: [
    {
      name: 'series1',
      data: [10, 8, 20, 10, 9, 16, 8, 12, 9, 20, 8, 10, 9],
    },
  ],
  colors: ["#f6ecf8", "#f6ecf8", "#f6ecf8", "#f6ecf8", secondary, secondary, secondary, secondary, secondary, "#f6ecf8", "#f6ecf8", "#f6ecf8"],
  chart: {
    width: 180,
    height: 66,
    type: 'bar',
    offsetX: -1, // Set the desired border radius value
    sparkline: {
      enabled: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
  },
  plotOptions: {
    bar: {
      borderRadius: 7,
      distributed: true,
      columnWidth: '80%',
    }
  },
  responsive: [
    {
      breakpoint: 1200,
      options: {
        chart: {
          width: 150,
        },
      },
    },
    {
      breakpoint: 1090,
      options: {
        chart: {
          width: 110,
          height: 65,
        },
      },
    },
    {
      breakpoint: 767,
      options: {
        chart: {
          width: 200,
          height: 65,
        },
      },
    },
    {
      breakpoint: 460,
      options: {
        chart: {
          width: 120,
          height: 65,
        },
      },
    },
],
};

export const projectsOverviewChartData:ApexOptions = {
  series: [
    {
      name: "This Month ",
      type: "area",
      data: [100, 120, 130, 180, 120, 190, 220, 230, 200, 190, 160, 140]
    },
    {
      name: "This Month",
      type: "line",
      data: [150, 170, 180, 230, 170, 270, 290, 280, 250, 260, 200, 190],
    },
  ],
  chart: {
    height: 280,
    type: "line",
    zoom: {
      enabled: false,
    },
    toolbar: {
      show: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: [3 ,0],
    colors: "#ffffff",
    strokeColors: "#C280D2",
    strokeWidth: 2,
    offsetX: -3,
    strokeOpacity: 1,
    fillOpacity: 1,
    hover: {
        size: 6
    }
},
  stroke:{       
    width:[3,3],
    curve: ["straight" ,"straight" ],
     dashArray: [0, 8],
  },
  colors: [ secondary, primary],
  xaxis: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
      
    ],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      formatter: function (val) {
        return val + "";
      },
      style: {
        fontSize: "14px",
        colors: "$black",
        fontWeight: "500",
        fontFamily: "nunito, sans-serif",
      },
    },
  },
  fill: {
    colors: [secondary , primary],
    type: ["gradient", "solid"],
    gradient: {
      shade: 'dark',
      type: "vertical",
      shadeIntensity: 1,
      gradientToColors: [secondary , primary ],
      inverseColors: false,
      opacityFrom: 0.6,
      opacityTo: 0.2,
      stops: [0, 100, 100, 100],
    },
  },
  grid: {
    show: true,
    borderColor: "var(--light-color)",
    strokeDashArray: 0,
    position: "back",
    xaxis: {
      lines: {
        show: true,
      },
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  },
  legend: {
    show: false,
  },
  responsive: [

    {
      breakpoint:1400,
      options:{
        chart:{
          offsetY: 30,
        }
      }
    },
    {
      breakpoint:1300,
      options:{
        series: [
          {
            name: "This Month ",
            type: "area",
            data: [100, 120, 130, 180, 120, 190, 220, 230]
          },
          {
            name: "This Month",
            type: "line",
            data: [150, 170, 180, 230, 170, 270, 290, 280],
          },
        ],
      }
    },
    {
      breakpoint:1200,
      options:{
        chart:{
          height: 270,
        }
      }
    },
    {
      breakpoint: 360,
      options:{
        series: [
          {
            name: "This Month ",
            type: "area",
            data: [100, 120, 130, 180, 120, 190]
          },
          {
            name: "This Month",
            type: "line",
            data: [150, 170, 180, 230, 170, 270],
          },
        ],
      }
    },
  ],
};

export const activityReportChartData:ApexOptions = {
  series: [{
    name: 'Net Profit',
    data: [105, 58, 20, 64, 120, 105, 65]
  }, {
    name: 'Revenue',
    data: [77, 77, 58, 80, 37, 78, 52]
  }, {
    name: 'Free Cash Flow',
    data: [20, 38, 105, 52, 78, 17, 17]
  }],
  chart: {
    type: 'bar',
    height: 300,
    toolbar: {
      show: false,
    },
  },
  colors: [primary, secondary, "rgb(253, 126, 64)"],
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '45%',
    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    show: true,
    width: 2,
    colors: ['transparent']
  },
  xaxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisBorder: {
      offsetX: 0,
      show: false,
    },
    axisTicks:{
      show: false,
    }
  },
  legend: {
    show: false
  },
  yaxis: {
    labels: {
      show: false,
    },
  },
  grid: {
    show: true,
    strokeDashArray: 3,
    borderColor: 'rgba(106, 113, 133, 0.30)',
  },
  fill: {
    opacity: 1
  },
  tooltip: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 480,
      options:{
        chart:{
          height: 250,
        }
      }
    },
  ],
};

export const teamMembersOneChart:ApexOptions = {
  series: [{
    name: 'team 1',
    data: [5, 10, 5, 10, 5, 14, 12, 14, 15]
  }
  ],
  chart: {
    width: 100,
    height: 80,
    type: 'line',
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      top: 2,
      left: 3,
      blur: 3,
      color: primary,
      opacity: 0.2
    }
  },
  grid: {
    yaxis: {
      lines: {
        show: false,
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: [2, 4],
    curve: 'straight',
  },
  xaxis: {
    offsetX: 0,
    offsetY: 0,
    labels: {
      offsetX: 0,
      show: false,
    },
    axisBorder: {
      offsetX: 0,
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  legend: {
    show: false
  },
  yaxis: {
    show: false,
  },
  tooltip: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint:1490,
      options:{
        chart:{
          width: 70,
        }
      }
    },
  ],
  colors: [primary],
};

export const teamMembersTwoChart:ApexOptions = {
  series: [{
    name: 'team 1',
    data: [5, 10, 15, 5, 20, 19, 18, 20, 5, 8, 20, 5, 10, 12, 15, 17]
  }
  ],
  chart: {
    width: 100,
    height: 80,
    type: 'line',
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      top: 2,
      left: 3,
      blur: 3,
      color: secondary,
      opacity: 0.2
    }
  },
  grid: {
    yaxis: {
      lines: {
        show: false,
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: [2, 4],
    curve: 'straight',
  },
  xaxis: {
    offsetX: 0,
    offsetY: 0,
    labels: {
      offsetX: 0,
      show: false,
    },
    axisBorder: {
      offsetX: 0,
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  legend: {
    show: false
  },
  yaxis: {
    show: false,
  },
  tooltip: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint:1490,
      options:{
        chart:{
          width: 70,
        }
      }
    },
  ],
  colors: [secondary],
};

export const teamMembersThreeChart:ApexOptions = {
  series: [{
    name: 'team 1',
    data: [5, 15, 8, 12, 15, 18, 20, 25, 15, 10, 15, 12, 25, 20, 5, 10]
  }
  ],
  chart: {
    width: 100,
    height: 85,
    type: 'line',
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      top: 2,
      left: 3,
      blur: 3,
      color: "#FD7E40",
      opacity: 0.2
    }
  },
  grid: {
    yaxis: {
      lines: {
        show: false,
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: [2, 4],
    curve: 'straight',
  },
  xaxis: {
    offsetX: 0,
    offsetY: 0,
    labels: {
      offsetX: 0,
      show: false,
    },
    axisBorder: {
      offsetX: 0,
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  legend: {
    show: false
  },
  yaxis: {
    show: false,
  },
  tooltip: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint:1490,
      options:{
        chart:{
          width: 70,
        }
      }
    },
  ],
  colors: ["#FD7E40"],
};

export const teamMembersFourChart:ApexOptions = {
  series: [{
    name: 'team 1',
    data: [5, 10, 8, 20, 20, 8, 25, 22, 18, 18]
  }
  ],
  chart: {
    width: 100,
    height: 80,
    type: 'line',
    toolbar: {
      show: false,
    },
    dropShadow: {
      enabled: true,
      top: 2,
      left: 3,
      blur: 3,
      color: primary,
      opacity: 0.2
    }
  },
  grid: {
    yaxis: {
      lines: {
        show: false,
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: [2, 4],
    curve: 'straight',
  },
  xaxis: {
    offsetX: 0,
    offsetY: 0,
    labels: {
      offsetX: 0,
      show: false,
    },
    axisBorder: {
      offsetX: 0,
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  legend: {
    show: false
  },
  yaxis: {
    show: false,
  },
  tooltip: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint:1490,
      options:{
        chart:{
          width: 70,
        }
      }
    },
  ],
  colors: [primary],
};
