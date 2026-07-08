// ApiHelper.tsx
import axios, { AxiosRequestConfig } from "axios";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { decryptData } from "./helper/Crypto";

// --------------------------------------------
// Create a single Axios instance
// --------------------------------------------
const api = axios.create({
  baseURL: "/",
});

// --------------------------------------------
// Member Panel's own session keys (localStorage is shared
// per-origin with AdminPanel in production — /admin and /member
// are the same origin, just different paths — so logout here
// must NOT touch keys it doesn't own, e.g. via localStorage.clear()).
// --------------------------------------------
const MEMBER_SESSION_KEYS = [
  "member_authtoken",
  "ClientDetails",
  "clientId",
  "userToken",
  "UserId",
  "UserName",
  "UID",
  "MemberName",
  "EmailId",
  "MobileNo",
  "ProfilePic",
  "refURL",
  "memberemail",
  "RankName",
];

export const clearMemberSession = () => {
  MEMBER_SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

// --------------------------------------------
// REQUEST INTERCEPTOR → Auto attach token
// --------------------------------------------
api.interceptors.request.use(
  (config) => {
    const encryptedToken = localStorage.getItem("member_authtoken");
    if (encryptedToken) {
      const token = decryptData(encryptedToken);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// --------------------------------------------
// RESPONSE INTERCEPTOR → Auto logout on 401
// --------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("401 Unauthorized → Logging out user");

      clearMemberSession();
      sessionStorage.clear();
      window.location.href = "/member/loginauth";
    }

    return Promise.reject(error);
  },
);

// --------------------------------------------
// ⭐ Export raw axios instance so non-hook
//    consumers (e.g. ProfileContext which lives
//    outside <Router>) can use it directly.
//    Interceptors (auth token + 401) still apply.
// --------------------------------------------
export { api as rawApi };

// --------------------------------------------
// HOOK: useApiHelper  (requires <Router>)
// --------------------------------------------
export const useApiHelper = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ← needs <Router>
  const cancelTokenSource = useRef(null);

  const cancelRequest = () => {
    if (cancelTokenSource.current) {
      cancelTokenSource.current.cancel("Request was cancelled");
      cancelTokenSource.current = null;
    }
  };

  const apiRequest = async (method, url, data = null, config = {}) => {
    setLoading(true);
    cancelTokenSource.current = axios.CancelToken.source();

    try {
      const response = await api({
        method,
        url,
        data,
        cancelToken: cancelTokenSource.current.token,
        ...config,
      });
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Request cancelled:", error.message);
        throw new Error("Request was cancelled");
      }
      if (error?.code === "ERR_NETWORK") {
        console.error("Network Error: Check your internet connection");
      }
      console.error(`API ${method.toUpperCase()} failed:`, error);
      throw error;
    } finally {
      setLoading(false);
      cancelTokenSource.current = null;
    }
  };

  const get = (url: string, config?: AxiosRequestConfig) =>
    apiRequest("get", url, null, config);
  const post = (url: string, data: any, config?: AxiosRequestConfig) =>
    apiRequest("post", url, data, config);
  const put = (url: string, data: any, config?: AxiosRequestConfig) =>
    apiRequest("put", url, data, config);
  const del = (url: string, config?: AxiosRequestConfig) =>
    apiRequest("delete", url, null, config);

  return { get, post, put, del, loading, cancelRequest };
};
