import { useState } from "react";
import SearchInput from "../../components/searchHeader/SearchComponent";
import { toast } from "react-toastify";
import { useFindUser } from "../../hooks/user/userHook";
import { useDebounce } from "../../utils/useDebounce";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";
import type { queryUser } from "../../types";
import { useDispatch } from "react-redux";
import { setqueryUser } from "../../store/slices/userSlice";
const SearchLayout: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedValue = useDebounce(searchQuery, 1500);

  const { data, isLoading } = useFindUser(debouncedValue?.trim() ? debouncedValue : "");  
  const userList = data?.data || [];

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

  return (
    <main className="w-full max-w-full p-3 flex flex-col justify-start items-center gap-5 ">
      <div className="w-full">
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
      <div className="max-w-5xl w-full flex flex-col gap-3 mt-4">
        {isLoading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : userList.length > 0 ? (
          userList.map((user: any) => (
            <div
              key={user._id}
              className="flex items-center justify-between p-2 hover:theme-border hover:scale-110 hover:cursor-pointer   duration-300  transition"
            >
              {/* --- Left: Profile Info --- */}
              <div className="flex items-center gap-4" onClick={() => handleUserProfile(user)}>
                <LazyLoadImage
                  src={user.profilePic}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="flex flex-col h-12   items-start justify-start">
                  <span className="text-md font-medium theme-text-primary">{user.fullName}</span>
                  <span className="text-xs theme-text-secondary">@{user.username}</span>
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
