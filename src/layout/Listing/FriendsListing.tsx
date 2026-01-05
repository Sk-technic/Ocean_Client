import React, { useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import { TbCancel } from "react-icons/tb";
import SearchInput from "../../components/Inputs/SearchInputs";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { useFriendsList } from "../../hooks/user/userHook";
import { useAppSelector } from "../../store/hooks";
import { optimizeUrl } from "../../utils/imageOptimize";

type Props = {
  followers: boolean;
  following: boolean;
  setFollowers: React.Dispatch<React.SetStateAction<boolean>>;
  setFollowing: React.Dispatch<React.SetStateAction<boolean>>;
};

const FriendsListing: React.FC<Props> = ({
  followers,
  following,
  setFollowers,
  setFollowing,
}) => {
  const { user: loggedInUser } = useSelector(
    (state: RootState) => state.auth
  );

  // profile being viewed
  const { user: profileUser } = useAppSelector((state) => state.user);

  const type = followers
    ? "followers"
    : following
      ? "following"
      : null;

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFriendsList({
    userId: profileUser?._id || loggedInUser?._id!,
    viewerId: loggedInUser?._id!,
    type: type!,
  });

  const handleClose = () => {
    setFollowers(false);
    setFollowing(false);
  };

  const users = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data ?? []);
  }, [data]);


  if (!type) return null;

  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <section className="theme-bg-primary border theme-border rounded-lg w-full max-w-xl h-[500px] flex flex-col">

        {/* Header */}
        <header className="p-3 border-b theme-border flex items-center gap-2">
          <h1 className="text-lg font-semibold capitalize flex-1">
            {type}
          </h1>

          <SearchInput
            name="search"
            className="scale-90"
            rounded="full"
          />

          <button
            onClick={handleClose}
            className="hover:scale-110 transition"
          >
            <TbCancel size={20} />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1">
          {isLoading && (
            <div className="flex items-center justify-center h-full text-sm text-muted">
              Loading...
            </div>
          )}

          {isError && (
            <div className="flex items-center justify-center h-full text-sm text-red-500">
              Failed to load {type}
            </div>
          )}

          {!isLoading && users.length === 0 && (
            <div className="flex items-center justify-center h-full text-sm text-muted">
              No {type} found
            </div>
          )}

          {users.length > 0 && (
            <Virtuoso
              data={users}
              style={{ height: 400 }}

              endReached={() => {
                console.log("🔥 endReached");
                console.log({
                  hasNextPage,
                  isFetchingNextPage,
                  nextCursor: data?.pages?.[data.pages.length - 1]?.nextCursor,
                });

                if (hasNextPage && !isFetchingNextPage) {
                  fetchNextPage();
                }
              }}

              components={{
                Footer: () => {
                  if (isFetchingNextPage) {
                    return (
                      <div className="py-3 text-center text-xs text-muted">
                        Loading more...
                      </div>
                    );
                  }

                  if (!hasNextPage) {
                    return (
                      <div className="py-3 text-center text-xs text-muted">
                        No more {type}
                      </div>
                    );
                  }

                  return null;
                },
              }}

              itemContent={(index, user) => (
                <FriendRow key={user._id} user={user} />
              )}
            />
          )}

        </div>
      </section>
    </main>
  );
};

export default FriendsListing;

type FriendRowProps = {
  user: {
    _id: string;
    fullName: string;
    username: string;
    profilePic?: string;
    isFollowing?: boolean;
  };
};

const FriendRow: React.FC<FriendRowProps> = ({ user }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b animate-fadeIn theme-border">
      <div className="flex items-center gap-3">
        <img
          src={optimizeUrl(user.profilePic || '', 200) || '/profile.png'}
          alt={user.fullName}
          className="w-10 h-10 rounded-full object-cover"
        />

        <div>
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-muted">@{user.username}</p>
        </div>
      </div>

      <button className={`text-xs px-3 py-1 rounded-md ${user.isFollowing ? 'border theme-hover-effect' : ""} theme-border transition`}>
        {user.isFollowing ? "Following" : "Follow"}
      </button>
    </div>
  );
};
