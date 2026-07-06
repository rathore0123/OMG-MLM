import { Fragment, useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../../ReduxToolkit/Hooks";
import { LI } from "../../AbstractElements";
import { useTranslation } from "react-i18next";
import { MenuItem } from "../../Type/Layout/Sidebar";
import MenuLists from "./MenuLists";
import { ApiService } from "../../Service/UniversalService/ApiService";
import { setMenuPages } from "../../ReduxToolkit/Reducers/MenuSlice";

interface RawMenu {
  FormId: number;
  FormCategoryId: number;
  ParentCategoryId: number | null;
  FormCategoryName: string;
  FormDisplayName: string;
  FormNameWithExt: string;
  Icon: string;
  IconColor: string;
  Position: number;
  ShowInMenu: boolean;
}

/* ─────────────────────────────────────────────
   SVG ICON COMPONENT
   - Strips Keenthemes HTML comments
   - Replaces ALL hardcoded fills with red-500
   - CSS handles hover → red-600
───────────────────────────────────────────── */
interface SvgIconProps {
  iconString: string;
  className?: string;
}

const SvgIcon = ({ iconString, className = "" }: SvgIconProps) => {
  const cleanSvg = iconString
    .replace(/<!--[\s\S]*?-->/g, "") // strip <!-- begin/end --> comments
    .trim()
    // override every hardcoded black fill with red-500
    .replace(/fill="#000000"/gi, 'fill="#ef4444"')
    .replace(/fill="#000"/gi, 'fill="#ef4444"')
    .replace(/fill="black"/gi, 'fill="#ef4444"')
    .replace(/fill="currentColor"/gi, 'fill="#ef4444"');

  return (
    <span
      className={`menu-svg-icon ${className}`}
      style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
      dangerouslySetInnerHTML={{ __html: cleanSvg }}
    />
  );
};

/* ─────────────────────────────────────────────
   HELPER — detect if icon field is raw SVG
───────────────────────────────────────────── */
const isSvgString = (icon: string): boolean =>
  typeof icon === "string" &&
  (icon.trimStart().startsWith("<") || icon.includes("<svg"));

/* ─────────────────────────────────────────────
   EXPORTED ICON RENDERER
   Use this wherever you render menu icons
   (MenuLists, SidebarItem, etc.)
───────────────────────────────────────────── */
export const MenuIcon = ({
  icon,
  iconColor,
}: {
  icon: string;
  iconColor?: string;
}) => {
  if (isSvgString(icon)) {
    return <SvgIcon iconString={icon} />;
  }

  // Fallback: font icon (feather / font-awesome / etc.)
  return <i className={icon} style={{ color: iconColor, fontSize: "18px" }} />;
};

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const SidebarMenuList = () => {
  const [activeMenu, setActiveMenu] = useState<string[]>([]);
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const { t } = useTranslation();
  const { pinedMenu } = useAppSelector((state) => state.layout);
  const dispatch = useAppDispatch();
  const { universalService } = ApiService();

  /* ── path builder ── */
  const makePath = (route?: string) => {
    if (!route) return "#";
    const cleanRoute = route.startsWith("/") ? route.slice(1) : route;
    return `${import.meta.env.BASE_URL}/${cleanRoute}`;
  };

  /* ── FETCH ── */
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await universalService({
          procName: "MemberMenuItems",
          Para: JSON.stringify({ ActionMode: "member" }),
        });

        const rows: RawMenu[] = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.data?.recordset)
              ? res.data.recordset
              : [];

        buildMenu(rows);
      } catch (err) {
        console.error("Menu fetch error:", err);
      }
    };

    fetchMenu();
  }, []);

  /* ── BUILD ── */
  const buildMenu = (rows: RawMenu[]) => {
    rows.sort((a, b) => (a.Position || 0) - (b.Position || 0));

    const categoryMap: Record<number, any> = {};
    const singleMenus: any[] = [];

    rows.forEach((row) => {
      if (!row.ShowInMenu) return;

      /* DASHBOARD — top-level link (no category) */
      if (row.FormCategoryId === 0) {
        singleMenus.push({
          icon: row.Icon || "home", // raw SVG string or fallback
          iconColor: row.IconColor,
          id: row.FormId,
          active: false,
          title: row.FormDisplayName,
          path: makePath(row.FormNameWithExt),
          type: "link",
        });
        return;
      }

      /* CATEGORY — first row in a group creates the parent */
      if (!categoryMap[row.FormCategoryId]) {
        categoryMap[row.FormCategoryId] = {
          icon: row.Icon || "folder", // raw SVG string or fallback
          iconColor: row.IconColor,
          id: row.FormCategoryId,
          title: row.FormCategoryName,
          route: row.FormNameWithExt,
          active: false,
          children: [],
        };
      }

      /* CHILD FORM */
      if (row.FormId !== 0) {
        categoryMap[row.FormCategoryId].children.push({
          title: row.FormDisplayName,
          path: makePath(row.FormNameWithExt),
          type: "link",
        });
      }
    });

    /* MAP CATEGORIES → menu items */
    const categoryMenus = Object.values(categoryMap).map((cat: any) => {
      if (cat.children.length === 0) {
        return {
          icon: cat.icon,
          iconColor: cat.iconColor,
          id: cat.id,
          active: false,
          title: cat.title,
          path: makePath(cat.route),
          type: "link",
        };
      }

      return {
        icon: cat.icon,
        iconColor: cat.iconColor,
        id: cat.id,
        title: cat.title,
        type: "sub",
        active: false,
        children: cat.children,
      };
    });

    const menuItems: MenuItem[] = [
      {
        title: "",
        Items: [...singleMenus, ...categoryMenus],
      },
    ];

    setMenuList(menuItems);

    // Flatten all navigable pages for the header search bar
    const flatPages = rows
      .filter((r) => r.ShowInMenu && r.FormNameWithExt && r.FormId !== 0)
      .map((r) => ({
        icon: "Home" as string,
        title: r.FormDisplayName,
        path: makePath(r.FormNameWithExt),
      }));
    dispatch(setMenuPages(flatPages));
  };

  /* ── PIN CHECK ── */
  const shouldHideMenu = (mainMenu: MenuItem) =>
    mainMenu?.Items?.map((d) => d.title).every((title) =>
      pinedMenu.includes(title || ""),
    );

  /* ── RENDER ── */
  return (
    <>
      {menuList.map((mainMenu: MenuItem, index) => (
        <Fragment key={index}>
          <LI
            className={`sidebar-main-title ${
              shouldHideMenu(mainMenu) ? "d-none" : ""
            }`}
          >
            {t(mainMenu.title)}
          </LI>

          <MenuLists
            menu={mainMenu.Items}
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            level={0}
          />
        </Fragment>
      ))}
    </>
  );
};

export default SidebarMenuList;
