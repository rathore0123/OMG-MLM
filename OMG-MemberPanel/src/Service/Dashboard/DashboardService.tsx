// service.js
import { useApiHelper } from '../../utils/ApiHelper';

export const useDashboardService = () => {
    const { get, post, loading } = useApiHelper();

    const fetchDashboardData = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/GetMemberDashboardData`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };

    return {
        fetchDashboardData,
        loading,
    };
};
