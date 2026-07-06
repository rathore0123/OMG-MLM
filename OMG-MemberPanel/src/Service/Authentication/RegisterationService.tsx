import { useApiHelper } from "../../utils/ApiHelper";

export const useRegisterService = () => {
  const { post, loading } = useApiHelper();

  const sendOTP = async (payload: any) => {
    try {
      return await post(
        `${import.meta.env.VITE_APP_API_URL}/ExecuteProc`,
        payload,
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  };
  const validateSponsor = async (payload: any) => {
    try {
      return await post(
        `${import.meta.env.VITE_APP_API_URL}/CheckSponsor`,
        payload,
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  };
  const registerMember = async (payload: any) => {
    try {
      return await post(
        `${import.meta.env.VITE_APP_WEBSITEAPI_URL}/Register`,
        payload,
      );
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  };

  return {
    sendOTP,
    registerMember,
    validateSponsor,
    loading,
  };
};
