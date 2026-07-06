import { useAppDispatch } from '../../../ReduxToolkit/Hooks';
import { SearchSuggestionListType } from '../../../Type/Layout/Sidebar';
import { SVG } from '../../../AbstractElements';
import { Link } from 'react-router-dom';
import { setResponsiveSearch } from '../../../ReduxToolkit/Reducers/LayoutSlice';
import { P } from '../../../AbstractElements';

const ResponsiveSearchList = ({ searchedArray, setSearchedWord }: SearchSuggestionListType) => {
  const dispatch = useAppDispatch();

  const handleClick = () => {
    setSearchedWord("");
    dispatch(setResponsiveSearch());
  };

  if (!searchedArray?.length) {
    return <P>Oops!! No results found.</P>;
  }

  return (
    <>
      {searchedArray.map((item, index) => (
        <div
          key={index}
          className={`ProfileCard u-cf${item._active ? " is-active" : ""}`}
        >
          <div className="ProfileCard-avatar">
            <SVG className="stroke-icon" iconId={item.icon} />
          </div>
          <div className="ProfileCard-details">
            <div className="ProfileCard-realName">
              <Link
                className="realname w-auto d-flex justify-content-start gap-2"
                to={item.path}
                onClick={handleClick}
              >
                {item.title}
              </Link>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ResponsiveSearchList;
