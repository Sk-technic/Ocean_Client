import React from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { FiCheck, FiX } from "react-icons/fi";
import { Bell } from "lucide-react";
import { useAcceptRequest } from "../../../hooks/follow/followHook";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { updateNotification } from "../../../store/slices/notification/notificationSlice";
const NotificationInbox: React.FC = () => {
  const { notifications, unreadCount } = useAppSelector(
    (state) => state.notification
  );
console.log("check: ",notifications);

  const {mutate:acceptrequest} = useAcceptRequest()

  const dispatch = useAppDispatch()
  const handleacceptRequest = (data: any) => {
    if (!data) return;

    console.log();
    
    acceptrequest({ userId: data?.fromUser?._id, notificationId: data?._id }, {
      onSuccess: () => {

        dispatch(updateNotification({ type: "follow", id: data?._id }))
      }
    })
  }





  if (notifications?.length < 1 || 0) {
    return (
      <main className="w-full p-6  flex flex-col items-center justify-center gap-3 animate-fadeIn">

        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[var(--accent-secondary)] shadow-md">
          <span className="text-2xl theme-text-primary"><Bell /></span>
        </div>

        <h3 className="text-lg font-semibold theme-text-primary">
          No Notifications Yet
        </h3>

        <p className="text-sm theme-text-muted text-center max-w-sm leading-relaxed">
          You're all caught up! New updates, requests, and activity will appear here whenever someone interacts with you.
        </p>
      </main>
    );
  }


  return (
    <main className="w-full p-4 animate-fadeIn">

      <div className="flex justify-center items-center mb-3">

        {unreadCount > 0 && (
          <span className="text-sm px-2 py-1 rounded-full bg-purple-600 text-white">
            {unreadCount} new
          </span>
        )}
      </div>

      <section className="flex flex-col items-center justify-center gap-3">
        {notifications?.map((n, index) => (
          <div
            key={index}
            className="
              flex items-center gap-3 p-3 rounded-xl 
              theme-bg-card theme-border border
              hover:bg-[var(--accent-secondary)] transition-all duration-200
            "
          >
            <img
              src={optimizeUrl(n?.fromUser?.profilePic||'', 300) || "./profile-dummy.png"}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover border theme-border"
            />

            <div className="flex-1 flex flex-col">
              <p className="text-sm theme-text-primary">
                <span className="font-semibold">{n?.fromUser?.fullName}</span>{" "}
                {n?.text}
              </p>

              <span className="text-xs theme-text-muted mt-1">
                {new Date(n?.createdAt).toLocaleString()}
              </span>
            </div>

            {n?.type === "follow-request" && (
              <div className="flex gap-3 items-center justify-center text-xs">
                <button
                  className="
                    px-3 py-2 rounded-xl bg-purple-500 
                    text-white hover:bg-green-700 
                    transition-all duration-200
                    shadow-lg
                  "
                  aria-label="confirm"
                  onClick={() => handleacceptRequest(n)}
                >
                  confirm
                </button>

                <button
                  className="
                    px-3 py-2 rounded-xl theme-bg-secondary border shadow-lg theme-border 
                    text-white hover:bg-red-600 
                    transition-all duration-200
                  "
                  aria-label="reject"
                >
                  rejected
                </button>
              </div>
            )}

            {!n?.isRead && (
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-1" />
            )}
          </div>
        ))}
      </section>
    </main>
  );
};

export default NotificationInbox;
