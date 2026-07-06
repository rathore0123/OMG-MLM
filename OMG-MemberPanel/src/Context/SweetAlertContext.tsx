// src/context/SweetAlertContext.tsx
import React, { createContext, useContext } from "react";
import Swal from "sweetalert2";

interface SweetAlertContextType {
  showAlert: (title: string, text?: string) => Promise<any>;
  showInputAlert: (title: string, inputPlaceholder?: string) => Promise<any>;
  ShowSuccessAlert: (title: string) => Promise<any>;
  ShowConfirmAlert: (title: string, text?: string) => Promise<boolean>; // Updated return type
  ShowConfirmBox: (title: string, text?: string) => Promise<boolean>; // Updated return type
  ShowInvestmentConfirm: (item: any, amount: number) => Promise<boolean>;
}

const SweetAlertContext = createContext<SweetAlertContextType | undefined>(
  undefined,
);

export const SweetAlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const showAlert = (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "OK",
    });
  };

  const showInputAlert = (title: string, inputPlaceholder?: string) => {
    return Swal.fire({
      title,
      input: "text",
      inputPlaceholder,
      showCancelButton: true,
    });
  };

  const ShowSuccessAlert = (title: string) => {
    return Swal.fire({
      icon: "success",
      title,
      showConfirmButton: false,
      timer: 1500,
    });
  };

  const ShowConfirmAlert = (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed!",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      return result.isConfirmed; // Returns true if confirmed, false otherwise
    });
  };
  const ShowConfirmBox = (title: string, text?: string) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: false,
      confirmButtonText: "Procced To Deposit",
      cancelButtonText: "No, cancel!",
    }).then((result) => {
      return result.isConfirmed; // Returns true if confirmed, false otherwise
    });
  };
 const ShowInvestmentConfirm = async (item: any, amount: number) => {
  const dailyIncome = item.DailyROIPercentage
    ? ((amount * item.DailyROIPercentage) / 100).toFixed(2)
    : "0";

  const monthlyIncome = item.MonthlyROIPercentage
    ? ((amount * item.MonthlyROIPercentage) / 100).toFixed(2)
    : (parseFloat(dailyIncome) * 30).toFixed(2);

  const result = await Swal.fire({
    html: `
    <div style="font-family: Inter, sans-serif; text-align:left;">

      <!-- HEADER -->
      <div style="text-align:center;margin-bottom:20px">
        <div style="
          width:60px;
          height:60px;
          border-radius:50%;
          background:linear-gradient(135deg,#00c853,#00e676);
          display:flex;
          align-items:center;
          justify-content:center;
          margin:0 auto 10px;
          font-size:26px;
        ">
          🚀
        </div>
        <h2 style="margin:0;font-size:20px;font-weight:600;">
          Confirm Investment
        </h2>
        <p style="margin:5px 0 0;color:#94a3b8;font-size:13px;">
          Please review your plan details
        </p>
      </div>

      <!-- PLAN CARD -->
      <div style="
        background:#111827;
        padding:15px;
        border-radius:12px;
        margin-bottom:15px;
        border:1px solid #1f2937;
      ">
        <div style="font-size:14px;color:#9ca3af;">Plan</div>
        <div style="font-size:16px;font-weight:600;margin-top:4px;">
          ${item.ProductName}
        </div>

        <div style="display:flex;justify-content:space-between;margin-top:10px;">
          <div>
            <div style="font-size:12px;color:#9ca3af;">Amount</div>
            <div style="font-weight:600;">${amount}</div>
          </div>
          <div>
            <div style="font-size:12px;color:#9ca3af;">Range</div>
            <div style="font-weight:600;">
              ${item.MinAmount} - ${item.MaxAmount}
            </div>
          </div>
        </div>
      </div>

      <!-- ROI CARD -->
      <div style="
        background:#111827;
        padding:15px;
        border-radius:12px;
        border:1px solid #1f2937;
      ">
        
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#9ca3af;">Daily ROI</span>
          <b>${item.DailyROIPercentage || 0}%</b>
        </div>

        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#9ca3af;">Daily Profit</span>
          <b style="color:#00e676;">${dailyIncome}</b>
        </div>

        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="color:#9ca3af;">Monthly ROI</span>
          <b>${item.MonthlyROIPercentage || 0}%</b>
        </div>

        <div style="display:flex;justify-content:space-between;">
          <span style="color:#9ca3af;">Monthly Profit</span>
          <b style="color:#00e676;">${monthlyIncome}</b>
        </div>

      </div>

    </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Confirm & Invest",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#16a34a",
    cancelButtonColor: "#dc2626",
    background: "#020617",
    color: "#e5e7eb",
    width: "420px",
    padding: "20px",
    customClass: {
      popup: "rounded-2xl",
      confirmButton: "swal-confirm-btn",
      cancelButton: "swal-cancel-btn",
    },
  });

  return result.isConfirmed;
};
  return (
    <SweetAlertContext.Provider
      value={{
        showAlert,
        showInputAlert,
        ShowSuccessAlert,
        ShowConfirmAlert,
        ShowConfirmBox,
        ShowInvestmentConfirm
      }}
    >
      {children}
    </SweetAlertContext.Provider>
  );
};

export const useSweetAlert = (): SweetAlertContextType => {
  const context = useContext(SweetAlertContext);
  if (!context) {
    throw new Error("useSweetAlert must be used within a SweetAlertProvider");
  }
  return context;
};
