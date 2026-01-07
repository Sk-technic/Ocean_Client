import React, { useState } from "react";
import { motion } from "framer-motion";
import { useFollow, useUnFollow } from "../../hooks/follow/followHook";
import { ImSpinner2 } from "react-icons/im";
import { toast } from "react-hot-toast";

interface FollowButtonProps {
  userId: string;
  isPrivate: boolean;
  state?: string; // initial followStatus
  setcount: (value: boolean) => void;
}

type FollowState = "not-following" | "requested" | "accepted";

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  state,
  setcount,
}) => {
  const [isLoading, setLoading] = useState(false);

  const [followState, setFollowState] = useState<FollowState>(
    state === "requested" || state === "accepted" ? state : "not-following"
  );

  console.log(followState);
  
  const { mutate: follow } = useFollow();

  const getButtonText = () => {

    switch (followState) {
      case "accepted":
        return "Unfollow";
      case "requested":
        return "Requested";
      default:
        return "Follow";
    }
  };

  const handleFollowAction = () => {
    setLoading(true);

    follow(userId, {
      onSuccess: (data: any) => {
        setLoading(false);

        const status = data?.follow?.status as FollowState;
        setFollowState(status);
        if(status == "accepted"){
          setcount(true);
        }
      },
      onError: () => setLoading(false),
    });
  };

  const handleCancelRequest = () => {
    toast.success("Follow request cancelled");
    // setFollowState("not-following");
  };

  const {mutateAsync:unfollow} = useUnFollow()
  const handleUnfollow = () => {
    toast.promise(
      unfollow(userId).then(() => {
        setFollowState("not-following");
      }),
      {
        loading: "Unfollowing...",
        success: "Unfollowed successfully",
        error: "Failed to unfollow",
      }
    );
  };

  const handleClick = () => {
    if (isLoading) return;

    if (followState === "not-following") {
      return handleFollowAction();
    }

    if (followState === "requested") {
      return handleCancelRequest();
    }

    if (followState === "accepted") {
      return handleUnfollow();
    }
  };

  const buttonStyle: Record<FollowState, string> = {
    "not-following":
      "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white border-none",
    requested:
      "theme-bg-secondary theme-text-muted border theme-border cursor-not-allowed",
    accepted:
      "theme-bg-card theme-text-primary border theme-border hover:bg-[var(--accent-secondary)]",
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.92 }}
      disabled={isLoading}
      className={`
        w-50
        px-5 py-2 rounded-xl font-medium text-sm 
        flex items-center justify-center gap-2
        backdrop-blur-lg select-none
        transition-all duration-300 shadow-md
        ${buttonStyle[followState]}
      `}
    >
    
        <span>{getButtonText()}</span>
      
        {isLoading && <ImSpinner2 className="animate-spin text-white text-lg" />}
    
    </motion.button>
  );
};

export default FollowButton;
