import React, { useState } from 'react';
import ProfileCard from '../../ui/dashboard/profile';
import { useAuthInit } from '../../hooks/auth/authHooks';
import { LuLayoutGrid } from "react-icons/lu";
import { BsFilePlay } from "react-icons/bs";
import { IoBookmarkOutline } from "react-icons/io5";
import FriendsListing from '../Listing/FriendsListing';
import PrimaryButton from '../../components/Buttons/PrimaryButoon';

const ProfilePage: React.FC = () => {

  const { data } = useAuthInit();
  const [followerList, setFollowers] = useState<boolean>(false)
  const [followingList, setFollowing] = useState<boolean>(false)
  return (
    <main className="relative theme-bg-primary min-h-screen flex flex-col">
      <section className="w-full max-w-8xl flex items-center justify-center">

        <ProfileCard
          user={{
            _id: data?.data?._id,
            username: data?.data?.username,
            fullName: data?.data?.firstName
              ? `${data.data.firstName} ${data.data.lastName}`
              : "Irene Brooks",
            bio: data?.data?.bio || '',
            profilePic: data?.data?.profilePic || '',
            followersCount: data?.data?.followersCount || 0,
            followingCount: data?.data?.followingCount || 0,
            videosCount: data?.data?.videosCount || 0,
            isVerified: data?.data?.isVerified || false,
            isemailVerified: data?.data?.isemailVerified,
            language: data?.data?.language || 'en',
            subscribersCount: data?.data?.subscribedCount || 0,
            coverImage: data?.data?.coverImage || '',
            socialLinks: data?.data?.socialLinks || null,
            isPrivate: data?.data?.isPrivate,
            status: data?.data?.status
          }}

          setFollowers={setFollowers}
          setFollowing={setFollowing}
        />
      </section>
      {(followerList || followingList) && <div className={`w-full flex items-center justify-center h-full absolute dark:bg-white/10 top-0 `}>
        <FriendsListing followers={followerList} following={followingList} setFollowers={setFollowers} setFollowing={setFollowing} />
      </div>}

      <section className="w-full max-w-8xl flex flex-col items-center justify-center">
        <div className='w-full max-w-5xl flex p-2 items-center justify-around theme-text-muted relative border-b-3 theme-border'>
          <div className='p-2 theme-hover-effect duration-300 theme-border rounded-full'>
            <LuLayoutGrid size={20} />
          </div>
          <div className='p-2 theme-hover-effect duration-300 theme-border rounded-full'>
            <BsFilePlay size={20} />
          </div>
          <div className='p-2 theme-hover-effect duration-300 theme-border rounded-full'>
            <IoBookmarkOutline size={20} />
          </div>
        </div>

      </section>


      <section className="w-full max-w-8xl h-50 flex flex-col items-center justify-center">
        <div className='w-full max-w-5xl flex p-2 items-center justify-around theme-text-muted relative'>
          <PrimaryButton label='add post'fullWidth={false} width='fit px-10 py-2'/>
          </div>
      </section>
    </main>

  );
};

export default ProfilePage;