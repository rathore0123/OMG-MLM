// service.js
import { useApiHelper } from '../../utils/ApiHelper';

export const useBotService = () => {
    const { post, loading } = useApiHelper();

    const getFXSTWalletBalance = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    
    const doActivation = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/ActivateBot`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const buyPackage = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_ADMIN_API_URL}/BuyPackage`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const doAadharVerification = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_ADMIN_API_URL}/VerifyAadhar`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const doWithdrawal = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_ADMIN_API_URL}/VerifyAadharPlaceWithdrawal`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    return {
        getFXSTWalletBalance,
        doActivation,
        doAadharVerification,
        doWithdrawal,
        buyPackage,
        loading,
    };
};
