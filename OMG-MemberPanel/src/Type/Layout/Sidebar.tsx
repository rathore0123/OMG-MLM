export interface HeaderTabContentType {
    tabs: string;
  }
  
  export interface SidebarMenuType {
    title: string;
    lanClass?: string;
    menucontent?: string;
    Items: SidebarItemType[];
  }
  
  export interface SidebarItemType {
    id?: number;
    title?: string;
    icon?: string;
    type?: string;
    active?: boolean;
    path?: string;
    children?: SidebarChildrenType[];
    lanClass?: string;
  }
  
  export interface SidebarChildrenType {
    path?: string;
    title: string;
    type: string;
    lanClass?: string;
    children?: SubChildrenType[];
  }
  
  export interface SubChildrenType {
    title: string;
    type: string;
    path: string;
  }
  
  export interface MenuListType {
    menu?: MenuItem[] | undefined;
    level: number;
    className?: string;
    setActiveMenu: Function;
    activeMenu: unknown[];
  }
  
  export interface SidebarItemTypes {
    item: {
      id?: number;
      title?: string | undefined;
      icon?: string;
      type?: string;
      active?: boolean;
      path?: string;
      children?: SidebarChildrenType[];
      lanClass?: string;
      Onclick?:()=> void;
    };
  }
  
  export interface MenuItem {
    title: any;
    badge?:string;
    lanClass?: string;
    menucontent?: string;
    target?:string,
    rel?:string,
    Items?: MenuItem[];
    menu_type?:string,
    id?: number;
    icon?: string;
    type?: string;
    active?: boolean;
    children?: MenuItem[];
    path?: string;
    mainTitle?: string;
    bookmark?:boolean;

  }
  
  export interface SearchSuggestionListType {
    searchedArray: SearchSuggestionItem[];
    setSearchedWord: (key: string) => void;
  }

  export interface SearchSuggestionItem {
    icon: string | undefined;
    title: string;
    path: string;
    bookmarked? : boolean;
    id?: number;
    _active?: boolean;
  }


  export interface EmptyClassType {
    searchIcon: boolean;
  }

  export interface BookmarkedDataType {
    icon?: string;
    path?: string;
    title?: string;
    color?:string
    id?: number;
    bookmarked?: boolean;
  }
  
  export interface BookmarkSliceType {
    linkItemsArray: BookmarkedDataType[]|[];
    bookmarkedData: BookmarkedDataType[];
    refreshTable:boolean

  }

export interface ThemeCustomizerProps{
  open: boolean,
  setOpen: (value:boolean) => void
}
export interface CustomizerHeaderProps{
  setOpen: (value:boolean) => void
}