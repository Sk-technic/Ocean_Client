import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../../api/services/chat/chatApi";
import { setChatList, updateLastMessage } from "../../store/slices/chatList";
import type { ChatRoom, IParticipant, Message } from "../../types/chat";
import type { AxiosError } from "axios";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import React, { useEffect, useMemo, useRef } from "react";
import { store } from "../../store";
import { messageKeyMap } from "./chatMessageMap";
import toast from "react-hot-toast";

const state = store.getState();

interface RoomMember {
  _id: string;
  username: string;
  fullName: string;
  email?: string;
  profilePic?: string;
}

interface MembersResponse {
  data: RoomMember[];
  nextCursor: string | null;
  hasNext: boolean;
}

export const useChatMessages = (roomId: string, limit = 50) => {
  const queryClient = useQueryClient();

  // 1. Strict Check: Room tabhi fetch hoga jab wo 'temp-' se start NA ho
  const isTemp = !roomId || roomId.startsWith("temp-");

  const queryKey = ["chatMessages", roomId];

  const query = useInfiniteQuery({
    queryKey,
    // 🛡️ API STOPPER: Temp room ke liye network request block
    enabled: !!roomId && !isTemp,

    queryFn: async ({ pageParam }) => {
      // Extra safety: Agar block bypass ho jaye toh return empty
      if (isTemp) return { messages: [], hasMore: false };
      return await chatApi.GetMessages(roomId, pageParam as string | undefined, limit);
    },

    initialPageParam: undefined,

    getNextPageParam: (lastPage: any) => {
      return lastPage?.hasMore ? lastPage.nextCursor : undefined;
    },

    // 🔑 ERROR FIX: "Query data cannot be undefined" ko rokne ke liye
    // Hum TanStack Query ko pehle se hi khali data structure de rahe hain
    initialData: isTemp ? {
      pages: [{
        messages: [],
        hasMore: false,
      }],
      pageParams: [undefined],
    } : undefined,

    // 🛡️ LOOP FIX: 500 error aane par pagal ki tarah retry mat karo
    retry: false,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // 🔄 AUTO REFETCH FIX: 
  // Purane useEffect mein 'query' dependency loop bana rahi thi.
  // Ab ye sirf tab refetch karega jab roomId badle aur wo temp na ho.
  useEffect(() => {
    if (roomId && !isTemp && !query.data && !query.isLoading) {
      query.refetch();
    }
  }, [roomId, isTemp]);

  // 🔑 DATA FLATTENING: 
  // Messages ko pages se nikaal kar ek single array mein convert karna
  const messages = useMemo(() => {
    if (!query.data?.pages) return [];
    return query.data.pages.flatMap((page: any) => page.messages || []) ?? [];
  }, [query.data?.pages]);

  // Saare important functions aur states ko return karna
  return {
    ...query,            // Saare TanStack props (fetchNextPage, hasNextPage, etc.)
    messages,            // Direct messages array for Virtuoso
    isLoading: query.isLoading,
    isTempRoom: isTemp   // UI logic ke liye help karega
  };
};

export const useChatUsers = (
  userId?: string,
  isConnected = false
) => {
  const dispatch = useAppDispatch();

  const query = useInfiniteQuery<
    {
      data: ChatRoom[];
      nextCursor: string | null;
      hasNext: boolean;
    },
    AxiosError
  >({
    queryKey: ["chatUsers", userId],
    initialPageParam: null, // ✅ REQUIRED in v5
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error("User ID is required");
      return chatApi.GetChatUsers(userId, pageParam as string | null);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const allRooms = query.data?.pages.flatMap(
    (page) => page.data
  );

  const prevLengthRef = useRef(0);

  useEffect(() => {
    if (!allRooms) return;

    if (allRooms.length === prevLengthRef.current) return;

    prevLengthRef.current = allRooms.length;
    dispatch(setChatList(allRooms));


  }, [allRooms, dispatch]);

  return {
    ...query,
    rooms: allRooms ?? [],
  };
};

export const useSendMedia = () => {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await chatApi.sendMediaFiles(data);
      return res.data;
    },
  });
};

export const useSendMessage = ({ socket, loggedInUser }: { socket: any; loggedInUser: any }) => {
  const queryClient = useQueryClient();

  const sendTextMessage = ({ roomId, toUserId, content, replyTo }: any) => {
    if (!content.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const effectiveRoomId = roomId ?? `temp-room-${toUserId}`;

    const tempMessage = {
      _id: tempId,
      tempId,
      roomId: effectiveRoomId,
      sender: {
        _id: loggedInUser._id,
        fullName: loggedInUser.fullName,
        profilePic: loggedInUser.profilePic,
      },
      content,
      type: "text",
      status: "pending",
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      // replyTo: replyTo ? {
      //   _id: replyTo._id,
      //   content: replyTo.content,
      //   sender: {
      //     _id: replyTo.sender._id,
      //     fullName: replyTo.sender.fullName,
      //     username: replyTo.sender.username,
      //     profilePic: replyTo.sender.profilePic
      //   },
      //   type: replyTo.type || "text",
      //   createdAt: replyTo.createdAt
      // } : null,
    };

    // Optimistic Update: Naya message hamesha LATEST page mein jayega
    queryClient.setQueryData(["chatMessages", effectiveRoomId], (old: any) => {
      if (!old) return old;
      const pages = [...old.pages];
      const lastPageIndex = pages.length - 1;

      pages[lastPageIndex] = {
        ...pages[lastPageIndex],
        messages: [...pages[lastPageIndex].messages, tempMessage],
      };

      return { ...old, pages };
    });

    socket.emit("send:message", {
      senderId: loggedInUser._id,
      toUserId,
      roomId: roomId || null,
      content,
      tempId,
      senderSocketId: socket?.id,
      replyTo: replyTo ?? null
    });
  };

  return { sendTextMessage };
};

export const useIncomingMessages = (socket: any, loggedInUserId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload: any) => {
      // Data destructuring as per your log
      const { roomId, message, tempId } = payload;
      if (!roomId || !message) return;

      console.log(payload);


      queryClient.setQueryData(["chatMessages", roomId], (old: any) => {
        if (!old?.pages) return old;

        let isReplaced = false;

        // 1. Saari pages mein map karke tempId dhoondo
        const updatedPages = old.pages.map((page: any) => {
          const updatedMessages = page.messages.map((m: any) => {
            // Check matching tempId
            if (tempId && m.tempId === tempId) {
              isReplaced = true;
              return {
                ...message,
                status: "send", // status sent set karo backend se 'send' aa raha hai toh use handle karo
                isOptimistic: false
              };
            }
            return m;
          });

          return { ...page, messages: updatedMessages };
        });

        // 2. Agar replace ho gaya, toh updated pages return karo
        if (isReplaced) {
          return { ...old, pages: updatedPages };
        }

        // 3. Agar replace NAHI hua (matlab kisi aur ka message hai), toh LATEST page mein append karo
        const lastPageIndex = updatedPages.length - 1;

        // Duplicate check using _id
        const alreadyExists = updatedPages.some((p: any) =>
          p.messages.some((m: any) => m._id === message._id)
        );

        if (!alreadyExists) {
          updatedPages[lastPageIndex] = {
            ...updatedPages[lastPageIndex],
            messages: [...updatedPages[lastPageIndex].messages, message],
          };
        }

        // store?.dispatch(addCount({roomId,userId:loggedInUserId}))
        return { ...old, pages: updatedPages };

      });
    };

    socket.on("chat:new_message", handleNewMessage);
    return () => socket.off("chat:new_message", handleNewMessage);
  }, [socket, queryClient, loggedInUserId]);
};

