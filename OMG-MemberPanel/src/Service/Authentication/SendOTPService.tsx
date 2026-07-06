// service.js
import { useApiHelper } from "../../utils/ApiHelper";

export const SendOTP_Service = () => {
  const { post, loading } = useApiHelper();

  // ✅ Only API call here
  const SendOTP = async (payload: any) => {
    try {
      return await post(
        `${import.meta.env.VITE_APP_API_URL}/SendEmailOTP`,
        payload,
      );
    } catch (error) {
      console.error("Error sending OTP:", error);
      throw error;
    }
  };

  const SendAadharOTP = async (payload: any) => {
    try {
      return await post(
        `${import.meta.env.VITE_APP_ADMIN_API_URL}/SendAadharOTP`,
        payload,
      );
    } catch (error) {
      console.error("Error sending Aadhar OTP:", error);
      throw error;
    }
  };

  // ✅ Timer logic separate
  const StartTimer = (data: any) => {
    const { setOtpTimer, setIsOtpSent, seconds = 60 } = data;

    setOtpTimer(seconds);

    const intervalId = setInterval(() => {
      setOtpTimer((prev: number) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setIsOtpSent(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  };

  const FormatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;

    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  return {
    SendOTP,
    SendAadharOTP,
    StartTimer,
    FormatTime,
    loading,
  };
};
