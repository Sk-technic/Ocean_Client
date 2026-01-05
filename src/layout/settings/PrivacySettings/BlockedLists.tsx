import React, { useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PrimaryButton from "../../../components/Buttons/PrimaryButoon";
import Loader from "../../../components/Loader/Loader";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { useTimeAgo } from "../../../utils/timecoverter";
import { useGetBlockedUsers, useUnBlockUser } from "../../../hooks/user/userHook";

const BlockedLists: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"mute" | "blocked">("mute");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [hasUserScrolled, setHasUserScrolled] = useState(false);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useGetBlockedUsers();

    const mutedUsers = useMemo(
        () => data?.pages.flatMap((p: any) => p.data.muted) ?? [],
        [data]
    );

    const blockedUsers = useMemo(
        () => data?.pages.flatMap((p: any) => p.data.blocked) ?? [],
        [data]
    );

    const createdTime = useTimeAgo(selectedUser?.createdAt);
    const detailUser = selectedUser?.blocked;
            console.log("detailUser",detailUser);
            const { mutateAsync: unBlock } = useUnBlockUser();

            const handleUnBlock = (id:string)=>{
                    unBlock(id)
                    setSelectedUser(null)
            }
            
    return (
        <div className="w-full space-y-5">
            <h1 className="text-xl font-bold">Blocked & Muted Users</h1>

            {/* Tabs */}
            <div className="flex gap-6">
                <button
                    onClick={() => setActiveTab("mute")}
                    className={activeTab === "mute" ? "border-b-2 border-blue-500" : ""}
                >
                    Muted Users
                </button>

                <button
                    onClick={() => setActiveTab("blocked")}
                    className={activeTab === "blocked" ? "border-b-2 border-blue-500" : ""}
                >
                    Blocked Users
                </button>
            </div>

            {/* Empty state */}
            {!isLoading &&
                ((activeTab === "mute" && mutedUsers.length === 0) ||
                    (activeTab === "blocked" && blockedUsers.length === 0)) && (
                    <div className="text-center text-disable py-10">
                        You haven’t {activeTab} anyone yet.
                    </div>
                )}

            <main className="flex gap-4">
                {/* LEFT LIST */}
                <section className="w-1/2 h-[460px]">
                    <Virtuoso
                        data={activeTab === "mute" ? mutedUsers : blockedUsers}
                        computeItemKey={(_, item: any) => item._id}
                        components={{
                            Footer: () =>
                                isFetchingNextPage ? <Loader /> : null,
                        }}
                        onScroll={() => !hasUserScrolled && setHasUserScrolled(true)}
                        atBottomStateChange={(isBottom) => {
                            if (hasUserScrolled && isBottom && hasNextPage) {
                                fetchNextPage();
                            }
                        }}
                        itemContent={(_, item: any) => {
                            const user = item.blocked;

                            return (
                                <div
                                    onMouseEnter={() => setSelectedUser(item)}
                                    className="flex justify-between items-center px-4 py-2 theme-hover-effect"
                                >
                                    <div className="flex gap-4">
                                        <LazyLoadImage
                                            src={optimizeUrl(user?.profilePic || "", 200) || '/profile-dummy.png'}
                                            className={`w-12 h-12 rounded-full object-cover ${user?.profilePic ? '' : 'border-2 theme-border'}`}
                                        />
                                        <div>
                                            <p className="text-sm">{user?.username}</p>
                                            <p className="text-xs text-disable">
                                                {user?.fullName}
                                            </p>
                                        </div>
                                    </div>

                                    <PrimaryButton
                                        label={activeTab === "mute" ? "Unmute" : "Unblock"}
                                        width="text-xs px-2 py-1"
                                        onClick={() =>handleUnBlock(user?._id)}
                                        fullWidth={false}
                                    />
                                </div>
                            );
                        }}
                    />
                </section>

                {/* RIGHT DETAILS */}
                {selectedUser && (
                    <section className="w-1/2 flex flex-col  theme-bg-primary h-[460px] shadow-sm rounded-sm overflow-hidden border theme-border">
                        <section
                            className="relative flex items-center justify-center p-1 bg-center bg-cover"
                            style={{
                                backgroundImage: `url(${optimizeUrl(detailUser?.profilePic || "", 400) ||
                                    "/profile-dummy.png"
                                    })`,
                            }}
                        >
                            <div className="absolute inset-0 dark:bg-black/30 bg-white/30 backdrop-blur-lg" />

                            <img
                                src={
                                    optimizeUrl(detailUser?.profilePic || "", 400) ||
                                    "/profile-dummy.png"
                                }
                                className="relative w-60 h-60 object-cover rounded"
                            />
                        </section>
                        <section className=" px-1">

                            <h3 className="font-semibold mb-3">
                                {activeTab === "mute"
                                    ? "Muted User Information"
                                    : "Blocked User Information"}
                            </h3>

                            <p className="text-xs theme-text-muted">
                                {activeTab === "mute"
                                    ? `Muting allows you to limit interruptions without blocking someone entirely.
Muted users will not trigger notifications, but their presence and activity remain visible. You can unmute them whenever you want.`
                                    : `Blocking completely restricts interaction between you and the selected user.
Blocked users cannot message you, view your profile, or engage with your content. You can unblock them at any time if you wish to allow interaction again.`}
                            </p>

                            <div className="mt-4 space-y-2 text-sm">
                                <p><b>Username:</b> {detailUser?.username}</p>
                                <p><b>Full Name:</b> {detailUser?.fullName}</p>
                                <p><b>Date:</b> {createdTime || "N/A"}</p>
                                <p><b>Status:</b> {activeTab}</p>
                            </div>
                        </section>
                    </section>
                )}
            </main>
        </div>
    );
};

export default BlockedLists;