export const useSendMediaOptimistic = (loggedInUser: any) => {
  const queryClient = useQueryClient();

  const addTempMediaMessage = ({
    roomId,
    toUserId,
    files,
    content,
    replyTo,
  }: {
    roomId?: string | null;
    toUserId?: string | null;
    files: File[];
    content?: string | null;
    replyTo?: string | null;
  }) => {
    if (!roomId && !toUserId) return null;

    const tempId = `temp-${Date.now()}`;
    const effectiveRoomId = roomId ?? `temp-room-${toUserId}`;

    let replyMessage = null;

    if (replyTo) {
      const cached = queryClient.getQueryData<any>([
        "chatMessages",
        effectiveRoomId,
      ]);

      if (cached?.pages?.length) {
        for (const page of cached.pages) {
          const found = page.messages.find(
            (m: any) => m._id === replyTo
          );
          if (found) {
            replyMessage = found;
            break;
          }
        }
      }
    }

    const tempMessage = {
      _id: tempId,
      tempId,
      roomId: effectiveRoomId,
      sender: {
        _id: loggedInUser._id,
        username: loggedInUser.username,
        fullName: loggedInUser.fullName,
        profilePic: loggedInUser.profilePic,
      },
      type: "media",
      content: content ?? null,
      media: files.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
        isLocal: true,
      })),
      replyTo: replyMessage
        ? {
          _id: replyMessage._id,
          content: replyMessage.content,
          sender: replyMessage.sender,
          type: replyMessage.type,
          media: replyMessage.media ?? [],
          createdAt: replyMessage.createdAt,
        }
        : null,
      status: "pending",
      isDeleted: false,
      isEdited: false,
      reactions: {},
      mentions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // 🔑 IMPORTANT: same mapping as text message
    messageKeyMap.set(tempId, effectiveRoomId);

    queryClient.setQueryData(
      ["chatMessages", effectiveRoomId],
      (old: any) => {
        if (old?.pages?.length) {
          return {
            ...old,
            pages: old.pages.map((p: any, i: number) =>
              i === old.pages.length - 1
                ? { ...p, messages: [...p.messages, tempMessage] }
                : p
            ),
          };
        }

        return {
          pages: [
            {
              messages: [tempMessage],
              nextCursor: null,
            },
          ],
          pageParams: [null],
        };
      }
    );

    return {
      tempId,
      effectiveRoomId,
    };
  };

  return { addTempMediaMessage };
};

