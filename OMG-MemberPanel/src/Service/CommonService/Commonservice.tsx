// service.js
import { useApiHelper } from '../../utils/ApiHelper';

export const useCommonService = () => {
    const { get, post, loading } = useApiHelper();

    const ApiCalling = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };

    return {
        ApiCalling,
        loading,
    };
};
