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
import MediaInput from "../../../components/Inputs/MediaInput";
import InputField from "../../../components/Inputs/Input";
import { createGroup } from "../../../hooks/chat/chatHook";

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
            room?.participants?.forEach((p: IParticipant) => {
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

    const { mutateAsync: createChatGroup, isPending } = createGroup()
    const handleCreateGroup = async(e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("name", groupName);
        if (description) {
            formData.append("description", description);
        }

        formData.append("createdBy", loggedInUser!._id);

        // admins (array)
        formData.append(
            "admins",
            JSON.stringify([loggedInUser!._id])
        );

        // participants (array of string IDs)
        const participantIds = selectedUsers.map(u => u._id);
        formData.append(
            "participants",
            JSON.stringify(participantIds)
        );

        // avatar (file)
        if (avatar instanceof File) {
            formData.append("avatar", avatar);
        }

        console.log("CREATE GROUP FORM DATA", [...formData.entries()]);
        await createChatGroup(formData, {
            onSuccess: () => {
                toast.success("group created")
            }
        })
        setAvatar(null)
        setGroupSlider(false);
        setStep(1);
        setSelectedUsers([]);

    };

    if (isPending) {
        return <Loader fullScreen message="Creating group..." />;
    }


    const handleAvatarChange = (file: File | null) => {
        setAvatar(file);
    };
    return (
        <div
            className={`absolute top-0 z-[888] right-0 theme-bg-primary flex flex-col
       border-l-5 theme-border w-110 h-full duration-300 transition-all ease-in-out
      ${groupSlider ? "translate-x-0 opacity-100" : "translate-x-30 opacity-0 pointer-events-none"}`}
        >
            <div className="flex items-center justify-between p-3 text-xl theme-border">
                <h3 className="font-semibold">
                    {step === 1 ? "Select Members" : "Group Info"}
                </h3>
                <XCircleIcon
                    className="cursor-pointer"
                    onClick={() => {
                        setSelectedUsers([]);
                        setStep(1);
                        setGroupSlider(false);
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
                            className=""
                            width="fit"
                        />
                        <PrimaryButton
                            fullWidth={false}
                            label="Next"
                            width="w-fit px-4 py-[6px] rounded-full"
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
                                                className="w-9 h-9 rounded-full object-cover"
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
                                            className="w-9 h-9 rounded-full object-cover"
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
                                                className="w-9 h-9 rounded-full object-cover"
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
                <form onSubmit={handleCreateGroup} className="flex flex-col h-[90vh] gap-2 w-full ">
                    <div className="flex flex-col items-center justify-center px-2 gap-2">
                        <div className="flex items-center ">
                            <MediaInput value={avatar} onChange={handleAvatarChange} name="avatar" />
                        </div>

                        <div className=" flex space-x-2">
                            <InputField className="" name="groupName" label="Name" required placeholder="group name" type="text" onChange={(e) => setGroupName(e.target.value)} />
                            <InputField className="" name="groupDiscription" required label="Discription" placeholder="group description" type="text" onChange={(e) => setDescription(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <p className="text-xs theme-text-muted">
                            Members: {selectedUsers.length + 1}
                        </p>
                          <div className="flex gap-2">
                        <PrimaryButton
                            onClick={() => setStep(1)}
                            fullWidth={false}
                            cancel
                            label="Cancel"
                            width="w-fit px-2 py-1 "
                        />
                        <PrimaryButton
                            fullWidth={false}
                            label="Create Group"
                            width="w-fit px-2 py-1"
                        />
                    </div>
                    </div>
                    
                    <div className=" overflow-y-scroll custom-scrollbar border px-1 border-t-2 theme-border">
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
                </form>

            )}

        </div>
    );
};

export default CreateGroupSlider;