export const useMessageDelivery = (socket: any) => {
  const queryClient = useQueryClient();
  const { activeRoom } = useAppSelector((s) => s.chat);
  const { user: dmUser } = useAppSelector((s) => s.user);

  useEffect(() => {
    if (!socket) return;

    const handleAck = (payload: any) => {
      const { tempId, roomId } = payload;

      const currentEffectiveId = activeRoom?._id ?? (dmUser?._id ? `temp-room-${dmUser._id}` : null);

      if (!currentEffectiveId || !tempId) return;

      const updateCache = (key: string) => {
        queryClient.setQueryData(["chatMessages", key], (old: any) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              messages: page.messages.map((m: any) => {
                if (m.tempId === tempId) {
                  return {
                    ...m,
                    ...payload,
                    status: "send",
                    isOptimistic: false,
                  };
                }
                return m;
              }),
            })),
          };
        });
      };

      updateCache(currentEffectiveId);

      if (roomId && roomId !== currentEffectiveId) {
        updateCache(roomId);
      }
    };

    socket.on("message:sent", handleAck);
    return () => socket.off("message:sent", handleAck);
  }, [socket, queryClient, activeRoom?._id, dmUser?._id]);
};

export const useMediaDelivery = (socket: any) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleAck = (message: any) => {
      if (!message?.tempId || !message?.roomId) return;

      queryClient.setQueryData(
        ["chatMessages", message.roomId],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((p: any) => ({
              ...p,
              messages: p.messages.map((m: any) =>
                m.tempId === message.tempId
                  ? { ...message, status: "send" }
                  : m
              ),
            })),
          };
        }
      );
    };

    socket.on("message:sent", handleAck);
    return () => socket.off("message:sent", handleAck);
  }, [socket, queryClient]);
};

