// service.js
import { useApiHelper } from '../../utils/ApiHelper';

export const useLoginService = () => {
    const { post, loading } = useApiHelper();

    const doLogin = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // throw error;
        }
    };

    return {
        doLogin,
        loading,
    };
};
