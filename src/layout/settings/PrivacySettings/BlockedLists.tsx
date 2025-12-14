import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { optimizeUrl } from '../../../utils/imageOptimize'
import PrimaryButton from '../../../components/Buttons/PrimaryButoon'
import toast from 'react-hot-toast'
import { useTimeAgo } from '../../../utils/timecoverter'
import { Virtuoso } from "react-virtuoso"   // ✅ Added
import { useGetMuteUsers, useUnMuteFollow } from '../../../hooks/follow/followHook'
import { addMutedUsers, removeMutedUser } from '../../../store/slices/blockedUsers/muteUserSlice'
import Loader from '../../../components/Loader/Loader'
import { useGetBlockedUsers, useUnBlockUser } from '../../../hooks/user/userHook'

const BlockedLists: React.FC = () => {

    const { users: mutedUsers } = useAppSelector((state) => state.muteUser)

    const [isActive, setIsActive] = useState<string>("mute")
    const [seletedUser, setSelectedUser] = useState<any>(null)

    const { mutateAsync: unmuteFollowRequest, } = useUnMuteFollow()
    const handleUnMute = (m: any) => {
        unmuteFollowRequest(m?.follower?._id, {
            onSuccess: () => {
                toast.success(`${m?.follower?.fullName} is UnMuted`)
                dispatch(removeMutedUser(m?._id))
            }
        })
    }

    const time = seletedUser?.createdAt
    const createTime = useTimeAgo(time)
    const [hasUserScrolled, setHasUserScrolled] = useState(false);

    const { cursor: NextCursor } = useAppSelector((state) => state.muteUser)
    const { users: blocked } = useAppSelector((state) => state.blockedUser)
    const dispatch = useAppDispatch()
    const { loadMore, isLoadMoreLoading } = useGetMuteUsers()
    const handleFetchMutedUSers = () => {
        if (isActive == "mute") {
            if (!NextCursor) return
            loadMore(NextCursor!, {
                onSuccess: (data: any) => {
                    dispatch(addMutedUsers({ data: data?.data, cursor: data?.data?.nextCursor }))
                },
            })
        }
    }

    const { mutateAsync: unblockUser } = useUnBlockUser()
    const handleUnblock = (blockedUser: any) => {
        toast.promise(
            unblockUser(blockedUser?._id,{
                onSuccess:()=>{
                    setSelectedUser(null)
                }
            }),
            {
                loading: "Unblocking user...",
                success: "User unblocked successfully",
                error: (err) =>
                    err?.message || "Failed to unblock user",
            }
        );
    };

    const {nextCursor:BlockedCursor} = useAppSelector((state)=>state.blockedUser)

    const {loadMoreBlockUser} = useGetBlockedUsers()
    const handleLoadMoreBlockedUsers=()=>{
        if(isActive=="blocked"){
            if(!BlockedCursor) return
            loadMoreBlockUser(BlockedCursor!)
        }
    }


    return (
        <div className="w-full space-y-5 ">

            <div>
                <h1 className="text-xl font-bold">Blocked & Muted Users</h1>
                <p className="text-sm theme-text-muted mt-1">
                    Manage muted and blocked users from a single place.
                </p>
            </div>

            <main className='w-full theme-text-primary flex flex-col items-start justify-center gap-3'>

                {/* Tabs */}
                <div className='flex items-center justify-start gap-5'>
                    <button
                        onClick={() => setIsActive("mute")}
                        className={`border-b-3 hover:cursor-pointer ${isActive == "mute" ? 'border-blue-500' : 'theme-border'}`}>
                        Mute Users
                    </button>

                    <button
                        onClick={() => setIsActive("blocked")}
                        className={`border-b-3 hover:cursor-pointer ${isActive == "blocked" ? 'border-blue-500' : 'theme-border'}`}>
                        Blocked Users
                    </button>
                </div>

                {/* Empty state */}
                {((mutedUsers.length == 0 && isActive == "mute") ||
                    (blocked.length == 0 && isActive == "blocked")) && (
                        <section className='w-xl p-5 flex items-center justify-center'>
                            <div className='theme-text-primary text-disable'>
                                {`You haven’t ${isActive} anyone yet..`}
                            </div>
                        </section>
                    )}

                <main className='w-full flex items-center justify-between p-3'>

                    {/* LEFT LIST — now using Virtuoso */}
                    <section className='w-[50%] h-[460px]'>
                        <Virtuoso<any>
                            className=' overflow-y-scroll'
                            data={isActive === "mute" ? mutedUsers : blocked}
                            followOutput="smooth"

                            increaseViewportBy={300}
                            computeItemKey={(index, item) => item._id}
                            components={{
                                Footer: () => (
                                    isLoadMoreLoading ? <Loader /> : <></>
                                ),
                            }}
                            onScroll={() => {
                                if (!hasUserScrolled) setHasUserScrolled(true);
                            }}

                            atBottomStateChange={(isBottom) => {
                                if (!hasUserScrolled) return;

                                if (isBottom && isActive=="mute") handleFetchMutedUSers();
                                if (isBottom && isActive=="blocked") handleLoadMoreBlockedUsers();
                            }}


                            itemContent={(index, item: any) => {

                                const isMute = isActive === "mute"

                                return (
                                    <div
                                        key={item?._id}
                                        onMouseEnter={() => setSelectedUser(item)}
                                        // onMouseLeave={() => setSelectedUser(null)}
                                        className='flex items-center group justify-between px-5 py-2 theme-hover-effect duration-500  w-full border-r-1 theme-border'
                                    >
                                        <div className='flex items-center gap-5'>

                                            {/* Profile Image */}
                                            {isMute ? (
                                                <LazyLoadImage
                                                    src={optimizeUrl(item?.follower?.profilePic || '', 200) || '/profile-dummy.png'}
                                                    className='w-12 h-12 rounded-full border-2 theme-border object-cover'
                                                    loading='lazy'
                                                    decoding='async'
                                                />
                                            ) : (
                                                <LazyLoadImage
                                                    src={optimizeUrl(item?.blocked?.profilePic||'',200) || '/profile-dummy.png'}
                                                    className='w-12 h-12 rounded-full object-cover'
                                                    loading='lazy'
                                                    decoding='async'
                                                />
                                            )}

                                            <div>
                                                <span className='text-sm theme-text-primary'>
                                                    {isMute ? item?.follower?.username : item?.blocked?.username}
                                                </span>
                                                <span className='text-sm text-disable block'>
                                                    {isMute ? item?.follower?.fullName : item?.blocked?.fullName}
                                                </span>

                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {isMute ? (
                                            <PrimaryButton
                                                label='Unmute'
                                                fullWidth={false}
                                                width='text-xs py-1 px-2 rounded-md'
                                                onClick={() => handleUnMute(item)}
                                            />
                                        ) : (
                                            <PrimaryButton
                                                label='Unblock'
                                                fullWidth={false}
                                                width='text-xs py-1 px-2 rounded-md'
                                                onClick={() => handleUnblock(item?.blocked)}
                                            />
                                        )}
                                    </div>

                                )
                            }}
                        />
                    </section>

                    {/* RIGHT DETAIL SECTION */}
                    {((seletedUser && seletedUser?.blocked?.username !== undefined && isActive == "blocked") || (seletedUser?.follower?.username !== undefined && isActive == "mute")) && (
                        <section className="w-[50%] shadow-sm h-[460px] flex items-start justify-between p-5 theme-bg-primary">
                            <div className="w-50 flex flex-col items-start justify-center gap-3 ">
                                <h2 className="text-[15px] font-semibold theme-text-primary mb-2">
                                    {isActive === "mute" ? "Muted User Information" : "Blocked User Information"}
                                </h2>

                                {isActive === "mute" ? (
                                    <>
                                        <p className="text-xs theme-text-muted mt-4 leading-relaxed">
                                            Muting helps you control unwanted interactions without blocking the user.
                                            Muted users won’t appear in your requests or notifications.
                                        </p>
                                        <p className="text-xs theme-text-muted mt-4 leading-relaxed">
                                            You can unmute them anytime to receive future follow requests.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs theme-text-muted mt-4 leading-relaxed">
                                            Blocked users cannot see your profile, posts, or interact with you in any way.
                                        </p>
                                        <p className="text-xs theme-text-muted mt-4 leading-relaxed">
                                            You can unblock them anytime to restore interaction permissions.
                                        </p>
                                    </>
                                )}

                                {isActive != "mute" && <div className='flex flex-col items-start justify-start w-full gap-3'>
                                    <span className='text-sm'>bio</span>
                                    <span className='text-[12px] theme-text-muted'>
                                        {seletedUser?.blocked?.bio ? seletedUser?.blocked?.bio : ''}
                                    </span>
                                </div>}
                            </div>
                            <div className="flex flex-col items-start justify-center w-50 gap-3 animate-fadeIn">
                                <div className="w-full flex justify-center">
                                    {isActive === "mute" ? (
                                        <img
                                            src={optimizeUrl(seletedUser?.follower?.profilePic || "", 400) || '/profile-dummy.png'}
                                            alt="profile"
                                            className='w-50 h-50 object-cover border theme-border shadow-md animate-fadeIn'
                                        />
                                    ) : (
                                        <img
                                            src={optimizeUrl(seletedUser?.blocked?.profilePic||'',400) || '/profile-dummy.png'}
                                            alt={seletedUser?.fullName}
                                            className='w-50 h-50 object-cover border theme-border shadow-md'
                                        />
                                    )}
                                </div>

                                <span className="flex items-center gap-1 theme-text-muted text-[12px] animate-fadeIn">
                                    <p className="text-[13px] theme-text-primary">Full Name:</p>
                                    {isActive === "mute" ? seletedUser?.follower?.fullName : seletedUser?.blocked?.fullName}
                                </span>

                                <span className="flex items-center gap-1 theme-text-muted text-[12px] animate-fadeIn">
                                    <p className="text-[13px] theme-text-primary">Username:</p>
                                    {isActive === "mute" ? `${seletedUser?.follower?.username}` : `${seletedUser?.blocked?.username}`}
                                </span>

                                <span className="flex items-center gap-1 theme-text-muted text-[12px] animate-fadeIn">
                                    <p className="text-[13px] theme-text-primary">Blocked / Muted on:</p>
                                    {createTime ? createTime : 'N/A'}
                                </span>

                                <span className="flex items-center gap-1 theme-text-muted text-[12px] animate-fadeIn">
                                    <p className="text-[13px] theme-text-primary">Status:</p>
                                    {isActive === "mute" ? "Muted" : "Blocked"}
                                </span>
                            </div>
                        </section>
                    )}

                </main>
            </main>
        </div>
    )
}

export default BlockedLists