export const useIncomingMediaMessages = (
  socket: any,
  loggedInUserId: string
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleIncoming = (payload: any) => {
      const { roomId, message, tempId } = payload;
      if (!roomId || !message) return;

      queryClient.setQueryData(
        ["chatMessages", roomId],
        (old: any) => {
          if (!old) return old;

          let replaced = false;

          const pages = old.pages.map((page: any) => {
            const messages = page.messages.map((m: any) => {
              if (
                tempId &&
                m.tempId === tempId &&
                message.sender?._id === loggedInUserId
              ) {
                replaced = true;
                return {
                  ...message,
                  sender: message.sender ?? m.sender,
                  status: "send",
                };
              }
              return m;
            });
            return { ...page, messages };
          });

          if (!replaced) {
            const exists = pages.some((p: any) =>
              p.messages.some((m: any) => m._id === message._id)
            );
            if (!exists) {
              pages[pages.length - 1] = {
                ...pages[pages.length - 1],
                messages: [
                  ...pages[pages.length - 1].messages,
                  message,
                ],
              };
            }
          }

          return { ...old, pages };
        }
      );
    };

    socket.on("chat:new_message", handleIncoming);
    return () => socket.off("chat:new_message", handleIncoming);
  }, [socket, queryClient, loggedInUserId]);
};

export const useIncomingMessageDelete = (socket: any) => {
  const queryClient = useQueryClient();
  const { activeRoom } = useAppSelector((s) => s.chat);
  const { user: dmUser } = useAppSelector((s) => s.user);

  useEffect(() => {
    if (!socket) return;

    const handleDelete = ({ roomId, messageId }: any) => {
      // 🔑 Effective Room ID dhoondna (Temp or Real)
      const currentEffectiveId = activeRoom?._id ?? (dmUser?._id ? `temp-room-${dmUser._id}` : null);

      const updateCache = (key: string) => {
        queryClient.setQueryData(["chatMessages", key], (old: any) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              messages: page.messages.map((m: any) =>
                m._id === messageId || m.tempId === messageId // tempId se bhi match check karna safe hai
                  ? {
                    ...m,
                    isDeleted: true,
                    content: "This message was removed or is no longer accessible.",
                    media: [],
                  }
                  : m
              ),
            })),
          };
        });
      };

      // 1. Backend se aaye roomId ko update karo
      if (roomId) updateCache(roomId);

      // 2. Agar hum abhi temp-room state mein hain, toh use bhi update karo
      if (currentEffectiveId && currentEffectiveId !== roomId) {
        updateCache(currentEffectiveId);
      }
    };

    socket.on("message:deleted", handleDelete);
    return () => socket.off("message:deleted", handleDelete);
  }, [socket, queryClient, activeRoom?._id, dmUser?._id]);
};

export const updateMessageInCache = ({
  roomId,
  messageId,
  updater,
  queryClient,
}: {
  roomId: string;
  messageId: string;
  updater: (message: any) => any;
  queryClient: any;
}) => {
  // Ensure we use string IDs
  const rId = roomId?.toString();
  const mId = messageId?.toString();

  queryClient.setQueryData(["chatMessages", rId], (old: any) => {
    if (!old?.pages?.length) return old;
    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        messages: page.messages.map((m: any) =>
          (m._id?.toString() === mId || m.tempId === mId) ? updater(m) : m
        ),
      })),
    };
  });
};

export const optimisticEditMessage = ({
  roomId,
  messageId,
  newContent,
  queryClient,
}: {
  roomId: string;
  messageId: string;
  newContent: string;
  queryClient: any;
}) => {
  updateMessageInCache({
    queryClient,
    roomId,
    messageId,
    updater: (m) => ({
      ...m,
      content: newContent,
      isEdited: true,
      updatedAt: new Date().toISOString(),
      isOptimistic: true,
    }),
  });
};

