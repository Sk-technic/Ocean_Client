import React from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { Bell } from "lucide-react";
import { useAcceptRequest, useMuteFollow, useRejectRequest } from "../../../hooks/follow/followHook";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { removeNotification, updateNotification } from "../../../store/slices/notification/notificationSlice";
import toast from "react-hot-toast";

const NotificationInbox: React.FC = () => {
  const { notifications } = useAppSelector(
    (state) => state.notification
  );
  const { mutate: acceptrequest } = useAcceptRequest()
  const { mutateAsync: rejectRequest } = useRejectRequest()

  const dispatch = useAppDispatch()
  const handleacceptRequest = (data: any) => {
    if (!data) return;
    console.log(data);

    acceptrequest({ userId: data?.actor?._id, notificationId: data?._id }, {
      onSuccess: () => {

        dispatch(updateNotification({ type: "follow", id: data?._id }))
      }
    })
  }

  const handleRejectRequest = (data: any) => {
    if (!data) return;
    rejectRequest({ userId: data?.actor?._id, notificationId: data?._id }, {
      onSuccess: () => {
        dispatch(removeNotification({ notificationId: data?._id }))
      }
    })
  }

// const {mutateAsync:MuteFollow} = useMuteFollow()
//   const handleBlock = (data:any)=>{
//         MuteFollow(data?.actor?._id,{
//           onSuccess:()=>{
//             toast.success("user muted")
//                     dispatch(removeNotification({ notificationId: data?._id }))

//           }
//         })
//   }




  if (notifications?.length < 1 || 0) {
    return (
      <main className="w-full border-l-2 theme-border h-full flex flex-col items-center justify-between gap-3 animate-fadeIn">
 <div className=" w-full item-start px-5 py-5 text-2xl font-bold">
          <h1>Notifications</h1>
        </div>
        <div className="w-full h-full flex flex-col items-center justify-center gap-5">

        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--accent-secondary)] shadow-md">
          <span className="text-2xl theme-text-primary"><Bell /></span>
        </div>

        <h3 className="text-lg font-semibold theme-text-primary">
          No Notifications Yet
        </h3>

        <p className="text-sm theme-text-muted text-center max-w-sm leading-relaxed">
          You're all caught up! New updates, requests, and activity will appear here whenever someone interacts with you.
        </p>
        </div>
      </main>
    );
  }


  return (
    <main className="w-full border-l-2 theme-border  h-[100%] flex items-start justify-start shadow-sm overflow-hidden">
      <section className="w-full h-[100%] flex flex-col items-center justify-end  theme-border">
        <div className=" w-full item-start px-5 py-5 text-2xl font-bold">
          <h1>Notifications</h1>
        </div>
        <section className="w-full h-full overflow-y-scroll custom-scrollbar">
          {notifications?.map((n, index) => (
            <div
              key={index}
              className="flex flex-col items-start border-b theme-border hover:cursor-pointer p-2 hover:bg-[var(--accent-secondary)] transition-all duration-500"
            >
              <div className=" w-full flex items-center  jutify-start gap-2">

                <img
                  src={optimizeUrl(n?.actor?.profilePic || '', 300) || "/profile-dummy.png"}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 theme-border"
                />

                <div className="flex-1 flex flex-col">
                  <p className="text-xs theme-text-primary">
                    <span className="font-semibold">{n?.actor?.username}</span>{" "}
                    {n?.message}
                  </p>

                  <span className="text-[12px] theme-text-muted mt-1">
                    {/* {useTimeAgo(n?.createdAt.toLocaleString())} */}
                    {new Date(n?.createdAt).toLocaleString()}
                  </span>
                </div>
                {!n?.isRead && (
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-1" />
                )}
              </div>

              {n?.type === "follow-request" && (
                <div className=" w-full flex justify-end">
                  <div className="flex gap-3 w-fit items-end justify-center text-xs">
                    <button

                      className="
                    px-3 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-purple-500 
                    text-white 
                    transition-all duration-200
                    shadow-lg
                    hover:cursor-pointer
                  "
                      aria-label="confirm"
                      onClick={() => handleacceptRequest(n)}
                    >
                      confirm
                    </button>

                    <button
                      onClick={() => handleRejectRequest(n)}
                      className="
                    px-3 py-2 rounded-xl theme-bg-secondary shadow-md
                    text-zinc-50/60 
                    hover:cursor-pointer
                    border border-transparent
                    hover:border-zinc-300/30
                    hover:text-white
                    duration-300
                  "
                      aria-label="reject"
                    >
                      rejected
                    </button>
                    {/* border-red-500/40 */}
                    {/* <button
                    onClick={()=>handleBlock(n)}
                      className="
                          px-3 py-2 rounded-xl theme-bg-secondary  shadow-lg 
                          text-red-500/50  
                          hover:cursor-pointer
                          border
                          border-transparent
                          hover:border-red-500/30
                          duration-300
                          hover:text-red-500/80
                          shadow-md 
                        "
                      aria-label="reject"
                    >
                      block
                    </button> */}
                  </div>
                </div>
              )}

            </div>
          ))}
        </section>
      </section>

    </main>
  );
};

export default NotificationInbox;
