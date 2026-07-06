import { Route, Routes } from "react-router-dom";
import Layout from "../Layout/Layout";
import routes from "./Route";
import Pagenotfound from "../Pages/PageNotfound/Pagenotfound";

const LayoutRoutes = () => {
  return (
    <Routes>
      {routes.map(({ path, Component }, i) => (
        <Route element={<Layout />} key={i}>
          <Route path={path} element={Component}/>
          <Route path="*" element={<Pagenotfound/>}/>
        </Route>
      ))}
    </Routes>
  );
};

export default LayoutRoutes;