export const useMessageEditListener = (socket: any, queryClient: any) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!socket) return;

    const handleEdit = ({ message }: any) => {
      // 🔑 RoomId ko string mein convert karein (Backend se ObjectId object aa sakta hai)
      const rId = message?.roomId?.toString() || message?.roomId;
      const mId = message?._id?.toString() || message?._id;

      if (!rId || !mId) {
        console.error("Missing IDs in edit event:", { rId, mId });
        return;
      }

      if (message?.updateRoom) {
        dispatch(
          updateLastMessage({
            roomId: rId,
            message: message,
            shouldUpdateLastMessage: true,
          })
        );
      }

      queryClient.setQueryData(["chatMessages", rId], (old: any) => {
        if (!old?.pages?.length) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            messages: page.messages.map((m: any) =>
              m._id === mId ? { ...m, ...message, isOptimistic: false } : m
            ),
          })),
        };
      });
    };

    socket.on("message:edited", handleEdit);
    return () => {
      socket.off("message:edited", handleEdit);
    };
  }, [socket, queryClient, dispatch]);
};

export const createGroup = () => {
  return useMutation({
    mutationFn: (data: FormData) => chatApi.createGroup(data),
  })
}

export const useRoomMembers = (roomId?: string) => {
  type MemberCursor = {
    joinedAt: string;
    _id: string;
  };

  const query = useInfiniteQuery<
    {
      data: any[];
      nextCursor: MemberCursor | null;
      hasNext: boolean;
      totalUsers?: number;
    },
    AxiosError
  >({
    queryKey: ["roomMembers", roomId],
    enabled: !!roomId,
    initialPageParam: null,

    queryFn: async ({ pageParam }) => {
      if (!roomId) throw new Error("roomId is required");

      return chatApi.getMembers(
        roomId,
        pageParam ? JSON.stringify(pageParam) : null
      );
    },

    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const normalizedPages = React.useMemo(() => {
    if (!query.data?.pages) return [];

    const adminMap = new Map<string, any>();
    const cleanedPages = query.data.pages.map(page => {
      const remaining = page.data.filter((m: any) => {
        if (m.role === "admin") {
          adminMap.set(m.id, m);
          return false; // remove admin from page
        }
        return true;
      });

      return { ...page, data: remaining };
    });

    if (adminMap.size === 0) return cleanedPages;

    cleanedPages[0] = {
      ...cleanedPages[0],
      data: [
        ...Array.from(adminMap.values()),
        ...cleanedPages[0].data,
      ],
    };

    return cleanedPages;
  }, [query.data]);

  const members =
    normalizedPages.flatMap(page => page.data) ?? [];

  const totalCount =
    query.data?.pages?.[0]?.totalUsers ?? 0;

  return {
    ...query,
    data: query.data
      ? { ...query.data, pages: normalizedPages }
      : query.data,
    members,
    totalCount,
  };
};

export const useAddAdmin = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => {
      return chatApi.addAdmin(roomId, userId);
    },

    onSuccess: (_, userId) => {
      queryClient.setQueryData(
        ["roomMembers", roomId],
        (oldData: any) => {
          if (!oldData) return oldData;

          let promotedUser: any = null;

          const cleanedPages = oldData.pages.map((page: any) => {
            const found = page.data.find((m: any) => m.id === userId);

            if (found) {
              promotedUser = { ...found, role: "admin" };
            }

            return {
              ...page,
              data: page.data.filter((m: any) => m.id !== userId),
            };
          });

          if (!promotedUser) return oldData;

          cleanedPages[0] = {
            ...cleanedPages[0],
            data: [
              promotedUser,
              ...cleanedPages[0].data,
            ],
          };

          return {
            ...oldData,
            pages: cleanedPages,
          };
        }
      );

      toast.success("User promoted to admin");
    },



    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add admin");
    },
  });
};

export const useRemoveAdmin = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => {
      return chatApi.removeAdmin(roomId, userId);
    },

    onSuccess: (_, userId) => {
      queryClient.setQueryData(
        ["roomMembers", roomId],
        (oldData: any) => {
          if (!oldData) return oldData;

          const updatedPages = oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((m: any) =>
              m.id === userId
                ? { ...m, role: "member" } 
                : m
            ),
          }));

          return {
            ...oldData,
            pages: updatedPages,
          };
        }
      );

      toast.success("Admin role removed");
    },

    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Failed to remove admin"
      );
    },
  });
};








