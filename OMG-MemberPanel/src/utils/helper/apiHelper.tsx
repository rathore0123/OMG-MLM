// ApiHelper.tsx
import axios, { AxiosRequestConfig } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
export const useApiHelper = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  const apiRequest = async (
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ) => {
    setLoading(true);
    try {
      const response = await axios({ method, url, data, ...config });

      
      return response.data;
    } catch (error:any) {
      console.log(error?.code);
      //error?.code  === "ERR_BAD_REQUEST" when 403 forbidden error serve crash 
      if (error?.code === 'ERR_NETWORK') {
        console.error('Network Error: Please check your internet connection.');
       // navigate(`${import.meta.env.BASE_URL}/connection-lost`);
      }
      console.error(`API ${method.toUpperCase()} request failed:`, error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const get = (url: string, config?: AxiosRequestConfig) => apiRequest('get', url, null, config);
  const post = (url: string, data: any, config?: AxiosRequestConfig) => apiRequest('post', url, data, config);
  const put = (url: string, data: any, config?: AxiosRequestConfig) => apiRequest('put', url, data, config);
  const del = (url: string, config?: AxiosRequestConfig) => apiRequest('delete', url, null, config);

  return { get, post, put, del, loading };
};
