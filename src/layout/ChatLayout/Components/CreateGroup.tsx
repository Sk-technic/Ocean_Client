import React, { useMemo, useState } from "react";
import { XCircleIcon } from "lucide-react";
import { useAppSelector } from "../../../store/hooks";
import type { ChatRoom, IParticipant } from "../../../types/chat";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { optimizeUrl } from "../../../utils/imageOptimize";
import PrimaryButton from "../../../components/Buttons/PrimaryButoon";
import SearchInput from "../../../components/searchHeader/SearchComponent";
import { IoIosCheckmarkCircleOutline, IoIosCheckmarkCircle } from "react-icons/io";
import { useDebounce } from "../../../utils/useDebounce";
import { useFindUser } from "../../../hooks/user/userHook";
import type { User } from "../../../types";
import Loader from "../../../components/Loader/Loader";
import toast from "react-hot-toast";
import { UploadProfile } from "../../../components/Inputs/UploadProfile";
import MediaInput from "../../../components/Inputs/MediaInput";
import InputField from "../../../components/Inputs/Input";

type SelectableUser = {
    _id: string;
    username: string;
    fullName: string;
    profilePic?: string;
};


const CreateGroupSlider: React.FC<{
    groupSlider: boolean;
    setGroupSlider: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ groupSlider, setGroupSlider }) => {
    const { list: rooms } = useAppSelector((state) => state.chat);
    const loggedInUser = useAppSelector((state) => state.auth.user);

    /* ---------- Extract suggested users ---------- */
    const extractGroupUsers = (
        rooms: ChatRoom[],
        loggedInUserId: string
    ): IParticipant[] => {
        const map = new Map<string, IParticipant>();

        rooms.forEach((room) => {
            room?.participants?.forEach((p:IParticipant) => {
                if (p._id !== loggedInUserId) {
                    map.set(p._id, p);
                }
            });
        });

        return Array.from(map.values());
    };

    const groupUsers = useMemo(
        () => extractGroupUsers(rooms, loggedInUser!._id),
        [rooms, loggedInUser]
    );

    /* ---------- State ---------- */
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedUsers, setSelectedUsers] = useState<SelectableUser[]>([]);
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [searchValue, setSearchValue] = useState("");

    const toggleUser = (user: SelectableUser) => {
        setSelectedUsers((prev) =>
            prev.some((u) => u._id === user._id)
                ? prev.filter((u) => u._id !== user._id)
                : [...prev, user]
        );
    };

    const debouncedValue = useDebounce(searchValue, 1500);
    const { data, isLoading } = useFindUser(
        debouncedValue?.trim() ? debouncedValue : ""
    );

    const searchUsers: SelectableUser[] = useMemo(() => {
        if (!data || !Array.isArray(data)) return [];

        return data.map((u: User) => ({
            _id: u._id,
            username: u.username,
            fullName: u.fullName,
            email: u.email,
            profilePic: u.profilePic,
        }));
    }, [data]);
    const isSelected = (id: string) =>
        selectedUsers.some((u) => u._id === id);


    const handleNext = () => {
        console.log(selectedUsers);
        toast.success("way to next step")
        setStep(2)
    }

    const handleCreateGroup = (e: React.FormEvent) => {
        e.preventDefault()
        const payload = {
            name: groupName,
            description,
            avatar,
            isGroup: true,
            createdBy: loggedInUser!._id,
            groupAdmin: [loggedInUser!._id],
            participants: selectedUsers.map((u) => ({
                user: u._id,
                unreadCount: 0,
                isMuted: false,
                isArchived: false,
                lastSeenAt: new Date().toISOString(),
            })),

        };
        console.log("CREATE GROUP: ", payload);

    }


    const handleAvatarChange = (file: File | null) => {
        setAvatar(file);
    };
    return (
        <div
            className={`absolute top-0 z-[888] left-20 theme-bg-primary flex flex-col
      border-l-2 border-r-5 theme-border w-110 h-full duration-300 transition-all ease-in-out
      ${groupSlider ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0 pointer-events-none"}`}
        >
            <div className="flex items-center justify-between p-3 text-xl theme-border">
                <h3 className="font-semibold">
                    {step === 1 ? "Select Members" : "Group Info"}
                </h3>
                <XCircleIcon
                    className="cursor-pointer"
                    onClick={() => {
                        setGroupSlider(false);
                        setStep(1);
                        setSelectedUsers([]);
                    }}
                />
            </div>

            {step === 1 && (
                <section className="flex flex-col h-[600px] gap-3">
                    {/* SEARCH */}
                    <div className="w-full py-5 px-3 flex items-end justify-around border-b-4 theme-border">
                        <SearchInput
                            name="search"
                            placeholder="search user"
                            onClear={() => setSearchValue("")}
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="rounded-md "
                            width="fit"
                        />
                        <PrimaryButton
                            fullWidth={false}
                            label="Next"
                            width="w-fit px-4 h-full rounded-md"
                            onClick={() => handleNext()}
                            disabled={selectedUsers.length == 0}
                        />
                    </div>

                    <div className="flex-1 overflow-y-scroll hide-scrollbar w-full">

                        {(searchUsers.length > 0 || isLoading) && (
                            <>
                                <p className="px-5 py-2 text-xs font-semibold opacity-60">
                                    Search Results
                                </p>

                                {isLoading && <Loader />}

                                {searchUsers.filter((user) => !isSelected(user._id)).map((user) => {
                                    const isSelected = selectedUsers.some(
                                        (u) => u._id === user._id
                                    );

                                    return (
                                        <div
                                            key={user._id}
                                            onClick={() => toggleUser(user)}
                                            className="flex items-center gap-3 p-2 px-5 cursor-pointer"
                                        >
                                            <LazyLoadImage
                                                src={
                                                    optimizeUrl(user?.profilePic || "", 200) ||
                                                    "/profile.png"
                                                }
                                                className="w-9 h-9 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm">{user.username}</p>
                                                <p className="text-xs opacity-60">{user.fullName}</p>
                                            </div>
                                            {isSelected ? (
                                                <IoIosCheckmarkCircle size={24} className="text-indigo-400" />
                                            ) : (
                                                <IoIosCheckmarkCircleOutline size={24} />
                                            )}
                                        </div>
                                    );
                                })}

                                <div className="my-2 border-b theme-border" />
                            </>
                        )}
                        {selectedUsers.length > 0 && (
                            <>
                                <p className="px-5 py-2 text-xs font-semibold opacity-60">
                                    Selected
                                </p>

                                {selectedUsers.map((user) => (
                                    <div
                                        key={user._id}
                                        onClick={() => toggleUser(user)}
                                        className="flex items-center gap-3 p-2 px-5 cursor-pointer bg-indigo-500/5"
                                    >
                                        <LazyLoadImage
                                            src={
                                                optimizeUrl(user?.profilePic || "", 200) ||
                                                "/profile.png"
                                            }
                                            className="w-9 h-9 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm">{user.username}</p>
                                            <p className="text-xs opacity-60">{user.fullName}</p>
                                        </div>
                                        <IoIosCheckmarkCircle size={24} className="text-indigo-400" />
                                    </div>
                                ))}

                                <div className="my-2 border-b theme-border" />
                            </>
                        )}


                        {groupUsers.length > 0 && (
                            <>
                                <p className="px-5 py-2 text-xs font-semibold opacity-60">
                                    Suggested
                                </p>

                                {groupUsers.filter((user) => !isSelected(user._id)).map((user) => {
                                    const isSelected = selectedUsers.some(
                                        (u) => u._id === user._id
                                    );

                                    return (
                                        <div
                                            key={user._id}
                                            onClick={() =>
                                                toggleUser(user)
                                            }
                                            className="flex items-center gap-3 p-2 px-5 cursor-pointer"
                                        >
                                            <LazyLoadImage
                                                src={
                                                    optimizeUrl(user?.profilePic || "", 200) ||
                                                    "/profile.png"
                                                }
                                                className="w-9 h-9 rounded-full"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm">{user.username}</p>
                                                <p className="text-xs opacity-60">{user.fullName}</p>
                                            </div>
                                            {isSelected ? (
                                                <IoIosCheckmarkCircle size={24} className="text-indigo-400" />
                                            ) : (
                                                <IoIosCheckmarkCircleOutline size={24} />
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </div>
                </section>
            )}

            {step === 2 && (
                <form onSubmit={handleCreateGroup} className="flex flex-col justify-between w-full h-full">
                    <div>

                        <div className="p-3 h-20 flex items-center ">
                            <MediaInput accept="image" value={avatar} onChange={handleAvatarChange} name="avatar" />
                        </div>
                        <div className=" p-3 space-y-2">
                            <InputField name="groupName" label="Name" required placeholder="" type="text" onChange={(e) => setGroupName(e.target.value)} />
                            <InputField name="groupDiscription" label="Discription" placeholder="" type="text" onChange={(e) => setDescription(e.target.value)} />
                        </div>
                        <p className="text-xs theme-text-muted px-3">
                            Members: {selectedUsers.length + 1}
                        </p>
                    </div>
                    <div className="h-full overflow-y-scroll custom-scrollbar px-1 border-t-2 theme-border">
                        {
                            selectedUsers.map((u) => (
                                <div className="w-full flex p-2 theme-hover-effect items-center justify-start gap-3">
                                    <LazyLoadImage src={optimizeUrl(u?.profilePic || '', 200) || '/profile-dummy.png'} className="w-10 h-10 rounded-full" />
                                    <div className="flex flex-col items-start justify-center">
                                        <span className="text-sm font-semibold">{u?.username}</span>
                                        <span className="text-[12px] theme-text-muted">{u?.fullName}</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                    <div className="p-3 gap-5 border-t-5 theme-border flex justify-end">
                        <PrimaryButton
                            onClick={() => setStep(1)}
                            fullWidth={false}
                            cancel
                            label="Cancel"
                            width="fit px-3 py-1 rounded-md"
                        />
                        <PrimaryButton
                            fullWidth={false}
                            label="Create Group"
                            width="w-fit px-3 rounded-md"
                        />
                    </div>
                </form>

            )}

        </div>
    );
};

export default CreateGroupSlider;
