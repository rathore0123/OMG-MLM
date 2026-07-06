import { UL, LI } from "../../AbstractElements";
import { useAppDispatch, useAppSelector } from "../../ReduxToolkit/Hooks";
import SidebarMenuList from "./SidebarMenuList";
import Swal from "sweetalert2";
import SvgIcon from "../../CommonElements/SVG/SvgIcon";
import { clearMemberSession } from "../../utils/ApiHelper";
import {
  scrollToLeft,
  scrollToRight,
} from "../../ReduxToolkit/Reducers/LayoutSlice";

/* ─────────────────────────────────────────────
   Inline SVG parser + renderer
   Strips Keenthemes HTML comments and replaces
   hardcoded black fills with red-500 (#ef4444).
   Hover → red-600 (#dc2626) via CSS class.
───────────────────────────────────────────── */
const parseSvgIcon = (raw: string): string =>
  raw
    .replace(/<!--[\s\S]*?-->/g, "") // strip <!-- begin/end --> wrappers
    .trim()
    .replace(/fill="#000000"/gi, 'fill="#ef4444"') // black  → red-500
    .replace(/fill="#000"/gi, 'fill="#ef4444"')
    .replace(/fill="black"/gi, 'fill="#ef4444"')
    .replace(/fill="currentColor"/gi, 'fill="#ef4444"');

const isSvg = (icon: string) =>
  typeof icon === "string" &&
  (icon.trimStart().startsWith("<") || icon.includes("<svg"));

interface MenuIconProps {
  icon: string;
  iconColor?: string;
}

export const MenuIcon = ({ icon, iconColor }: MenuIconProps) => {
  if (isSvg(icon)) {
    return (
      <span
        className="menu-svg-icon"
        style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
        dangerouslySetInnerHTML={{ __html: parseSvgIcon(icon) }}
      />
    );
  }

  // Fallback: font / feather icon
  return (
    <i
      className={icon}
      style={{ color: iconColor ?? "#ef4444", fontSize: "18px" }}
    />
  );
};

/* ─────────────────────────────────────────────
   SIDEBAR
───────────────────────────────────────────── */
const Sidebar = () => {
  const { pinedMenu, margin } = useAppSelector((state) => state.layout);

  const { sidebarIconType, layout } = useAppSelector(
    (state) => state.themeCustomizer,
  );

  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
    });

    if (!result.isConfirmed) return;

    clearMemberSession();
    window.location.href = "portal/login";
  };

  return (
    <>
      <div className="overlay" />

      <div
        className={`page-sidebar ${
          sidebarIconType === "Colorfull icon" ? "iconcolor-sidebar" : ""
        }`}
        id="sidebarwrappers"
      >
        {/* Left scroll arrow */}
        <div
          className={`left-arrow ${margin === 0 ? "disabled" : ""}`}
          id="left-arrow"
          onClick={() => dispatch(scrollToLeft())}
        >
          <SvgIcon className="feather" iconId="arrow-left" />
        </div>

        {/* Menu container */}
        <div
          id="sidebar-menu"
          style={{
            marginLeft: layout === "horizontal-sidebar" ? `${margin}px` : "0px",
          }}
        >
          <UL className="sidebar-menu simple-list" id="simple-bar">
            {/* ── Dynamic API menu items ── */}
            <SidebarMenuList />

            {/* ── Logout ── */}
            <LI className="sidebar-list">
              <a
                className="sidebar-link sidebar-title logout-link"
                onClick={handleLogout}
                rel="noreferrer noopener"
                href="javascript:void(0)"
              >
                {/* Logout SVG icon — red-500, hover → red-600 via CSS */}
                <span
                  className="menu-svg-icon logout-svg-icon"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    marginRight: "10px",
                    flexShrink: 0,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M16 17L21 12L16 7" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M21 12H9" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`,
                  }}
                />
                <span className="text-Primary">Logout</span>
              </a>
            </LI>
          </UL>
        </div>

        {/* Right scroll arrow (uncomment if needed) */}
        {/* <div
          className={`right-arrow ${margin === -3500 ? "disabled" : ""}`}
          onClick={() => dispatch(scrollToRight())}
        >
          <SvgIcon className="feather" iconId="arrow-right" />
        </div> */}
      </div>
    </>
  );
};

export default Sidebar;
