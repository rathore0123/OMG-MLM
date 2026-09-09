import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import Login from "../Component/Authentication/Login";
import BrowserAuth from "../Component/Authentication/BrowserAuth";
import ForgotPassword from "../Component/Authentication/ForgotPassword";
import ResetPassword from "../Component/Authentication/ResetPassword";
import Connectionlost from "../Component/Authentication/connectionlost";
import LayoutRoutes from "./LayoutRoutes";
import PrivateRoute from "./PrivateRoute";
import  authRoutes  from "./AuthRoutes";
import ConnectionStatusChecker from './../CheckConnection';
import RegistrationSuccess from "../Component/Authentication/RegistrationSucces/RegistrationSuccess";

/* React Router doesn't reset scroll on navigation by default — without this,
   a new page opens still scrolled to wherever the previous page was left. */
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const RouterData = () => {
  const login = localStorage.getItem("clientId");
  return (
    <BrowserRouter>
     <ScrollToTop />
     <ConnectionStatusChecker />
      <Routes>
        {login ? (
          <>
            <Route
              path={`${import.meta.env.BASE_URL}` || '/'}
              element={
                <Navigate to={`${import.meta.env.BASE_URL}/dashboard`} />
              }
            />
          </>
        ) : (
          ""
        )}
        <Route path={"/"} element={<PrivateRoute />}> 
          <Route path={`/*`} element={<LayoutRoutes />} />
        </Route>
        {authRoutes.map(({ path, Component }, i) => (
          <Route path={path} element={Component} key={i} />
        ))}
        <Route path={`${import.meta.env.BASE_URL}/login`} element={<BrowserAuth />} />
        <Route path={`${import.meta.env.BASE_URL}/loginauth`} element={<BrowserAuth />} />
        <Route path={`${import.meta.env.BASE_URL}/forgotpassword`} element={<ForgotPassword />} />
        <Route path={`${import.meta.env.BASE_URL}/resetpassword`} element={<ResetPassword />} />
        <Route path={`${import.meta.env.BASE_URL}/connection-lost`} element={<Connectionlost />} />
        <Route path={`${import.meta.env.BASE_URL}/registration-success`} element={<RegistrationSuccess  />} />
        
      </Routes>
    </BrowserRouter>
  );
};

export default RouterData;
