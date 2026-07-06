import { Link } from "react-router-dom";
import { LI, SVG } from "../../../AbstractElements";
import { Href } from "../../../utils/Constant";
import { FormGroup, Input } from "reactstrap";
import { ChangeEvent, useEffect, useState } from "react";
import { MenuItem, SearchSuggestionItem } from "../../../Type/Layout/Sidebar";
import { useAppDispatch } from "../../../ReduxToolkit/Hooks";
import { MenuList } from "../../../Data/Layout/Sidebar";
import { getLinkItemsArray } from "../../../ReduxToolkit/Reducers/BookmarkHeaderSlice";
import SearchSuggestionList from "./SearchSuggestionList";

const ResponsiveSearch = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [arr, setArr] = useState<SearchSuggestionItem[]>([]);
  const [searchedWord, setSearchedWord] = useState<string>("");
  const [searchedArray, setSearchedArray] = useState<SearchSuggestionItem[]>(
    [],
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    const suggestionArray: SearchSuggestionItem[] = [];
    let num = 0;
    const getAllLink = (item: MenuItem, icon: string | undefined) => {
      if (item.children) {
        item.children.forEach((ele) => {
          getAllLink(ele, icon);
        });
      } else {
        num = num + 1;
        suggestionArray.push({
          icon: icon,
          title: item.title,
          path: item.path ? item.path : "",
          bookmarked: false,
          id: num,
        });
      }
    };
    MenuList?.forEach((item) => {
      item.Items?.forEach((child) => {
        getAllLink(child, child.icon);
      });
    });
    setArr(suggestionArray);
    dispatch(getLinkItemsArray(suggestionArray));
  }, [dispatch]);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (!searchedWord) setSearchedWord("");
    setSearchedWord(e.target.value);
    let result = arr.filter((item) =>
      item.title?.toLowerCase().includes(e.target.value.toLowerCase()),
    );
    setSearchedArray(result);
  };
  return (
    <LI className="serchinput d-xl-none d-flex">
      <Link className="search-mode" to={Href} onClick={() => setOpen(!open)}>
        <SVG className="svg-color" iconId="Search" />
      </Link>
      <FormGroup className={`search-form ${open ? "open" : ""}`}>
        <Input
          type="text"
          placeholder="Search here..."
          onChange={(e) => handleSearch(e)}
          value={searchedWord}
        />
        <div
          className={`Typeahead-menu w-100 custom-scrollbar ${searchedWord.length ? "is-open" : ""}`}
        >
          <SearchSuggestionList
            searchedArray={searchedArray}
            setSearchedWord={setSearchedWord}
          />
        </div>
      </FormGroup>
    </LI>
  );
};

export default ResponsiveSearch;
