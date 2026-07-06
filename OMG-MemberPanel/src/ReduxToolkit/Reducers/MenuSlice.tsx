import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SearchSuggestionItem } from "../../Type/Layout/Sidebar";

interface MenuState {
  pages: SearchSuggestionItem[];
}

const initialState: MenuState = { pages: [] };

const MenuSlice = createSlice({
  name: "MenuSlice",
  initialState,
  reducers: {
    setMenuPages: (state, action: PayloadAction<SearchSuggestionItem[]>) => {
      state.pages = action.payload;
    },
  },
});

export const { setMenuPages } = MenuSlice.actions;
export default MenuSlice.reducer;
