/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Badges, LI, SVG, UL } from "../../AbstractElements";
import SvgIcon from "../../CommonElements/SVG/SvgIcon";
import { useAppDispatch, useAppSelector } from "../../ReduxToolkit/Hooks";
import { MenuListType, SidebarItemTypes } from "../../Type/Layout/Sidebar";
import { setSidebarClose } from "../../ReduxToolkit/Reducers/LayoutSlice";
import { Href } from "../../utils/Constant";
import { useSweetAlert } from "../../Context/SweetAlertContext";

/* ─────────────────────────────────────────────
   SVG PARSER UTILS
───────────────────────────────────────────── */

const isSvgString = (icon?: string): boolean =>
  typeof icon === "string" &&
  (icon.trimStart().startsWith("<") || icon.includes("<svg"));

const parseSvgIcon = (raw: string): string =>
  raw
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim()
    .replace(/fill="#000000"/gi, 'fill="var(--primary-start)"')
    .replace(/fill="#000"/gi, 'fill="var(--primary-start)"')
    .replace(/fill="black"/gi, 'fill="var(--primary-start)"')
    .replace(/fill="currentColor"/gi, 'fill="var(--primary-start)"')
    .replace(/opacity="0\.\d+"[^>]*fill="var\(--primary-start\)"/g, (match) =>
      match.replace('fill="var(--primary-start)"', 'fill="var(--primary-end)"'),
    );

/* ─────────────────────────────────────────────
   MENU ICON
───────────────────────────────────────────── */

const MenuIcon = ({
  icon,
  isActive,
}: {
  icon?: string;
  isActive?: boolean;
}) => {
  if (!icon) return null;

  if (isSvgString(icon)) {
    return (
      <span
        className={`sidebar-svg-icon ${isActive ? "icon-active" : ""}`}
        dangerouslySetInnerHTML={{
          __html: parseSvgIcon(icon),
        }}
      />
    );
  }

  return (
    <span
      className={`material-symbols-outlined sidebar-icon ${
        isActive ? "icon-active" : ""
      }`}
      style={{ fontSize: "20px", marginRight: "10px" }}
    >
      {icon}
    </span>
  );
};

/* ─────────────────────────────────────────────
   MENU LISTS
───────────────────────────────────────────── */

const MenuLists: React.FC<MenuListType> = ({
  menu,
  setActiveMenu,
  activeMenu,
  level,
  className,
}) => {
  const location = useLocation();

  const dispatch = useAppDispatch();

  const { sidebarClose } = useAppSelector((state) => state.layout);

  const { t } = useTranslation();

  const { ShowSuccessAlert } = useSweetAlert();

  /* ─────────────────────────────────────────────
     CHECK ACTIVE ROUTE
  ───────────────────────────────────────────── */

  const isRouteActive = (item: any): boolean => {
    if (item.path && location.pathname === item.path) {
      return true;
    }

    if (item.children?.length) {
      return item.children.some((child: any) => isRouteActive(child));
    }

    return false;
  };

  /* ─────────────────────────────────────────────
     SET ACTIVE MENU ON PAGE LOAD
  ───────────────────────────────────────────── */

  const shouldSetActive = ({ item }: SidebarItemTypes): boolean => {
    let returnValue = false;

    if (item?.path === location.pathname) {
      returnValue = true;
    }

    if (!returnValue && item?.children) {
      item.children.every((subItem: any) => {
        returnValue = shouldSetActive({ item: subItem });

        return !returnValue;
      });
    }

    return returnValue;
  };

  useEffect(() => {
    menu?.forEach((item: any) => {
      const gotValue = shouldSetActive({ item });

      if (gotValue) {
        const temp = [...activeMenu];

        temp[level] = item.title;

        setActiveMenu(temp);
      }
    });
  }, []);

  /* ─────────────────────────────────────────────
     HANDLE MENU CLICK
  ───────────────────────────────────────────── */

  const handleClick = (item: string, menu_Type?: any) => {
    const temp = [...activeMenu];

    temp[level] = item !== temp[level] ? item : "";

    /* remove deeper levels when switching menu */
    temp.splice(level + 1);

    setActiveMenu(temp);

    if (menu_Type === "single") {
      CloseSideBar();
    }
  };

  /* ─────────────────────────────────────────────
     LOGOUT
  ───────────────────────────────────────────── */

  const HandleLogOut = () => {
    localStorage.clear();

    ShowSuccessAlert("Successfully Logged Out");
  };

  /* ─────────────────────────────────────────────
     CLOSE SIDEBAR MOBILE
  ───────────────────────────────────────────── */

  const CloseSideBar = () => {
    const Width = window.innerWidth;

    if (Width < 600) {
      dispatch(setSidebarClose(!sidebarClose));
    }
  };

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */

  return (
    <>
      {menu?.map((item, index) => {
        const routeActive = isRouteActive(item);

        const menuOpen = activeMenu[level] === item.title;

        return (
          <LI
            key={index}
            className={`
              ${level === 0 ? "sidebar-list" : ""}
              ${routeActive ? "active" : ""}
              ${menuOpen ? "open" : ""}
            `}
          >
            <Link
              className={`
                ${
                  !className
                    ? "sidebar-link sidebar-title"
                    : item.type === "sub"
                      ? "submenu-title"
                      : ""
                }

                ${routeActive ? "active" : ""}
                ${menuOpen ? "open" : ""}
              `}
              onClick={() =>
                item.title === "SignOut"
                  ? HandleLogOut()
                  : handleClick(item.title, item.menu_type)
              }
              to={
                item.title === "SignOut"
                  ? `${import.meta.env.BASE_URL}/login`
                  : item.path
                    ? item.path
                    : Href
              }
              target={
                item.path ===
                "https://mimpiglobal.xyz/MimpiGlobalBusinessPlan.pdf"
                  ? "_blank"
                  : undefined
              }
              rel="noreferrer noopener"
            >
              {/* ICON */}

              {level === 0 ? (
                <MenuIcon icon={item.icon} isActive={routeActive || menuOpen} />
              ) : (
                level === 1 && <SVG className="svg-menu" iconId="right-3" />
              )}

              {/* TITLE */}

              <span className="text-Primary">{t(item.title)}</span>

              {/* LOTTERY GIF */}

              {item.title === "Lottery" && (
                <img
                  style={{ width: "30px" }}
                  src="https://i.pinimg.com/originals/e4/bc/07/e4bc0799c9451146ee915317f92800ef.gif"
                  alt="lottery"
                />
              )}

              {/* BADGE */}

              {item.badge && (
                <Badges pill color="primary">
                  {item.badge}
                </Badges>
              )}

              {/* CHEVRON */}

              {item.children && (
                <SvgIcon iconId="chevron-right" className="feather" />
              )}
            </Link>

            {/* SUBMENU */}

            {item.children && (
              <UL
                className={`simple-list ${
                  level !== 0
                    ? "nav-sub-childmenu submenu-content"
                    : "sidebar-submenu"
                }`}
                style={{
                  display: menuOpen || routeActive ? "block" : "none",
                }}
              >
                <span onClick={() => CloseSideBar()}>
                  <MenuLists
                    menu={item.children}
                    activeMenu={activeMenu}
                    setActiveMenu={setActiveMenu}
                    level={level + 1}
                    className="sidebar-submenu"
                  />
                </span>
              </UL>
            )}
          </LI>
        );
      })}
    </>
  );
};

export default MenuLists;
