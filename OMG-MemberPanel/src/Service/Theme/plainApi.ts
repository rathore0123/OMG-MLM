import { decryptData } from "../../utils/helper/Crypto";
import axios from "axios";

const plainAxios = axios.create({
  baseURL: import.meta.env.VITE_EXEC_PROC,
});

// OPTIONAL: minimal interceptor if needed
plainAxios.interceptors.request.use((config) => {
  const encryptedToken = localStorage.getItem("member_authtoken");
  const token =decryptData(encryptedToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const plainUniversalService = async (payload) => {
  return plainAxios.post("/executeprocedure", payload);
};
