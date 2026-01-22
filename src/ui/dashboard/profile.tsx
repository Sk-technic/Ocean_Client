import React, { useRef, useState } from "react";
import { ShieldPlus } from "lucide-react";
import type { User } from "../../types";
import { toast } from "react-hot-toast";
import Loader from "../../components/Loader/Loader";
import { BsCardImage } from "react-icons/bs";
import EditProfileForm from "../../components/forms/editProfile";
import { userHooks } from "../../hooks/user/userHook";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import ConfirmDialog from "../../components/Dailogbox/ConfirmDailog";
import UserLinksDialog from "../../components/Dailogbox/UserLinksDailoge";

import {
  FaDiscord,
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaYoutube,
} from "react-icons/fa";
import { SiThreads } from "react-icons/si";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";
import { setqueryUser } from "../../store/slices/userSlice";
import { optimizeUrl } from "../../utils/imageOptimize";
import FollowButton from "../../components/Buttons/FollowButton";
import { FcGoogle } from "react-icons/fc";
import { FaXTwitter } from "react-icons/fa6";

interface ProfileHeaderProps {
  user: User;
  onUpdateCover?: (file: File) => void;
  onUpdateProfile?: (file: File) => void;
  setFollowers: React.Dispatch<React.SetStateAction<boolean>>
  setFollowing: React.Dispatch<React.SetStateAction<boolean>>
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onUpdateCover,
  onUpdateProfile,
  setFollowers: setFollowerList,
  setFollowing: setFollowingList
}) => {
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const profileInputRef = useRef<HTMLInputElement | null>(null);

  const [showCoverDialog, setShowCoverDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [ConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [updateProfileDialogOpen, setUpdateProfileDialogOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  const { mutate: mutateCoverImage, isPending: coverPending } =
    userHooks.useUpdateCoverImage();
  const { mutate: mutateProfileImage, isPending: profilePending } =
    userHooks.useUpdateProfileImage();
  const { mutate: mutateDeleteCover } = userHooks.useDeleteCoverImage();
  const { mutate: mutateDeleteProfile } = userHooks.useDeleteProfileImage();

  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  // Check if the current profile belongs to the logged-in user
  const isOwnProfile = loggedInUser && user._id === loggedInUser._id;
 const handlefollowing = () => {
    setFollowerList(false)
    setFollowingList(prev => !prev)
  }
  const handlefollow = () => {
    setFollowingList(false)
    setFollowerList(prev => !prev)
  }
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    onUpdateCover?.(file);

    mutateCoverImage(file, {
      onSuccess: () => toast.success("Cover image updated successfully!"),
      onError: (error: any) =>
        toast.error(error?.message || "Failed to update cover image."),
    });
    setShowCoverDialog(false);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    onUpdateProfile?.(file);

    mutateProfileImage(file, {
      onSuccess: () => toast.success("Profile image updated successfully!"),
      onError: (error: any) =>
        toast.error(error?.message || "Failed to update profile image."),
    });
    setShowProfileDialog(false);
  };

  const triggerCoverDialog = () => setShowCoverDialog(true);
  const triggerProfileDialog = () => setShowProfileDialog(true);

  const triggerCoverInput = () => {
    if (!coverPending) coverInputRef.current?.click();
    else toast.success("Please wait, updating cover image...");
  };

  const triggerProfileInput = () => {
    if (!profilePending) profileInputRef.current?.click();
    else toast.success("Please wait, updating profile image...");
  };

  const deleteCover = () => {
    mutateDeleteCover(undefined, {
      onSuccess: () => {
        setConfirmDialogOpen(false);
        setShowCoverDialog(false);
      },
      onError: (error: any) =>
        toast.error(error?.message || "Failed to delete cover image."),
    });
  };

  const deleteProfile = () => {
    mutateDeleteProfile(undefined, {
      onSuccess: () => {
        setConfirmDialogOpen(false);
        setShowProfileDialog(false);
      },
      onError: (error: any) =>
        toast.error(error?.message || "Failed to delete profile image."),
    });
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setUpdateProfileDialogOpen(false);
    }, 300);
  };

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const handleMessage = () => {
    if (!loggedInUser || !user?._id) return;
    console.log(user);
    dispatch(setqueryUser(user))
    navigate(`/message`)
  };

  const bio = user.bio || "";
  const truncatedBio = bio.length > 100 ? bio.slice(0, 100) + "..." : bio;

  const socialKeys = user.socialLinks ? Object.keys(user.socialLinks) : [];

  const [followers, setFollowers] = useState<boolean>(false)

 console.log("------",user);
 
  return (
    <main className="w-full max-w-5xl h-fit">

      <main className="w-full theme-bg-primary theme-text-primary overflow-hidden transition-all duration-300">
        {/* Cover Section */}
        <div className="relative flex justify-center items-center w-full h-48 md:h-48 overflow-hidden group bg-[var(--bg-card)]">
          {user.coverImage ? (
            <LazyLoadImage
              src={optimizeUrl(user?.coverImage, 1000) || "./public/coverImage.jpg"}
              alt="cover"
              effect="opacity"
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              loading="lazy"
            />
          ) : (
            <BsCardImage size={"100px"} color="#d7d7d7" />
          )}

          {/* Edit cover button - Only show for own profile */}
          {isOwnProfile && (
            <button
              onClick={triggerCoverDialog}
              className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
            >
              {coverPending ? <Loader size={14} message="upload" /> : "Edit"}
            </button>
          )}

          <input
            type="file"
            accept="image/*"
            ref={coverInputRef}
            onChange={handleCoverChange}
            className="hidden"
          />

          {/* Cover Edit Dialog - Only show for own profile */}
          {showCoverDialog && isOwnProfile && (
            <div className="absolute top-10 right-2 w-32 bg-[var(--bg-card)] dark:bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-1 shadow-lg flex flex-col gap-1 z-50 animate-fadeIn">
              <button
                onClick={triggerCoverInput}
                className="text-xs font-medium px-2 py-1 rounded hover:bg-[var(--accent-secondary-hover)] transition-colors theme-text-primary text-center"
              >
                Edit
              </button>
              <button
                onClick={() => setConfirmDialogOpen(true)}
                className="text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-700 text-red-600 text-center transition-colors"
              >
                Delete
              </button>
              <ConfirmDialog
                open={ConfirmDialogOpen}
                onCancel={() => setConfirmDialogOpen(false)}
                onConfirm={deleteCover}
                title="Delete Cover Image?"
                message="Are you sure you want to permanently delete your Cover image?"
              />
              <button
                onClick={() => setShowCoverDialog(false)}
                className="text-xs font-medium px-2 py-1 rounded hover:bg-[var(--accent-secondary-hover)] transition-colors theme-text-primary text-center"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile + Info Section */}
        <div className="relative w-full mx-auto flex  gap-15 justify-center md:justify-end">
          {/* Profile Image */}
          <div className=" relative -top-15  w-32 h-32 md:w-40 md:h-40 group rounded-[50px] p-[10px] bg-white/20 shadow-xl backdrop-blur-md">
            <div className="w-full h-full rounded-[40px] overflow-hidden bg-[var(--bg-card)]">
              <img
                src={optimizeUrl(user?.profilePic || '', 500) || "./profile-dummy.png"}
                referrerPolicy="no-referrer"
                alt={user.username}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover bg-none rounded-[40px]"
              />
            </div>

            {/* Edit profile image button - Only show for own profile */}
            {isOwnProfile && (
              <button
                onClick={triggerProfileDialog}
                className="absolute bottom-2 right-2 text-xs px-3 py-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
              >
                {profilePending ? <Loader size={14} message="upload" /> : "Edit"}
              </button>
            )}

            <input
              type="file"
              accept="image/*"
              ref={profileInputRef}
              onChange={handleProfileChange}
              className="hidden"
            />

            {/* Profile Edit Dialog - Only show for own profile */}
            {showProfileDialog && isOwnProfile && (
              <div className="absolute bottom-10 right-2 w-32 bg-[var(--bg-card)] dark:bg-[var(--bg-card)] border border-[var(--border-primary)] rounded-xl p-1 shadow-lg flex flex-col gap-1 z-50 animate-fadeIn">
                <button
                  onClick={triggerProfileInput}
                  className="text-xs font-medium px-2 py-1 rounded hover:bg-[var(--accent-secondary-hover)] transition-colors theme-text-primary text-center"
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirmDialogOpen(true)}
                  className="text-xs font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-700 text-red-600 text-center transition-colors"
                >
                  Delete
                </button>
                <ConfirmDialog
                  open={ConfirmDialogOpen}
                  onCancel={() => setConfirmDialogOpen(false)}
                  onConfirm={deleteProfile}
                  title="Delete Profile Image?"
                  message="Are you sure you want to permanently delete your profile image?"
                />
                <button
                  onClick={() => setShowProfileDialog(false)}
                  className="text-xs font-medium px-2 py-1 rounded hover:bg-[var(--accent-secondary-hover)] transition-colors theme-text-primary text-center"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex flex-col md:flex-row justify-center w-[70%]">
            {/* Left Info */}
            <div className="h-auto w-full flex flex-col md:items-start  items-center justify-between md:items-start">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-[var(--text-primary)] flex items-center tracking-wide">
                  <span>
                    {user.username}
                  </span>
                </h1>
                {user?.isemailVerified && (
                  <span className="border p-1 rounded-full theme-border theme-bg-card shadow-sm">
                    <FcGoogle size={15} />
                  </span>
                )}
              </div>
              {user.fullName && (
                <p className="text-[13px] text-zinc-300 mt-1">
                  {user.fullName}
                </p>
              )}
              {user.language && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Based in {user.language}
                </p>
              )}

              {/* Bio with toggle */}
              <p className={`text-sm text-[var(--text-secondary)] mt-2 ${bio?"w-130" :"w-0"} leading-snug`}>
                {showFullBio ? bio : truncatedBio}{" "}
                {bio.length > 100 && (
                  <button
                    onClick={() => setShowFullBio((prev) => !prev)}
                    className="text-gray-400 cursor-pointer font-medium hover:underline"
                  >
                    {showFullBio ? "show less" : "more"}
                  </button>
                )}
              </p>

              {/* Social Links */}
              {socialKeys.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  {socialKeys.slice(0, 2).map((key) => {
                    const link = user.socialLinks?.[key];
                    const iconMap: Record<string, React.ReactElement> = {
                      discord: <FaDiscord size={18} />,
                      facebook: <FaFacebook size={18} />,
                      instagram: <FaInstagram size={18} />,
                      telegram: <FaTelegram size={18} />,
                      threads: <SiThreads size={18} />,
                      youtube: <FaYoutube size={18} />,
                      twitter:<FaXTwitter size={18} />
                    };
                    return (
                      <a
                        key={key}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--text-secondary)] hover:text-white"
                      >
                        {iconMap[key.toLowerCase()] || key}
                      </a>
                    );
                  })}

                  {socialKeys.length > 2 && !showLinks && (
                    <button
                      className="text-gray-400 cursor-pointer text-sm hover:underline"
                      onClick={() => setShowLinks(true)}
                    >
                      +{socialKeys.length - 2} more
                    </button>
                  )}
                </div>
              )}

              <UserLinksDialog
                open={showLinks}
                socialLinks={user.socialLinks || {}}
                onClose={() => setShowLinks(false)}
              />
            </div>

            {/* Right Stats + Actions */}
            <div className="flex flex-col items-center justify-between md:items-end p-1">
              <div className="flex gap-3 mt-3 md:mt-0">
                <div className="text-center">
                  <p className="text-md theme-text-muted font-normal">
                    {followers ? Number(user?.followersCount) + 1 : user?.followersCount}
                  </p>
                  <button onClick={handlefollow} className="text-xs theme-text-primary font-bold cursor-pointer duration-300">Followers</button>
                </div>
                <div className="text-center">
                  <p className="text-md theme-text-muted font-normal">{user.followingCount ?? 0}</p>
                  <button onClick={handlefollowing} className="text-xs theme-text-primary font-bold cursor-pointer duration-300">Following</button>
                </div>
                <div className="text-center">
                  <p className="text-md theme-text-muted font-normal">
                    {user.subscribersCount ?? 0}
                  </p>
                  <button onClick={() => toast.success("get subscribers")} className="text-xs theme-text-primary font-bold cursor-pointer duration-300">Subscribers</button>
                </div>
              </div>

              {/* Action Buttons - Different for own profile vs other profiles */}
              <div className="flex justify-center items-center w-full mt-5 gap-3">
                {isOwnProfile ? (
                  // Edit Profile Button for own profile
                  <button
                    onClick={() => setUpdateProfileDialogOpen(true)}
                    className="px-6 py-2 w-fit text-md font-medium rounded-xl border border-[var(--border-primary)] text-[var(--text-primary)] bg-[var(--accent-secondary-hover)] cursor-pointer hover:bg-[var(--accent-secondary)] transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  // Follow and Message buttons for other profiles
                  <>
                    <FollowButton userId={user?._id} isPrivate={user?.isPrivate!} state={user?.followStatus} setcount={setFollowers} />

                    <button
                      onClick={handleMessage}
                      className="px-6 py-2 text-md font-medium rounded-xl border border-[var(--border-primary)] text-[var(--text-primary)] bg-[var(--accent-secondary-hover)] hover:bg-[var(--accent-secondary)] transition"
                    >
                      Message
                    </button>


                  </>
                )}
              </div>

              {/* Edit Profile Modal - Only for own profile */}
              {updateProfileDialogOpen && isOwnProfile && (
                <div
                  className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ${isClosing ? "animate-fadeOut" : "animate-fadeIn"
                    }`}
                >
                  {loggedInUser && <EditProfileForm onClose={handleClose} user={loggedInUser} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      {
        !isOwnProfile &&
        (user?.isPrivate && user?.followStatus !== "accepted") &&
        <div className="w-full flex  justify-center items-center p-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 border-2 flex items-center border-[var(--text-muted)] justify-center rounded-full">
              <ShieldPlus size={25} strokeWidth={2} className="text-[var(--text-secondary)]" />
            </div>
            <div className="w-60 text-sm font-normal theme-text-secondary ">
              <h2>
                This account is private
              </h2>
              <span className="text-sm font-[300] text-zinc-500">
                Follow to see their photos and videos.
              </span>
            </div>
          </div>
        </div>

      }
    </main>
  );
};

export default ProfileHeader;