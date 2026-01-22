import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFindUser } from "../../../hooks/user/userHook";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { setqueryUser } from "../../../store/slices/userSlice";
import Loader from "../../../components/Loader/Loader";
import NotFound from "../../../pages/NotFound/Notfound";
import type { queryUser, User } from "../../../types";
import ProfileHeader from "../../../ui/dashboard/profile";
import FriendsListing from "../../Listing/FriendsListing";

const UserProfileComponent = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username } = useParams();

  const authUser = useAppSelector((state) => state.auth.user);
  const { user: storedUser } = useAppSelector((state) => state.user);

  const { data, isLoading } = useFindUser(username?.trim() || "");

  const [queryUserData, setQueryUserData] = useState<queryUser | null|undefined|User>(null);

  useEffect(() => {
    if (username === authUser?.username) {
      navigate("/Dashboard");
    }
  }, [username, authUser, navigate]);

  useEffect(() => {
    if (storedUser?.username === username) {
      setQueryUserData(storedUser);
      return;
    }

    if (data?.data?.[0]) {
      dispatch(setqueryUser(data.data[0]));
      setQueryUserData(data.data[0]);
      return;
    }

    setQueryUserData(null);
  }, [username, storedUser, data, dispatch]);
  const [followerList, setFollowers] = useState<boolean>(false)
  const [followingList, setFollowing] = useState<boolean>(false)
  if (isLoading) {
    return <Loader />;
  }

  if (!queryUserData) {
    return (
      <div className="max-w-6xl overflow-hidden">
        <NotFound />
      </div>
    );
  }

  return (
    <main className="w-full theme-bg-primary h-full flex flex-col justify-start items-center ">
      <ProfileHeader user={queryUserData}  setFollowers={setFollowers}  setFollowing={setFollowing}/>
  {(followerList || followingList) && <div className={`w-full flex items-center justify-center h-full absolute dark:bg-white/10 top-0 `}>
        <FriendsListing followers={followerList} following={followingList} setFollowers={setFollowers} setFollowing={setFollowing} />
      </div>}    </main>
  );
};

export default UserProfileComponent;
