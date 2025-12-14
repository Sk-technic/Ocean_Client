import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useAccountPrivacy } from '../../../hooks/user/userHook';
import { useParams } from 'react-router-dom';
import ToggleSwitch from '../../../components/Buttons/ToggleSwitch';
import { updateAccountPrivacy } from '../../../store/slices/authSlice';
import { useState } from 'react';
import toast from 'react-hot-toast';

export const AccountPrivary = () => {
  const { user: loggedInUser } = useAppSelector((state) => state.auth)

  const { mutateAsync: updatePrivacy } = useAccountPrivacy()
  const dispatch = useAppDispatch()
  const [isPrivate, setIsprivate] = useState<boolean>(loggedInUser?.isPrivate!)
  const handlePrivacy = async () => {
    let key = loggedInUser?.isPrivate ? "0" : "1";

    // Wrap the real API call inside a timed Promise
    const delayedPromise = new Promise((resolve, reject) => {
      const startTime = Date.now();

      updatePrivacy({ userId: loggedInUser?._id!, key })
        .then((data) => {
          const elapsed = Date.now() - startTime;
          const delay = Math.max(600 - elapsed, 0); // ensure 600ms minimum

          setTimeout(() => resolve(data), delay);
        })
        .catch((err) => reject(err));
    });

    toast.promise(delayedPromise, {
      loading: "Updating privacy...",
      success: "Privacy updated!",
      error: "Update failed",
    });

    delayedPromise.then((data: any) => {
      dispatch(updateAccountPrivacy({ userId: data._id, key: data.isPrivate }));
      setIsprivate(data.isPrivate);
    });
  };

  return (
    <div className="text-white theme-text-primary mx-auto ">

      <div className="border theme-border shadow-md rounded-lg p-5 flex items-center justify-between mb-6">
        <span className="text-lg font-medium">Private account</span>
        <ToggleSwitch value={isPrivate} onClick={() => handlePrivacy()} />
      </div>

      <p className="theme-text-muted text-xs mb-4 px-2">
        When your account is public, your profile and posts can be seen by anyone,
        on or off Instagram, even if they don't have an Instagram account.
      </p>

      <p className="theme-text-muted text-xs px-2">
        When your account is private, only the followers you approve can see what you share,
        including your photos or videos on hashtag and location pages, and your followers and
        following lists. Certain info on your profile, like your profile picture and username,
        is visible to everyone on and off Instagram.{" "}
        <span className="text-blue-400 cursor-pointer hover:underline">Learn more</span>.
      </p>
    </div>
  )
}
