// service.js
import { useApiHelper } from '../../utils/ApiHelper';

export const useResetPasswordService = () => {
    const { post, loading } = useApiHelper();

    const doSendPassword = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_WEBSITEAPI_URL}/SendPasswordResetLink`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // throw error;
        }
    };
    const doResetPassword = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_WEBSITEAPI_URL}/Reset`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // throw error;
        }
    };
    const checkTokenValidity = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // throw error;
        }
    };
    return {
        doSendPassword,
        doResetPassword,
        checkTokenValidity,
        loading,
    };
};
