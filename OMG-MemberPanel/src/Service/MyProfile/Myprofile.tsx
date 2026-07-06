// service.js
import { useApiHelper } from '../../utils/ApiHelper';

export const Profile_Service = () => {
    const { post, loading } = useApiHelper();

    const UpdateUser_Profile = async (payload: any) => {
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }
    };

    const GetProfile_Details = async (payload:any) =>{
        try {
            return await post(`${import.meta.env.VITE_APP_API_URL}/ExecuteProcedure`, payload);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            throw error;
        }

    }

    return {
        UpdateUser_Profile,
        GetProfile_Details,
        loading,
    };
};
