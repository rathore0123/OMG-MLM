import { configureStore } from "@reduxjs/toolkit";
import BookmarkHeaderSlice from "./Reducers/BookmarkHeaderSlice";
import LayoutSlice from "./Reducers/LayoutSlice";
import ThemeCustomizerSlice from "./Reducers/ThemeCustomizerSlice";
import MenuSlice from "./Reducers/MenuSlice";

const Store = configureStore({
  reducer: {
    layout: LayoutSlice,
    bookmarkHeader:BookmarkHeaderSlice,
    themeCustomizer: ThemeCustomizerSlice,
    menu: MenuSlice,
  },
});

export default Store;

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;
