import axios from "axios";
import React, { createContext, useContext, useState, useEffect } from "react";

interface CompanyType {
  CompanyName: string;
  CompanyLogo: string;
}

interface CompanyContextType {
  company: CompanyType | null;
  loading: boolean;
  fetchCompany: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [company, setCompany] = useState<CompanyType | null>(null);
  const [loading, setLoading] = useState(false);

  const companydetail = import.meta.env.VITE_COMPANY_DETAILS;

  const fetchCompany = async () => {
    try {
      setLoading(true);

      const res = await axios.post(companydetail, {});

      // ✅ FIX: axios data access
      const data = res?.data;

      if (Array.isArray(data) && data.length > 0) {
        setCompany(data[0]);
      }

    } catch (error) {
      console.error("Error fetching company:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ AUTO LOAD (IMPORTANT)
  useEffect(() => {
    fetchCompany();
  }, []);

  return (
    <CompanyContext.Provider value={{ company, loading, fetchCompany }}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within CompanyProvider");
  }
  return context;
};