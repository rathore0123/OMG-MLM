// service.js
import { useApiHelper } from '../../utils/ApiHelper';

export const useDepositFundService = () => {
    const { post, loading } = useApiHelper();

    const getDepositWalletBalance = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const getBankByCurrency = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const doDeposit = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/RequestFundForProductwalletINR`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const getCurrencyValue = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const getTRC20Address = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/GenerateDepositWalletAddress`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const getBEP20Address = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/GenerateBEP20USDTAddress`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const getBEP20AddressKYC = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/GenerateBEP20USDTAddressKYC`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const getBEP20AddressFee = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/GenerateBEP20USDTAddressFee`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const getTRC20AddressKYC = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/GenerateTRC20USDTAddressKYC`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const getFXSTTokenAddress = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/GenerateFXSTAddress`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const getDepositTransactions = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const verifyUTR = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_BASE_URL}/VerifyUTR`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    return {
        getDepositWalletBalance,
        getBankByCurrency,
        getCurrencyValue,
        doDeposit,
        getTRC20Address,
        getBEP20Address,
        getFXSTTokenAddress,
        getDepositTransactions,
        getBEP20AddressKYC,
        verifyUTR,
        getTRC20AddressKYC,
        getBEP20AddressFee,
        loading,
    };
};
