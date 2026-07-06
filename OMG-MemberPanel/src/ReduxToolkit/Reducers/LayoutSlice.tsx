import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarClose: false,
  pinedMenu: [""],
  layoutName: "",
  responsiveSearch: false,
  scroll: false,
  margin: 0,
  flip: false,
};

const LayoutSlice = createSlice({
  name: "LayoutSlice",
  initialState,
  reducers: {
    setSidebarClose: (state, action) => {
      state.sidebarClose = action.payload;
    },
    setPinedMenu: (state, action) => {
      state.pinedMenu = action.payload;
    },
    handlePined: (state, action) => {
      if (action.payload) {
        if (state.pinedMenu.includes(action.payload)) {
          let filterMenu = state.pinedMenu.filter((item) => item !== action.payload);
          state.pinedMenu = filterMenu;
        } else {
          state.pinedMenu = [...state.pinedMenu, action.payload];
        }
      }
    },
    setResponsiveSearch: (state) => {
      state.responsiveSearch = !state.responsiveSearch;
    },
    setScrollMenu: (state, action) => {
      state.scroll = action.payload;
    },
    scrollToLeft: (state) => {
      state.margin += 500;
    },
    scrollToRight: (state) => {
      state.margin -= 500;
    },
    setFlip: (state) => {
      state.flip = !state.flip;
    },
  },
});

export const {setSidebarClose, setPinedMenu, handlePined, setResponsiveSearch, setScrollMenu, scrollToLeft, scrollToRight, setFlip } = LayoutSlice.actions;

export default LayoutSlice.reducer;
