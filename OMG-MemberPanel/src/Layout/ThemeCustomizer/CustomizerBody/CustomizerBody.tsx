// import MixLayout from "./MixLayout";
import SidebarIcon from "./SidebarIcon";
import LayoutType from "./LayoutType";
import SidebarType from "./SidebarType";
import UnlimitedColor from "./UnlimitedColor";

const CustomizerBody = () => {
  return (
    <div className="customizer-body">
      {/* <MixLayout /> */}
      <SidebarIcon />
      <LayoutType />
      <SidebarType />
      <UnlimitedColor />
    </div>
  );
};

export default CustomizerBody;
