import { createSlice } from "@reduxjs/toolkit";
import { BookmarkSliceType, BookmarkedDataType } from "../../Type/Layout/Sidebar";
import { bookMarkData } from "../../Data/Layout/HeaderData";

const initialState:BookmarkSliceType = {
  bookmarkedData: [...bookMarkData],
  linkItemsArray:[],
  refreshTable:false
};
  
  const bookmarkSlice = createSlice({
    name: "BookmarkSlice",
    initialState,
    reducers: {
      getLinkItemsArray: (state, action) => {
        state.linkItemsArray = action.payload;
      },
      handleBookmarkChange: (state, action) => {
        if (!action.payload.bookmarked) {
          state.bookmarkedData.push({ ...action.payload, bookmarked: !action.payload.bookmarked });
        } else {
          const tempt :BookmarkedDataType[] = [];
          state.bookmarkedData.forEach((ele) => {
            if (ele.id !== action.payload.id) {
              tempt.push(ele);
            }
          });
          state.bookmarkedData = tempt;
        }
        const temp = [...state.linkItemsArray];
        temp.splice(action.payload.id - 1, 1, { ...action.payload, bookmarked: !action.payload.bookmarked });
        state.linkItemsArray = temp;
      },
      handleStarredValue:(state,action)=> {
        state.bookmarkedData = state.bookmarkedData.filter((data)=>data.title !== action.payload.title)
      },
      
      refreshDataTable:(state, action)=>{
        state.refreshTable = !state.refreshTable
      }

  },
  });
  
  export const { getLinkItemsArray,handleBookmarkChange,handleStarredValue, refreshDataTable} = bookmarkSlice.actions;
  
  export default bookmarkSlice.reducer;