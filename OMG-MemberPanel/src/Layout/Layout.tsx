/* eslint-disable react-hooks/exhaustive-deps */
import Header from "./Header/Header";
import Sidebar from "./Sidebar/Sidebar";
import Loader from "./Loader/Loader";
import TapTop from "./TapTop/TapTop";
import { useAppDispatch, useAppSelector } from "../ReduxToolkit/Hooks";
import { Outlet } from "react-router-dom";
import Footer from "./Footer/Footer";
import { setSidebarClose } from "../ReduxToolkit/Reducers/LayoutSlice";
import { useEffect } from "react";
import ThemeCustomizer from "./ThemeCustomizer/ThemeCustomizer";
import { setLayout } from "../ReduxToolkit/Reducers/ThemeCustomizerSlice";

const Layout = () => {
  const {layout} = useAppSelector((state)=>state.themeCustomizer)
  const dispatch = useAppDispatch();
  const { sidebarClose } = useAppSelector((state) => state.layout);
  const compactSidebar = () => {
    let windowWidth = window.innerWidth;
    if (layout === "compact-wrapper") {
      if (windowWidth < 1200) {
        dispatch(setSidebarClose(true));
      } else {
        dispatch(setSidebarClose(false));
      }
    }
    else if(layout === "horizontal-sidebar"){
      if (windowWidth < 1200) {
        dispatch(setSidebarClose(true))
        dispatch(setLayout("vertical"))
      } 
      else {
        dispatch(setSidebarClose(false))
        dispatch(setLayout(localStorage.getItem("layout")))
      }
    }
  };
  useEffect(() => {
    compactSidebar();
    window.addEventListener("resize", () => {
      compactSidebar();
    });
  }, [layout]);
  return (
    <>
      <Loader />
      {/* <TapTop /> */}
      <main className={`page-wrapper ${layout} ${sidebarClose ? "sidebar-close" : "" }`} >
        <Header />
        <div className="page-body-wrapper">
          <Sidebar />
          {/* Mobile overlay — closes sidebar on outside tap */}
          {!sidebarClose && (
            <div
              className="sidebar-overlay"
              onClick={() => dispatch(setSidebarClose(true))}
            />
          )}
          <Outlet />
          <Footer />
        </div>
      </main>
      <ThemeCustomizer />
    </>
  );
};

export default Layout;
