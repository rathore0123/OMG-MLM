// service.js
import { useApiHelper } from '../../utils/ApiHelper';

export const useTransferFundService = () => {
    const { post, loading } = useApiHelper();

    const getWalletBalance = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const doTransfer = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const validateSponsor = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const doKingMakerzTransfer = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_ADMIN_API_URL}/KingMakerzTransfer`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    const doLoginKingMakerz = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_ADMIN_API_URL}/LoginWithKingMakerz`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };
    return {
        getWalletBalance,
        doTransfer,
        doKingMakerzTransfer,
        validateSponsor,
        doLoginKingMakerz,
        loading,
    };
};
