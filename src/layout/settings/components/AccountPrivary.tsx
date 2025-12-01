import  { useState } from 'react'
import { useAppSelector } from '../../../store/hooks';
import { useAccountPrivacy } from '../../../hooks/user/userHook';

export const AccountPrivary = () => {
    const {user:loggedInUser} = useAppSelector((state)=>state.auth)

    const {mutateAsync:updatePrivacy} = useAccountPrivacy()
    const handlePrivacy = ()=>{
        let key = "1"
        if(loggedInUser?.isPrivate){
            key="0"
        }
        updatePrivacy({userId:loggedInUser?._id!,key:key})
    }
  return (
      <div className="text-white w-full max-w-3xl theme-text-primary mx-auto py-8">
      
      <h2 className="text-2xl font-semibold mb-6">Account privacy</h2>

      <div className="border theme-border shadow-md rounded-3xl p-5 flex items-center justify-between mb-6">
        <span className="text-lg font-medium">Private account</span>

        <button
        onClick={()=>handlePrivacy()}
          className={`w-12 h-6 rounded-full flex items-center transition-all shadow-md duration-300 ${
            loggedInUser?.isPrivate ? "bg-gradient-to-r from-blue-500 to-purplr-500" : "bg-neutral-700"
          }`}
        >
          <span
            className={`w-5 h-5 bg-white rounded-full transform transition-all duration-300 ${
              loggedInUser?.isPrivate ? "translate-x-6" : "translate-x-1"
            }`}
          ></span>
        </button>
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
