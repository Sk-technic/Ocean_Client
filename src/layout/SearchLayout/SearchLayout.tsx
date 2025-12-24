import { useState } from "react";
import SearchInput from "../../components/searchHeader/SearchComponent";
import { toast } from "react-hot-toast";
import { useFindUser } from "../../hooks/user/userHook";
import { useDebounce } from "../../utils/useDebounce";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";
import type { queryUser } from "../../types";
import { useDispatch } from "react-redux";
import { setqueryUser } from "../../store/slices/userSlice";
import { useTheme } from "../../hooks/theme/usetheme";
const SearchLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedValue = useDebounce(searchQuery, 1500);

  const { data, isLoading } = useFindUser(debouncedValue?.trim() ? debouncedValue : "");  
  
  const userList = data || [];

  const handleSearch = (query: string) => {
    if (query.trim()) {
      toast.success(`Searching for: ${query}`);
    } else {
      toast.error("Please enter a search term");
    }
  };
  const navigate = useNavigate()

  const dispatch = useDispatch()
  const handleUserProfile = (user: queryUser) => {
    dispatch(setqueryUser(user))
    navigate(`/${user.username}`)
  }

  const {theme} = useTheme()
  return (
    <main className={`w-100 max-w-full border-l-2 theme-border h-full flex flex-col justify-start items-center gap-5 hide-scrollbar theme-bg-primary`}>
      <div className=" w-full px-5 pt-5 text-2xl font-bold">
        <h1>Search</h1>
      </div>
      <div className="w-full px-5 ">
        <SearchInput
          label="Discover Content"
          name="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onSearch={() => handleSearch(searchQuery)}
          onClear={() => setSearchQuery('')}
          
        />
      </div>
      {/* --- Results Section --- */}
      <div className="w-full  flex flex-col overflow-y-scroll hide-scrollbar">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : userList.length > 0 ? (
          userList.map((user: any) => (
            <div
              key={user._id}
              className="flex items-center duration-500 theme-hover-effect justify-between hover:cursor-pointer px-10 py-2 duration-300  transition"
            >
              {/* --- Left: Profile Info --- */}
              <div className="flex items-center gap-4" onClick={() => handleUserProfile(user)}>
                <LazyLoadImage
                  src={user.profilePic || '/profile.png'}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="flex flex-col h-12   items-start justify-start">
                  <span className="text-xs font-semibold theme-text-secondary">{user.username}</span>
                  <span className="text-[12px] theme-text-muted">{user.fullName}{}</span>
                </div>
              </div>
            </div>
          ))
        ) : debouncedValue.trim() ? (
          <p className="text-center text-gray-500">No users found</p>
        ) : (
          <p className="text-center text-gray-400">Start typing to search for users...</p>
        )}
      </div>
    </main>
  );
};

export default SearchLayout;
