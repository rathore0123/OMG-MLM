import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const login = localStorage.getItem("clientId") ? true : false;
  return login !== false ? (
    <Outlet />
  ) : (
    <Navigate to={`${import.meta.env.BASE_URL}/loginauth`} />
  );
};

export default PrivateRoute;



