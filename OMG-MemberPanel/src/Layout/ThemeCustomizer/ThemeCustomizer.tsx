import { useState } from "react";
import ThemeCustomizerSidebar from "./ThemeCustomizerSidebar";
import { LI, UL } from "../../AbstractElements";

const ThemeCustomizer = () => {
  const [open,setOpen] = useState<boolean>(false)
  return (
    <>
      <div className="sidebar-pannle-main">
        <UL>
          <LI className="cog-click icon-btn btn-primary" onClick={()=>setOpen(true)}>
            <i className="fa fa-spin fa-cog" />
          </LI>
        </UL>
      </div>
      <ThemeCustomizerSidebar open={open} setOpen={setOpen} />
    </>
  );
};

export default ThemeCustomizer;
