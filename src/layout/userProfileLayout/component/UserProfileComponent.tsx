import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useFindUser } from "../../../hooks/user/userHook";
import { useAppDispatch } from "../../../store/hooks";
import { setqueryUser } from "../../../store/slices/userSlice";
import Loader from "../../../components/Loader/Loader";
import ProfileCard from "../../../ui/dashboard/profile";
import NotFound from "../../../pages/NotFound/Notfound";
import type { RootState } from "../../../store";
import type { queryUser } from "../../../types";

const UserProfileComponent = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { username } = useParams();

  const authUser = useSelector((state: RootState) => state.auth.user);
  const { user: storedUser } = useSelector((state: RootState) => state.user);

  const { data, isLoading } = useFindUser(username?.trim() || "");

  const [queryUserData, setQueryUserData] = useState<queryUser | null>(null);

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
    <main>
      <ProfileCard user={queryUserData} />
    </main>
  );
};

export default UserProfileComponent;
