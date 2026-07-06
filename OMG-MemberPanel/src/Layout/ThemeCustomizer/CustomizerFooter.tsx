import React from "react";
import { Btn, SVG } from "../../AbstractElements";
import SvgIcon from "../../CommonElements/SVG/SvgIcon";
import { BuyNow, Document } from "../../utils/Constant";

const CustomizerFooter = () => {
  return (
    <div className="customizer-footer">
      <div className="d-flex align-items-center justify-content-around">
        <Btn color="primary" href="https://themeforest.net/user/pixelstrap/portfolio" target="_blank" >
          <SvgIcon className="stroke-white feather me-1" iconId="shopping-cart" />
          {BuyNow}
        </Btn>
        <Btn color="primary" href="https://docs.pixelstrap.net/admin/edmin/document/" target="_blank" >
          <SVG className="stroke-white svg-w-21 me-1" iconId="Document" />
          {Document}
        </Btn>
      </div>
    </div>
  );
};

export default CustomizerFooter;
