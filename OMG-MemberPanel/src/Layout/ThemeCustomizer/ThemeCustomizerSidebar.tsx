import React from "react";
import { ThemeCustomizerProps } from "../../Type/Layout/Sidebar";
import CustomizerHeader from "./CustomizerHeader";
import CustomizerBody from "./CustomizerBody/CustomizerBody";
import CustomizerFooter from "./CustomizerFooter";

const ThemeCustomizerSidebar:React.FC<ThemeCustomizerProps> = ({open,setOpen}) => {
  return (
    <section className={`setting-sidebar ${open ? "open" :""}`}>
      <CustomizerHeader setOpen={setOpen} />
      <CustomizerBody />
      <CustomizerFooter />
    </section>
  );
};

export default ThemeCustomizerSidebar;
