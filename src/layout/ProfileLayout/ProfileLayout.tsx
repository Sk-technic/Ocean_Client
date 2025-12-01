import React from 'react';
import ProfileCard from '../../ui/dashboard/profile';
import { useAuthInit } from '../../hooks/auth/authHooks';
import ProfileMenu from './ProfileMenu/ProfileMenu';

const ProfilePage: React.FC = () => {

  const { data } = useAuthInit();

  return (
    <main className="relative theme-bg-primary min-h-screen flex flex-col gap-5">
      <section className="w-full max-w-8xl mb-6 ">

        <ProfileCard
          user={{
            _id: data?.data?._id,
            username: data?.data?.username || "irenebrooks",
            fullName: data?.data?.firstName
              ? `${data.data.firstName} ${data.data.lastName}`
              : "Irene Brooks",
            bio: data?.data?.bio || '',
            profilePic: data?.data?.profilePic || '',
            followersCount: data?.data?.followersCount || 0,
            followingCount: data?.data?.followingCount || 0,
            videosCount: data?.data?.videosCount || 0,
            isVerified: data?.data?.isVerified || false,
            language: data?.data?.language || 'en',
            subscribersCount: data?.data?.subscribedCount || 0,
            coverImage: data?.data?.coverImage || '',
            socialLinks: data?.data?.socialLinks || null
          }}
        />
      </section>
      <section>
        <ProfileMenu/>
      </section>
    </main>

  );
};

export default ProfilePage;